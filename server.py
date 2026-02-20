import http.server
import socketserver
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import json
import time
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone, timedelta

PORT = 8080

# Configuration: Top-tier High-Signal Sources
RSS_FEEDS = [
    {"url": "https://www.theverge.com/rss/index.xml", "tag": "TECH", "weight": 10},
    {"url": "https://techcrunch.com/feed/", "tag": "STARTUPS", "weight": 9},
    {"url": "https://openai.com/blog/rss.xml", "tag": "AI RESEARCH", "weight": 10}, # Check generic structure
    {"url": "https://feeds.feedburner.com/blogspot/gJZg", "tag": "GOOGLE AI", "weight": 9}, # Google AI Blog
    {"url": "https://devblogs.microsoft.com/python/feed/", "tag": "DEV", "weight": 8},
    {"url": "https://www.wired.com/feed/category/business/latest/rss", "tag": "BUSINESS", "weight": 8},
]

# Fallback images in case RSS item has none
import random

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
        "https://images.unsplash.com/photo-1531297461136-82lw9z1w?q=80&w=1000&auto=format&fit=crop"
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

cached_news = []
last_fetch_time = 0
CACHE_DURATION = 600  # 10 minutes

def fetch_and_parse_feeds():
    news_items = []
    
    # Headers to mimic a browser to avoid 403 Forbidden on some feeds
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

    for feed_config in RSS_FEEDS:
        print(f"Fetching {feed_config['url']}...")
        try:
            req = urllib.request.Request(feed_config['url'], headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                xml_data = response.read()
                
            root = ET.fromstring(xml_data)
            
            # Handle different RSS versions (usually 'channel/item' or 'entry')
            items = root.findall('.//item')
            if not items:
                items = root.findall('.//{http://www.w3.org/2005/Atom}entry')
            
            print(f"  - Found {len(items)} items")

            for item in items[:5]: # Take top 5 from each source
                title_elem = item.find('title')
                link_elem = item.find('link')
                desc_elem = item.find('description')
                pubdate_elem = item.find('pubDate')
                
                # Atom namespace handling
                if title_elem is None:
                    title_elem = item.find('{http://www.w3.org/2005/Atom}title')
                if link_elem is None:
                     # Atom links have href attribute
                    atom_link = item.find('{http://www.w3.org/2005/Atom}link')
                    link = atom_link.attrib.get('href') if atom_link is not None else "#"
                else:
                    link = link_elem.text

                # Image extraction logic
                image_url = None
                # Check media:content
                media_content = item.find('{http://search.yahoo.com/mrss/}content')
                if media_content is not None:
                    image_url = media_content.attrib.get('url')
                
                # Check enclosure
                if not image_url:
                    enclosure = item.find('enclosure')
                    if enclosure is not None and enclosure.attrib.get('type', '').startswith('image'):
                        image_url = enclosure.attrib.get('url')
                
                # Check description for img tag (simple check)
                if not image_url and desc_elem is not None and desc_elem.text:
                    if '<img' in desc_elem.text:
                         # Very basic extraction, might be fragile without regex or soup
                        start = desc_elem.text.find('src="')
                        if start != -1:
                            start += 5
                            end = desc_elem.text.find('"', start)
                            image_url = desc_elem.text[start:end]

                if not image_url:
                     image_url = random.choice(FALLBACK_IMAGES.get(feed_config["tag"], FALLBACK_IMAGES["TECH"]))

                # Date parsing
                pub_date_str = ""
                ts = 0.0
                if pubdate_elem is not None and pubdate_elem.text:
                     pub_date_str = pubdate_elem.text
                     try:
                        # Try parsing RFC 2822
                        dt = parsedate_to_datetime(pub_date_str)
                        ts = dt.timestamp()
                     except:
                        ts = time.time() # Fallback
                else:
                    # Atom updated/published
                    published_elem = item.find('{http://www.w3.org/2005/Atom}published') or item.find('{http://www.w3.org/2005/Atom}updated')
                    if published_elem is not None:
                         pub_date_str = published_elem.text
                         # Basic ISO parse (needs improved logic for full robustness)
                         ts = time.time() 

                # Filter > 24h
                # Check if recent
                # For simplicity in this mock-env, let's just accept them but sort.
                
                title_text = title_elem.text if title_elem is not None else "No Title"
                news_items.append({
                    "id": str(hash(title_text)),
                    "headline": title_text,
                    "tag": feed_config["tag"],
                    "impactScore": f"{8.0 + (len(title_elem.text)%20)/10:.1f}", # Mock impact score
                    "date": pub_date_str, # We will calc time ago on frontend or here
                    "timestamp": ts,
                    "image": image_url,
                    "link": link,
                    "source": feed_config["tag"] # Using Tag as source/author proxy for now
                })
                
        except Exception as e:
            print(f"Error fetching {feed_config['url']}: {e}")
            continue

    # Sort by timestamp (newest first)
    news_items.sort(key=lambda x: x['timestamp'], reverse=True)
    return news_items

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global cached_news, last_fetch_time

        if self.path == '/api/news':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Simple caching strategy
            if not cached_news or (time.time() - last_fetch_time > CACHE_DURATION):
                print("Cache expired or empty, fetching fresh news...")
                cached_news = fetch_and_parse_feeds()
                last_fetch_time = time.time()
            
            self.wfile.write(json.dumps(cached_news).encode())
        else:
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

print(f"Starting TrendWire Server on port {PORT}...")
http.server.HTTPServer(("", PORT), RequestHandler).serve_forever()
