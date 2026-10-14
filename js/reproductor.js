/* ===== Reproductor de escenas por pasos (CX.play, CX.players, CX.stopAll) ===== */
/* Cada paso es una FOTO del estado: estado(k) = originales -> base -> steps[0..k].set, en orden.
   El movimiento lo ponen las transiciones CSS (css/reproductor.css), nunca requestAnimationFrame.
   Claves de un SetMap {selector:{x,y,h,on,cls,txt}}: x/y traslación en px (= unidades del svg),
   h escala vertical 0–1 desde abajo, on visible/oculto, cls clases añadidas a las originales, txt texto. */
CX.players=[];
/* Quita de la lista los reproductores que ya no están en la página (y los apaga del todo) */
CX.podar=()=>{for(let i=CX.players.length;i--;)if(!CX.players[i].root.isConnected){CX.players[i].off();CX.players.splice(i,1)}};
CX.stopAll=()=>{CX.podar();CX.players.forEach(p=>p.stop())};
/* Ciclo de vida común: cambiar de tema o esconder la pestaña para todo; al imprimir, cada uno enseña su último paso */
addEventListener('hashchange',()=>CX.stopAll());
document.addEventListener('visibilitychange',()=>{if(document.hidden)CX.stopAll()});
addEventListener('beforeprint',()=>{CX.stopAll();CX.players.forEach(p=>{if(p.cur!==p.n-1)p.go(p.n-1)})});   // el que ya está al final conserva su pie (p. ej. la introducción)
CX.play=function(container,scene){
  const steps=scene.steps||[],n=steps.length;
  /* Mapas de estado: base y el set de cada paso (o su setAlt en la rama alternativa) */
  const mapas=()=>[scene.base||{}].concat(steps.map(s=>(P.alt&&s.setAlt)||s.set||{}));
  const todos=[scene.base||{}].concat(steps.map(s=>s.set||{}),steps.map(s=>s.setAlt||{}));
  const root=document.createElement('div');
  root.className='pl';root.tabIndex=0;root.setAttribute('role','group');root.setAttribute('aria-label',scene.title||'Animación paso a paso');
  root.innerHTML=`<div class="diagram">${scene.svg}</div><p class="pl-cap" aria-live="polite"></p>
    <div class="pl-pills" role="group" aria-label="Pasos">${steps.map((s,i)=>`<button type="button" class="pl-pill" data-k="${i}">${s.pill||i+1}</button>`).join('')}</div>
    <div class="pl-ctl"><button type="button" class="b" data-a="first">⏮ Reiniciar</button><button type="button" class="b" data-a="prev">◀ Anterior</button><button type="button" class="b pri pl-play" data-a="play">▶ Reproducir</button><button type="button" class="b" data-a="next">Siguiente ▶</button>${scene.q?'<button type="button" class="b pl-quiz" data-a="quiz" hidden>Ponte a prueba</button>':''}<span class="pl-spd" role="group" aria-label="Velocidad">${[['0.5','0,5×'],['1','1×'],['2','2×']].map(([v,t])=>`<button type="button" class="b" data-v="${v}" aria-pressed="${v==='1'}">${t}</button>`).join('')}</span>${CX.reto?'<label class="pl-retol"><input type="checkbox" class="pl-reto"> Modo reto</label>':''}</div>`;
  container.appendChild(root);
  const svg=CX.$('.diagram svg',root),cap=CX.$('.pl-cap',root),pills=CX.$$('.pl-pill',root),bPlay=CX.$('[data-a=play]',root),bSpd=CX.$$('[data-v]',root),bQuiz=CX.$('.pl-quiz',root),sw=CX.$('.pl-reto',root);
  pills.forEach((b,i)=>b.setAttribute('aria-label',`Paso ${i+1}: ${b.textContent}`));   // nombre accesible: el número de paso y su etiqueta
  /* Elementos tocados (en orden del documento) y, de cada uno, qué claves se usan y sus valores originales */
  const keys=new Map();
  todos.forEach(m=>Object.entries(m).forEach(([sel,v])=>CX.$$(sel,svg).forEach(e=>{
    const k=keys.get(e)||new Set();Object.keys(v).forEach(c=>k.add(c));keys.set(e,k);
  })));
  const els=CX.$$('*',svg).filter(e=>keys.has(e)&&!e.classList.contains('fly'));
  const orig=new Map(els.map(e=>[e,{tr:e.style.transform,op:e.style.opacity,pe:e.style.pointerEvents,ah:e.getAttribute('aria-hidden'),cl:e.getAttribute('class'),tx:e.textContent}]));
  els.forEach(e=>{if(keys.get(e).has('h')){e.style.transformBox='fill-box';e.style.transformOrigin='bottom'}});
  const fin=new Map();   // traslación FINAL [x,y] que render() acaba de dar a cada elemento (null si no es una traslación)
  const attr=(e,a,v)=>v===null?e.removeAttribute(a):e.setAttribute(a,v);
  /* Pinta el estado del paso k: mezcla base y sets 0..k por clave y escribe una sola vez cada elemento */
  function render(k){
    const st=new Map(els.map(e=>[e,{}]));
    mapas().slice(0,k+2).forEach(m=>Object.entries(m).forEach(([sel,v])=>CX.$$(sel,svg).forEach(e=>{if(st.has(e))Object.assign(st.get(e),v)})));
    st.forEach((s,e)=>{
      const o=orig.get(e),u=keys.get(e);
      if(u.has('x')||u.has('y')||u.has('h')){fin.set(e,s.h===undefined&&(s.x!==undefined||s.y!==undefined)?[s.x||0,s.y||0]:null);e.style.transform=s.h!==undefined?`scaleY(${s.h})`:(s.x!==undefined||s.y!==undefined)?`translate(${s.x||0}px,${s.y||0}px)`:o.tr}
      if(u.has('on')){
        const off=s.on===undefined?null:!s.on;
        e.style.opacity=off===null?o.op:off?'0':'1';
        e.style.pointerEvents=off?'none':o.pe;
        attr(e,'aria-hidden',off===null?o.ah:off?'true':o.ah);
      }
      if(u.has('cls'))attr(e,'class',s.cls?((o.cl||'')+' '+s.cls).trim():o.cl);
      if(u.has('txt'))e.textContent=s.txt!==undefined?s.txt:o.tx;
    });
  }
  let intro=scene.intro||'';
  function show(k){
    P.cur=Math.max(0,Math.min(n-1,k|0));
    render(P.cur);
    const s=steps[P.cur];
    cap.innerHTML=intro||(n?`<b>Paso ${P.cur+1} de ${n}</b> · ${(P.alt&&s.capAlt)||s.cap||''}`:'');
    if(bQuiz)bQuiz.hidden=P.cur!==n-1;
    /* hl: resalta solo lo del paso actual (nada mientras se ve la introducción) */
    CX.$$('.hl',svg).forEach(e=>e.classList.remove('hl'));
    if(!intro&&s&&s.hl)CX.$$(s.hl,svg).forEach(e=>e.classList.add('hl'));
    if(s&&s.cx!==undefined)centrar(s.cx);   // la autoevaluación solo al final, cuando ya se ha visto todo
    pills.forEach((b,i)=>i===P.cur?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
    root.dispatchEvent(new CustomEvent('cx-step',{bubbles:true,detail:{k:P.cur}}));   // aviso para la escena que lo contiene
  }
  /* Efectos del paso recién estrenado (solo con next()): paquetes en vuelo (.fly) y líneas que se dibujan.
     No forman parte del estado: snap() no los ve y cualquier salto (go) los retira al instante. */
  const flies=new Set(),trazos=new Set();
  const sinMov=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function centro(p){   // [x,y] tal cual, o el centro del bbox del selector en unidades del svg, en su posición FINAL
    if(Array.isArray(p))return p;
    const e=CX.$(p,svg);if(!e)return null;
    try{
      /* Si el elemento se traslada en este paso, su CTM aún marca el inicio de la transición: se usa el CTM del padre + la traslación final */
      const b=e.getBBox(),t=fin.get(e),a=svg.getScreenCTM().inverse(),m=t?a.multiply(e.parentNode.getScreenCTM()).translate(t[0],t[1]):a.multiply(e.getScreenCTM()),q=new DOMPoint(b.x+b.width/2,b.y+b.height/2).matrixTransform(m);
      return [q.x,q.y];
    }catch(_){return null}
  }
  function quitarFx(){flies.forEach(g=>g.remove());flies.clear();trazos.forEach(a=>a.cancel());trazos.clear()}
  function efectos(s){
    if(!s||sinMov())return;
    const dur=600/P.speed;
    ((P.alt&&s.flyAlt)||s.fly||[]).forEach(f=>{
      const a=centro(f.from),z=centro(f.to);if(!a||!z)return;
      const l=String(f.l||''),w=Math.max(28,l.length*7+14),g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','fly '+(f.k||'rad'));
      g.innerHTML=`<rect x="${-w/2}" y="-9" width="${w}" height="18" rx="9"/><text text-anchor="middle" dominant-baseline="central">${CX.esc(l)}</text>`;
      const dl=(f.d||0)*dur;                                // d: sale tras d vuelos (mensajes en cadena dentro de un paso)
      g.style.transitionDuration=`${dur}ms,120ms`;g.style.transitionDelay=dl+'ms';
      g.style.transform=`translate(${a[0]}px,${a[1]}px)`;   // posición de salida, sin animar
      if(dl)g.style.opacity='0';                            // invisible hasta su turno
      svg.appendChild(g);flies.add(g);
      g.getBoundingClientRect();                            // fuerza el reflujo: así la salida ya está pintada
      g.style.transform=`translate(${z[0]}px,${z[1]}px)`;if(dl)g.style.opacity='1';
      const fin=ev=>{if(ev&&(ev.target!==g||ev.propertyName!=='transform'))return;g.remove();flies.delete(g)};
      g.addEventListener('transitionend',fin);
      setTimeout(fin,1000/P.speed+dl);                         // por si transitionend no llega (mismo punto, pestaña oculta)
    });
    if(s.draw)CX.$$(s.draw,svg).forEach(e=>{
      const L=e.getTotalLength?e.getTotalLength():0;if(!L||!e.animate)return;
      const d=`${L} ${L}`,an=e.animate([{strokeDasharray:d,strokeDashoffset:L},{strokeDasharray:d,strokeDashoffset:0}],{duration:dur,easing:'cubic-bezier(.2,0,0,1)'});
      trazos.add(an);an.onfinish=an.oncancel=()=>trazos.delete(an);   // al acabar no deja estilos en línea: la línea queda normal
    });
  }
  /* Reproducción automática: un solo temporizador por reproductor, siempre se limpia en stop() */
  let timer=0;
  function avanzar(){const c=P.cur;P.go(c+1);if(P.cur>c)efectos(steps[P.cur])}
  const etiqueta=()=>{bPlay.textContent=P.playing?'⏸ Pausa':'▶ Reproducir'};
  /* espera al menos 2400 ms, o lo que tarden en llegar los mensajes en cadena del paso actual (último vuelo + 600 ms para verlo) */
  function espera(){const s=steps[P.cur]||{},fl=(P.alt&&s.flyAlt)||s.fly||[],d=fl.reduce((m,f)=>Math.max(m,f.d||0),0);return Math.max(2400,(d+2)*600)/P.speed}
  function arrancar(){clearTimeout(timer);timer=setTimeout(()=>{if(!root.getClientRects().length)return P.stop();avanzar();if(P.cur>=n-1)P.stop();else arrancar()},espera())}   // la reproducción ignora el reto   // sin caja (página oculta): para
  const P={root,svg,n,cur:0,playing:false,speed:1,alt:false,
    go(k){intro='';quitarFx();quitarCarta();show(k)},
    /* Siguiente a mano: con el Modo reto, primero la pregunta; la segunda pulsación (o Ver respuesta) da el paso */
    next(){
      if(carta||!retoOn()||P.cur>=n-1)return avanzar();
      ponerCarta();
    },
    prev(){P.go(P.cur-1)},
    play(){
      if(n<2)return;
      if(P.cur>=n-1){P.go(0);efectos(steps[0])}   // en el último paso, reproducir vuelve a empezar (y estrena el paso 1)
      P.playing=true;etiqueta();arrancar();
    },
    stop(){clearTimeout(timer);timer=0;P.playing=false;etiqueta()},
    /* Rama alternativa (p. ej. SIM clonada): clase alt en el svg y pies capAlt donde los haya */
    setAlt(v){P.alt=!!v;svg.classList.toggle('alt',P.alt);show(P.cur)},
    off(){P.stop();quitarFx();if(io)io.disconnect();document.removeEventListener('cx-reto',sinc)},   // al quitarlo de la página: ni temporizador ni observador
    setSpeed(v){
      P.speed=v;bSpd.forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===v)));
      if(P.playing)arrancar();
    },
    snap(){return JSON.stringify(els.map(e=>[e.style.transform,e.style.opacity,e.getAttribute('class')||'',e.textContent]))}
  };
  /* Los botones: ir a un paso a mano (pastilla, anterior, siguiente, reiniciar) para la reproducción */
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||!root.contains(b))return;
    const a=b.dataset.a;
    if(b.dataset.k!==undefined){P.stop();P.go(+b.dataset.k)}
    else if(b.dataset.v!==undefined)P.setSpeed(+b.dataset.v);
    else if(a==='play')P.playing?P.stop():P.play();
    else if(a==='quiz')abrirPregunta();
    else if(a==='reveal')avanzar();
    else if(a){P.stop();a==='first'?(P.setAlt(false),P.go(0),efectos(steps[0])):a==='prev'?P.prev():P.next()}
  });
  /* Modo reto: tarjeta con la pregunta (sin temporizadores); la pastilla siguiente esconde su etiqueta con «?» */
  const retoOn=()=>!!(CX.reto&&CX.reto.get());
  let carta=null;
  function ponerCarta(){
    const k=P.cur+1;
    carta=document.createElement('div');carta.className='pl-card';carta.setAttribute('role','status');
    carta.innerHTML=`<b>${scene.label==='seq'?'¿Qué mensaje va ahora y de quién a quién?':'¿Qué pasa ahora?'}</b> <button type="button" class="b pri" data-a="reveal">Ver respuesta</button>`;
    CX.$('.diagram',root).after(carta);
    pills[k].textContent='?';pills[k].setAttribute('aria-label',`Paso ${k+1}: ?`);   // tampoco se lo chiva al lector de pantalla
    if(root.contains(document.activeElement))CX.$('[data-a=reveal]',carta).focus({preventScroll:true});
  }
  function quitarCarta(){
    if(!carta)return;
    const foco=carta.contains(document.activeElement);
    carta.remove();carta=null;
    pills.forEach((b,i)=>{b.textContent=steps[i].pill||i+1;b.setAttribute('aria-label',`Paso ${i+1}: ${b.textContent}`)});
    if(foco)CX.$('[data-a=next]',root).focus({preventScroll:true});   // el foco sigue en un control con nombre: Siguiente
  }
  if(sw){sw.checked=retoOn();sw.addEventListener('change',()=>CX.reto.set(sw.checked))}
  const sinc=()=>{if(sw)sw.checked=retoOn();if(!retoOn())quitarCarta()};
  document.addEventListener('cx-reto',sinc);
  /* Pantalla estrecha: si el dibujo se desplaza dentro de su marco, deja a la vista la x (unidades del svg) del paso */
  function centrar(x){
    const d=svg.parentNode;if(d.scrollWidth<=d.clientWidth+1)return;
    const vb=svg.viewBox.baseVal,w=svg.getBoundingClientRect().width;if(!vb||!vb.width||!w)return;
    d.scrollTo({left:Math.max(0,x/vb.width*w-d.clientWidth/2),behavior:sinMov()?'auto':'smooth'});
  }
  /* Abre y enseña la pregunta de autoevaluación de la misma página cuyo enunciado contiene scene.q */
  function abrirPregunta(){
    const pg=root.closest('.page')||document,d=CX.$$('details.q',pg).find(x=>{const m=CX.$('summary',x);return m&&m.textContent.includes(scene.q)});
    if(!d)return;
    d.open=true;d.scrollIntoView({behavior:sinMov()?'auto':'smooth',block:'center'});
    const m=CX.$('summary',d);if(m)m.focus({preventScroll:true});
  }
  /* Teclado, solo con el foco dentro de este reproductor: flechas = paso, espacio (sobre el propio .pl) = reproducir/pausa */
  root.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();P.stop();e.key==='ArrowRight'?P.next():P.prev()}
    else if(e.key===' '&&e.target===root){e.preventDefault();P.playing?P.stop():P.play()}
  });
  /* Se pausa solo cuando sale de la vista (umbral 0: en cuanto no queda ni un píxel visible) */
  const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)P.stop()}),{threshold:0}):null;
  if(io)io.observe(root);
  show(scene.start==='last'?n-1:0);
  CX.podar();CX.players.push(P);
  return P;
};
