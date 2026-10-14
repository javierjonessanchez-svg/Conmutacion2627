/* ===== Widgets del tema 2: interfaz aérea (portadoras, TDMA, ráfaga, TA, canales, multitramas, asignaciones) ===== */
/* ---------- Tema 2: portadoras (extra) ---------- */
CX.w.carrier=function(root){
  const B={g900:{n0:1,n1:124,ul:n=>890+0.2*n,sep:45,name:'GSM 900'},g1800:{n0:512,n1:885,ul:n=>1710.2+0.2*(n-512),sep:95,name:'GSM 1800'}};
  root.innerHTML=`<p class="wt">De número de portadora a frecuencia <span>Extra: esta fórmula no está en las diapositivas, pero encaja con los datos de arriba.</span></p>
  <div class="ctrl"><label>Banda <select id="cb"><option value="g900">GSM 900</option><option value="g1800">GSM 1800</option></select></label>
  <label>Portadora (ARFCN) <input id="cn" type="number" value="62" min="1" max="885" step="1"></label></div>
  <div class="out"><div><small>Subida (MS a BTS)</small><b id="cu"></b></div><div><small>Bajada (BTS a MS)</small><b id="cd"></b></div><div><small>Separación</small><b id="cs"></b></div><div><small>Portadoras en la banda</small><b id="cc"></b></div></div>`;
  const cb=CX.$('#cb',root),cn=CX.$('#cn',root);
  function upd(fix){
    const b=B[cb.value];let n=Math.round(+cn.value);if(isNaN(n))n=b.n0;n=Math.min(b.n1,Math.max(b.n0,n));
    if(fix)cn.value=n;
    cn.min=b.n0;cn.max=b.n1;
    const u=b.ul(n);CX.$('#cu',root).textContent=CX.fmt(u,1)+' MHz';CX.$('#cd',root).textContent=CX.fmt(u+b.sep,1)+' MHz';CX.$('#cs',root).textContent=b.sep+' MHz';CX.$('#cc',root).textContent=b.n1-b.n0+1;
  }
  cb.addEventListener('change',()=>{cn.value=cb.value==='g900'?62:700;upd(true)});cn.addEventListener('input',()=>upd(false));cn.addEventListener('change',()=>upd(true));
  upd(true);
};

/* ---------- Tema 2: escalera de tiempos ---------- */
CX.w.tdma=function(root){
  const TF=120/26;
  const Lv=[
    {n:'Ráfaga (ranura)',ms:TF/8,fr:'1/8',f:'120 / 26 / 8',d:'Un octavo de trama. En cada ranura se transmite una ráfaga.'},
    {n:'Trama TDMA',ms:TF,fr:'1',f:'120 / 26',d:'8 ranuras numeradas de 0 a 7. Es lo que se repite continuamente en cada portadora.'},
    {n:'Multitrama de 26 tramas',ms:120,fr:'26',f:'26 tramas = 120 ms',d:'Es la unidad básica de tiempo de GSM. Es la estructura de las combinaciones de tráfico.'},
    {n:'Multitrama de 51 tramas',ms:51*TF,fr:'51',f:'51 × 120/26 = 235,38 ms',d:'Es la estructura de las combinaciones de señalización (algunas se repiten cada 102 tramas).'},
    {n:'Supertrama',ms:6120,fr:'1326',f:'51 × 120 ms = 6,12 s',d:'Agrupa 51 multitramas de 26 tramas, o 26 multitramas de 51: 1326 tramas en los dos casos.'},
    {n:'Hipertrama',ms:6120*2048,fr:'2.715.648',f:'6,12 s × 2048 = 12.533,7 s',d:'Agrupa 2048 supertramas. Cada trama se identifica por su número de orden en la hipertrama. Dura casi 3 horas y media.'}
  ];
  const lo=Math.log10(0.4),hi=Math.log10(1.4e7);
  const tt=ms=>ms<10?CX.fmt(ms,3)+' ms':ms<1000?CX.fmt(ms,2)+' ms':ms<6e4?CX.fmt(ms/1000,2)+' s':CX.fmt(ms/1000,1)+' s';
  root.innerHTML='<p class="wt">Escalera de tiempos <span>Pulsa un nivel. Las barras están en escala logarítmica.</span></p><div class="lad">'+Lv.map((l,i)=>`<button type="button" data-i="${i}"><span class="nm">${l.n}</span><span class="bar2"><i style="width:${((Math.log10(l.ms)-lo)/(hi-lo)*100).toFixed(1)}%"></i></span><span class="tt">${tt(l.ms)}</span></button>`).join('')+'</div><div class="info"></div>';
  const info=CX.$('.info',root);
  function pick(i){
    const l=Lv[i];
    CX.$$('.lad button',root).forEach((b,j)=>{b.classList.toggle('sel',j===i);CX.$$('.nm',b).forEach(n=>n.style.fontWeight=j===i?'700':'')});
    info.innerHTML=`<b class="n">${l.n}</b>. ${l.d}<p>Cálculo: <span class="mono">${l.f}</span>. Tramas que contiene: <b>${l.fr}</b>.</p>`;
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b)pick(+b.dataset.i)});
  pick(2);
};

/* ---------- Tema 2: anatomía de la ráfaga ---------- */
CX.w.burst=function(root){
  const T={
    normal:{name:'Ráfaga normal',seg:[
      {k:'T',b:3,c:'k7',d:'Tail bits: 3 bits a cero al principio y al final de la ráfaga.'},
      {k:'Datos',b:57,c:'k1',d:'Primer bloque de 57 bits de datos.'},
      {k:'S',b:1,c:'k3',d:'Stealing flag: un bit por bloque de datos que indica si la ráfaga lleva tráfico o señalización. Así se detecta un FACCH.'},
      {k:'TS',b:26,c:'k4',d:'Training sequence: 26 bits para la sincronización de la ráfaga. El receptor la usa para estimar el canal.'},
      {k:'S',b:1,c:'k3',d:'Stealing flag del segundo bloque de datos.'},
      {k:'Datos',b:57,c:'k1',d:'Segundo bloque de 57 bits de datos. Entre los dos bloques hay 114 bits de información por ráfaga.'},
      {k:'T',b:3,c:'k7',d:'Tail bits finales.'},
      {k:'GP',b:8.25,c:'k6',d:'Guard period: 8,25 tiempos de bit de guarda sin transmisión.'}],
      tot:'148 bits + 8,25 de guarda = 156,25 tiempos de bit = 0,577 ms (cada bit dura 3,69 µs). Una transmisión ocupa un número entero de ráfagas normales.'},
    acceso:{name:'Ráfaga de acceso aleatorio',seg:[
      {k:'TB',b:8,c:'k7',d:'Tail bits iniciales (8).'},
      {k:'SS',b:41,c:'k4',d:'Secuencia de sincronización de 41 bits.'},
      {k:'Datos',b:36,c:'k1',d:'36 bits de datos: es la petición de recursos dedicados.'},
      {k:'TB',b:3,c:'k7',d:'Tail bits finales (3).'},
      {k:'GI',b:68.25,c:'k6',d:'Tiempo de guarda de 68,25 bits. Compensa la diferencia de tiempos de transmisión entre móviles a distinta distancia de la BTS: la transmisión NO ocupa todo el intervalo.'}],
      tot:'88 bits + 68,25 de guarda = 156,25 tiempos de bit = 0,577 ms. Se usa en el RACH, un canal compartido con contienda (ALOHA ranurado) y posibles colisiones.'}
  };
  root.innerHTML=`<p class="wt">Anatomía de una ráfaga <span>Pulsa cada campo. El ancho es proporcional a los bits.</span></p>
  <div class="ctrl"><div class="seg" role="group" aria-label="Tipo de ráfaga"><button class="b" type="button" data-t="normal">Ráfaga normal</button><button class="b" type="button" data-t="acceso">Ráfaga de acceso aleatorio</button></div></div>
  <div class="burst"></div><div class="info"></div>`;
  const bu=CX.$('.burst',root),info=CX.$('.info',root);let cur='normal';
  function draw(t){
    cur=t;const d=T[t];
    CX.$$('.seg .b',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===t));
    bu.innerHTML=d.seg.map((s,i)=>`<button type="button" class="${s.c}" data-i="${i}" style="flex:${s.b} 1 0;min-width:${s.b<4?22:0}px"><b>${s.k}</b><small>${CX.fmt(s.b)}</small></button>`).join('');
    info.innerHTML=`<b class="n">${d.name}.</b> ${d.tot}`;
  }
  root.addEventListener('click',e=>{
    const t=e.target.closest('[data-t]');if(t)return draw(t.dataset.t);
    const s=e.target.closest('[data-i]');if(!s)return;
    const seg=T[cur].seg[+s.dataset.i];
    CX.$$('.burst button',root).forEach(b=>b.classList.toggle('sel',b===s));
    info.innerHTML=`<b class="n">${seg.k}, ${CX.fmt(seg.b)} bits.</b> ${seg.d}`;
  });
  draw('normal');
};

/* ---------- Tema 2: avance temporal y radio máximo ---------- */
CX.w.ta=function(root){
  const c=3e8,tb=1/270833.333; // duración de un bit (s)
  const GI=68.25;
  const rmax=GI*tb*c/2/1000; // km
  root.innerHTML=`<p class="wt">¿Hasta dónde llega la célula? <span>Un móvil junto a la BTS y otro a distancia <i>d</i> transmiten una ráfaga de acceso a la vez.</span></p>
  <div class="ctrl"><label for="td">Distancia del móvil lejano: <b id="tdv"></b></label><input id="td" type="range" min="0" max="45" step="0.5" value="20"><button class="b" type="button" id="tmax">Poner en el límite</button></div>
  <div style="height:26px;background:var(--soft);border-radius:6px;position:relative;overflow:hidden"><div id="tbar" style="position:absolute;left:0;top:0;bottom:0;background:var(--green)"></div></div>
  <p class="cap" style="margin-top:4px">La barra es el tiempo de guarda de la ráfaga de acceso (68,25 bits). Se llena con el deslizamiento de la ráfaga del móvil lejano.</p>
  <div class="out"><div><small>Retardo ida y vuelta</small><b id="to1"></b></div><div><small>Deslizamiento en bits</small><b id="to2"></b></div><div><small>Guarda consumida</small><b id="to3"></b></div></div>
  <div class="info" id="tinf"></div>
  <p class="cap">Cálculo: retardo = 2d/c, con c = 3·10⁸ m/s, y un bit dura 1/270,833 kbit/s = 3,69 µs. El límite es 68,25 bits × 3,69 µs × c / 2 = <b>${CX.fmt(rmax,1)} km</b>. En la práctica el radio de GSM se limita a 35 km porque el avance temporal que se puede señalizar tiene un máximo (dato extra, no está en las diapositivas).</p>`;
  const td=CX.$('#td',root);
  function upd(){
    const d=+td.value,rtt=2*d*1000/c,bits=rtt/tb,pct=bits/GI*100,ok=bits<=GI;
    CX.$('#tdv',root).textContent=CX.fmt(d,1)+' km';
    CX.$('#to1',root).textContent=CX.fmt(rtt*1e6,0)+' µs';CX.$('#to2',root).textContent=CX.fmt(bits,1);CX.$('#to3',root).textContent=CX.fmt(pct,0)+' %';
    const bar=CX.$('#tbar',root);bar.style.width=Math.min(100,pct)+'%';bar.style.background=ok?'var(--green)':'var(--red)';
    CX.$('#tinf',root).innerHTML=ok?`La ráfaga del móvil lejano llega <b>dentro</b> de su guarda: no pisa la ranura siguiente.`:`La ráfaga se sale de la guarda y <b>pisa la ranura siguiente</b>: esa distancia ya no es posible con acceso aleatorio.`;
  }
  td.addEventListener('input',upd);CX.$('#tmax',root).addEventListener('click',()=>{td.value=Math.round(rmax*2)/2;upd()});
  upd();
};

/* ---------- Tema 2: canales lógicos ---------- */
CX.w.chan=function(root){
  const G=[
    {g:'Canales de tráfico',d:'Llevan datos de usuario.',c:[
      ['TCH/F','Dúplex, punto a punto, bajo demanda','Full rate: ocupa una ranura completa. Voz a 13 kbps (codec) más control de errores. Datos a 9,6, 4,8 o 2,4 kbps.'],
      ['TCH/H','Dúplex, punto a punto, bajo demanda','Half rate: ocupa media ranura. Voz a 6,5 kbps. Datos a 4,8 o 2,4 kbps.'],
      ['CBCH','Difusión','Cell Broadcast Channel: difunde información a los móviles de la célula (meteorología, tráfico viario…).']]},
    {g:'BCCH: difusivos',d:'Son los canales piloto de la célula. Van de la red a los móviles (downlink).',c:[
      ['FCCH','Downlink, difusivo','Frequency Correction: transmite continuamente la ráfaga de corrección de frecuencia para facilitar la sincronización del móvil con la BTS.'],
      ['SCH','Downlink, difusivo','Synchronization: transmite la ráfaga de sincronización temporal para sincronizarse con la trama TDM.'],
      ['BCCH','Downlink, difusivo','Broadcast Control: información de la BTS, como la identidad de la célula y del área de localización, el número de trama, etc.']]},
    {g:'CCCH: comunes',d:'Canales simplex compartidos por los móviles. En cada momento la información afecta a uno solo.',c:[
      ['PCH','Downlink','Paging: aviso de llamadas entrantes.'],
      ['RACH','Uplink, con contienda','Random Access: cualquier móvil puede pedir recursos dedicados. Es ALOHA ranurado, con colisiones, y usa la ráfaga de acceso.'],
      ['AGCH','Downlink','Access Granted: la red asigna recursos al móvil que los pidió por el RACH. Los móviles con solicitud pendiente lo escuchan.']]},
    {g:'DCCH: dedicados',d:'Asignados a un móvil concreto en exclusiva, bajo demanda. El móvil los devuelve al terminar.',c:[
      ['SDCCH','Dúplex','Stand-alone Dedicated Control: la red lo asigna para un procedimiento de señalización concreto (establecer una llamada, enviar un SMS, registrarse).'],
      ['SACCH','Dúplex, asociado','Slow Associated: va ligado a un TCH o a un SDCCH. Lleva las medidas de calidad que móvil y BTS hacen siempre que usan un canal dedicado. Si la calidad es mala, el BSS puede cambiar de canal.'],
      ['FACCH','Dúplex, asociado','Fast Associated: en realidad es un TCH reconvertido a señalización de mayor velocidad durante un intervalo corto. Se indica con los bits S (stealing) de la ráfaga normal.']]}
  ];
  root.innerHTML='<p class="wt">Familia de canales lógicos <span>Pulsa uno para ver su sentido y su función.</span></p><div class="cgrid">'+G.map(g=>`<div><h5>${g.g}</h5>${g.c.map(c=>`<button class="b" type="button" data-k="${c[0]}">${c[0]}</button>`).join('')}<p class="cap" style="margin:2px 0 0">${g.d}</p></div>`).join('')+'</div><div class="info">Piensa en el orden en que los usa un móvil: FCCH y SCH para sincronizarse, BCCH para saber dónde está, PCH para que le avisen, RACH para pedir canal, AGCH para recibirlo, SDCCH para señalizar y TCH con su SACCH para hablar.</div>';
  root.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;
    CX.$$('[data-k]',root).forEach(x=>x.setAttribute('aria-pressed',x===b));
    let f;G.forEach(g=>g.c.forEach(c=>{if(c[0]===b.dataset.k)f=c}));
    CX.$('.info',root).innerHTML=`<b class="n">${f[0]}</b> <span class="tag">${f[1]}</span><p>${f[2]}</p>`});
};

/* ---------- Tema 2: visor de multitramas (cheatsheet) ---------- */
CX.w.mframe=function(root){
  const rep=(t,n)=>Array(n).fill(t),cat=(...a)=>[].concat(...a);
  const blk=(t,n)=>rep(t,n);
  const dlIV=()=>{const f=rep('-',51);f[0]='F';f[1]='S';[2,3,4,5].forEach(i=>f[i]='B');[6,7,8,9].forEach(i=>f[i]='C');[10,20,30,40].forEach(g=>{f[g]='F';f[g+1]='S';for(let i=g+2;i<=g+9;i++)f[i]='C'});return f};
  const dlV=h=>{const f=rep('-',51);f[0]='F';f[1]='S';[2,3,4,5].forEach(i=>f[i]='B');[6,7,8,9].forEach(i=>f[i]='C');f[10]='F';f[11]='S';for(let i=12;i<=19;i++)f[i]='C';
    f[20]='F';f[21]='S';[22,23,24,25].forEach(i=>f[i]='D0');[26,27,28,29].forEach(i=>f[i]='D1');f[30]='F';f[31]='S';[32,33,34,35].forEach(i=>f[i]='D2');[36,37,38,39].forEach(i=>f[i]='D3');
    f[40]='F';f[41]='S';[42,43,44,45].forEach(i=>f[i]=h?'A2':'A0');[46,47,48,49].forEach(i=>f[i]=h?'A3':'A1');return f};
  const ulV=h=>cat(blk('D3',4),['R','R'],blk(h?'A0':'A2',4),blk(h?'A1':'A3',4),rep('R',23),blk('D0',4),blk('D1',4),['R','R'],blk('D2',4));
  const ulVII=h=>cat(...[0,1,2,3,4,5,6,7].map(i=>blk('D'+i,4)),...(h?[0,1,2,3]:[4,5,6,7]).map(i=>blk('A'+i,4)),rep('-',3));
  const dlVII=h=>cat(...(h?[1,2,3]:[5,6,7]).map(i=>blk('A'+i,4)),rep('-',3),...[0,1,2,3,4,5,6,7].map(i=>blk('D'+i,4)),blk(h?'A4':'A0',4));
  const I=cat(rep('T',12),['A'],rep('T',12),['-']);
  const II=Array.from({length:26},(_,f)=>f===12?'A':f===25?'a':(f%2===0?'T':'t'));
  const GP=cat(blk('B0',4),blk('B1',4),blk('B2',4),['P'],blk('B3',4),blk('B4',4),blk('B5',4),['-'],blk('B6',4),blk('B7',4),blk('B8',4),['P'],blk('B9',4),blk('B10',4),blk('B11',4),['-']);
  const CB={
    I:{t:'I',s:'TCH/F + SACCH',n:26,dl:I,ul:I,same:1},
    II:{t:'II y III',s:'2 × TCH/H + 2 SACCH',n:26,dl:II,ul:II,same:1},
    IV:{t:'IV',s:'FCCH, SCH, BCCH, CCCH',n:51,dl:dlIV(),ul:rep('R',51)},
    V:{t:'V',s:'IV + SDCCH/4 + SACCH/4',n:102,dl:cat(dlV(0),dlV(1)),ul:cat(ulV(0),ulV(1))},
    VI:{t:'VI',s:'BCCH + CCCH',n:51,dl:cat(blk('B',4),rep('C',44),rep('-',3)),ul:rep('R',51)},
    VII:{t:'VII',s:'SDCCH/8 + SACCH/8',n:102,dl:cat(dlVII(0),dlVII(1)),ul:cat(ulVII(0),ulVII(1))},
    G:{t:'GPRS',s:'12 bloques radio + PTCCH',n:52,dl:GP,ul:GP,same:1,extra:1}
  };
  const TF=120/26;
  const name=(t,id)=>{
    if(id==='I')return {T:'TCH/F',A:'SACCH','-':'libre'}[t];
    if(id==='II')return {T:'TCH/H (1)',t:'TCH/H (2)',A:'SACCH (1)',a:'SACCH (2)'}[t];
    if(/^D\d/.test(t))return 'SDCCH '+t[1];if(/^A\d/.test(t))return 'SACCH '+t[1];if(/^B\d/.test(t))return 'Bloque radio '+t.slice(1);
    return {F:'FCCH',S:'SCH',B:'BCCH',C:'CCCH',R:'RACH','-':'libre (sin uso)',P:'PTCCH'}[t];
  };
  const kls=t=>t==='-'?'ch-i':/^B\d/.test(t)?'ch-G':t==='t'?'ch-t':t==='a'?'ch-A':t==='P'?'ch-F':'ch-'+t[0];
  const bits=t=>t==='R'?36:(t==='F'||t==='S'||t==='-'||t==='P')?0:114;
  let id='V',dir='dl',sel=null;
  root.innerHTML=`<p class="wt">Visor de multitramas <span>Basado en la cheatsheet. Elige combinación y sentido y pulsa un canal para ver su capacidad.</span></p>
  <div class="ctrl"><div class="seg" id="mfc" role="group" aria-label="Combinación">${Object.entries(CB).map(([k,c])=>`<button class="b" type="button" data-c="${k}">${c.t}</button>`).join('')}</div>
  <div class="seg" id="mfd" role="group" aria-label="Sentido"><button class="b" type="button" data-d="dl">Bajada (BTS a MS)</button><button class="b" type="button" data-d="ul">Subida (MS a BTS)</button></div></div>
  <p class="cap" id="mfs" style="margin:2px 0 4px"></p><div id="mfg"></div><div class="chips" id="mfk"></div><div class="info" id="mfi"></div>`;
  function draw(){
    const c=CB[id],arr=c[dir];
    CX.$$('#mfc .b',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===id));
    CX.$$('#mfd .b',root).forEach(b=>{b.setAttribute('aria-pressed',b.dataset.d===dir);b.disabled=!!c.same});
    CX.$('#mfs',root).innerHTML=`<b>Combinación ${c.t}:</b> ${c.s}. Ciclo de ${c.n} tramas = ${CX.fmt(c.n*TF,2)} ms.${c.same?' Es igual en los dos sentidos.':''}${c.extra?' (Extra: aparece en la cheatsheet para GPRS.)':''}`;
    const per=c.n>51?51:c.n;let h='';
    for(let r=0;r<arr.length;r+=per){h+=`<p class="cap" style="margin:6px 0 0">Tramas ${r} a ${Math.min(arr.length,r+per)-1}</p><div class="mf">`+arr.slice(r,r+per).map((t,i)=>`<button type="button" class="${kls(t)}${sel&&t!==sel?' dim':''}${t===sel?' sel':''}" data-t="${t}" title="Trama ${r+i}: ${name(t,id)}">${t}<small>${r+i}</small></button>`).join('')+'</div>'}
    CX.$('#mfg',root).innerHTML=h;
    const cnt={};arr.forEach(t=>cnt[t]=(cnt[t]||0)+1);
    CX.$('#mfk',root).innerHTML=Object.keys(cnt).map(t=>`<button class="b ${kls(t)}" type="button" data-t="${t}" aria-pressed="${t===sel}">${name(t,id)}: ${cnt[t]}</button>`).join('');
    info(cnt);
  }
  function info(cnt){
    const c=CB[id],el=CX.$('#mfi',root);
    if(!sel||!cnt[sel]){el.innerHTML='Pulsa una casilla o un canal de la lista para ver cuántas ráfagas le tocan en el ciclo y qué capacidad bruta tiene.';return}
    const n=cnt[sel],cyc=c.n*TF/1000,b=bits(sel);
    let s=`<b class="n">${name(sel,id)}</b>: ${n} ráfagas en un ciclo de ${c.n} tramas (${CX.fmt(cyc*1000,2)} ms).`;
    if(b){const r=n*b/cyc;s+=` Capacidad bruta: ${n} × ${b} bits ÷ ${CX.fmt(cyc,4)} s = <b>${CX.fmt(r/1000,3)} kbit/s</b> (${CX.fmt(r,0)} bit/s).`;
      if(!/^(T|t|A|a)$/.test(sel)&&n%4===0)s+=` Son ${n/4} bloques de 4 ráfagas.`;
      s+=sel==='R'?' Una ráfaga de acceso lleva 36 bits de datos.':' Una ráfaga normal lleva 2 × 57 = 114 bits.';}
    else s+=' Es una ráfaga especial de longitud fija, no se mide por bits de datos.';
    s+=' <span class="cap">«Bruta» significa antes de descontar la codificación: por ejemplo un TCH/F da 22,8 kbit/s brutos para 13 kbit/s de voz.</span>';
    el.innerHTML=s;
  }
  root.addEventListener('click',e=>{
    const c=e.target.closest('[data-c]');if(c){id=c.dataset.c;sel=null;return draw()}
    const d=e.target.closest('[data-d]');if(d&&!d.disabled){dir=d.dataset.d;return draw()}
    const t=e.target.closest('[data-t]');if(t){sel=sel===t.dataset.t?null:t.dataset.t;draw()}
  });
  draw();
};

/* ---------- Tema 2: asignaciones típicas ---------- */
CX.w.alloc=function(root){
  const P={
    baja:{t:'Baja capacidad',f:1,sig:[['V',1]],sd:4,tf:7,th:14},
    media:{t:'Capacidad media',f:4,sig:[['IV',1],['VII',2]],sd:16,tf:29,th:58},
    alta:{t:'Alta capacidad',f:12,sig:[['IV',1],['VII',5],['VI',3]],sd:40,tf:87,th:174}
  };
  const kc={IV:'ch-F',V:'ch-D',VI:'ch-B',VII:'ch-A','I/II':'ch-T'};
  let key='baja',pb=0.02;
  root.innerHTML=`<p class="wt">Perfiles de asignación <span>Elige el perfil y mira qué sale. Abajo se calcula cuánto tráfico aguanta con un bloqueo dado (Erlang B).</span></p>
  <div class="ctrl"><div class="seg" role="group" aria-label="Perfil">${Object.entries(P).map(([k,p])=>`<button class="b" type="button" data-p="${k}">${p.t}</button>`).join('')}</div>
  <label>Bloqueo objetivo <select id="apb"><option value="0.01">1 %</option><option value="0.02" selected>2 %</option><option value="0.05">5 %</option></select></label></div>
  <div id="als"></div><div class="out" id="alo"></div><div class="info" id="ali"></div>`;
  function draw(){
    const p=P[key];
    CX.$$('.seg .b',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===key));
    const cells=[];p.sig.forEach(([k,n])=>{for(let i=0;i<n;i++)cells.push(k)});while(cells.length<p.f*8)cells.push('I/II');
    let g='<div class="slots"><div class="h"></div>'+[0,1,2,3,4,5,6,7].map(i=>`<div class="h">ranura ${i}</div>`).join('');
    for(let f=0;f<p.f;f++){g+=`<div class="h">f${f+1}</div>`+cells.slice(f*8,f*8+8).map(k=>`<div class="${kc[k]}">${k}</div>`).join('')}
    CX.$('#als',root).innerHTML=g+'</div><p class="cap">Dibujo orientativo: las diapositivas solo dicen que la señalización ocupa las ranuras bajas de la frecuencia más baja. Azul = tráfico (I o II), violeta = V, gris = IV, amarillo = VI, verde = VII.</p>';
    const sigTxt=p.sig.map(([k,n])=>`${n} comb. ${k}`).join(' + ');
    const aF=CX.erl.maxA(p.tf,pb),aH=CX.erl.maxA(p.th,pb);
    CX.$('#alo',root).innerHTML=`<div><small>Frecuencias / ranuras</small><b>${p.f} / ${p.f*8}</b></div><div><small>SDCCH</small><b>${p.sd}</b></div><div><small>TCH/F (comb. I)</small><b>${p.tf}</b></div><div><small>TCH/H (comb. II)</small><b>${p.th}</b></div>`;
    CX.$('#ali',root).innerHTML=`<b class="n">${p.t}.</b> Señalización: ${sigTxt}. Tráfico: ${p.tf} combinaciones I o II (${p.tf} TCH/F o ${p.th} TCH/H).<p>Con bloqueo ≤ ${CX.fmt(pb*100,0)} %, ${p.tf} canales admiten unos <b>${CX.fmt(aF,2)} Erlang</b> y ${p.th} canales (todo half rate) unos <b>${CX.fmt(aH,2)} Erlang</b>. Pasar a half rate más que duplica el tráfico admisible, porque agrupar canales es más eficiente.</p>`;
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b){key=b.dataset.p;draw()}});
  CX.$('#apb',root).addEventListener('change',e=>{pb=+e.target.value;draw()});
  draw();
};

