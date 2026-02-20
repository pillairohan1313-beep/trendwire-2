document.addEventListener('DOMContentLoaded', () => {
    // ─── Parse Article ID ───
    // Support both clean URL (/article/:id) and query string (?id=...)
    let articleId = null;
    const pathMatch = window.location.pathname.match(/\/article\/(.+)/);
    if (pathMatch) {
        articleId = pathMatch[1];
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        articleId = urlParams.get('id');
    }

    const paywallOverlay = document.getElementById('paywall-overlay');

    // ─── Paywall Logic ───
    const PRO_KEY = 'trendwire_is_pro';
    const READ_COUNT_KEY = 'trendwire_articles_read';
    const DAILY_LIMIT = 5;

    let isPro = localStorage.getItem(PRO_KEY) === 'true';
    let articlesRead = parseInt(localStorage.getItem(READ_COUNT_KEY) || '0');

    if (!isPro && articlesRead > DAILY_LIMIT) {
        showPaywall();
        return;
    }

    // ─── Resolve Article Data ───
    resolveArticle().then(article => {
        if (!article) {
            document.getElementById('article-content').innerHTML = `
                <div class="text-center py-20">
                    <span class="material-icons text-primary text-6xl mb-4">signal_wifi_off</span>
                    <h2 class="text-2xl font-bold text-white mb-2">Signal Not Found</h2>
                    <p class="text-slate-400 mb-6">This intelligence brief could not be located.</p>
                    <a href="/" class="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all uppercase tracking-widest text-sm">Return to Dashboard</a>
                </div>
            `;
            return;
        }
        loadArticle(article);
        setupActionButtons(article);
    });

    async function resolveArticle() {
        let article = null;

        // 1. Try localStorage cache first (passed from dashboard click)
        const cachedData = localStorage.getItem('current_article_data');
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                if (parsed.id === articleId) {
                    article = parsed;
                }
            } catch (e) {
                console.error("Failed to parse cached article data", e);
            }
        }

        // 2. Try fetching from live API if no cache match
        if (!article && articleId) {
            try {
                const response = await fetch('/api/news');
                if (response.ok) {
                    const data = await response.json();
                    article = data.find(a => a.id === articleId);
                }
            } catch (e) {
                console.error("Failed to fetch from API", e);
            }
        }

        // 3. Fallback to static FEED_DATA
        if (!article && typeof FEED_DATA !== 'undefined') {
            article = FEED_DATA.find(a => a.id === articleId);
        }

        // 4. Fallback to first article if no ID
        if (!article && !articleId && typeof FEED_DATA !== 'undefined' && FEED_DATA.length > 0) {
            article = FEED_DATA[0];
        }

        return article;
    }

    // ─── Load Article ───
    function loadArticle(data) {
        // Headline
        const titleEl = document.getElementById('article-headline');
        if (titleEl) titleEl.textContent = data.headline;

        // Image
        const imgEl = document.getElementById('article-image');
        if (imgEl) {
            imgEl.src = data.image;
            imgEl.alt = data.headline;
        }

        // Impact Score
        const scoreEl = document.getElementById('impact-score');
        if (scoreEl) scoreEl.textContent = data.impactScore || '8.0';

        // Tag
        const tagEl = document.getElementById('article-tag');
        if (tagEl) tagEl.textContent = data.tag || 'NEWS';

        // Signal ID — generate from article ID hash
        const signalIdEl = document.getElementById('signal-id');
        if (signalIdEl) {
            const shortHash = Math.abs(hashCode(data.id || data.headline)).toString(36).toUpperCase().slice(0, 6);
            signalIdEl.textContent = `SIGNAL_ID: ${data.tag ? data.tag.replace(/\s/g, '') : 'SIG'}_${shortHash}`;
        }

        // View Count — semi-random based on article id
        const viewCountEl = document.getElementById('view-count');
        if (viewCountEl) {
            const views = 200 + Math.abs(hashCode(data.id || data.headline)) % 4800;
            viewCountEl.textContent = views >= 1000 ? `${(views / 1000).toFixed(1)}K` : views.toString();
        }

        // Date — format from timestamp
        const dateEl = document.getElementById('article-date');
        if (dateEl) {
            if (data.timestamp) {
                const dt = new Date(data.timestamp * 1000);
                const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
                dateEl.textContent = dt.toLocaleDateString('en-US', options).toUpperCase();
            } else {
                dateEl.textContent = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
            }
        }

        // Content — use article content or generate fallback with external backlink
        const contentContainer = document.getElementById('article-content');
        if (contentContainer) {
            if (data.content && data.content !== 'undefined') {
                // Ensure the "Source Intelligence" backlink section is always present
                let contentHtml = data.content;
                if (data.link && !contentHtml.includes('View Original')) {
                    contentHtml += `
                        <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                            <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                            <div class="flex justify-between items-end">
                                <span class="text-lg font-bold text-white">${escapeHtml(data.tag || 'NEWS')}</span>
                                <a href="${data.link}" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                            </div>
                        </div>
                    `;
                }
                contentContainer.innerHTML = contentHtml;
            } else {
                // Generate a styled fallback from available data
                contentContainer.innerHTML = `
                    <p class="mb-4 text-lg leading-relaxed text-slate-300">
                        <span class="text-primary font-bold">SIGNAL DETECTED:</span> ${escapeHtml(data.headline)}
                    </p>
                    <p class="mb-6 leading-relaxed text-slate-400">
                        This intelligence brief is sourced from <strong>${escapeHtml(data.source || data.tag)}</strong>.
                        Full analysis is available at the original source.
                    </p>
                    ${data.link ? `
                    <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                        <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                        <div class="flex justify-between items-end">
                            <span class="text-lg font-bold text-white">${escapeHtml(data.tag || 'NEWS')}</span>
                            <a href="${data.link}" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                        </div>
                    </div>` : ''}
                `;
            }
        }

        // Related Signals — fetch from API or fallback to FEED_DATA
        const relatedGrid = document.getElementById('related-signals');
        if (relatedGrid) {
            populateRelatedSignals(relatedGrid, data);
        }

        // Update Page Title
        document.title = `${data.headline} | Trendwire`;

        // Dynamic Log Stream
        const logStream = document.getElementById('log-stream');
        if (logStream) {
            const shortTag = (data.tag || 'SIG').replace(/\s/g, '_');
            logStream.innerHTML = `
                <p><span class="text-primary">[OK]</span> HEURISTIC_MATCH: ${75 + Math.abs(hashCode(data.id || '')) % 25}%</p>
                <p><span class="text-primary">[OK]</span> ${shortTag}_STABILITY: HIGH</p>
                <p><span class="text-slate-600">[..]</span> INDEXING_PARAM...</p>
                <p><span class="text-primary">[OK]</span> FETCH_SIGNAL_COMPLETE</p>
                <p><span class="text-primary">[OK]</span> CONTENT_VERIFIED: TRUE</p>
            `;
        }
    }

    async function populateRelatedSignals(container, currentArticle) {
        let allArticles = [];

        // Try API first
        try {
            const response = await fetch('/api/news');
            if (response.ok) {
                allArticles = await response.json();
            }
        } catch (e) {
            // Fallback to FEED_DATA
        }

        if (allArticles.length === 0 && typeof FEED_DATA !== 'undefined') {
            allArticles = FEED_DATA;
        }

        const related = allArticles
            .filter(a => a.id !== currentArticle.id)
            .slice(0, 4);

        container.innerHTML = related.map(r => `
            <a href="/article/${r.id}" class="block bg-[#1a2639]/60 border border-[#2d3b55] rounded-lg p-4 hover:border-[#F05A1A]/40 transition-all group">
                <span class="text-[10px] font-mono text-[#F05A1A] uppercase tracking-wider">${r.tag}</span>
                <h3 class="text-sm font-bold text-white mt-1 group-hover:text-[#F05A1A] transition-colors leading-snug">${escapeHtml(r.headline)}</h3>
                <span class="text-[10px] font-mono text-slate-500 mt-2 block">${r.readTime || '3 min read'}</span>
            </a>
        `).join('');
    }

    // ─── Action Buttons ───
    function setupActionButtons(article) {
        const shareBriefBtn = document.getElementById('btn-share-brief');
        if (shareBriefBtn) {
            shareBriefBtn.addEventListener('click', () => {
                const url = window.location.href;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        showToast('Link copied to clipboard');
                    }).catch(() => {
                        showToast('Copy failed — use browser share');
                    });
                } else if (navigator.share) {
                    navigator.share({ title: document.title, url: url });
                } else {
                    showToast('Share not supported in this browser');
                }
            });
        }

        const saveVaultBtn = document.getElementById('btn-save-vault');
        if (saveVaultBtn) {
            // Check if already saved
            const vault = JSON.parse(localStorage.getItem('trendwire_vault') || '[]');
            if (vault.find(v => v.id === article.id)) {
                saveVaultBtn.innerHTML = '<span class="material-icons text-sm">bookmark</span><span class="text-xs uppercase tracking-widest">Saved ✓</span>';
            }

            saveVaultBtn.addEventListener('click', () => {
                const vault = JSON.parse(localStorage.getItem('trendwire_vault') || '[]');
                if (vault.find(v => v.id === article.id)) {
                    showToast('Already saved to Vault');
                    return;
                }
                vault.push({ id: article.id, headline: article.headline, tag: article.tag, image: article.image, savedAt: Date.now() });
                localStorage.setItem('trendwire_vault', JSON.stringify(vault));
                saveVaultBtn.innerHTML = '<span class="material-icons text-sm">bookmark</span><span class="text-xs uppercase tracking-widest">Saved ✓</span>';
                showToast('Saved to Vault');
            });
        }
    }

    // ─── Paywall Functions ───
    function showPaywall() {
        if (paywallOverlay) {
            paywallOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    document.getElementById('btn-unlock-pro')?.addEventListener('click', () => {
        window.location.href = '/pro';
    });

    // ─── Hamburger Toggle (Mobile) ───
    const hamburgerBtn = document.getElementById('hamburger-btn-article');
    const sidebar = document.getElementById('sidebar-article');
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('sidebar-open');
        });
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('sidebar-open') &&
                !sidebar.contains(e.target) &&
                !hamburgerBtn.contains(e.target)) {
                sidebar.classList.remove('sidebar-open');
            }
        });
    }

    // ─── Utility Functions ───
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showToast(message) {
        const existing = document.getElementById('toast-notification');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a2639] border border-[#2d3b55] text-white text-sm px-6 py-3 rounded-lg shadow-2xl z-[200] font-mono tracking-wide';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
});
