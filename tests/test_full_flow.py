from playwright.sync_api import sync_playwright
import time

def test_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        # Reset local storage
        page = context.new_page()
        page.goto('http://localhost:8080')
        page.evaluate("localStorage.clear()")
        page.reload()
        
        # 1. Verify Home Page
        print("1. Home Page Loaded")
        assert "Trendwire" in page.title()
        
        # 2. Verify Feed Interactions (Read 5 Articles)
        for i in range(1, 6):
            print(f"Reading Article {i}...")
            # Click the first card every time (it's simpler, logic counts clicks)
            # But to be robust, we should maybe click different ones if the link changes?
            # app.js renderFeed generates links.
            # We just need to click *any* card.
            page.locator('.bento-grid > div').first.click()
            
            # Wait for navigation
            page.wait_for_load_state('networkidle')
            
            # Verify we are on article page
            # Check URL or Title
            try:
                page.wait_for_selector('#article-title', timeout=5000)
            except:
                print(f"FAILED to load article {i}")
                print(page.content())
                break
                
            title = page.inner_text('#article-title')
            print(f"   Loaded: {title}")
            assert "Impact Score" in page.content() or "IMPACT SCORE" in page.content()
            
            # Go back to home
            page.goto('http://localhost:8080')
            page.wait_for_load_state('networkidle')
            
        print("Finished reading 5 articles.")
        
        # 3. Verify Paywall on 6th Click
        print("Attempting 6th Article (Should be blocked)...")
        page.locator('.bento-grid > div').first.click()
        
        # Should NOT navigate (or if it does, article page blocks)
        # app.js logic prevents navigation and shows modal.
        
        # Check for matching modal ID
        # app.js: showPaywall() removes 'hidden' class from #paywall-overlay
        
        time.sleep(1) 
        overlay = page.locator('#paywall-overlay')
        classes = overlay.get_attribute('class')
        print(f"Overlay classes: {classes}")
        
        if 'hidden' not in classes:
            print("SUCCESS: Paywall Modal Verified.")
        else:
            print(f"FAILURE: Paywall not visible. Current URL: {page.url}")
            # If it navigated, it might be stuck on article page?
            
        browser.close()

if __name__ == "__main__":
    test_full_flow()
