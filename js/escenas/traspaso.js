/* ===== Escena animada del traspaso intra-MSC (CX.w.hoanim), sobre el reproductor común ===== */
/* Hechos: Cx_Red-RecursosRadio.md, diapositivas 8–13. Lo que no está en ellas va marcado como Extra. */
CX.w.hoanim=function(root){
  const R0=180,R1=720,RY=340;                                  // BTS 1 y BTS 2 sobre la carretera, altura del móvil
  const POS=[.15,.35,.50,.62,.66,.66,.70,.72,.75];             // posición del móvil en cada paso (fracción BTS 1 -> BTS 2)
  const X=f=>R0+f*(R1-R0);
  /* Mismo modelo de nivel que el widget ho: nivel en dBm según la distancia, barra de 0 a 1 entre -60 y -10 dBm */
  const lev=d=>-50-30*Math.log10(Math.max(d,0.05)),alto=d=>Math.min(1,Math.max(0,(lev(d)+60)/50));
  const caja=(id,x,y,w,h,t,c)=>`<g id="${id}" class="ho-nd ${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/><text x="${x+w/2}" y="${y+h/2+5}" text-anchor="middle">${t}</text></g>`;
  const torre=(id,x,t,c)=>`<g id="${id}" class="ho-nd ho-torre ${c}"><path d="M${x-12} 278L${x} 204L${x+12} 278M${x-8} 254H${x+8}M${x-5} 232H${x+5}"/><path class="ho-ond" d="M${x-14} 206a18 18 0 0 1 0-20M${x+14} 206a18 18 0 0 0 0-20"/><text x="${x}" y="298" text-anchor="middle">${t}</text></g>`;
  /* Enlace radio de cada paso: de la BTS que sirve al móvil (la 1 hasta el salto, la 2 desde el salto) a su posición */
  const radio=POS.map((f,i)=>{const b=i<6?R0:R1;return `<line id="ho-rl${i}" class="ho-rl ${i<6?'c1':'c2'}" x1="${b}" y1="210" x2="${X(f)}" y2="${RY-16}"/>`}).join('');
  const fase=(x,y,t)=>`<g class="ho-fase"><rect x="${x-t.length*3.6-10}" y="${y-13}" width="${t.length*7.2+20}" height="22" rx="11"/><text x="${x}" y="${y+3}" text-anchor="middle">${t}</text></g>`;
  const svg=`<svg class="ho" viewBox="0 0 900 430" role="img" aria-label="Traspaso intra-MSC: el móvil pasa de la BTS 1 a la BTS 2">
    <ellipse class="ho-cel c1" cx="${R0}" cy="330" rx="290" ry="100"/><ellipse class="ho-cel c2" cx="${R1}" cy="330" rx="290" ry="100"/>
    <rect class="ho-road" x="30" y="${RY+12}" width="840" height="10" rx="5"/>
    <line class="ho-lk" x1="450" y1="36" x2="${R0}" y2="138"/><line id="ho-l-m2" class="ho-lk" x1="450" y1="36" x2="${R1}" y2="138"/>
    <line class="ho-lk" x1="${R0}" y1="138" x2="${R0}" y2="204"/><line id="ho-l-b2" class="ho-lk" x1="${R1}" y1="138" x2="${R1}" y2="204"/>
    <line id="ho-l-bsc" class="ho-lk ho-tb" x1="${R0+60}" y1="150" x2="${R1-10}" y2="206"/>
    <polyline id="ho-path1" class="ho-path c1" points="${R0},206 ${R0},138 450,36"/><polyline id="ho-path2" class="ho-path c2" points="${R1},206 ${R1},138 450,36"/>
    <g id="ho-msc2" class="ho-ti"><line class="ho-lk ho-map" x1="520" y1="36" x2="730" y2="36"/><text class="ho-mapt" x="625" y="27" text-anchor="middle">MAP sobre SS7</text>
      <line class="ho-lk" x1="790" y1="58" x2="${R1+40}" y2="120"/>${caja('ho-msc2b',730,14,130,44,'MSC 2','s')}</g>
    ${caja('ho-msc',380,14,140,44,'MSC','s')}${caja('ho-bsc1',R0-60,118,120,40,'BSC 1','c1')}${caja('ho-bsc2',R1-60,118,120,40,'BSC 2','c2')}
    ${torre('ho-bts1',R0,'BTS 1','c1')}${torre('ho-bts2',R1,'BTS 2','c2')}
    ${radio}
    <g id="ho-ms" class="ho-ms"><rect x="${R0-10}" y="${RY-16}" width="20" height="32" rx="4"/><rect class="ho-pant" x="${R0-6}" y="${RY-11}" width="12" height="15" rx="1.5"/><text x="${R0}" y="${RY+40}" text-anchor="middle">MS</text></g>
    <g class="ho-pan"><rect class="bx" x="10" y="10" width="100" height="102" rx="8"/><text class="sm mu" x="60" y="27" text-anchor="middle">Nivel recibido</text>
      <rect class="ho-pista" x="26" y="36" width="24" height="54"/><rect class="ho-pista" x="70" y="36" width="24" height="54"/>
      <rect id="ho-b1" class="ho-bar c1" x="26" y="36" width="24" height="54"/><rect id="ho-b2" class="ho-bar c2" x="70" y="36" width="24" height="54"/>
      <text class="sm" x="38" y="105" text-anchor="middle">BTS 1</text><text class="sm" x="82" y="105" text-anchor="middle">BTS 2</text></g>
    <g class="ho-pan"><rect class="bx" x="150" y="10" width="170" height="48" rx="8"/><text class="sm mu" x="235" y="28" text-anchor="middle">Informes por el SACCH</text>
      <text id="ho-sacch" class="sm b" x="235" y="48" text-anchor="middle">—</text></g>
    <g id="ho-fases">${fase(360,300,'① Medidas e informe')}${fase(300,110,'② Solicitud')}${fase(600,76,'③ Decisión')}${fase(560,240,'④ Ejecución')}</g>
  </svg>`;
  /* Estado de cada paso: posición del móvil, barras de nivel y enlace radio activo */
  const mover=i=>{const f=POS[i];return{'#ho-ms':{x:f*(R1-R0)},'#ho-b1':{h:alto(f)},'#ho-b2':{h:alto(1-f)},'.ho-rl':{on:0},['#ho-rl'+i]:{on:1}}};
  const mono=t=>`<span class="mono">${t}</span>`;
  const steps=[
    {pill:'Llamada',cap:`<b>Llamada en curso.</b> El móvil está cerca de la BTS 1 y la voz va por MS – BTS 1 – BSC 1 – MSC. Un traspaso puede deberse a tres causas: <b>mala calidad</b> de la conexión, <b>cambio de localización</b> o <b>volumen de tráfico</b> en la célula.`},
    {pill:'Medidas',cap:`<b>1ª fase: medidas.</b> El móvil se aleja: baja el nivel de la BTS 1 y sube el de la BTS 2. MS y BTS miden <b>nivel de señal, BER y distancia</b>; el móvil también mide otras BTS. Mide en el <b>período corto</b> (entre sus intervalos de Tx y Rx, ≈ 2,3 ms) y en el <b>período largo</b> (tramas libres de la multitrama, ≈ 7 ms).`},
    {pill:'Informe 480 ms',cap:`<b>1ª fase: informe.</b> Las medidas se empaquetan y viajan por el <b>SACCH</b> del móvil a la BTS (${mono('Measurement Report')}) y de la BTS al BSC (${mono('Measurement Result')}) <b>cada 480 ms</b>, mientras el móvil sigue moviéndose.`,
      set:{'#ho-sacch':{txt:'480 → 960 → 1440 ms'}}},
    {pill:'Solicitud',hl:'#ho-bsc1',cap:`<b>2ª fase: solicitud.</b> En este ejemplo ya llega más señal de la BTS 2. El BSC 1 ejecuta su algoritmo de <b>comparación de umbrales</b> con la información del móvil, de la BTS y la suya propia (por ejemplo, la potencia de transmisión). La BTS 2 no depende de él, así que pide el traspaso al MSC común (${mono('Handover Required')}). <span class="extra-i">Extra: el margen entre niveles (histéresis) no está en las diapositivas.</span>`},
    {pill:'Decisión',hl:'#ho-msc',cap:`<b>3ª fase: decisión.</b> El MSC repite la comparación incluyendo información de la rama destino y ordena ejecutar el traspaso: ${mono('Handover Request')} al BSC 2, que activa un canal en la BTS 2 (${mono('Channel Activation')}); vuelven los dos ACK.`},
    {pill:'Orden',cap:`<b>4ª fase: ejecución.</b> La orden ${mono('Handover Command')} baja por el camino antiguo: MSC → BSC 1 → BTS 1 → móvil. Lleva el <b>identificador del traspaso</b>, igual que los dos ACK anteriores y, luego, ${mono('Handover Access')} y ${mono('Physical Information')}.`},
    {pill:'Salto',hl:'#ho-bts2',cap:`<b>Salto a la BTS 2.</b> El móvil pasa al canal nuevo y envía ${mono('Handover Access')}; la BTS 2 contesta con ${mono('Physical Information')}. Con ${mono('SABM')} y ${mono('UA')} se abre LAPDm en el canal nuevo. <span class="extra-i">Extra: Physical Information le da al móvil su avance temporal (no lo dice esta diapositiva).</span>`},
    {pill:'Completo',cap:`<b>Traspaso completo.</b> ${mono('Handover Complete')} sube por BTS 2 → BSC 2 → MSC. La voz va ahora por MS – BTS 2 – BSC 2 – MSC.`,
      set:{'#ho-path1':{on:0},'#ho-path2':{on:1}}},
    {pill:'Resumen',cap:`<b>Liberación y resumen.</b> ${mono('Clear Command')} y ${mono('Clear Complete')} liberan el canal de la BTS 1. Las cuatro fases: <b>medidas e informe · solicitud · decisión · ejecución</b>. Pulsa un tipo de traspaso para ver qué elementos cambian.`,
      set:{'#ho-fases':{on:1}}}
  ];
  steps.forEach((s,i)=>{s.set=Object.assign(mover(i),s.set||{});s.cx=X(POS[i])});   // en el móvil, el marco sigue al teléfono
  /* Mensajes de cada paso, con los nombres de la diapositiva 13; d = orden dentro del paso (sale cuando llega el anterior) */
  const M=(l,from,to,d)=>({l,from:'#ho-'+from,to:'#ho-'+to,d,k:'rad'});
  const FLY={
    2:[M('Measurement Report','ms','bts1',0),M('Measurement Result','bts1','bsc1',1)],
    3:[M('Handover Required','bsc1','msc',0)],
    4:[M('Handover Request','msc','bsc2',0),M('Channel Activation','bsc2','bts2',1),M('Channel Activation ACK','bts2','bsc2',2),M('Handover Request ACK','bsc2','msc',3)],
    5:[M('Handover Command','msc','bsc1',0),M('Handover Command','bsc1','bts1',1),M('Handover Command','bts1','ms',2)],
    6:[M('Handover Access','ms','bts2',0),M('Physical Information','bts2','ms',1),M('SABM','ms','bts2',2),M('UA','bts2','ms',3)],
    7:[M('Handover Complete','ms','bts2',0),M('Handover Complete','bts2','bsc2',1),M('Handover Complete','bsc2','msc',2)],
    8:[M('Clear Command','msc','bsc1',0),M('Clear Command','bsc1','bts1',1),M('Clear Complete','bts1','bsc1',2),M('Clear Complete','bsc1','msc',3)]
  };
  Object.entries(FLY).forEach(([i,f])=>steps[i].fly=f);
  root.innerHTML=`<p class="wt">El traspaso, paso a paso <span>Intra-MSC, el ejemplo de las diapositivas: el móvil pasa de la BTS 1 (BSC 1) a la BTS 2 (BSC 2).</span></p>`;
  const P=CX.play(root,{svg,steps,q:'cuatro fases',title:'Traspaso paso a paso',base:{'#ho-path1':{on:1},'#ho-path2':{on:0},'#ho-fases':{on:0},'#ho-sacch':{txt:'—'}}});
  /* Tipos de traspaso (diapositiva 8), solo en el resumen: marcan qué elementos cambian en cada uno */
  const TIPOS={bsc:['Intra-BSC','las células origen y destino dependen del mismo BSC.'],
    msc:['Intra-MSC','mismo MSC, pero distinto BSC (el ejemplo de esta escena).'],
    inter:['Inter-MSC','distinto MSC; requiere señalización entre MSCs (MAP sobre SS7).']};
  const fila=document.createElement('div');fila.className='ho-tipos';fila.hidden=true;
  fila.innerHTML=`<span class="ho-tl">Tipos de traspaso</span>${Object.entries(TIPOS).map(([t,[l]])=>`<button type="button" class="b" data-t="${t}" aria-pressed="false">${l}</button>`).join('')}<p class="ho-tip" aria-live="polite"></p>`;
  root.appendChild(fila);
  const tip=CX.$('.ho-tip',fila);
  function tipo(t){
    Object.keys(TIPOS).forEach(x=>P.svg.classList.toggle('t-'+x,x===t));
    CX.$$('[data-t]',fila).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===t)));
    tip.innerHTML=t?`<b>${TIPOS[t][0]}:</b> ${TIPOS[t][1]}`:'';
  }
  fila.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)tipo(b.getAttribute('aria-pressed')==='true'?null:b.dataset.t)});
  root.addEventListener('cx-step',e=>{fila.hidden=e.detail.k!==P.n-1;if(fila.hidden)tipo(null)});
  fila.hidden=P.cur!==P.n-1;
};
