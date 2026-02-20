from playwright.sync_api import sync_playwright
import time

def test_trendwire():
    with sync_playwright() as p:
        # Launch browser
        try:
            browser = p.chromium.launch(headless=True)
        except Exception as e:
            print(f"Error launching browser: {e}")
            print("Trying to install chromium again...")
            import subprocess
            subprocess.run(["/Users/rohanpillai/Library/Python/3.9/bin/playwright", "install", "chromium"])
            browser = p.chromium.launch(headless=True)
            
        page = browser.new_page()
        
        # 1. Navigate to App
        print("Navigating to http://localhost:8080...")
        page.goto('http://localhost:8080')
        page.wait_for_load_state('networkidle')
        
        # 2. Visual Verification
        title = page.title()
        print(f"Page Title: {title}")
        assert "Trendwire" in title
        
        # 3. Feed Verification
        # Wait for bento grid to be populated
        page.wait_for_selector('.bento-grid > div')
        cards = page.locator('.bento-grid > div')
        count = cards.count()
        print(f"Found {count} feed cards.")
        assert count > 0
        
        # 4. Paywall Functional Test
        print("Testing Paywall Logic (Clicking 6 articles)...")
        
        # Click the first card 6 times (or different cards)
        # The logic counts total clicks, not unique articles
        first_card = cards.first
        for i in range(6):
            first_card.click()
            print(f"Clicked article {i+1}")
            time.sleep(0.2) # Simulate user behavior
            
        # 5. Check Log Output
        # Verify Paywall Overlay is visible
        overlay = page.locator('#paywall-overlay')
        
        # Check if 'hidden' class is removed
        classes = overlay.get_attribute('class')
        print(f"Overlay classes: {classes}")
        
        if 'hidden' not in classes:
            print("SUCCESS: Paywall verified visible.")
        else:
            print("FAILURE: Paywall not visible.")
            
        browser.close()

if __name__ == "__main__":
    test_trendwire()
