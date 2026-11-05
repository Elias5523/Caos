(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
  let audioCtx = null;
  let audioRunning = false;
  let ambientNodes = [];
  let toastTimer;
  let profile = 'krampus';

  const prelude = $('#prelude');
  window.addEventListener('load', () => setTimeout(() => prelude?.classList.add('done'), 1600));
  setTimeout(() => prelude?.classList.add('done'), 3000);

  /* Sticky active section navigation, accessible mobile menu. */
  const mobileButton = $('#mobile-menu-btn');
  const mobileNav = $('#mobile-nav');
  mobileButton?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    mobileButton.setAttribute('aria-expanded', String(isOpen));
    mobileButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    mobileButton.setAttribute('aria-expanded', 'false');
  }));
  const sectionIDs = ['inicio','entidades','dossie','manifestacao'];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach(entry => {
        $$('.desktop-nav a').forEach(link => link.classList.toggle('nav-active', link.getAttribute('href') === '#' + entry.target.id));
      });
    }, {rootMargin:'-25% 0px -65% 0px'});
    sectionIDs.forEach(id => { const sec = $('#' + id); if (sec) navObserver.observe(sec); });
  }

  /* Mouse-following glow and subtle parallax. */
  const cursor = $('#cursor-light');
  const heroArt = $('#hero-art');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let smoothX = mouseX, smoothY = mouseY;
  let parallaxFrame;
  window.addEventListener('pointermove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!reducedMotion && !parallaxFrame) parallaxFrame = requestAnimationFrame(moveCursor);
  }, {passive: true});
  function moveCursor() {
    parallaxFrame = null;
    smoothX += (mouseX - smoothX) * 0.17;
    smoothY += (mouseY - smoothY) * 0.17;
    if (cursor) cursor.style.transform = `translate(${smoothX - 230}px,${smoothY - 230}px)`;
    if (window.innerWidth > 700 && heroArt) {
      const px = (mouseX / window.innerWidth - .5) * 22;
      const py = (mouseY / window.innerHeight - .5) * 12;
      const krampus = $('.hero-krampus');
      const stalker = $('.hero-stalker');
      if (krampus) krampus.style.transform = `translate(${px * -.65}px,${py * -.55}px)`;
      if (stalker) stalker.style.transform = `translate(${px * .5}px,${py * .4}px)`;
    }
    if (Math.abs(mouseX - smoothX) + Math.abs(mouseY - smoothY) > 1) parallaxFrame = requestAnimationFrame(moveCursor);
  }

  /* Black viscous drops from the roof and edges. */
  const droplets = $('#droplets');
  if (droplets && !reducedMotion) {
    const dropPositions = [3,8,13,20,26,33,40,47,54,60,67,74,80,86,92,97];
    dropPositions.forEach((left, i) => {
      const drop = document.createElement('i');
      drop.className = 'droplet';
      drop.style.setProperty('--left', left + '%');
      drop.style.setProperty('--length', (35 + (i * 29 % 69)) + 'px');
      drop.style.setProperty('--width', (3 + (i * 3 % 6)) + 'px');
      drop.style.setProperty('--time', (5.8 + (i * 19 % 45) / 10) + 's');
      drop.style.setProperty('--delay', (-i * .82) + 's');
      droplets.appendChild(drop);
    });
  }

  /* Branching red chaos lightning throughout the viewport. Not a background video. */
  const canvas = $('#storm-canvas');
  const ctx = canvas?.getContext('2d');
  const flash = $('#storm-flash');
  let bolts = [], canvasW = 0, canvasH = 0, lastSpawn = 0, nextSpawn = 1700, stormBoost = 0;
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasW = window.innerWidth;
    canvasH = window.innerHeight;
    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resizeCanvas, {passive:true});
  resizeCanvas();
  function pointsBetween(a,b,steps,scatter) {
    const points = [];
    const dx = b.x - a.x, dy = b.y - a.y;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const offset = (Math.random() - .5) * scatter * Math.sin(Math.PI*t);
      points.push({x:a.x+dx*t + offset * (Math.abs(dy)>Math.abs(dx)?1:.22),y:a.y+dy*t + offset * (Math.abs(dx)>Math.abs(dy)?1:.22)});
    }
    return points;
  }
  function createBolt(intense = false) {
    if (reducedMotion || !canvasW) return;
    const horizontal = Math.random() < .7;
    const start = horizontal ? {x:-40,y:canvasH*(.07+Math.random()*.85)} : {x:canvasW*(.1+Math.random()*.85),y:-30};
    const end = horizontal ? {x:canvasW+40,y:clamp(start.y + (Math.random()-.5)*canvasH*.48,30,canvasH-30)} : {x:clamp(start.x+(Math.random()-.5)*canvasW*.5,0,canvasW),y:canvasH+30};
    const points = pointsBetween(start,end,Math.round(13+Math.random()*11),intense?105:59);
    const branches = [];
    for (let i=3; i<points.length-3; i+=3) {
      if (Math.random()>.63) {
        const p = points[i], target = {x:p.x+(Math.random()-.5)*240,y:p.y+(Math.random()-.5)*180};
        branches.push(pointsBetween(p,target,4,26));
      }
    }
    bolts.push({points,branches,created:performance.now(),life:intense?520:230,intense});
    if (bolts.length>7) bolts.shift();
    if (intense || Math.random()>.75) {
      flash?.classList.add('active');
      setTimeout(() => flash?.classList.remove('active'),intense?130:65);
    }
  }
  function strokePath(points, strength, branch=false) {
    if (!ctx) return;
    ctx.beginPath();
    points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
    ctx.strokeStyle = `rgba(220,15,46,${.13*strength})`;
    ctx.lineWidth = branch?7:20;
    ctx.shadowColor = '#ff172f';
    ctx.shadowBlur = branch?12:25;
    ctx.stroke();
    ctx.strokeStyle = `rgba(245,29,53,${.72*strength})`;
    ctx.lineWidth = branch?.65:2.8;
    ctx.shadowBlur = 13;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,182,178,${.83*strength})`;
    ctx.lineWidth = branch?.32:.8;
    ctx.shadowBlur = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  function animateStorm(now) {
    if (!ctx || reducedMotion) return;
    ctx.clearRect(0,0,canvasW,canvasH);
    if (now-lastSpawn>nextSpawn) {
      createBolt(false);
      lastSpawn = now;
      nextSpawn = (1450+Math.random()*1750)/(1+stormBoost);
    }
    bolts = bolts.filter(b => now-b.created < b.life);
    bolts.forEach(b => {
      const age = (now-b.created)/b.life;
      const s = Math.pow(1-age,1.6)*(age<.13?.7:1);
      strokePath(b.points,s);
      b.branches.forEach(branch => strokePath(branch,s*.6,true));
    });
    requestAnimationFrame(animateStorm);
  }
  if (!reducedMotion) requestAnimationFrame(animateStorm);
  const stormBurst = () => {
    createBolt(true);
    setTimeout(() => createBolt(true),150);
    playSting();
  };

  /* Profiles follow mod mechanics; poetic titles and dossier prose are decorative. */
  const profiles = {
    krampus: {
      id:'K—001', title:'KRAMPUS', label:'O CASTIGO QUE CAMINHA PELA NEVE',
      description:'Uma presença brutal que surge em regiões geladas ou quando a maldade acumulada ultrapassa todos os limites. O som de sua aproximação não é um aviso. É uma sentença.',
      when:'APÓS A 10ª NOITE', domain:'GELO / PUNIÇÃO', threat:'EXTREMA', index:'SUJEITO 01 / INVOCADO',
      image:'assets/krampus.png', alt:'Imagem do emblema de Krampus fornecida pelo usuário',
      abilities:[
        ['DESARMAMENTO','Seus golpes podem derrubar os itens que você segura.'],
        ['LACAIOS','Invoca Krampus Henchmen para ajudá-lo a atacar.'],
        ['NEVASCA','Quando enfraquecido, provoca uma tempestade que congela adversários.']
      ]
    },
    stalker: {
      id:'N—002',title:'NIGHTMARE STALKER',label:'A PRESENÇA INVISÍVEL QUE NÃO DESISTE',
      description:'Um espírito que começa a surgir a partir da terceira noite. Invisível enquanto se aproxima, revela apenas dois olhos brilhantes. Seu grito traz um olhar de terror que transforma a fuga em desespero.',
      when:'A PARTIR DA 3ª NOITE', domain:'SOMBRA / TERROR', threat:'EXTREMA', index:'SUJEITO 02 / À ESPREITA',
      image:'assets/nightmare-stalker.png', alt:'Imagem do emblema do Nightmare Stalker fornecida pelo usuário',
      abilities:[
        ['CAMUFLAGEM','Invisível e mais veloz até receber dano.'],
        ['OLHAR DE TERROR','Impõe escuridão e outros efeitos debilitantes durante a caçada.'],
        ['EVOLUÇÃO','Sua força aumenta com os dias do mundo, até o dia 100.']
      ]
    }
  };
  function selectProfile(key, scroll = false) {
    if (!(key in profiles)) return;
    profile = key;
    const entry = profiles[key];
    const c = $('#dossier-console');
    if (c) c.dataset.current = key;
    const fields = {
      '#profile-id':entry.id,'#profile-title':entry.title,'#profile-label':entry.label,
      '#profile-description':entry.description,'#stat-when':entry.when,
      '#stat-domain':entry.domain,'#stat-threat':entry.threat,'#console-img-index':entry.index
    };
    Object.entries(fields).forEach(([selector,value]) => {const el = $(selector); if(el) el.textContent = value;});
    const image = $('#profile-image');
    if (image) { image.src = entry.image; image.alt = entry.alt; }
    const list = $('#ability-list');
    if(list) list.replaceChildren(...entry.abilities.map(([title,description],i) => {
      const row = document.createElement('div');
      row.className = 'ability-row';
      const index = document.createElement('span'); index.textContent = String(i+1).padStart(2,'0');
      const details = document.createElement('div');
      const strong = document.createElement('b'); strong.textContent = title;
      const small = document.createElement('small'); small.textContent = description;
      details.append(strong,small);
      const arrow = document.createElement('span'); arrow.textContent = '↗';
      row.append(index,details,arrow);
      return row;
    }));
    $$('[data-profile]').forEach(button => {
      const active = button.dataset.profile === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed',String(active));
    });
    if (scroll) $('#dossie')?.scrollIntoView({behavior:reducedMotion?'instant':'smooth'});
  }
  $$('[data-profile]').forEach(btn => btn.addEventListener('click', () => selectProfile(btn.dataset.profile)));
  $$('[data-select]').forEach(el => el.addEventListener('click',() => selectProfile(el.dataset.select,true)));

  /* A short local simulation of the Krampus naughtiness mechanic. */
  let malice = 0;
  const maliceEl = $('#maldade');
  const maliceValue = $('#malice-value');
  const maliceSnow = $('#malice-snow');
  if (maliceSnow && !reducedMotion) {
    for (let i=0;i<31;i++) {
      const s = document.createElement('span');
      s.className = 'snowflake'; s.textContent = i%4?'·':'✦';
      s.style.setProperty('--snow-left', (i*41 % 100)+'%');
      s.style.setProperty('--snow-size',(5+i*7%9)+'px');
      s.style.setProperty('--snow-time',(4+i*17%65/10)+'s');
      s.style.setProperty('--snow-delay',(-i*0.43)+'s');
      maliceSnow.appendChild(s);
    }
  }
  function updateMalice(next) {
    const prev = malice;
    malice = clamp(next,0,100);
    if (maliceValue) maliceValue.textContent = String(malice).padStart(3,'0');
    const fill = $('#malice-fill'); if (fill) fill.style.width = malice+'%';
    const title=$('#malice-state-title'),desc=$('#malice-state-description'),icon=$('#malice-icon');
    let t,d,i;
    if(malice<25){t='SEU NOME AINDA NÃO FOI PRONUNCIADO.';d='Nenhuma presença detectada nas proximidades.';i='◇';}
    else if(malice<50){t='VOCÊ OUVIU OS SINOS?';d='Algo percebeu suas transgressões.';i='♢';}
    else if(malice<80){t='PASSOS EM MEIO À NEVE.';d='Uma advertência se aproxima do limiar.';i='♈';}
    else if(malice<100){t='O JULGAMENTO ESTÁ PRÓXIMO.';d='Os servos se movem. O inverno está despertando.';i='⛧';}
    else{t='KRAMPUS FOI DESPERTADO.';d='O índice máximo foi alcançado. Não existe retorno fácil.';i='✣';}
    if (title) title.textContent=t;
    if (desc) desc.textContent=d;
    if (icon) icon.textContent=i;
    maliceEl?.classList.toggle('frost',malice>=50);
    maliceEl?.classList.toggle('maxed',malice>=100);
    if (malice===100 && prev<100) {
      stormBurst();
      setTimeout(()=>showEncounter('krampus'),330);
    } else if (malice>=80 && prev<80) stormBurst();
  }
  $('#raise-malice')?.addEventListener('click',()=>{updateMalice(malice+20);playClick(.24)});
  $('#lower-malice')?.addEventListener('click',()=>{updateMalice(malice-15);playClick(.14)});

  /* Infrared/security-camera encounter: eyes alone or full beast. */
  const anomaly = $('#anomaly-window');
  const revealButton = $('#reveal-stalker');
  revealButton?.addEventListener('click',()=>{
    const shown=anomaly.classList.toggle('revealed');
    $('#window-message').textContent = shown ? '// FORMA VERDADEIRA DETECTADA — FUJA' : '// DOIS PONTOS LUMINOSOS DETECTADOS';
    revealButton.querySelector('span').textContent = shown ? 'OCULTAR PRESENÇA' : 'REVELAR PRESENÇA';
    if (shown) {stormBurst();playClick(.6);} else playClick(.16);
  });
  function clock() {
    const label=$('#window-time');
    if(label) label.textContent=new Date().toLocaleTimeString('pt-BR',{hour12:false});
  }
  clock();setInterval(clock,1000);

  /* A little runic puzzle – stateful and keyboard usable. */
  const runeOrder=['eye','horn','rift'];
  let runePosition=0;
  function resetRitual(message='SELO ADORMECIDO. AGUARDANDO CONTATO.') {
    runePosition=0;
    $$('.rune').forEach(button=>{button.classList.remove('done');button.disabled=false;button.setAttribute('aria-pressed','false');});
    $$('.progress-segments i').forEach(seg=>seg.classList.remove('lit'));
    $('#ritual-log').textContent=message;
    $('#seal-count').textContent='00 / 03';
    $('#ritual-altar')?.classList.remove('unsealed');
  }
  $$('.rune').forEach(button=>button.addEventListener('click',()=>{
    const chosen=button.dataset.rune;
    if (chosen !== runeOrder[runePosition]) {
      stormBurst();
      resetRitual('ORDEM INTERROMPIDA. O SELO REJEITOU O CONTATO.');
      toast('SINAL INCORRETO. O RITUAL RECOMEÇOU.');
      return;
    }
    button.classList.add('done');button.disabled=true;button.setAttribute('aria-pressed','true');
    const segments=$$('.progress-segments i');
    segments[runePosition]?.classList.add('lit');
    runePosition++;
    $('#seal-count').textContent=String(runePosition).padStart(2,'0')+' / 03';
    const texts=['O OLHAR FOI RECONHECIDO.','OS CHIFRES RESPONDERAM AO CHAMADO.','O SELO FOI ROMPIDO.'];
    $('#ritual-log').textContent=texts[runePosition-1];
    playClick(.1+runePosition*.18);
    if (runePosition===3) {
      $('#ritual-altar')?.classList.add('unsealed');
      stormBoost=2.5;
      stormBurst();
      setTimeout(()=>{showEncounter(profile);stormBoost=0},530);
    }
  }));
  $('#reset-ritual')?.addEventListener('click',()=>resetRitual());
  $('#hero-summon')?.addEventListener('click',()=>{
    $('#manifestacao')?.scrollIntoView({behavior:reducedMotion?'instant':'smooth'});
    stormBurst();
  });

  /* Modal apparition, tied to the currently chosen profile. */
  const encounter=$('#encounter');
  function showEncounter(key) {
    const isKrampus=key==='krampus';
    $('#encounter-image').src=isKrampus?'assets/krampus.png':'assets/nightmare-stalker.png';
    $('#encounter-image').alt=isKrampus?'Krampus se manifesta':'Nightmare Stalker se manifesta';
    $('#encounter-title').textContent=isKrampus?'O INVERNO VEIO COBRAR.':'ELE SABE QUE VOCÊ ESTÁ AQUI.';
    $('#encounter-text').textContent=isKrampus?'Os chifres surgem da nevasca. Sua dívida foi encontrada.':'A escuridão encontrou uma passagem. Dois olhos nunca deixaram de olhar.';
    encounter?.classList.add('open');
    encounter?.setAttribute('aria-hidden','false');
    document.body.classList.add('encounter-open');
    $('#encounter-close')?.focus();
    playSting();
  }
  function closeEncounter() {
    encounter?.classList.remove('open');
    encounter?.setAttribute('aria-hidden','true');
    document.body.classList.remove('encounter-open');
    resetRitual();
    if(malice>=100) updateMalice(0);
  }
  $('#encounter-close')?.addEventListener('click',closeEncounter);
  $('#encounter-exit')?.addEventListener('click',closeEncounter);
  $('.encounter-backdrop')?.addEventListener('click',closeEncounter);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&encounter?.classList.contains('open'))closeEncounter();});
  function toast(message) {
    const el=$('#toast');if(!el)return;
    el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
  }

  /* Opt-in audio synthesized locally with Web Audio, no external tracks. */
  const soundToggle=$('#sound-toggle');
  function getAudioContext() {
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if (!Ctx)return null;
    try {audioCtx??=new Ctx();return audioCtx;}catch{return null;}
  }
  function stopAmbient() {
    ambientNodes.forEach(node=>{try{node.stop?.()}catch{}try{node.disconnect?.()}catch{}});
    ambientNodes=[];audioRunning=false;
    soundToggle?.setAttribute('aria-pressed','false');
    if (soundToggle) soundToggle.querySelector('span').textContent='SOM OFF';
    soundToggle?.setAttribute('aria-label','Ativar áudio ambiente');
  }
  function startAmbient() {
    const ac=getAudioContext();if(!ac){toast('ÁUDIO INDISPONÍVEL NESTE NAVEGADOR.');return;}
    ac.resume();
    stopAmbient();
    const master=ac.createGain();master.gain.value=.045;master.connect(ac.destination);
    ambientNodes.push(master);
    [39.5,40.3,59.5,83].forEach((freq,i)=>{
      const osc=ac.createOscillator(),gain=ac.createGain();
      osc.type=i<2?'sawtooth':'sine';osc.frequency.value=freq;
      gain.gain.value=i<2?.10:.21;
      osc.connect(gain);gain.connect(master);osc.start();
      ambientNodes.push(osc,gain);
    });
    const lfo=ac.createOscillator(),lfoGain=ac.createGain();
    lfo.frequency.value=.12;lfoGain.gain.value=.019;lfo.connect(lfoGain);lfoGain.connect(master.gain);lfo.start();
    ambientNodes.push(lfo,lfoGain);
    audioRunning=true;
    soundToggle?.setAttribute('aria-pressed','true');
    if(soundToggle)soundToggle.querySelector('span').textContent='SOM ON';
    soundToggle?.setAttribute('aria-label','Desativar áudio ambiente');
  }
  soundToggle?.addEventListener('click',()=>audioRunning?stopAmbient():startAmbient());
  document.addEventListener('visibilitychange',()=>{
    if (document.hidden && audioCtx) audioCtx.suspend();
    else if (!document.hidden && audioRunning && audioCtx) audioCtx.resume();
  });
  function playClick(intensity=.1) {
    if(!audioRunning||!audioCtx)return;
    const ac=audioCtx,osc=ac.createOscillator(),gain=ac.createGain();
    const start=ac.currentTime;
    osc.type='triangle';osc.frequency.setValueAtTime(140+intensity*200,start);osc.frequency.exponentialRampToValueAtTime(48,start+.2);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.055,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.2);
    osc.connect(gain);gain.connect(ac.destination);osc.start(start);osc.stop(start+.22);
  }
  function playSting() {
    if(!audioRunning||!audioCtx)return;
    const ac=audioCtx,start=ac.currentTime;
    [77,82.4,39].forEach((hz,i)=>{
      const osc=ac.createOscillator(),gain=ac.createGain();osc.type=i===2?'sawtooth':'triangle';
      osc.frequency.setValueAtTime(hz,start);osc.frequency.linearRampToValueAtTime(hz*.57,start+.7);
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(i===2?.06:.075,start+.06);gain.gain.exponentialRampToValueAtTime(.0001,start+1.1);
      osc.connect(gain);gain.connect(ac.destination);osc.start(start);osc.stop(start+1.15);
    });
  }
})();
