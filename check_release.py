from playwright.sync_api import sync_playwright
from pathlib import Path
url=Path('/mnt/data/portal-caos-atualizado.html').as_uri()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for label,width,height in [('desktop',1440,900),('mobile',390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[]
  page.on('pageerror', lambda e: errors.append(str(e)))
  page.set_content(Path('/mnt/data/portal-caos-atualizado.html').read_text(),wait_until='domcontentloaded',timeout=30000)
  page.wait_for_timeout(1800)
  count=page.locator('img[src^="data:image/png"]').count()
  dims=page.evaluate('''() => ({scrollWidth:document.documentElement.scrollWidth,width:innerWidth,imageOK:[...document.querySelectorAll('img')].map(i => ({alt:i.alt, complete:i.complete, naturalWidth:i.naturalWidth})).filter(i=>i.alt.includes('Krampus')||i.alt.includes('Stalker'))})''')
  print(label,'PNG imgs',count,'overflow',dims['scrollWidth']-dims['width'],'images',dims['imageOK'],'errors',errors,flush=True)
  page.screenshot(path=f'/mnt/data/portal-caos/hero-{label}-novo.png',animations='disabled')
  page.screenshot(path=f'/mnt/data/portal-caos/preview-{label}-novo.png',full_page=True,animations='disabled')
  if label=='desktop':
   page.locator('[data-profile="stalker"]').click()
   assert page.locator('#profile-title').inner_text()=='NIGHTMARE STALKER'
   src=page.locator('#profile-image').get_attribute('src')
   assert src.startswith('data:image/png;base64')
   page.locator('#reveal-stalker').click()
   assert 'revealed' in page.locator('#anomaly-window').get_attribute('class')
   page.locator('#raise-malice').click()
   assert page.locator('#malice-value').inner_text()=='020'
   for rune in ['eye','horn','rift']:
    page.locator('[data-rune="'+rune+'"]').click()
   page.wait_for_timeout(740)
   assert 'open' in page.locator('#encounter').get_attribute('class')
   assert page.locator('#encounter-image').get_attribute('src').startswith('data:image/png')
   page.locator('#encounter-close').click()
   assert 'open' not in page.locator('#encounter').get_attribute('class')
   print('PASS: dossier, reveal, malice, ritual, modal, self-contained src')
  page.close()
 browser.close()
