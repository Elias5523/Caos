from playwright.sync_api import sync_playwright
from pathlib import Path
content=Path('/mnt/data/portal-caos-atualizado.html').read_text(encoding='utf-8')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for label,size in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
  page=browser.new_page(viewport=size,reduced_motion='reduce')
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.set_content(content,wait_until='domcontentloaded',timeout=20000)
  page.wait_for_timeout(200)
  res=page.evaluate('''() => {let b=document.querySelector('[data-profile="stalker"]'); b.click(); let title=document.querySelector('#profile-title').textContent; document.querySelector('#raise-malice').click(); let malice=document.querySelector('#malice-value').textContent; document.querySelector('#reveal-stalker').click(); let reveal=document.querySelector('#anomaly-window').classList.contains('revealed'); for (let r of ['eye','horn','rift']) document.querySelector('[data-rune="'+r+'"]').click(); return { title, malice, reveal, pngs:[...document.querySelectorAll('img')].filter(x=>x.src.startsWith('data:image/png')).length, overflow:document.documentElement.scrollWidth-innerWidth}; }''')
  print(label,res, 'errors',errors,flush=True)
  assert res['title']=='NIGHTMARE STALKER' and res['malice']=='020' and res['reveal'] and res['pngs']>=7 and res['overflow']==0 and not errors
  if label=='mobile':
   page.screenshot(path='/mnt/data/portal-caos/hero-mobile-novo.png',animations='disabled',timeout=15000)
  page.close()
 browser.close()
