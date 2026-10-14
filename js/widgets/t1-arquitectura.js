/* ===== Widgets del tema 1: arquitectura GSM y TRAU ===== */
/* ---------- Tema 1: arquitectura clicable ---------- */
CX.w.arch=function(root){
  const SS={RSS:['--blue','Subsistema de radio'],BSS:['--orange','Subsistema de estaciones base'],NSS:['--green','Subsistema de red y conmutación'],OSS:['--slate','Subsistema de operación'],EXT:['--muted','Red externa']};
  const N={
    ms:{x:70,y:230,t:'MS',ss:'RSS',name:'MS, estación móvil',fn:'Terminal físico (Tx/Rx radio, codecs, pantalla, batería) más la SIM. Es el único elemento que habla por la interfaz aérea.',st:'En la SIM: IMSI, Ki, TMSI, área de localización, Kc, PIN y PUK.',ifc:'Um, con la BTS.'},
    bts:{x:205,y:230,t:'BTS',ss:'BSS',name:'BTS, estación transceptora base',fn:'Elemento pasivo que depende de un controlador. Tiene antenas, amplificadores y planta de energía, y sirve a una o más células. Suele incluir funciones TRAU.',st:'Nada de abonados: solo transmite y recibe.',ifc:'Um con los móviles y Abis con la BSC.'},
    bsc:{x:340,y:230,t:'BSC',ss:'BSS',name:'BSC, controladora de estaciones base',fn:'Gestiona los recursos radio de las BTS que controla (decenas): espectro, asignación de canales y traspasos. Puede incluir funciones TRAU.',st:'Configuración de sus BTS y de los canales.',ifc:'Abis (BTS), A (MSC) y O (OSS).'},
    trau:{x:225,y:340,t:'TRAU',ss:'BSS',name:'TRAU, transcodificación y adaptación de velocidad',fn:'Convierte la voz de 13/6,5 kbps a los 64 kbps de la red terrestre (transcodificación) y adapta la velocidad de los datos. Va habitualmente junto a la BTS o la BSC.',st:'Nada.',ifc:'Depende de dónde se coloque (mira el bloque del TRAU más abajo).'},
    msc:{x:500,y:230,t:'MSC',ss:'NSS',name:'MSC, centro de conmutación móvil',fn:'Es la central telefónica del núcleo GSM: controla y encamina las llamadas y las comunicaciones de datos entre usuarios. Hace de capa de red con los móviles (MM y CM).',st:'Nada propio: consulta el VLR asociado y el HLR.',ifc:'A (BSC), B (VLR), C, E y F con otros conmutadores y registros.'},
    gmsc:{x:660,y:230,t:'GMSC',ss:'NSS',name:'GMSC, MSC de pasarela',fn:'Un MSC que además contiene la pasarela hacia la red fija (RTC/RDSI) y otras plataformas de servicio (como el SMSC).',st:'Nada propio. Está asociado al HLR del sistema.',ifc:'C con el HLR, E con otros MSC, y pasarelas a RTC/RDSI y SMS.'},
    vlr:{x:500,y:100,t:'VLR',ss:'NSS',name:'VLR, registro de visitantes',fn:'Tiene la información de los abonados ACTIVOS en el área de un MSC. Hay un registro asociado a cada MSC. Asigna los TMSI.',st:'Perfil del abonado visitante, su LA y su TMSI.',ifc:'B con el MSC, D con el HLR y G con otros VLR.'},
    hlr:{x:790,y:110,t:'HLR',ss:'NSS',name:'HLR, registro base',fn:'Base de datos de los abonados del sistema. Traduce el número público (MSISDN) a la identidad real (IMSI) y sabe en qué VLR está cada uno. Está asociado al GMSC y suele ser único en la red.',st:'Identidades, servicios contratados, datos de autenticación y localización.',ifc:'C con el GMSC, D con el VLR y H con el AuC.'},
    auc:{x:925,y:110,t:'AuC',ss:'NSS',name:'AuC, centro de autenticación',fn:'Tiene la información necesaria para autenticar y cifrar los servicios: almacena los algoritmos de autenticación y cifrado y genera las claves de cada servicio (las tripletas). Asociado al HLR.',st:'Ki de cada abonado y algoritmos A3 y A8.',ifc:'H con el HLR.'},
    pstn:{x:830,y:230,t:'RTC/RDSI',ss:'EXT',name:'Red fija (RTC y RDSI)',fn:'Redes externas a las que se llega por la pasarela del GMSC.',st:'—',ifc:'Con el GMSC.'},
    smsg:{x:830,y:320,t:'SMSG',ss:'NSS',name:'SMSG, pasarela SMS',fn:'Pasarela hacia el centro de servicio de SMS (SMSC), que se considera externo a la red GSM.',st:'—',ifc:'Con el GMSC.'},
    omc:{x:400,y:425,t:'OMC',ss:'OSS',name:'OMC, centro de operación y mantenimiento',fn:'Monitoriza y controla los elementos de red (BSS y NSS) y genera los registros de uso para la tarificación posterior (CDR, Call Detail Record).',st:'Registros de uso y estado de la red.',ifc:'O, con la BSC y el MSC.'},
    eir:{x:590,y:425,t:'EIR',ss:'OSS',name:'EIR, registro de identidades de equipo',fn:'Base de datos de equipos (terminales, no abonados). Permite gestionar listas de equipos válidos, robados o dudosos.',st:'El IMEI de los terminales.',ifc:'F con el MSC.'}
  };
  const L=[['ms','bts','Um'],['bts','bsc','Abis'],['bsc','msc','A'],['bsc','trau',''],['msc','vlr','B'],['msc','gmsc','E'],['gmsc','hlr','C'],['vlr','hlr','D'],['hlr','auc','H'],['msc','eir','F'],['gmsc','pstn',''],['gmsc','smsg',''],['bsc','omc','O'],['msc','omc','O']];
  const BG=[['RSS',15,175,115,110],['BSS',150,175,270,200],['NSS',440,55,555,305],['OSS',340,388,320,90]];
  let s='<div class="diagram"><svg viewBox="0 0 1000 490" role="group" aria-label="Arquitectura de red GSM">';
  BG.forEach(([k,x,y,w,h])=>{const c=SS[k][0];s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:color-mix(in srgb,var(${c}) 9%,var(--panel));stroke:var(${c});stroke-dasharray:5 4"/><text class="sm b" x="${x+10}" y="${y+18}" style="fill:var(${c})">${k}</text>`});
  L.forEach(([a,b,l],i)=>{const A=N[a],B=N[b];s+=`<g class="lk" data-a="${a}" data-b="${b}"><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>${l?`<text x="${(A.x+B.x)/2}" y="${(A.y+B.y)/2-5}" text-anchor="middle">${l}</text>`:''}</g>`});
  Object.entries(N).forEach(([id,n])=>{s+=`<g class="nd" data-id="${id}" tabindex="0" role="button" aria-label="${CX.esc(n.name)}" style="--c:var(${SS[n.ss][0]})"><rect x="${n.x-40}" y="${n.y-19}" width="80" height="38" rx="8"/><text x="${n.x}" y="${n.y+5}" text-anchor="middle">${n.t}</text></g>`});
  s+='</svg></div><div class="info" aria-live="polite">Pulsa un elemento. Se resaltan sus enlaces y las interfaces con las que se conecta.</div>';
  root.innerHTML='<p class="wt">Arquitectura de red GSM <span>Pulsa un elemento para ver qué hace, qué guarda y con quién habla.</span></p>'+s;
  const info=CX.$('.info',root);
  function pick(id){
    const n=N[id];
    CX.$$('.nd',root).forEach(g=>g.classList.toggle('sel',g.dataset.id===id));
    CX.$$('.lk',root).forEach(g=>{const on=g.dataset.a===id||g.dataset.b===id;g.classList.toggle('hi',on)});
    const nb=new Set();L.forEach(([a,b])=>{if(a===id)nb.add(b);if(b===id)nb.add(a)});
    CX.$$('.nd',root).forEach(g=>g.classList.toggle('nb',nb.has(g.dataset.id)));
    info.innerHTML=`<b class="n">${CX.esc(n.name)}</b> <span class="tag" style="background:color-mix(in srgb,var(${SS[n.ss][0]}) 25%,var(--panel))">${SS[n.ss][1]}</span><p><b>Qué hace.</b> ${n.fn}</p><p><b>Qué guarda.</b> ${n.st}</p><p><b>Interfaces.</b> ${n.ifc}</p>`;
  }
  root.addEventListener('click',e=>{const g=e.target.closest('.nd');if(g)pick(g.dataset.id)});
  root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.nd')){e.preventDefault();pick(e.target.closest('.nd').dataset.id)}});
};

/* ---------- Tema 1: dónde poner el TRAU ---------- */
CX.w.trau=function(root){
  const O={
    bts:{t:'Junto a la BTS',abis:64,a:64,x:'La voz ya viaja a 64 kbps desde la BTS: cada llamada ocupa un canal de 64 kbps en Abis y en A.',pos:1},
    bsc:{t:'Junto a la BSC',abis:16,a:64,x:'En Abis la llamada va a 16 kbps (13 kbps de voz con su señalización y sincronismo), así que caben 4 por canal de 64 kbps. Se transcodifica en la BSC y A va a 64 kbps.',pos:2},
    msc:{t:'Junto al MSC',abis:16,a:16,x:'El transporte es el más barato: 16 kbps también en la interfaz A. La conversión a 64 kbps se hace pegada al MSC.',pos:3}
  };
  root.innerHTML=`<p class="wt">¿Dónde está el TRAU? <span>Cambia la posición y mira cuánto ocupa cada enlace.</span></p>
  <div class="ctrl"><div class="seg" role="group" aria-label="Posición del TRAU">${Object.entries(O).map(([k,o])=>`<button class="b" type="button" data-k="${k}">${o.t}</button>`).join('')}</div></div>
  <div class="diagram"><svg viewBox="0 0 760 170" role="img" aria-label="Posición del TRAU entre BTS, BSC y MSC"><g id="trs"></g></svg></div><div class="info"></div>`;
  const g=CX.$('#trs',root),info=CX.$('.info',root);
  function draw(k){
    const o=O[k];
    const nodes=[['BTS',70],['BSC',330],['MSC',620]];
    let s='';
    s+=`<line class="ln" x1="110" y1="80" x2="290" y2="80" style="stroke-width:3"/><line class="ln" x1="370" y1="80" x2="580" y2="80" style="stroke-width:3"/>`;
    s+=`<text class="md b" x="200" y="68" text-anchor="middle">${o.abis} kbps</text><text class="sm mu" x="200" y="100" text-anchor="middle">Abis · ${Math.floor(30*64/o.abis)} llamadas por E1</text>`;
    s+=`<text class="md b" x="475" y="68" text-anchor="middle">${o.a} kbps</text><text class="sm mu" x="475" y="100" text-anchor="middle">A · ${Math.floor(30*64/o.a)} llamadas por E1</text>`;
    nodes.forEach(([t,x])=>{s+=`<rect x="${x-38}" y="58" width="76" height="44" rx="8" style="fill:var(--panel);stroke:var(--orange);stroke-width:2.5"/><text class="md b" x="${x}" y="86" text-anchor="middle">${t}</text>`});
    const c={1:70,2:330,3:620}[o.pos];
    s+=`<line x1="${c}" y1="102" x2="${c}" y2="118" class="ln" style="stroke:var(--orange);stroke-width:3"/><rect x="${c-33}" y="118" width="66" height="30" rx="7" style="fill:var(--orange);stroke:none"/><text class="md b" x="${c}" y="138" text-anchor="middle" style="fill:#fff">TRAU</text>`;
    g.innerHTML=s;
    info.innerHTML=`<b class="n">${o.t}.</b> ${o.x} <span class="cap">Una E1 de Abis o A tiene 30 canales de 64 kbps para tráfico.</span>`;
    CX.$$('.seg .b',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k));
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)draw(b.dataset.k)});
  draw('bsc');
};

