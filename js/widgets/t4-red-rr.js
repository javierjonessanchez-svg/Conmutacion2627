/* ===== Widgets del tema 4: red y recursos radio (cabecera de capa 3 y traspaso) ===== */
/* ---------- Tema 4: cabecera de un mensaje de capa 3 ---------- */
CX.w.l3hdr=function(root){
  const PD={CC:['0011','Control de llamada'],MM:['0101','Gestión de movilidad'],SMS:['1001','Mensajes cortos'],SS:['1011','Servicios suplementarios'],RR:['0110','Recursos radio']};
  root.innerHTML=`<p class="wt">Monta la cabecera <span>Primer octeto de un mensaje de capa 3: TI (4 bits) y PD (4 bits).</span></p>
  <div class="ctrl"><label>Protocolo <select id="hp">${Object.keys(PD).map(k=>`<option>${k}</option>`).join('')}</select></label>
  <label>Valor de TI <select id="hv">${[0,1,2,3,4,5,6].map(i=>`<option>${i}</option>`).join('')}</select></label>
  <label>Bit F <select id="hf"><option value="0">0: sentido de la comunicación</option><option value="1">1: sentido contrario</option></select></label></div>
  <div class="frm" id="hb"></div><div class="info" id="hi"></div>`;
  const hp=CX.$('#hp',root),hv=CX.$('#hv',root),hf=CX.$('#hf',root);hp.value='MM';
  function run(){
    const p=hp.value,fixed=(p==='RR'||p==='MM');
    if(fixed)hv.value='0';hv.disabled=fixed;
    const v=+hv.value,F=hf.value,ti=F+v.toString(2).padStart(3,'0'),pd=PD[p][0];
    CX.$('#hb',root).innerHTML=`<span class="k5" style="flex:1"><b>${F}</b><br><small>F</small></span><span class="k3" style="flex:3"><b>${ti.slice(1)}</b><br><small>valor de TI</small></span><span class="k4" style="flex:4"><b>${pd}</b><br><small>PD: ${p}</small></span>`;
    const oct=ti+pd;
    CX.$('#hi',root).innerHTML=`Octeto: <span class="mono"><b>${oct}</b></span> = 0x${parseInt(oct,2).toString(16).toUpperCase().padStart(2,'0')}. ${p} (${PD[p][1]}) ${fixed?'no abre transacciones: el valor de TI es 0.':'puede tener varias transacciones a la vez; el valor de TI (1 a 6) distingue unas de otras.'}${p==='RR'?' <span class="cap">(Extra: la diapositiva no da el PD de RR; 0110 es el valor de la norma.)</span>':''}`;
  }
  root.addEventListener('change',run);run();
};

/* ---------- Tema 4: modelo de juguete del disparo de traspaso ---------- */
CX.w.ho=function(root){
  const lev=d=>-50-30*Math.log10(Math.max(d,0.05));
  root.innerHTML=`<p class="wt">¿Cuándo se dispara un traspaso? <span>Extra: modelo de juguete. Las diapositivas solo dicen que el BSC «compara umbrales».</span></p>
  <div class="ctrl"><label>Posición del móvil <input type="range" id="hx" min="2" max="98" value="30"></label><label>Margen <input type="range" id="hm" min="0" max="12" value="4"> <b id="hmv"></b></label></div>
  <div class="diagram"><svg viewBox="0 0 700 250" role="img" aria-label="Nivel de señal de dos BTS según la posición del móvil"><g id="hsv"></g></svg></div><div class="info" id="hin"></div>`;
  const hx=CX.$('#hx',root),hm=CX.$('#hm',root);
  const X=x=>50+x*600,Y=l=>20+(0-l)/60*190;
  function run(){
    const x=hx.value/100,m=+hm.value;CX.$('#hmv',root).textContent=m+' dB';
    const l1=lev(x),l2=lev(1-x),k=Math.pow(10,m/30),xo=k/(1+k);
    let p1='',p2='';for(let i=2;i<=98;i+=2){const t=i/100;p1+=`${X(t).toFixed(1)},${Y(lev(t)).toFixed(1)} `;p2+=`${X(t).toFixed(1)},${Y(lev(1-t)).toFixed(1)} `}
    CX.$('#hsv',root).innerHTML=`<rect x="${X(xo)}" y="20" width="${X(0.98)-X(xo)}" height="190" style="fill:color-mix(in srgb,var(--brown) 14%,var(--panel))"/>
    <line x1="50" y1="210" x2="650" y2="210" class="ln mu"/><line x1="50" y1="20" x2="50" y2="210" class="ln mu"/>
    <polyline points="${p1}" fill="none" style="stroke:var(--blue);stroke-width:3"/><polyline points="${p2}" fill="none" style="stroke:var(--orange);stroke-width:3"/>
    <line x1="${X(xo)}" y1="20" x2="${X(xo)}" y2="210" class="ln" stroke-dasharray="5 4" style="stroke:var(--brown)"/>
    <line x1="${X(x)}" y1="20" x2="${X(x)}" y2="210" class="ln"/><circle cx="${X(x)}" cy="${Y(l1)}" r="5" style="fill:var(--blue)"/><circle cx="${X(x)}" cy="${Y(l2)}" r="5" style="fill:var(--orange)"/>
    <text class="sm b" x="52" y="238" style="fill:var(--blue)">BTS 1</text><text class="sm b" x="648" y="238" text-anchor="end" style="fill:var(--orange)">BTS 2</text>
    <text class="sm mu" x="${X(xo)+6}" y="34">zona de traspaso</text><text class="sm mu" x="8" y="26">nivel</text>`;
    const go=l2>l1+m;
    CX.$('#hin',root).innerHTML=`Nivel de BTS 1: <b>${CX.fmt(l1,1)}</b>, de BTS 2: <b>${CX.fmt(l2,1)}</b> (unidades relativas). ${go?'<b>La vecina supera a la actual en más que el margen: el BSC pediría el traspaso.</b>':'La célula actual sigue siendo suficientemente mejor: no hay traspaso.'} Con este margen el traspaso empieza a partir del <b>${CX.fmt(xo*100,0)} %</b> del camino. Un margen mayor evita los traspasos de ida y vuelta (efecto ping-pong) pero retrasa el cambio.`;
  }
  hx.addEventListener('input',run);hm.addEventListener('input',run);run();
};

