// Fallback feed data — used when the live /api/news endpoint is unreachable.
// Tags are aligned with the API categories: TOOLS (AI RESEARCH, GOOGLE AI, DEV) and REPORTS (BUSINESS, STARTUPS, TECH).
const FEED_DATA = [
    {
        id: "meta-algo-shift",
        headline: "Meta's Advantage+ Algorithm Shift Detected",
        tag: "BUSINESS",
        impactScore: "9.2",
        author: "Sarah K.",
        source: "Internal Algo Watch",
        date: "2m AGO",
        readTime: "4 min read",
        timestamp: Math.floor(Date.now() / 1000) - 120,
        link: "https://www.facebook.com/business/news",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                <span class="text-primary font-bold">CRITICAL ALERT:</span> Our sensors have detected a significant backend update to Meta's Advantage+ shopping campaigns (ASC) rolling out across North American ad accounts.
            </p>
            <p class="mb-6 leading-relaxed text-slate-400">
                Early telemetry suggests a <strong>22% efficiency increase</strong> for accounts utilizing creative-led targeting, while "broad targeting" setups are seeing a temporary volatility in CPMs. This shift aligns with the V14 API documentation leaked earlier this week.
            </p>
            <blockquote class="border-l-2 border-primary pl-4 my-8 italic text-slate-200 bg-primary/5 p-4 rounded-r-lg">
                "The system is prioritizing creative diversity over audience segmentation. Accounts with &lt; 3 active creative formats are being penalized in the auction."
            </blockquote>
            <h3 class="text-xl font-bold text-white mb-3 mt-8">Actionable Intel</h3>
            <ul class="list-disc pl-5 space-y-2 text-slate-400 mb-6">
                <li><span class="text-white font-bold">Immediate:</span> Launch 3 net-new static variations to stabilize learning phases.</li>
                <li><span class="text-white font-bold">Watch:</span> Monitor CPMs on placements outside to Feed; Reels inventory is currently underpriced.</li>
                <li><span class="text-white font-bold">Pivot:</span> Shift 15% of budget to ASC campaigns if currently under 30% total spend.</li>
            </ul>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">BUSINESS</span>
                    <a href="https://www.facebook.com/business/news" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "openai-sora-integration",
        headline: "OpenAI Sora Integration: Beta Access leaked",
        tag: "AI RESEARCH",
        impactScore: "9.8",
        author: "Devin R.",
        source: "Silicon Valley Insider",
        date: "12m AGO",
        readTime: "3 min read",
        timestamp: Math.floor(Date.now() / 1000) - 720,
        link: "https://openai.com/blog",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                The waiting list is over. Or at least, it is for a select group of 500 enterprise API users.
            </p>
            <p class="mb-6 leading-relaxed text-slate-400">
                Leaked API documentation confirms that Sora, OpenAI's text-to-video model, is being integrated directly into the Assistant API. This allows for <span class="text-primary">programmatic video generation</span> at scale.
            </p>
            <h3 class="text-xl font-bold text-white mb-3 mt-8">Market Impact</h3>
            <p class="mb-4 leading-relaxed text-slate-400">
                For marketers, this means the cost of video production is about to drop by orders of magnitude. The "Video Fatigue" era is ending; the "Hyper-Personalized Video" era is beginning.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">AI RESEARCH</span>
                    <a href="https://openai.com/blog" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "google-core-update",
        headline: "Google Core Update: SEO Volatility High",
        tag: "TECH",
        impactScore: "8.5",
        author: "Algorlm Watch",
        source: "Search Engine Land",
        date: "45m AGO",
        readTime: "5 min read",
        timestamp: Math.floor(Date.now() / 1000) - 2700,
        link: "https://searchengineland.com",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                The March 2026 Core Update is rolling out, and the SERPs are bleeding red.
            </p>
            <p class="leading-relaxed text-slate-400">
                Sites relying heavily on "scaled content" (AI-generated without human loop) are seeing visibility drops of 40-60%. Meanwhile, reddit and forum discussions are taking over the top slots for informational queries.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">TECH</span>
                    <a href="https://searchengineland.com" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "tiktok-shop-surge",
        headline: "TikTok Shop: Q1 GMV Surpasses Expectations",
        tag: "BUSINESS",
        impactScore: "7.9",
        author: "Retail Dive",
        source: "Market Reports",
        date: "1h AGO",
        readTime: "4 min read",
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        link: "https://www.retaildive.com",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                TikTok Shop is correctly eating social commerce. Q1 GMV is up 150% YoY.
            </p>
            <p class="leading-relaxed text-slate-400">
                The integration of "Shop Tab" directly into the main navigation has proven sticky. Users are spending an average of 14 minutes per session in the shopping interface alone.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">BUSINESS</span>
                    <a href="https://www.retaildive.com" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "nvidia-chip-shortage",
        headline: "Nvidia H200 Shortage: AI Training Stalled?",
        tag: "TECH",
        impactScore: "9.0",
        author: "Chip Insider",
        source: "Bloomberg",
        date: "2h AGO",
        readTime: "6 min read",
        timestamp: Math.floor(Date.now() / 1000) - 7200,
        link: "https://www.bloomberg.com/technology",
        image: "https://images.unsplash.com/photo-1550009158-9ebf69188005?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                Supply chain constraints are hitting the AI infrastructure layer.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">TECH</span>
                    <a href="https://www.bloomberg.com/technology" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "jasper-pivot",
        headline: "Jasper.ai Pivots to Enterprise Workflows",
        tag: "AI RESEARCH",
        impactScore: "6.5",
        author: "SaaS Weekly",
        source: "TechCrunch",
        date: "3h AGO",
        readTime: "3 min read",
        timestamp: Math.floor(Date.now() / 1000) - 10800,
        link: "https://techcrunch.com",
        image: "https://images.unsplash.com/photo-1535378437321-6a8fd74f9c01?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                The OG AI writing tool is moving upmarket to avoid the commoditization trap.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">AI RESEARCH</span>
                    <a href="https://techcrunch.com" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "email-deliverability",
        headline: "Gmail & Yahoo New Sender Rules Live",
        tag: "BUSINESS",
        impactScore: "8.8",
        author: "Postmaster Team",
        source: "Email Geeks",
        date: "4h AGO",
        readTime: "5 min read",
        timestamp: Math.floor(Date.now() / 1000) - 14400,
        link: "https://blog.google/products/gmail/",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                 Authentication is no longer optional. DMARC enforcement has begun.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">BUSINESS</span>
                    <a href="https://blog.google/products/gmail/" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "crypto-bull-run",
        headline: "Bitcoin Breaks $95k: Institutional FOMO",
        tag: "STARTUPS",
        impactScore: "9.5",
        author: "CoinDesk",
        source: "MarketWatch",
        date: "5h AGO",
        readTime: "4 min read",
        timestamp: Math.floor(Date.now() / 1000) - 18000,
        link: "https://www.coindesk.com",
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                 The ETF inflows are relentless. $95k is the new floor?
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">STARTUPS</span>
                    <a href="https://www.coindesk.com" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "ux-trends-2026",
        headline: "Spatial Computing UI: The New Standard",
        tag: "DEV",
        impactScore: "7.2",
        author: "Design Systems",
        source: "NNGroup",
        date: "6h AGO",
        readTime: "7 min read",
        timestamp: Math.floor(Date.now() / 1000) - 21600,
        link: "https://www.nngroup.com",
        image: "https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                 With Vision Pro adoption hitting 5M units, 'flat' design is officially dead.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">DEV</span>
                    <a href="https://www.nngroup.com" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    },
    {
        id: "linkedin-algo-update",
        headline: "LinkedIn Deprioritizes Polls & Carousels",
        tag: "GOOGLE AI",
        impactScore: "8.1",
        author: "Social Media Today",
        source: "Platform Updates",
        date: "8h AGO",
        readTime: "3 min read",
        timestamp: Math.floor(Date.now() / 1000) - 28800,
        link: "https://www.socialmediatoday.com",
        image: "https://images.unsplash.com/photo-1611944212129-2999044c23da?q=80&w=1000&auto=format&fit=crop",
        content: `
            <p class="mb-4 text-lg leading-relaxed text-slate-300">
                 Stick to text and single-image posts. The engagement bait era is over.
            </p>
            <div class="bg-[#1a2639] border border-[#2d3b55] p-4 rounded-lg my-6">
                <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
                <div class="flex justify-between items-end">
                    <span class="text-lg font-bold text-white">GOOGLE AI</span>
                    <a href="https://www.socialmediatoday.com" target="_blank" rel="noopener" class="text-[#F05A1A] text-sm hover:underline font-bold">View Original →</a>
                </div>
            </div>
        `
    }
];

if (typeof module !== 'undefined') {
    module.exports = FEED_DATA;
}
