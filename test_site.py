from playwright.sync_api import sync_playwright
from pathlib import Path
import re,base64
root=Path('/mnt/data/portal-caos')
html=(root/'index.html').read_text()
for asset in ['krampus.svg','nightmare-stalker.svg','favicon.svg','sigil.svg']:
    payload='data:image/svg+xml;base64,'+base64.b64encode((root/'assets'/asset).read_bytes()).decode()
    html=html.replace('assets/'+asset, payload)
html=html.replace('<link rel="stylesheet" href="style.css">', '<style>'+ (root/'style.css').read_text()+'</style>')
html=html.replace('<script src="script.js" defer></script>', '')
html=html.replace('</body>', '<script>'+ (root/'script.js').read_text()+'</script></body>')
html=re.sub(r'<link rel="(?:preconnect|stylesheet)" href="https://[^>]+>', '', html)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda err: errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded',timeout=30000)
    page.wait_for_timeout(2200)
    page.screenshot(path='/mnt/data/portal-caos/preview-desktop.png',full_page=True,animations='disabled')
    page.locator('[data-profile="stalker"]').click()
    assert page.locator('#profile-title').inner_text() == 'NIGHTMARE STALKER'
    page.locator('#reveal-stalker').click()
    assert 'revealed' in page.locator('#anomaly-window').get_attribute('class')
    page.locator('#raise-malice').click()
    assert page.locator('#malice-value').inner_text() == '020'
    for rune in ['eye','horn','rift']:
        page.locator('[data-rune="'+rune+'"]').click()
    page.wait_for_timeout(750)
    assert 'open' in page.locator('#encounter').get_attribute('class')
    page.locator('#encounter-close').click()
    assert 'open' not in page.locator('#encounter').get_attribute('class')
    print('errors',errors)
    print('title',page.title())
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    mobile.set_content(html,wait_until='domcontentloaded')
    mobile.wait_for_timeout(1900)
    mobile.screenshot(path='/mnt/data/portal-caos/preview-mobile.png',full_page=True,animations='disabled')
    print('mobile scrollWidth:',mobile.evaluate('document.documentElement.scrollWidth'),'innerWidth:',mobile.evaluate('window.innerWidth'))
    browser.close()
