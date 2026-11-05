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

html=re.sub(r'<link rel="(?:preconnect|stylesheet)" href="https://[^>]+>', '', html)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,reduced_motion='reduce')
    errors=[]
    mobile.on('pageerror',lambda err: errors.append(str(err)))
    mobile.set_content(html,wait_until='domcontentloaded',timeout=25000)
    print('mobile-loaded',flush=True)
    mobile.wait_for_timeout(500)
    print('mobile scrollWidth:',mobile.evaluate('document.documentElement.scrollWidth'),'innerWidth:',mobile.evaluate('window.innerWidth'),flush=True)
    print('offenders:',mobile.evaluate('''() => [...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+4 && getComputedStyle(e).position!=='fixed').filter(e=>e.getBoundingClientRect().left<window.innerWidth).sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right).slice(0,25).map(e=>({name:e.tagName,cls:e.className?.baseVal||e.className,text:e.textContent?.trim().slice(0,25),right:Math.round(e.getBoundingClientRect().right),width:Math.round(e.getBoundingClientRect().width)}))'''),flush=True)
    mobile.screenshot(path='/mnt/data/portal-caos/preview-mobile.png',full_page=True,animations='disabled',timeout=25000)
    print('mobile screenshot done',flush=True)
    print('errors',errors,flush=True)
    browser.close()
