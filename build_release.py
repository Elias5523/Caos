from pathlib import Path
import base64, re, zipfile
root=Path('/mnt/data/portal-caos')
html=(root/'index.html').read_text(encoding='utf-8')
js=(root/'script.js').read_text(encoding='utf-8')
for name in ['krampus.png','nightmare-stalker.png','favicon.svg','sigil.svg']:
    path=root/'assets'/name
    mime='image/png' if name.endswith('.png') else 'image/svg+xml'
    data=f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
    html=html.replace('assets/'+name,data)
    js=js.replace('assets/'+name,data)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>\n'+(root/'style.css').read_text(encoding='utf-8')+'\n</style>')
html=html.replace('<script src="script.js" defer></script>', '')
html=html.replace('</body>','<script>\n'+js+'\n</script>\n</body>')
html=re.sub(r'<link rel="preconnect" href="https://[^>]+>', '', html)
standalone=Path('/mnt/data/portal-caos-atualizado.html')
standalone.write_text(html,encoding='utf-8')
(root/'LEIA-ME.txt').write_text('''O REINO DE LUGAR NENHUM — BORN IN CHAOS\n\nVERSÃO ATUALIZADA COM AS IMAGENS FORNECIDAS PELO USUÁRIO\n- Krampus: assets/krampus.png (segunda imagem enviada).\n- Nightmare Stalker: assets/nightmare-stalker.png (terceira imagem enviada).\n- Removidas as antigas figuras desenhadas de ambos os personagens.\n\nCOMO ABRIR\nOpção 1: descompacte esta pasta e abra index.html no navegador.\nOpção 2: use o arquivo portal-caos-atualizado.html (distribuído separadamente), que inclui os recursos em um único arquivo.\n\nAs animações dos raios vermelhos, líquido preto, dossiês, medidor de maldade, experiência Stalker e ritual continuam funcionando.\n\nO layout funciona offline, mas as fontes Google poderão utilizar fontes alternativas sem internet.\nProjeto não oficial inspirado em Born in Chaos.\n''',encoding='utf-8')
zip_path=Path('/mnt/data/portal-caos-atualizado-completo.zip')
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for filename in ['index.html','style.css','script.js','LEIA-ME.txt']:
        z.write(root/filename,'portal-caos/'+filename)
    for p in (root/'assets').iterdir():
        if p.is_file(): z.write(p,'portal-caos/assets/'+p.name)
print('BUILT',standalone,standalone.stat().st_size,'ZIP',zip_path.stat().st_size)
