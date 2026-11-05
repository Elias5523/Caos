from pathlib import Path
import shutil
root=Path('/mnt/data/portal-caos')
assets=root/'assets'
shutil.copy2('/mnt/data/image(20261103-145341).png', assets/'krampus.png')
shutil.copy2('/mnt/data/image(20261103-145344).png', assets/'nightmare-stalker.png')
html=root.joinpath('index.html').read_text(encoding='utf-8')
js=root.joinpath('script.js').read_text(encoding='utf-8')
html=html.replace('assets/krampus.svg','assets/krampus.png').replace('assets/nightmare-stalker.svg','assets/nightmare-stalker.png')
js=js.replace('assets/krampus.svg','assets/krampus.png').replace('assets/nightmare-stalker.svg','assets/nightmare-stalker.png')
html=html.replace('Ilustrações originais de Krampus e Nightmare Stalker','Imagens de Krampus e Nightmare Stalker')
html=html.replace('Krampus, criatura de chifres enormes e olhos vermelhos','Emblema de caveira com chifres e coroa de espinhos representando Krampus')
html=html.replace('Nightmare Stalker, criatura sombria com máscara de crânio','Cabeça sombria de carneiro com chifres representando Nightmare Stalker')
html=html.replace('Ilustração de Krampus','Emblema de caveira com chifres de Krampus')
html=html.replace('Ilustração de Nightmare Stalker','Emblema sombrio com chifres de Nightmare Stalker')
html=html.replace('Forma do Nightmare Stalker escondida na escuridão','Cabeça escura com chifres do Nightmare Stalker escondida nas sombras')
html=html.replace('ILUSTRAÇÕES E INTERAÇÕES CRIADAS PARA ESTA EXPERIÊNCIA.','IMAGENS ENVIADAS PELO CRIADOR DO SITE; INTERAÇÕES PERSONALIZADAS PARA ESTA EXPERIÊNCIA.')
js=js.replace('Ilustração original de Krampus','Imagem do emblema de Krampus fornecida pelo usuário').replace('Ilustração original de Nightmare Stalker','Imagem do emblema do Nightmare Stalker fornecida pelo usuário')
root.joinpath('index.html').write_text(html,encoding='utf-8')
root.joinpath('script.js').write_text(js,encoding='utf-8')
for fname in ['krampus.svg','nightmare-stalker.svg']:
    (assets/fname).unlink(missing_ok=True)
css='''

/* Retratos originais enviados pelo usuário — substituem as antigas figuras em SVG.
   Preserva todas as animações de caos, scanlines, sangue e observação. */
.hero-art{isolation:isolate}
.hero-krampus{
  width:47%;height:70%;left:17%;top:20%;z-index:3;
  filter:drop-shadow(0 24px 24px rgba(0,0,0,.85)) drop-shadow(0 0 24px rgba(193,43,53,.24));
}
.hero-stalker{
  width:43%;height:68%;left:57%;top:22%;z-index:2;opacity:.98;
  filter:drop-shadow(0 25px 22px rgba(0,0,0,.8)) drop-shadow(0 0 27px rgba(196,64,78,.43));
}
.hero-krampus img,.hero-stalker img{
  object-fit:contain;object-position:center center;
}
.hero-krampus:before,.hero-stalker:before{
  content:"";position:absolute;inset:18% 4% 13%;border-radius:50%;z-index:-1;pointer-events:none;
  background:radial-gradient(ellipse,rgba(162,35,52,.20),rgba(112,22,42,.08) 48%,transparent 72%);
  filter:blur(16px);
}
.hero-stalker:before{background:radial-gradient(ellipse,rgba(199,79,97,.21),rgba(134,25,42,.08) 49%,transparent 72%)}
.note-left{left:15%;top:67%}
.note-right{right:2%;top:35%}
.creature-art{top:4%;bottom:24%;left:5%;right:5%}
.creature-art img{height:100%;width:100%;object-position:center center;filter:drop-shadow(0 10px 20px rgba(0,0,0,.85)) drop-shadow(0 0 10px rgba(226,63,75,.13))}
.stalker-card .creature-art img{height:100%;filter:drop-shadow(0 10px 20px black) drop-shadow(0 0 28px rgba(171,120,142,.44))}
.stalker-card .card-haze{background:radial-gradient(circle,rgba(130,96,112,.23),transparent 70%)}
.console-art img{width:90%;height:83%;left:5%;bottom:9%;object-position:center center;filter:drop-shadow(0 17px 18px #020103) drop-shadow(0 0 26px rgba(178,48,64,.22))}
.dossier-console[data-current="stalker"] .console-art img{filter:drop-shadow(0 14px 18px black) drop-shadow(0 0 26px rgba(198,127,145,.35))}
.stalker-apparition{inset:8% 8% 3%;filter:brightness(.43) contrast(1.2) drop-shadow(0 0 18px #8e8eab)}
.anomaly-window.revealed .stalker-apparition{opacity:1;filter:brightness(.9) contrast(1.14) drop-shadow(0 0 31px #ad6073)}
.encounter-content img{top:4%;width:min(80%,390px);height:380px;opacity:.72;filter:drop-shadow(0 0 45px rgba(241,50,71,.3))}
@media(max-width:1300px){
  .hero-krampus{left:15%}
  .hero-stalker{left:56%}
}
@media(max-width:980px){
  .hero-krampus{width:49%;left:13%;top:17%}
  .hero-stalker{width:44%;left:55%;top:18%}
}
@media(max-width:700px){
  .hero-art{width:127%;height:64%;top:2%;right:-34%;opacity:.95}
  .hero-krampus{width:51%;height:76%;left:7%;top:2%}
  .hero-stalker{width:48%;height:74%;left:48%;top:4%}
  .creature-art{top:4%;bottom:23%}
  .console-art img{width:92%;height:90%;left:4%;bottom:5%}
  .encounter-content img{width:min(84%,340px);height:320px;top:10%}
}
'''
root.joinpath('style.css').write_text(root.joinpath('style.css').read_text(encoding='utf-8')+css,encoding='utf-8')
print('Updated', len(html), len(js), 'PNG files', list(p.name for p in assets.iterdir()))
