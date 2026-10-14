/* ===== Widgets del tema 5: movilidad (identidades, áreas de localización, autenticación) ===== */
/* ---------- Tema 5: decodificador de identidades ---------- */
CX.w.ident=function(root){
  const CC={'1':'EE. UU. y Canadá','33':'Francia','34':'España','39':'Italia','44':'Reino Unido','49':'Alemania','351':'Portugal','359':'Bulgaria'};
  const MCC={'214':'España','208':'Francia','222':'Italia','234':'Reino Unido','262':'Alemania','268':'Portugal','310':'EE. UU.'};
  const ESM={'01':'Vodafone','03':'Orange','04':'Yoigo','07':'Movistar'};
  const bar=(parts)=>`<div class="bits">${parts.map(p=>`<span class="${p[2]}" style="flex:${Math.max(1,p[0].length)}">${p[0]||'·'}</span>`).join('')}</div><div class="bl">${parts.map(p=>`<span style="flex:${Math.max(1,p[0].length)}">${p[1]}</span>`).join('')}</div>`;
  const luhn=s=>{let sum=0,alt=false;for(let i=s.length-1;i>=0;i--){let d=+s[i];if(alt){d*=2;if(d>9)d-=9}sum+=d;alt=!alt}return sum%10===0};
  const chk=s14=>{let sum=0,alt=true;for(let i=s14.length-1;i>=0;i--){let d=+s14[i];if(alt){d*=2;if(d>9)d-=9}sum+=d;alt=!alt}return (10-sum%10)%10};
  root.innerHTML=`<p class="wt">Desmonta tus identidades <span>Escribe un número y mira cómo se reparte. Los países y operadores son una tabla pequeña (extra).</span></p>
  <div class="cols">
   <div><b>MSISDN</b><div class="ctrl"><input id="im1" type="text" value="+34 639 123 456" style="min-width:0;width:100%" aria-label="MSISDN"></div><div id="io1"></div></div>
   <div><b>IMSI</b><div class="ctrl"><input id="im2" type="text" value="214 01 0123456789" style="min-width:0;width:100%" aria-label="IMSI"> <label>MNC <select id="im2m"><option>2</option><option>3</option></select> dígitos</label></div><div id="io2"></div></div>
   <div><b>IMEI</b><div class="ctrl"><input id="im3" type="text" value="490154203237518" style="min-width:0;width:100%" aria-label="IMEI"></div><div id="io3"></div></div>
  </div>`;
  const dg=id=>(CX.$(id,root).value.match(/\d/g)||[]).join('');
  function run(){
    let s=dg('#im1'),cp='';for(const n of [3,2,1]){if(CC[s.slice(0,n)]&&s.length>n){cp=s.slice(0,n);break}}
    let h='';
    if(!s)h='<p class="cap">Escribe dígitos.</p>';
    else if(cp){const nn=s.slice(cp.length);const spain=cp==='34';
      h=bar(spain?[[cp,'CP','k1'],[nn.slice(0,3),'CA','k2'],[nn.slice(3),'NA','k3']]:[[cp,'CP','k1'],[nn,'NN (CA + NA)','k3']])+`<p class="cap">Código de país ${cp}: ${CC[cp]}. ${spain?(nn.length===9?'9 dígitos nacionales, como corresponde.':'En España el nacional tiene 9 dígitos y aquí hay '+nn.length+'.')+(/^(6|7[1-4])/.test(nn)?' Empieza por 6 o 71 a 74: es de servicio móvil.':' No empieza por 6 ni 71 a 74: no parece móvil.'):''} Total ${s.length} de 15 dígitos máximo${s.length>15?' (¡te pasas!)':''}.</p>`}
    else h=bar([[s,'¿CP?','k7']])+'<p class="cap">No reconozco ese código de país (mi tabla es pequeña).</p>';
    CX.$('#io1',root).innerHTML=h;

    s=dg('#im2');const ml=+CX.$('#im2m',root).value,mcc=s.slice(0,3),mnc=s.slice(3,3+ml),msin=s.slice(3+ml);
    CX.$('#io2',root).innerHTML=s?bar([[mcc,'MCC','k1'],[mnc,'MNC','k2'],[msin,'MSIN','k3']])+`<p class="cap">${MCC[mcc]?'País: '+MCC[mcc]+'. ':'País no reconocido. '}${mcc==='214'&&ESM[mnc]?'Operador: '+ESM[mnc]+'. ':''}${msin.length>10?'MSIN de '+msin.length+' dígitos: máximo 10. ':''}Total ${s.length} de 15 máximo${s.length>15?' (¡te pasas!)':''}.</p>`:'<p class="cap">Escribe dígitos.</p>';

    s=dg('#im3');
    if(s.length!==15)CX.$('#io3',root).innerHTML=bar([[s.slice(0,6),'TAC','k4'],[s.slice(6,8),'FAC','k5'],[s.slice(8,14),'SNR','k3'],[s.slice(14),'c','k1']])+`<p class="cap">Un IMEI tiene 15 dígitos; llevas ${s.length}.</p>`;
    else{const ok=luhn(s);CX.$('#io3',root).innerHTML=bar([[s.slice(0,6),'TAC','k4'],[s.slice(6,8),'FAC','k5'],[s.slice(8,14),'SNR','k3'],[s.slice(14),'c','k1']])+`<p class="cap">${ok?'<b>Dígito de control correcto</b> (comprobación de Luhn).':'<b>Dígito de control incorrecto</b>: para esos 14 dígitos sería '+chk(s.slice(0,14))+'.'} Los dos primeros dígitos (${s.slice(0,2)}) son la autoridad que homologa el modelo.</p>`}
  }
  root.addEventListener('input',run);root.addEventListener('change',run);run();
};

/* ---------- Tema 5: simulador de áreas de localización ---------- */
CX.w.lasim=function(root){
  const COLS=8,ROWS=4,SZ={1:[1,1],4:[2,2],8:[4,2],16:[4,4]};
  let size=8,pos=[3,1],mv=0,lu=0,pg=0,paged=false;
  const la=(c,r,s)=>{const [w,h]=SZ[s];return Math.floor(c/w)+Math.floor(r/h)*(COLS/w)};
  root.innerHTML=`<p class="wt">¿Qué tamaño de LA conviene? <span>Mueve al móvil (pulsa una célula) y cuenta Location Updates. Luego llama al móvil y mira cuántas células avisan.</span></p>
  <div class="ctrl"><span>Células por LA:</span><div class="seg" role="group" aria-label="Tamaño del LA">${Object.keys(SZ).map(k=>`<button class="b" type="button" data-s="${k}">${k}</button>`).join('')}</div>
  <button class="b" type="button" data-a="walk">Dar 10 pasos al azar</button><button class="b pri" type="button" data-a="call">Llamar al móvil</button><button class="b" type="button" data-a="reset">Poner contadores a cero</button></div>
  <div class="sim" id="lg" style="grid-template-columns:repeat(${COLS},1fr);max-width:640px"></div>
  <div class="out"><div><small>Movimientos</small><b id="lm">0</b></div><div><small>Location Updates</small><b id="ll">0</b></div><div><small>Células avisadas (paging)</small><b id="lp">0</b></div></div>
  <div class="info" id="li"></div>
  <p class="wt" style="margin-top:14px">Comparación justa <span>El mismo paseo de 400 pasos con cada tamaño.</span></p><div id="lt"></div>`;
  const grid=CX.$('#lg',root);
  function draw(){
    CX.$$('[data-s]',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.s==size));
    const my=la(pos[0],pos[1],size);let h='';
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const id=la(c,r,size);h+=`<button type="button" class="la${id%4}${c===pos[0]&&r===pos[1]?' ms':''}${paged&&id===my?' pg':''}" data-c="${c}" data-r="${r}" aria-label="Célula ${c+1}, ${r+1}, LA ${id+1}">${c===pos[0]&&r===pos[1]?'MS':'LA '+(id+1)}</button>`}
    grid.innerHTML=h;
    CX.$('#lm',root).textContent=mv;CX.$('#ll',root).textContent=lu;CX.$('#lp',root).textContent=pg;
    CX.$('#li',root).innerHTML=`Con LA de <b>${size}</b> ${size==1?'célula':'células'}: cada vez que cruzas a otro color hay un Location Update, y cada llamada entrante se avisa en <b>${size}</b> ${size==1?'célula':'células'} (todas las del LA, porque la red no sabe en cuál estás).`;
  }
  function move(c,r){const a=la(pos[0],pos[1],size),b=la(c,r,size);pos=[c,r];mv++;if(a!==b)lu++;paged=false}
  function walk(n,rnd,st){
    for(let i=0;i<n;i++){const o=[[1,0],[-1,0],[0,1],[0,-1]].map(d=>[pos[0]+d[0],pos[1]+d[1]]).filter(p=>p[0]>=0&&p[0]<COLS&&p[1]>=0&&p[1]<ROWS);const p=o[Math.floor(rnd()*o.length)];move(p[0],p[1])}
  }
  root.addEventListener('click',e=>{
    const s=e.target.closest('[data-s]');if(s){size=+s.dataset.s;paged=false;return draw()}
    const c=e.target.closest('[data-c]');if(c){move(+c.dataset.c,+c.dataset.r);return draw()}
    const a=e.target.closest('[data-a]');if(!a)return;
    if(a.dataset.a==='walk'){walk(10,Math.random);draw()}
    if(a.dataset.a==='call'){pg+=size;paged=true;draw()}
    if(a.dataset.a==='reset'){mv=lu=pg=0;paged=false;draw()}
  });
  /* comparación con un paseo fijo (generador congruencial) */
  (function table(){
    let rows='';
    Object.keys(SZ).forEach(k=>{
      let s=12345,L=0;const rnd=()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;let p=[3,1];
      for(let i=0;i<400;i++){const o=[[1,0],[-1,0],[0,1],[0,-1]].map(d=>[p[0]+d[0],p[1]+d[1]]).filter(q=>q[0]>=0&&q[0]<COLS&&q[1]>=0&&q[1]<ROWS);const q=o[Math.floor(rnd()*o.length)];if(la(p[0],p[1],+k)!==la(q[0],q[1],+k))L++;p=q}
      rows+=`<tr><td><b>${k}</b></td><td>${L}</td><td>${k}</td></tr>`;
    });
    CX.$('#lt',root).innerHTML=`<div class="tw"><table><tr><th>Células por LA</th><th>Location Updates en 400 pasos</th><th>Células que avisan por llamada</th></tr>${rows}</table></div><p class="cap">Un LA grande reduce la señalización de actualización (el móvil casi no cruza fronteras) pero multiplica el paging por cada llamada. No hay un tamaño perfecto: depende de cuánto se muevan los móviles y de cuántas llamadas entren.</p>`;
  })();
  draw();
};

/* ---------- Tema 5: demostración de autenticación (función de juguete) ---------- */
CX.w.authsim=function(root){
  const h32=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h>>>0};
  const hex=(n,l)=>n.toString(16).padStart(l,'0').slice(-l);
  const A3=(k,r)=>hex(h32('A3|'+k+'|'+r),8),A8=(k,r)=>hex(h32('A8a|'+k+'|'+r),8)+hex(h32('A8b|'+k+'|'+r),8);
  const rnd=()=>{const a=new Uint8Array(16);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256)}).getRandomValues(a);return [...a].map(b=>b.toString(16).padStart(2,'0')).join('')};
  root.innerHTML=`<p class="wt">Prueba la autenticación <span>A3 y A8 aquí son una función de juguete, no los algoritmos reales. Lo que importa es quién tiene Ki.</span></p>
  <div class="ctrl"><label>Ki en la SIM <input type="text" id="ak1" value="clave-secreta-7" style="min-width:160px"></label><label>Ki en el AuC <input type="text" id="ak2" value="clave-secreta-7" style="min-width:160px"></label><button class="b pri" type="button" id="ago">Autenticar con un RAND nuevo</button></div>
  <div class="tw"><table id="at"></table></div><div class="info" id="ar"></div>`;
  function run(){
    const k1=CX.$('#ak1',root).value,k2=CX.$('#ak2',root).value,R=rnd();
    const sa=A3(k2,R),ka=A8(k2,R),sb=A3(k1,R),kb=A8(k1,R),ok=sa===sb;
    CX.$('#at',root).innerHTML=`<tr><th></th><th>MS (SIM)</th><th>Aire</th><th>Red (HLR/AuC)</th></tr>
    <tr><td>Genera</td><td></td><td></td><td class="mono">RAND = ${R}</td></tr>
    <tr><td>Envía RAND</td><td></td><td class="mono">RAND ←</td><td></td></tr>
    <tr><td>Calcula</td><td class="mono">SRES<sub>B</sub> = ${sb}<br>Kc<sub>B</sub> = ${kb}</td><td></td><td class="mono">SRES<sub>A</sub> = ${sa}<br>Kc<sub>A</sub> = ${ka}</td></tr>
    <tr><td>Responde</td><td></td><td class="mono">→ SRES<sub>B</sub></td><td></td></tr>`;
    CX.$('#ar',root).innerHTML=ok?`<b>SRES coincide.</b> La red ordena el modo cifrado. Las dos Kc son iguales (<span class="mono">${ka}</span>) y no han viajado. Un espía solo ha visto el RAND y el SRES.`:`<b>SRES distinto: autenticación rechazada.</b> La SIM no tiene la misma Ki que el AuC (por ejemplo una SIM clonada con la clave equivocada), así que su respuesta no vale y no se llega a cifrar.`;
  }
  CX.$('#ago',root).addEventListener('click',run);run();
};

