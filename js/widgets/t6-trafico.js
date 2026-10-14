/* ===== Widgets del tema 6: tráfico (Erlang B/Engset/Erlang C y M/M/1) ===== */
/* ---------- Tema 6: calculadora de Erlang B, Engset y Erlang C ---------- */
CX.erl.engset=(p,a,N)=>{let t=1,s=1,last=N>=1?0:1;for(let k=1;k<=N;k++){t=t*(p-k+1)/k*a;s+=t;last=t}return last/s};
CX.erl.maxUsers=(N,a,pb)=>{let lo=N+1,hi=100000;if(CX.erl.engset(lo-1,a,N)>pb)return N;for(let i=0;i<40;i++){const m=Math.floor((lo+hi+1)/2);if(CX.erl.engset(m-1,a,N)<=pb)lo=m;else hi=m-1;if(lo>=hi)break}return lo};
CX.w.erlang=function(root){
  let mode='B';
  root.innerHTML=`<p class="wt">Calculadora de Erlang <span>Cambia los datos y mira cómo responden el bloqueo y el dimensionado.</span></p>
  <div class="ctrl"><div class="seg" role="group" aria-label="Modelo"><button class="b" type="button" data-m="B">Erlang B y Engset (pérdidas)</button><button class="b" type="button" data-m="C">Erlang C (cola)</button></div></div>
  <div class="ctrl"><label>Tráfico A (Erlang) <input id="eA" type="number" step="0.1" min="0.1" value="6.67"></label><label>Servidores N <input id="eN" type="number" step="1" min="1" value="7"></label>
  <span id="eBx"><label><input type="checkbox" id="ef" checked> Usuarios finitos, p = <input id="ep" type="number" min="2" step="1" value="300"></label><label>Bloqueo objetivo <select id="et"><option value="0.001">0,1 %</option><option value="0.01" selected>1 %</option><option value="0.02">2 %</option><option value="0.05">5 %</option><option value="0.1">10 %</option></select></label></span>
  <span id="eCx" hidden><label>Duración media 1/μ (min) <input id="eh" type="number" step="0.5" min="0.1" value="2"></label></span></div>
  <details style="margin:6px 0"><summary>Calcular A a partir de usuarios y duración</summary><div class="ctrl"><label>Usuarios <input id="cu" type="number" value="300" style="width:90px"></label><label>un intento cada (min) <input id="ci" type="number" value="90" style="width:90px"></label><label>duración media (min) <input id="cd" type="number" value="2" style="width:90px"></label><b id="cres"></b><button class="b" type="button" id="cuse">Usar este A y estos usuarios</button></div></details>
  <div class="out" id="eo"></div><div class="info" id="ei"></div><div class="diagram" id="ec"></div>`;
  const $=s=>CX.$(s,root);
  function chart(f,N,t,lab){
    const nmax=Math.max(10,N*2,Math.ceil(+$('#eA').value*1.8)+4),W=700,H=230,X=n=>50+(n-1)/(nmax-1)*620,Y=v=>20+(1-v)*170;
    let pts='';for(let n=1;n<=nmax;n++)pts+=`${X(n).toFixed(1)},${Y(f(n)).toFixed(1)} `;
    let ax='';[0,.25,.5,.75,1].forEach(v=>ax+=`<line x1="50" x2="670" y1="${Y(v)}" y2="${Y(v)}" class="ln" style="stroke:var(--line);stroke-width:1"/><text class="sm mu" x="44" y="${Y(v)+4}" text-anchor="end">${v*100}%</text>`);
    $('#ec').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${lab} frente al número de servidores">${ax}<polyline points="${pts}" fill="none" style="stroke:var(--red);stroke-width:3"/>${t!=null?`<line x1="50" x2="670" y1="${Y(t)}" y2="${Y(t)}" stroke-dasharray="5 4" class="ln" style="stroke:var(--green)"/>`:''}<line x1="${X(N)}" x2="${X(N)}" y1="20" y2="190" class="ln" style="stroke:var(--ink)"/><circle cx="${X(N)}" cy="${Y(f(N))}" r="5" style="fill:var(--red)"/><text class="sm mu" x="360" y="222" text-anchor="middle">${lab}  frente al número de servidores N (1 a ${nmax})</text></svg>`;
  }
  function run(){
    CX.$$('[data-m]',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===mode));
    $('#eBx').hidden=mode!=='B';$('#eCx').hidden=mode!=='C';
    const A=Math.max(0.01,+$('#eA').value),N=Math.max(1,Math.round(+$('#eN').value));
    const cu=+$('#cu').value,ci=+$('#ci').value,cd=+$('#cd').value;$('#cres').textContent='A = '+CX.fmt(cu*cd/ci,2)+' E';
    let o='',inf='';
    if(mode==='B'){
      const B=CX.erl.B(A,N),t=+$('#et').value,fin=$('#ef').checked,p=Math.round(+$('#ep').value);
      o=`<div><small>Bloqueo Erlang B</small><b>${CX.fmt(B*100,2)} %</b></div><div><small>Tráfico cursado</small><b>${CX.fmt(A*(1-B),2)} E</b></div><div><small>Ocupación por canal</small><b>${CX.fmt(A*(1-B)/N*100,0)} %</b></div>`;
      const nmin=CX.erl.minN(A,t),amax=CX.erl.maxA(N,t);
      inf=`Con <b>${N}</b> canales y ${CX.fmt(A,2)} E se pierde el <b>${CX.fmt(B*100,2)} %</b> de las llamadas (Erlang B). Para bloqueo ≤ ${CX.fmt(t*100,1)} % hacen falta <b>${nmin}</b> canales; y ${N} canales admiten como máximo <b>${CX.fmt(amax,2)} E</b>.`;
      if(fin&&p>N){const a=A/p,pl=CX.erl.engset(p-1,a,N),pt=CX.erl.engset(p,a,N),mu=CX.erl.maxUsers(N,a,t);
        o+=`<div><small>Engset, bloqueo de llamada P<sub>L</sub></small><b>${CX.fmt(pl*100,2)} %</b></div><div><small>Engset, sistema lleno P<sub>B</sub></small><b>${CX.fmt(pt*100,2)} %</b></div>`;
        inf+=`<p>Con <b>${p}</b> usuarios (a = A/p = ${CX.fmt(a,4)} por usuario) el bloqueo que ve una llamada es P<sub>L</sub> = P<sub>B</sub>(p−1) = <b>${CX.fmt(pl*100,2)} %</b>. Con esa actividad por usuario, ${N} canales atienden hasta unos <b>${mu}</b> usuarios sin pasar del ${CX.fmt(t*100,1)} %.</p>`}
      chart(n=>CX.erl.B(A,n),N,t,'Bloqueo Erlang B');
    }else{
      const h=+$('#eh').value;
      if(A>=N){o='<div><small>Estado</small><b>inestable</b></div>';inf='<b>A ≥ N:</b> llega más tráfico del que los servidores pueden atender y la cola crece sin límite. Erlang C solo vale con A &lt; N.'}
      else{const pd=CX.erl.C(A,N),eq=A/(N-A)*pd,en=A+eq,ew=h*pd/(N-A),et=h+ew;
        o=`<div><small>Probabilidad de espera P<sub>D</sub></small><b>${CX.fmt(pd*100,2)} %</b></div><div><small>Clientes en cola E[q]</small><b>${CX.fmt(eq,3)}</b></div><div><small>Clientes en el sistema E[n]</small><b>${CX.fmt(en,2)}</b></div><div><small>Espera media E[W]</small><b>${CX.fmt(ew*60,1)} s</b></div><div><small>Tiempo total E[T]</small><b>${CX.fmt(et,2)} min</b></div>`;
        inf=`Con ρ = A/N = ${CX.fmt(A/N*100,0)} %, una llamada tiene que esperar con probabilidad <b>${CX.fmt(pd*100,2)} %</b> y espera de media ${CX.fmt(ew*60,1)} s (contando solo a las que esperan y a las que no, E[W]).`}
      chart(n=>CX.erl.C(A,n),N,null,'Probabilidad de espera Erlang C');
    }
    $('#eo').innerHTML=o;$('#ei').innerHTML=inf;
  }
  root.addEventListener('click',e=>{const m=e.target.closest('[data-m]');if(m){mode=m.dataset.m;run()}if(e.target.id==='cuse'){$('#eA').value=CX.fmt($('#cu').value*$('#cd').value/$('#ci').value,3).replace(',','.');$('#ep').value=$('#cu').value;$('#ef').checked=true;run()}});
  root.addEventListener('input',run);run();
};

/* ---------- Tema 6: M/M/1 frente a M/D/1 ---------- */
CX.w.mm1=function(root){
  root.innerHTML=`<p class="wt">Una cola, dos tipos de servicio <span>Mueve la carga ρ y compara cuánto tarda un mensaje con servicio exponencial (M/M/1) o constante (M/D/1).</span></p>
  <div class="ctrl"><label>Carga ρ = λ/μ <input id="mr" type="range" min="5" max="95" value="70"></label><b id="mrv"></b><label>Tiempo de servicio 1/μ (ms) <input id="ms" type="number" min="0.1" step="0.5" value="10" style="width:90px"></label></div>
  <div class="out" id="mo"></div><div class="diagram" id="mc"></div>`;
  const $=s=>CX.$(s,root);
  function run(){
    const r=$('#mr').value/100,s=+$('#ms').value;$('#mrv').textContent=CX.fmt(r*100,0)+' %';
    const mm=1/(1-r),md=(1/(1-r))*(1-r/2),lam=r/s*1000;
    $('#mo').innerHTML=`<div><small>λ</small><b>${CX.fmt(lam,1)} /s</b></div><div><small>M/M/1: E[n]</small><b>${CX.fmt(r/(1-r),2)}</b></div><div><small>M/M/1: E[T]</small><b>${CX.fmt(mm*s,1)} ms</b></div><div><small>M/M/1: E[W]</small><b>${CX.fmt((r/(1-r))*s,1)} ms</b></div><div><small>M/D/1: E[n]</small><b>${CX.fmt(r/(1-r)*(1-r/2),2)}</b></div><div><small>M/D/1: E[T]</small><b>${CX.fmt(md*s,1)} ms</b></div>`;
    const W=700,H=230,X=x=>50+(x-0.05)/0.9*620,Y=v=>200-Math.min(v,20)/20*180;let p1='',p2='';
    for(let i=5;i<=95;i++){const x=i/100;p1+=`${X(x).toFixed(1)},${Y(1/(1-x)).toFixed(1)} `;p2+=`${X(x).toFixed(1)},${Y((1/(1-x))*(1-x/2)).toFixed(1)} `}
    let ax='';[1,5,10,15,20].forEach(v=>ax+=`<line x1="50" x2="670" y1="${Y(v)}" y2="${Y(v)}" class="ln" style="stroke:var(--line);stroke-width:1"/><text class="sm mu" x="44" y="${Y(v)+4}" text-anchor="end">${v}×</text>`);
    $('#mc').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Retardo medio frente a la carga">${ax}<polyline points="${p1}" fill="none" style="stroke:var(--red);stroke-width:3"/><polyline points="${p2}" fill="none" style="stroke:var(--blue);stroke-width:3"/><line x1="${X(r)}" x2="${X(r)}" y1="20" y2="200" class="ln"/><circle cx="${X(r)}" cy="${Y(mm)}" r="5" style="fill:var(--red)"/><circle cx="${X(r)}" cy="${Y(md)}" r="5" style="fill:var(--blue)"/>
    <text class="sm b" x="60" y="40" style="fill:var(--red)">M/M/1</text><text class="sm b" x="60" y="58" style="fill:var(--blue)">M/D/1 (siempre menor)</text><text class="sm mu" x="360" y="224" text-anchor="middle">E[T] en múltiplos del tiempo de servicio, frente a la carga ρ de 5 % a 95 %</text></svg>`;
  }
  root.addEventListener('input',run);run();
};

