from http.server import BaseHTTPRequestHandler
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import json
import urllib.parse
import json
import time
import random
import re
import html
from email.utils import parsedate_to_datetime
from datetime import datetime

# Configuration: Top-tier High-Signal Sources
RSS_FEEDS = [
    {"url": "https://www.theverge.com/rss/index.xml", "tag": "TECH", "weight": 10},
    {"url": "https://techcrunch.com/feed/", "tag": "STARTUPS", "weight": 9},
    {"url": "https://openai.com/blog/rss.xml", "tag": "AI RESEARCH", "weight": 10},
    {"url": "https://feeds.feedburner.com/blogspot/gJZg", "tag": "GOOGLE AI", "weight": 9},
    {"url": "https://www.adexchanger.com/feed/", "tag": "ADTECH", "weight": 9},
    {"url": "https://searchengineland.com/feed", "tag": "SEO", "weight": 8},
    {"url": "https://www.socialmediatoday.com/feeds/news/", "tag": "SOCIAL", "weight": 8},
    {"url": "https://www.wired.com/feed/category/business/latest/rss", "tag": "BUSINESS", "weight": 8},
]

# Category mapping for filter tabs
TAG_CATEGORIES = {
    "TOOLS": ["AI RESEARCH", "GOOGLE AI", "DEV", "ADTECH", "SEO", "SOCIAL"],
    "REPORTS": ["BUSINESS", "STARTUPS", "TECH"],
}

# Fallback images pool for visual diversity
FALLBACK_IMAGES = {
    "TECH": [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1000&auto=format&fit=crop"
    ],
    "STARTUPS": [
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1000&auto=format&fit=crop"
    ],
    "AI RESEARCH": [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1535378620166-273708d44e4c?q=80&w=1000&auto=format&fit=crop"
    ],
    "GOOGLE AI": [
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1000&auto=format&fit=crop"
    ],
    "DEV": [
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1000&auto=format&fit=crop"
    ],
    "BUSINESS": [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=1000&auto=format&fit=crop"
    ]
}


def strip_html(text):
    """Remove HTML tags and decode entities from text."""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', text)
    clean = html.unescape(clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean


def estimate_read_time(text):
    """Estimate reading time based on word count."""
    if not text:
        return "2 min read"
    word_count = len(text.split())
    minutes = max(2, round(word_count / 200))
    return f"{minutes} min read"


def fetch_dynamic_media(headline, default_tag):
    """Fetch a relevant GIF/video from Tenor based on the headline."""
    try:
        # Clean headline to just words, take first 4-5 words for better match
        words = re.findall(r'\b[a-zA-Z0-9]+\b', headline)
        query = " ".join(words[:4]) if len(words) >= 4 else headline
        q = urllib.parse.quote_plus(query)
        url = f"https://g.tenor.com/v1/search?q={q}&key=LIVDSRZULELA&limit=1&media_filter=minimal"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=1.0) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('results'):
                media = data['results'][0]['media'][0]
                if 'mp4' in media:
                    return media['mp4']['url']
                elif 'gif' in media:
                    return media['gif']['url']
    except Exception as e:
        pass
    return None


def build_content_html(title, description, source_tag, link):
    """Build styled article content HTML from RSS description."""
    desc_text = strip_html(description) if description else ""

    if not desc_text:
        desc_text = f"Read the full analysis on this {source_tag.lower()} signal."

    # Split into paragraphs for better readability
    sentences = desc_text.split('. ')
    paragraphs = []
    current = []
    for s in sentences:
        current.append(s)
        if len(current) >= 3:
            paragraphs.append('. '.join(current) + ('.' if not current[-1].endswith('.') else ''))
            current = []
    if current:
        paragraphs.append('. '.join(current) + ('.' if not current[-1].endswith('.') else ''))

    content = f'''
        <p class="mb-4 text-lg leading-relaxed text-slate-300">
            <span class="text-primary font-bold">SIGNAL DETECTED:</span> {paragraphs[0] if paragraphs else desc_text}
        </p>
    '''

    for p in paragraphs[1:]:
        content += f'''
        <p class="mb-6 leading-relaxed text-slate-400">
            {p}
        </p>
        '''

    content += f'''
        <div class="bg-surface border border-border-navy p-4 rounded-lg my-6">
            <h4 class="text-sm font-mono text-slate-500 uppercase mb-2">Source Intelligence</h4>
            <div class="flex justify-between items-end">
                <span class="text-lg font-bold text-white">{source_tag}</span>
                <a href="{link}" target="_blank" rel="noopener" class="text-primary text-sm hover:underline">View Original →</a>
            </div>
        </div>
    '''

    return content


def fetch_and_parse_feeds():
    news_items = []
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

    for feed_config in RSS_FEEDS:
        try:
            req = urllib.request.Request(feed_config['url'], headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                xml_data = response.read()
                
            root = ET.fromstring(xml_data)
            items = root.findall('.//item')
            if not items:
                items = root.findall('.//{http://www.w3.org/2005/Atom}entry')
            
            for item in items[:4]:  # Limit to 4 per source for speed
                title_elem = item.find('title')
                link_elem = item.find('link')
                desc_elem = item.find('description')
                pubdate_elem = item.find('pubDate')
                
                # Atom fallbacks
                if title_elem is None:
                    title_elem = item.find('{http://www.w3.org/2005/Atom}title')
                if link_elem is None:
                    atom_link = item.find('{http://www.w3.org/2005/Atom}link')
                    link = atom_link.attrib.get('href') if atom_link is not None else "#"
                else:
                    link = link_elem.text

                # Atom content/summary fallback
                if desc_elem is None:
                    desc_elem = item.find('{http://www.w3.org/2005/Atom}summary')
                if desc_elem is None:
                    desc_elem = item.find('{http://www.w3.org/2005/Atom}content')

                title_text = title_elem.text if title_elem is not None else "No Title"

                # Try to fetch dynamic media first
                image_url = fetch_dynamic_media(title_text, feed_config["tag"])

                if not image_url:
                    # Extract image from various sources
                    media_content = item.find('{http://search.yahoo.com/mrss/}content')
                    if media_content is not None:
                        image_url = media_content.attrib.get('url')
                    
                    if not image_url:
                        enclosure = item.find('enclosure')
                        if enclosure is not None and enclosure.attrib.get('type', '').startswith('image'):
                            image_url = enclosure.attrib.get('url')
                    
                    if not image_url and desc_elem is not None and desc_elem.text:
                        if '<img' in desc_elem.text:
                            start = desc_elem.text.find('src="')
                            if start != -1:
                                start += 5
                                end = desc_elem.text.find('"', start)
                                image_url = desc_elem.text[start:end]

                if not image_url:
                    image_url = random.choice(FALLBACK_IMAGES.get(feed_config["tag"], FALLBACK_IMAGES["TECH"]))

                # Parse publication date
                ts = 0.0
                if pubdate_elem is not None and pubdate_elem.text:
                    try:
                        dt = parsedate_to_datetime(pubdate_elem.text)
                        ts = dt.timestamp()
                    except Exception:
                        ts = time.time()
                else:
                    ts = time.time()

                desc_text = desc_elem.text if desc_elem is not None else ""
                clean_desc = strip_html(desc_text)

                # Build content and metadata
                read_time = estimate_read_time(clean_desc)
                content_html = build_content_html(title_text, desc_text, feed_config["tag"], link)

                # Author extraction — try dc:creator, then fallback to source tag
                author_elem = item.find('{http://purl.org/dc/elements/1.1/}creator')
                author = author_elem.text if author_elem is not None and author_elem.text else feed_config["tag"]

                news_items.append({
                    "id": str(hash(title_text)),
                    "headline": title_text,
                    "tag": feed_config["tag"],
                    "impactScore": f"{8.0 + (len(title_text) % 20) / 10:.1f}",
                    "readTime": read_time,
                    "author": author,
                    "content": content_html,
                    "timestamp": ts,
                    "image": image_url,
                    "link": link,
                    "source": feed_config["tag"]
                })
                
        except Exception as e:
            continue

    news_items.sort(key=lambda x: x['timestamp'], reverse=True)
    return news_items

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
        self.end_headers()
        
        news = fetch_and_parse_feeds()
        self.wfile.write(json.dumps(news).encode())
