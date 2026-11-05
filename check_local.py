from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for label,size in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
  page=browser.new_page(viewport=size,reduced_motion='reduce')
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.goto('http://127.0.0.1:8765/index.html',wait_until='domcontentloaded',timeout=15000)
  page.wait_for_timeout(250)
  res=page.evaluate('''() => {document.querySelector('[data-profile="stalker"]').click(); let title=document.querySelector('#profile-title').textContent; document.querySelector('#raise-malice').click(); let malice=document.querySelector('#malice-value').textContent; document.querySelector('#reveal-stalker').click(); let reveal=document.querySelector('#anomaly-window').classList.contains('revealed');for(let r of ['eye','horn','rift'])document.querySelector('[data-rune="'+r+'"]').click();return {title,malice,reveal,images:[...document.querySelectorAll('img')].map(i=>[i.alt,i.complete,i.naturalWidth]).filter(i=>i[0].includes('Krampus')||i[0].includes('Stalker')),overflow:document.documentElement.scrollWidth-innerWidth}}''')
  print(label,res,'errors',errors,flush=True)
  assert res['title']=='NIGHTMARE STALKER' and res['malice']=='020' and res['reveal'] and res['overflow']==0 and not errors
  assert all(i[2] for i in res['images'])
  if label=='mobile':
   page.screenshot(path='/mnt/data/portal-caos/hero-mobile-novo.png',timeout=20000,animations='disabled')
  page.close()
 browser.close()
