document.addEventListener('DOMContentLoaded', () => {
    // DOM References
    const feedGrid = document.querySelector('.bento-grid');
    const paywallOverlay = document.getElementById('paywall-overlay');
    const closeDemoPaywall = document.getElementById('close-demo-paywall');
    const unlockBtn = document.getElementById('unlock-full-access');
    const filterBtns = document.querySelectorAll('[data-filter]');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const tuneBtn = document.getElementById('tune-btn');

    // Config
    const ARTICLE_LIMIT = 5;
    const READ_COUNT_KEY = 'trendwire_articles_read';
    const POLL_INTERVAL_MS = 60000; // 60s auto-refresh
    let articlesRead = parseInt(localStorage.getItem(READ_COUNT_KEY) || '0');
    let currentFilter = 'ALL';
    let feedCache = []; // Cache feed data for filtering

    // ─── Filter Logic ───
    const FILTER_MAP = {
        'ALL': null,
        'TOOLS': ['AI RESEARCH', 'GOOGLE AI', 'DEV'],
        'REPORTS': ['BUSINESS', 'STARTUPS', 'TECH']
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            // Update visual state
            filterBtns.forEach(b => {
                b.classList.remove('bg-border-navy', 'text-white');
                b.classList.add('text-slate-500');
            });
            btn.classList.add('bg-border-navy', 'text-white');
            btn.classList.remove('text-slate-500');
            // Re-render with filter
            renderCards(feedCache);
        });
    });

    // ─── Hamburger Toggle (Mobile) ───
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
        });
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('sidebar-open') &&
                !sidebar.contains(e.target) &&
                !hamburgerBtn.contains(e.target)) {
                sidebar.classList.remove('sidebar-open');
            }
        });
    }

    // ─── Tune (Filter Settings) Button ───
    if (tuneBtn) {
        tuneBtn.addEventListener('click', () => {
            showToast('Filter settings coming in v1.1');
        });
    }

    // ─── Sidebar Navigation ───
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.nav;
            if (target === 'dashboard') {
                window.location.href = '/';
            } else if (target === 'sensors') {
                showToast('Sensors panel coming in v1.1');
            } else if (target === 'insights') {
                showToast('Pro Insights — Unlock with Pro subscription');
            } else if (target === 'storage') {
                showToast('Saved articles (Vault) coming in v1.1');
            }
        });
    });

    // ─── Render Feed ───
    async function renderFeed(showLoader = true) {
        if (!feedGrid) return;

        if (showLoader && feedCache.length === 0) {
            feedGrid.innerHTML = `
                <div class="col-span-full h-64 flex flex-col items-center justify-center space-y-4 animate-pulse">
                    <div class="w-12 h-12 border-4 border-[#f05a1a] border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing Neural Feed...</p>
                </div>
            `;
        }

        try {
            const response = await fetch('/api/news');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            feedCache = data;
            renderCards(data);

        } catch (error) {
            console.error("Failed to fetch news:", error);
            // If we have cached data, keep showing it
            if (feedCache.length > 0) {
                showToast('Feed refresh failed — showing cached data');
                return;
            }
            feedGrid.innerHTML = `
                <div class="col-span-full h-64 flex flex-col items-center justify-center text-center space-y-2">
                    <span class="material-icons text-red-500 text-4xl">warning</span>
                    <p class="text-white font-bold">Neural Link Offline</p>
                    <p class="text-slate-500 text-sm">Unable to fetch live signals. Check connection.</p>
                </div>
            `;
        }
    }

    function renderCards(data) {
        if (!feedGrid) return;

        // Apply filter
        let filteredData = data;
        if (currentFilter !== 'ALL' && FILTER_MAP[currentFilter]) {
            filteredData = data.filter(item =>
                FILTER_MAP[currentFilter].includes(item.tag)
            );
        }

        if (filteredData.length === 0) {
            feedGrid.innerHTML = `
                <div class="col-span-full h-64 flex flex-col items-center justify-center text-center space-y-2">
                    <span class="material-icons text-slate-500 text-4xl">travel_explore</span>
                    <p class="text-white font-bold">No Signals Detected</p>
                    <p class="text-slate-500 text-sm">No signals match the current filter.</p>
                </div>
            `;
            return;
        }

        feedGrid.innerHTML = filteredData.map((item, index) => {
            const colSpan = index === 0 ? 'col-span-2' : '';
            const bgBlur = index === 0 ? '<div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16"></div>' : '';
            const clickHandler = `handleArticleClick('${item.id}', '${encodeURIComponent(JSON.stringify(item))}')`;
            const delayClass = `delay-${Math.min(index * 100, 1000)}`;
            const timeAgo = formatTimeAgo(item.timestamp);
            const readTime = item.readTime || estimateReadTime(item.headline);

            return `
                <div class="${colSpan} relative group cursor-pointer overflow-hidden rounded-xl border border-border-navy h-full min-h-[300px] animate-fade-up ${delayClass}" style="animation-fill-mode: forwards;" onclick="${clickHandler}">
                ${bgBlur}
                
                <!-- Background Image -->
                <img src="${item.image}" alt="${escapeHtml(item.headline)}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-50" loading="lazy">
                
                <!-- Dark Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80"></div>
                
                <!-- Border Glow Effect -->
                <div class="absolute inset-0 border border-transparent group-hover:border-[#f05a1a]/50 rounded-xl transition-colors duration-300 pointer-events-none z-20"></div>

                <!-- Content Container -->
                <div class="absolute inset-0 p-5 flex flex-col justify-between z-10">
                    
                    <!-- Top Section: Tag & Impact -->
                    <div class="flex justify-between items-start">
                        <span class="bg-[#f05a1a] text-white text-[10px] font-bold px-2.5 py-1 rounded tracking-wider uppercase shadow-sm">${item.tag}</span>
                        
                        <div class="flex flex-col items-end">
                            <span class="text-[9px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">Impact</span>
                            <span class="text-xl font-mono font-bold text-white drop-shadow-md">${item.impactScore}</span>
                        </div>
                    </div>

                    <!-- Bottom Section: Headlines & Metadata -->
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <h2 class="text-base md:text-lg font-bold leading-snug text-white group-hover:text-[#f05a1a] transition-colors duration-300 drop-shadow-sm">${escapeHtml(item.headline)}</h2>
                            <div class="flex items-center gap-3 text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                                <span>${timeAgo}</span>
                                <span class="w-1 h-1 bg-slate-500 rounded-full"></span>
                                <span>${readTime}</span>
                            </div>
                        </div>
                        
                        <!-- Action / Footer -->
                        <div class="pt-2 flex justify-between items-center border-t border-white/10 mt-2">
                            <div class="flex -space-x-1.5 opacity-80">
                                <div class="w-5 h-5 rounded-full border border-white/20 bg-slate-800 flex items-center justify-center text-[7px] text-slate-300 font-bold">AI</div>
                                <div class="w-5 h-5 rounded-full border border-white/20 bg-slate-700 flex items-center justify-center text-[7px] text-slate-300 font-bold">MK</div>
                            </div>
                            <button class="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                                Read Brief <span class="material-icons text-[12px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // ─── Utility Functions ───

    function formatTimeAgo(timestamp) {
        if (!timestamp) return 'LIVE';
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        if (diff < 60) return 'JUST NOW';
        if (diff < 3600) return `${Math.floor(diff / 60)}m AGO`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h AGO`;
        return `${Math.floor(diff / 86400)}d AGO`;
    }

    function estimateReadTime(headline) {
        if (!headline) return '2 min read';
        const words = headline.split(' ').length;
        return `${Math.max(2, Math.ceil(words / 3))} min read`;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message) {
        // Remove existing toast
        const existing = document.getElementById('toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border-navy text-white text-sm px-6 py-3 rounded-lg shadow-2xl z-[200] font-mono tracking-wide animate-fade-up transition-opacity duration-300';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ─── Article Click Handler ───
    window.handleArticleClick = (articleId, itemData = null) => {
        if (itemData) {
            try {
                localStorage.setItem('current_article_data', decodeURIComponent(itemData));
            } catch (e) {
                console.error("Could not save article data", e);
            }
        }

        articlesRead = parseInt(localStorage.getItem(READ_COUNT_KEY) || '0');

        if (articlesRead >= ARTICLE_LIMIT) {
            showPaywall();
            return;
        }

        articlesRead++;
        localStorage.setItem(READ_COUNT_KEY, articlesRead.toString());

        // Use clean URL (vercel.json rewrite handles it)
        window.location.href = `/article/${articleId}`;
    };

    // ─── Paywall ───
    function showPaywall() {
        if (paywallOverlay) {
            paywallOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function hidePaywall() {
        if (paywallOverlay) {
            paywallOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (closeDemoPaywall) {
        closeDemoPaywall.addEventListener('click', () => {
            localStorage.setItem(READ_COUNT_KEY, '0');
            articlesRead = 0;
            hidePaywall();
            showToast('Demo Mode: Article limit reset.');
        });
    }

    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            window.location.href = '/pro.html';
        });
    }

    // ─── Auto-Refresh (SWR Pattern) ───
    let pollTimer = null;
    function startPolling() {
        pollTimer = setInterval(() => {
            renderFeed(false); // Silent refresh, no loader
        }, POLL_INTERVAL_MS);
    }

    // Pause polling when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(pollTimer);
        } else {
            renderFeed(false);
            startPolling();
        }
    });

    // ─── Init ───
    renderFeed();
    startPolling();
});
