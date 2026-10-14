/* ===== Escena animada de la autenticación GSM (CX.w.authanim), sobre el reproductor común ===== */
/* Hechos: Cx_Red-Movilidad.md, diapositivas 13–15. La longitud de SRES no sale en ellas, así que no se muestra. */
CX.w.authanim=function(root){
  const sub=(t,s)=>`${t}<tspan class="au-sub" baseline-shift="sub">${s}</tspan>`;   // SRES_A, SRES_B como en las diapositivas
  /* Ficha (token) con texto: RAND, SRES, Kc */
  const ficha=(id,cls,x,y,t,w)=>`<g id="${id}" class="au-tk ${cls}"><rect x="${x-w/2}" y="${y-12}" width="${w}" height="24" rx="12"/><text x="${x}" y="${y+5}" text-anchor="middle">${t}</text></g>`;
  const chip=(id,x,y,w,t)=>`<g id="${id}" class="au-chip"><rect x="${x}" y="${y}" width="${w}" height="48" rx="6"/><text x="${x+w/2}" y="${y+31}" text-anchor="middle">${t}</text></g>`;
  /* La llave Ki: solo existe dentro de la SIM y del AuC (secreto compartido) */
  const llave=(x,y,extra)=>`<g class="ki"><circle cx="${x}" cy="${y}" r="17"/>${extra||`<text x="${x}" y="${y+5}" text-anchor="middle">Ki</text>`}</g>`;
  const flecha=(x1,y1,x2,y2,c)=>`<line class="au-fl ${c||''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const svg=`<svg class="au" viewBox="0 0 900 430" role="img" aria-label="Autenticación GSM entre el móvil y la red">
    <defs><marker id="au-pt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="au-ptm" d="M0 0L10 5L0 10z"/></marker></defs>
    <line class="au-radio" x1="296" y1="22" x2="296" y2="362"/><text class="sm mu" x="296" y="14" text-anchor="middle">Interfaz radio</text>
    <g id="au-ms" class="au-col"><rect x="10" y="22" width="262" height="340" rx="14"/><text class="au-ct" x="26" y="48">MS</text>
      <g id="au-sim"><rect class="au-simr" x="26" y="60" width="230" height="196" rx="10"/><text class="au-ct" x="244" y="248" text-anchor="end">SIM</text>
        ${llave(62,94,`<text class="ok-only" x="62" y="99" text-anchor="middle">Ki</text><text class="clon-only" x="62" y="99" text-anchor="middle">Ki′</text>`)}
        ${flecha(62,111,78,132)}${flecha(70,108,184,132)}${flecha(176,106,104,132)}${flecha(192,106,196,132)}
        ${chip('au-a3s',44,132,84,'A3')}${chip('au-a8s',150,132,84,'A8')}
        ${ficha('au-rand-s','tk-rand',190,94,'RAND',66)}${ficha('au-sres-s','tk-sres',86,216,sub('SRES','B'),78)}${ficha('au-kc-s','tk-kc',192,216,'Kc',46)}</g>
      ${chip('au-a5s',150,300,84,'A5')}<text class="sm" x="40" y="329">Datos ⟷</text></g>
    <g id="au-bss" class="au-col"><rect x="320" y="22" width="130" height="340" rx="14"/><text class="au-ct" x="385" y="48" text-anchor="middle">BSS</text>
      ${chip('au-a5n',343,300,84,'A5')}${ficha('au-kc-b','tk-kc',385,240,'Kc',46)}</g>
    <line id="au-air" class="au-air" x1="234" y1="324" x2="343" y2="324"/><text id="au-airt" class="au-airt" x="289" y="300" text-anchor="middle">Datos cifrados</text>
    <g id="au-vlr" class="au-col s"><rect x="490" y="22" width="150" height="340" rx="14"/><text class="au-ct" x="565" y="48" text-anchor="middle">MSC/VLR</text>
      ${ficha('au-trip','au-trip',565,110,`⟨RAND, ${sub('SRES','A')}, Kc⟩`,140)}
      <text id="au-cmp" class="au-cmp" x="565" y="200" text-anchor="middle"></text><text id="au-cmpq" class="sm" x="565" y="226" text-anchor="middle">¿${sub('SRES','A')} = ${sub('SRES','B')}?</text></g>
    <line id="au-kcl" class="au-kcl" x1="490" y1="240" x2="410" y2="240" marker-end="url(#au-pt)"/>
    <g id="au-hlr" class="au-col v"><rect x="680" y="22" width="210" height="340" rx="14"/><text class="au-ct" x="696" y="48">HLR</text>
      <g id="au-auc"><rect class="au-aucr" x="694" y="60" width="182" height="196" rx="10"/><text class="au-ct" x="864" y="248" text-anchor="end">AuC</text>
        ${llave(722,94)}${flecha(722,111,736,132)}${flecha(730,108,824,132)}${flecha(806,106,748,132)}${flecha(822,106,834,132)}
        ${chip('au-a3n',704,132,76,'A3')}${chip('au-a8n',792,132,76,'A8')}
        ${ficha('au-rand-n','tk-rand',818,94,'RAND',66)}${ficha('au-sres-n','tk-sres',742,216,sub('SRES','A'),78)}${ficha('au-kc-n','tk-kc',830,216,'Kc',46)}</g></g>
    <g id="au-res" class="au-res"><rect x="10" y="372" width="880" height="50" rx="10"/>
      <text x="450" y="392" text-anchor="middle">Por el aire viajan <tspan class="b">RAND</tspan> y <tspan class="b">SRES</tspan>.</text>
      <text x="450" y="412" text-anchor="middle">Nunca viajan por el aire: <tspan class="b au-kit">Ki</tspan> y <tspan class="b au-kct">Kc</tspan>.</text></g>
  </svg>`;
  const mono=t=>`<span class="mono">${t}</span>`,S=l=>`SRES<sub>${l}</sub>`;
  const steps=[
    {pill:'Servicio',hl:'#au-ms',cap:`<b>Petición de servicio.</b> El móvil pide un servicio (llamada, actualización de posición, registro…) e indica su IMSI/TMSI: ${mono('CM-Service Request')} por el SDCCH, después de pedir canal (${mono('RR-Channel Request')}) y recibirlo (${mono('RR-Immediate Assignment')}). La autenticación la inicia la red.`},
    {pill:'VLR → HLR',hl:'#au-vlr',cap:`<b>El VLR pide verificar el IMSI.</b> El MSC/VLR solicita al HLR la verificación del IMSI (${mono('MAP-SEND AUTH INFO (IMSI)')}), y el HLR pide al AuC la tripleta de autenticación.`},
    {pill:'Tripleta',hl:'#au-auc',cap:`<b>El AuC crea la tripleta.</b> Genera un número aleatorio <b>RAND</b> (128 bits) y, con la clave secreta <b>Ki</b> del abonado, calcula ${S('A')} = A3(Ki, RAND) y <b>Kc</b> = A8(Ki, RAND), de 64 bits.`,
      set:{'#au-rand-n':{on:1},'#au-sres-n':{on:1},'#au-kc-n':{on:1}}},
    {pill:'HLR → VLR',hl:'#au-vlr',cap:`<b>El HLR entrega la tripleta.</b> Comprueba que el IMSI es cliente y tiene contratado el servicio pedido, y entrega ⟨RAND, ${S('A')}, Kc⟩ al MSC/VLR (${mono('MAP-SEND AUTH INFO ack')}).`,
      set:{'#au-trip':{on:1}}},
    {pill:'RAND',cap:`<b>El RAND viaja por el aire.</b> El MSC/VLR entrega el RAND al BSS, que lo transmite al móvil: ${mono('MM-Authentication Request (RAND)')}. Por el aire solo va el RAND.`,
      set:{'#au-rand-s':{on:1}}},
    {pill:'SIM calcula',hl:'#au-sim',cap:`<b>La SIM calcula.</b> Contiene Ki y los algoritmos A3 y A8: con Ki y RAND obtiene ${S('B')} = A3(Ki, RAND) y su propia Kc = A8(Ki, RAND).`,
      capAlt:`<b>La SIM clonada calcula.</b> Su Ki es distinta, así que su ${S('B')} no coincide con el ${S('A')} de la red (y su Kc tampoco).`,
      set:{'#au-sres-s':{on:1},'#au-kc-s':{on:1}}},
    {pill:'Respuesta',hl:'#au-vlr',cap:`<b>Respuesta.</b> El móvil devuelve ${S('B')} (${mono('MM-Authentication Response')}) y el MSC/VLR comprueba si ${S('A')} = ${S('B')}: coinciden ✓.`,
      capAlt:`<b>Respuesta rechazada.</b> El MSC/VLR compara: ${S('A')} ≠ ${S('B')} ✗. No se entrega Kc ni se pasa a modo cifrado.`,
      set:{'#au-cmp':{txt:'✓'},'#au-cmpq':{on:1}},setAlt:{'#au-cmp':{txt:'✗',cls:'mal'},'#au-cmpq':{on:1}}},
    {pill:'Cifrado',hl:'#au-bss',cap:`<b>Cifrado.</b> El MSC entrega Kc al BSS (no al móvil, que ya ha generado la suya) y el BSS ordena el paso a modo cifrado: ${mono('RR-Cipher Mode Command')} y ${mono('RR-Cipher Mode Complete')}. Desde aquí los datos viajan cifrados, con A5 en los dos extremos. Servicio aceptado: ${mono('CM-Service Request Accepted')}.`,
      capAlt:`<b>Sin cifrado.</b> Como ${S('A')} ≠ ${S('B')}, el MSC no entrega Kc al BSS y no hay paso a modo cifrado.`,
      set:{'#au-kc-b':{on:1},'#au-kcl':{on:1},'#au-air':{cls:'cifrado'},'#au-airt':{on:1},'#au-a5s':{on:1},'#au-a5n':{on:1}},setAlt:{}},
    {pill:'Resumen',cap:`<b>Resumen.</b> Por el aire viajan <b>RAND</b> y <b>SRES</b>; <b>Ki</b> y <b>Kc</b> nunca viajan por el aire. Ki es el secreto compartido entre la SIM y el AuC, y cada lado calcula su Kc.`,
      set:{'#au-res':{on:1}}}
  ];
  /* Mensajes con los nombres de la diapositiva 15 (por la fila y=280); ninguno lleva Ki ni Kc */
  const XS={ms:140,bss:385,vlr:565,hlr:785},M=(l,f,t,d,k)=>({l,from:[XS[f],280],to:[XS[t],280],d,k:k||'rad'});
  const FLY={
    0:[M('CM-Service Request','ms','vlr',0)],
    1:[M('MAP-SEND AUTH INFO (IMSI)','vlr','hlr',0,'map')],
    3:[M('MAP-SEND AUTH INFO ack','hlr','vlr',0,'map')],
    4:[M('MM-Authentication Request (RAND)','vlr','ms',0)],
    6:[M('MM-Authentication Response (SRES_B)','ms','vlr',0)],
    7:[M('RR-Cipher Mode Command','bss','ms',0),M('RR-Cipher Mode Complete','ms','bss',1),M('CM-Service Request Accepted','vlr','ms',2)]
  };
  Object.entries(FLY).forEach(([i,f])=>steps[i].fly=f);
  [350,675,785,675,350,140,350,290,450].forEach((x,i)=>steps[i].cx=x);   // en el móvil, el marco va a donde pasa cada paso
  steps[7].flyAlt=[];steps[7].draw='#au-kcl';   // la Kc va del MSC al BSS por la red fija (trazo, no paquete)
  root.innerHTML=`<p class="wt">La autenticación, paso a paso <span>Quién guarda Ki, qué se calcula en cada lado y qué viaja por el aire.</span></p>`;
  const ocultos=['#au-rand-n','#au-sres-n','#au-kc-n','#au-trip','#au-rand-s','#au-sres-s','#au-kc-s','#au-cmpq','#au-kc-b','#au-kcl','#au-airt','#au-a5s','#au-a5n','#au-res'];
  const base=Object.fromEntries(ocultos.map(s=>[s,{on:0}]));base['#au-cmp']={txt:''};
  const P=CX.play(root,{svg,steps,base,q:'viaja por el aire',title:'Autenticación paso a paso'});
  /* En el resumen: repetir la respuesta con una SIM clonada (otra Ki), o volver a la buena */
  const fila=document.createElement('div');fila.className='au-fila';
  fila.innerHTML='<button type="button" class="b au-clon"></button>';
  root.appendChild(fila);
  const bc=CX.$('.au-clon',fila);
  const pintar=()=>{bc.hidden=P.cur!==P.n-1;bc.textContent=P.alt?'Volver a la SIM original':'Probar con una SIM clonada (Ki distinta)'};
  bc.addEventListener('click',()=>{P.setAlt(!P.alt);P.go(4);P.play()});   // desde el RAND: la SIM calcula, responde y la red decide
  root.addEventListener('cx-step',pintar);pintar();
};
