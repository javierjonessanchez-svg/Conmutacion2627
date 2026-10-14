/* ===== Arranque: CX.init (decoración, navegación, rutas, tema, impresión, búsqueda y repaso) y carga de la página ===== */
/* ============================ Arranque ============================ */
CX.init=function(){
  const pages=CX.$$('.page'),temas=CX.$$('.page.tema');
  const seen=new Set(CX.store.get('seen',[])),done=new Set(CX.store.get('done',[]));
  let uid=0;
  CX.$$('script.seq').forEach(sc=>CX.seq(sc,++uid));
  CX.$$('[data-w]').forEach(el=>{const f=CX.w[el.dataset.w];if(f){try{f(el)}catch(err){el.innerHTML='<p class="ojo"><b>Error en el widget.</b> '+CX.esc(err.message)+'</p>';console.error(err)}}});

  /* par trenzado: dos hilos (color del tema + blanco) que se cruzan a paso fijo. Orden de dibujo: hilo de color,
     borde y alma del hilo blanco, y otra vez el de color a trazos (un medio paso sí y otro no) para que en los cruces
     vaya una vez por encima cada hilo. Lo usan la cabecera de cada tema (CX.twist) y los conectores del índice (CX.stub). */
  const NS='http://www.w3.org/2000/svg';
  function hilo(s,W,H,A,HP){const K=HP*.3642;   // K: puntos de control de la curva (aproximación de un seno)
    let d=`M0 ${H/2-s*A}c${K} 0 ${HP-K} ${2*s*A} ${HP} ${2*s*A}`;
    for(let x=HP,g=-s;x<W;x+=HP,g=-g)d+=`s${HP-K} ${2*g*A} ${HP} ${2*g*A}`;return d}
  function par(cls,W,H,A,HP){const svg=document.createElementNS(NS,'svg');
    svg.setAttribute('class',cls);svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('preserveAspectRatio','xMinYMid slice');
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const dC=hilo(1,W,H,A,HP),dB=hilo(-1,W,H,A,HP);
    [['wc',dC],['we',dB],['ww',dB],['wo',dC]].forEach(([c,d])=>{const p=document.createElementNS(NS,'path');
      p.setAttribute('class',c);p.setAttribute('d',d);p.setAttribute('pathLength',W);   // pathLength = ancho: una unidad de trazo ≈ una unidad de x
      if(c==='wo')p.setAttribute('stroke-dasharray',`${HP} ${HP}`);                     // los trazos acaban en las crestas, donde los hilos están separados
      svg.append(p)});
    return svg}
  /* cabecera: viewBox ancho y "slice"; con 20 px de alto la escala es 1, así que el paso no cambia con el ancho y lo que sobra se recorta */
  const TW=2400;
  CX.twist=()=>par('twist',TW,20,4.5,15);
  CX.stub=()=>par('stub',24,14,3,8);
  /* mapa de inicio: cada tema cuelga de su regleta con un trozo de par en vertical (el grupo .pr ya va girado 90°) */
  CX.$$('#p-home .pr').forEach(g=>{const W=72,H=12,A=3.5,HP=12,dC=hilo(1,W,H,A,HP),dB=hilo(-1,W,H,A,HP);
    [['wc',dC],['we',dB],['ww',dB],['wo',dC]].forEach(([c,d])=>{const p=document.createElementNS(NS,'path');
      p.setAttribute('class',c);p.setAttribute('d',d);p.setAttribute('transform',`translate(0 ${-H/2})`);p.setAttribute('pathLength',W);
      if(c==='wo')p.setAttribute('stroke-dasharray',`${HP} ${HP}`);g.append(p)})});
  /* se dibuja una vez al abrir el tema (~700 ms, stroke-dashoffset); con movimiento reducido no se anima */
  const quieto=matchMedia('(prefers-reduced-motion: reduce)');
  function trenzar(page){
    const svg=CX.$('.twist',page);if(!svg||quieto.matches||!svg.animate)return;
    const w=Math.min(TW,Math.ceil(svg.getBoundingClientRect().width)+2);   // solo se ve el tramo [0, w]
    const ease='cubic-bezier(.33,0,.15,1)';
    svg.querySelectorAll('path').forEach((p,i)=>{p.getAnimations().forEach(a=>a.cancel());
      if(p.classList.contains('wo'))   // los cruces alternos aparecen al final, cuando ya están los dos hilos
        p.animate([{opacity:0},{opacity:0,offset:.78},{opacity:1}],{duration:860,easing:'ease-out'});
      else p.animate([{strokeDasharray:`${TW} ${TW}`,strokeDashoffset:TW},{strokeDasharray:`${TW} ${TW}`,strokeDashoffset:TW-w}],
        {duration:700,delay:i?70:0,easing:ease,fill:'backwards'})});
  }

  /* cabeceras, índice interno y navegación anterior/siguiente de cada tema */
  temas.forEach((t,i)=>{
    const h2=CX.$('h2',t);
    h2.after(CX.twist());
    const src=t.dataset.src;if(src){const p=document.createElement('p');p.className='src';p.textContent='Basado en '+src;h2.before(p)}
    const h3s=CX.$$('h3',t);
    h3s.forEach((h,j)=>{if(!h.id)h.id=t.id.slice(2)+'-s'+(j+1)});
    const lead=CX.$('.lead',t);
    if(h3s.length&&lead){const j=document.createElement('nav');j.className='jump';j.setAttribute('aria-label','En esta página');
      j.innerHTML=h3s.map(h=>`<a href="#/${t.id.slice(2)}/${h.id}">${CX.esc(h.textContent)}</a>`).join('');lead.after(j)}
    const prev=temas[i-1],next=temas[i+1];
    const nav=document.createElement('div');nav.className='pgnav';
    nav.innerHTML=(prev?`<a href="#/${prev.id.slice(2)}" style="--c:var(--${prev.dataset.color})"><small>Anterior</small>${CX.esc(prev.dataset.title)}</a>`:'<span></span>')+(next?`<a class="nx" href="#/${next.id.slice(2)}" style="--c:var(--${next.dataset.color})"><small>Siguiente</small>${CX.esc(next.dataset.title)}</a>`:`<a class="nx" href="#/repaso" style="--c:var(--blue)"><small>Siguiente</small>Modo repaso</a>`);
    const d=document.createElement('div');d.className='domino';
    d.innerHTML=`<button class="b" type="button" aria-pressed="false">Lo domino</button><span class="stats">Márcalo cuando puedas contestar el repaso de este tema sin mirar.</span>`;
    t.append(d,nav);
    const btn=CX.$('button',d);
    btn.setAttribute('aria-pressed',done.has(t.id));
    btn.addEventListener('click',()=>{done.has(t.id)?done.delete(t.id):done.add(t.id);btn.setAttribute('aria-pressed',done.has(t.id));CX.store.set('done',[...done]);paint()});
  });

  /* índice lateral (el "panel de conectores") */
  const navEl=CX.$('#nav');
  const items=[{id:'home',title:'Mapa del curso',c:'--slate'}].concat(temas.map(t=>({id:t.id.slice(2),title:t.dataset.title,sub:t.dataset.short,c:'--'+t.dataset.color,pid:t.id})));
  items.push({id:'repaso',title:'Modo repaso',c:'--blue'});
  items.push({pend:1,title:'GPRS, 3G y 4G',sub:'pendiente',c:'--violet'},{pend:1,title:'SIP e IMS',sub:'pendiente',c:'--violet'});
  navEl.innerHTML=items.map(it=>it.pend?`<span class="ni pend" style="--c:var(${it.c})"><span class="jk"></span><span>${it.title}<small>${it.sub}</small></span></span>`:`<a class="ni" data-id="${it.id}" href="#/${it.id==='home'?'':it.id}" style="--c:var(${it.c})"><span class="jk"></span><span>${CX.esc(it.title)}${it.sub?`<small>${CX.esc(it.sub)}</small>`:''}</span></a>`).join('');
  CX.$$('.jk',navEl).forEach(j=>j.append(CX.stub()));   // cada conector lleva su trozo de par
  function paint(){
    CX.$$('.ni[data-id]',navEl).forEach(a=>{const pid='p-'+a.dataset.id;a.classList.toggle('seen',seen.has(pid));a.classList.toggle('done',done.has(pid))});
    CX.$$('.node[data-t]').forEach(g=>{const pid='p-'+g.dataset.t;g.classList.toggle('seen',seen.has(pid));g.classList.toggle('done',done.has(pid))});
    CX.$('#prog').textContent=`Dominados: ${temas.filter(t=>done.has(t.id)).length} de ${temas.length} temas`;
  }

  /* router por hash: #/tema  o  #/tema/ancla */
  function route(h){
    const parts=(typeof h==='string'?h:location.hash).replace(/^#\/?/,'').split('/');
    const id=parts[0]||'home',anchor=parts[1];
    let page=CX.$('#p-'+id);if(!page){page=CX.$('#p-home')}
    const nueva=!page.classList.contains('show');   // saltar a un ancla del mismo tema no vuelve a trenzar
    pages.forEach(p=>p.classList.toggle('show',p===page));
    CX.$$('.ni[data-id]',navEl).forEach(a=>a.classList.toggle('on',a.dataset.id===(page.id.slice(2))));
    /* en el móvil el índice es una fila desplazable: dejar a la vista el conector del tema abierto */
    const on=CX.$('.ni.on',navEl);if(on&&navEl.scrollWidth>navEl.clientWidth)navEl.scrollLeft=on.offsetLeft-16;
    if(page.classList.contains('tema')){seen.add(page.id);CX.store.set('seen',[...seen]);if(nueva)trenzar(page)}
    document.title=(page.dataset.title?page.dataset.title+' · ':'')+'Apuntes de Conmutación';
    paint();
    const target=anchor&&document.getElementById(anchor);
    if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));else window.scrollTo(0,0);
    if(page.id==='p-repaso')CX.repaso.open();
  }
  addEventListener('hashchange',()=>route());
  CX.route=route;

  /* tema claro/oscuro */
  const tb=CX.$('#theme'),root=document.documentElement;
  function setTheme(t){if(t)root.dataset.theme=t;const dark=root.dataset.theme==='dark'||(!root.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);tb.textContent=dark?'Cambiar a tema claro':'Cambiar a tema oscuro'}
  const st=CX.store.get('theme',null);if(st)root.dataset.theme=st;setTheme();
  tb.addEventListener('click',()=>{const dark=root.dataset.theme==='dark'||(!root.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);const t=dark?'light':'dark';setTheme(t);CX.store.set('theme',t)});
  CX.$('#print').addEventListener('click',()=>print());
  /* al imprimir, abrir las respuestas del repaso y restaurar después */
  let reopen=[];
  addEventListener('beforeprint',()=>{reopen=CX.$$('details:not([open])');reopen.forEach(d=>d.open=true)});
  addEventListener('afterprint',()=>{reopen.forEach(d=>d.open=false);reopen=[]});

  /* búsqueda: un bloque por cada h3 de cada tema */
  const index=[];
  temas.forEach(t=>{
    CX.$$('h3',t).forEach(h=>{let txt=h.textContent+' ',e=h.nextElementSibling;while(e&&e.tagName!=='H3'&&!e.classList.contains('domino')){if(e.tagName!=='SCRIPT')txt+=e.textContent+' ';e=e.nextElementSibling}
      index.push({page:t.id.slice(2),pt:t.dataset.title,id:h.id,title:h.textContent,txt:txt.replace(/\s+/g,' '),n:CX.norm(txt)})});
  });
  const q=CX.$('#q'),res=CX.$('#sres');
  q.addEventListener('input',()=>{
    const v=CX.norm(q.value.trim());if(v.length<2){res.hidden=true;return}
    const hits=index.filter(b=>b.n.includes(v)).slice(0,10);
    res.hidden=false;
    res.innerHTML=hits.length?hits.map(b=>{const i=b.n.indexOf(v),s=b.txt.slice(Math.max(0,i-30),i+60);return `<a href="#/${b.page}/${b.id}"><b>${CX.esc(b.title)}</b><span>${CX.esc(b.pt)}: …${CX.esc(s)}…</span></a>`}).join(''):'<a><span>Nada con «'+CX.esc(q.value)+'». Prueba con otra palabra o sin tildes.</span></a>';
  });
  res.addEventListener('click',()=>{res.hidden=true;q.value=''});
  q.addEventListener('keydown',e=>{if(e.key==='Escape'){res.hidden=true;q.blur()}});

  /* próximas pruebas (fechas de la guía) */
  const today=new Date();today.setHours(0,0,0,0);
  const tests=[
    {d:'2026-10-13',n:'PS4',t:'Capa de red, recursos radio y movilidad',l:[['rr','Red: RR'],['mm','Movilidad']]},
    {d:'2026-10-20',n:'PS5',t:'Análisis de rendimiento en GSM (antes de esta fecha)',l:[['um','Interfaz aérea'],['trafico','Tráfico']]},
    {d:'2026-11-03',n:'PS6',t:'GPRS y 3G/4G',l:[]},
    {d:'2026-11-24',n:'PEI',t:'Todo el grupo grande de las sesiones 1 a 10',l:[['arq','Arquitectura'],['um','Interfaz aérea'],['enlace','Enlace'],['rr','RR'],['mm','Movilidad']]}
  ].filter(x=>new Date(x.d+'T00:00:00')>=today).slice(0,3);
  CX.$('#nextlist').innerHTML=tests.map(x=>{const days=Math.round((new Date(x.d+'T00:00:00')-today)/864e5);
    return `<div class="next${days===0?' hoy':''}"><div class="dd">${days===0?'Hoy':days}<small>${days===0?'':days===1?'día':'días'}</small></div><div><p><b>${x.n}</b>, ${new Date(x.d+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})}. ${x.t}.</p>${x.l.length?`<p class="links">${x.l.map(l=>`<a href="#/${l[0]}">${l[1]}</a>`).join('')}</p>`:''}</div></div>`}).join('')||'<p>No quedan pruebas en el calendario guardado.</p>';

  /* repaso con tarjetas */
  const cards=[];
  temas.forEach(t=>CX.$$('details.q',t).forEach(d=>{const s=CX.$('summary',d);cards.push({t:t.dataset.title,id:t.id,q:s.innerHTML,a:[...d.childNodes].filter(n=>n!==s).map(n=>n.outerHTML||n.textContent).join('')})}));
  const sel=CX.$('#rtema');sel.innerHTML='<option value="">Todos los temas</option>'+temas.map(t=>`<option value="${t.id}">${CX.esc(t.dataset.title)}</option>`).join('');
  const know=CX.store.get('know',{});let deck=[],pos=0,shown=false;
  CX.repaso={open(){build()}};
  function build(){
    deck=cards.filter(c=>!sel.value||c.id===sel.value);
    deck.sort((a,b)=>((know[a.q]===1?1:0)-(know[b.q]===1?1:0))||(Math.random()-.5)); // primero lo no sabido
    pos=0;shown=false;draw();
  }
  function draw(){
    const fc=CX.$('#fc'),bt=CX.$('#fcbtn');
    const sa=deck.filter(c=>know[c.q]===1).length;
    CX.$('#rstats').textContent=deck.length?`Sabidas ${sa} de ${deck.length}`:'';
    if(!deck.length){fc.innerHTML='<p>Aún no hay preguntas de repaso.</p>';bt.innerHTML='';return}
    fc.style.removeProperty('--pair');
    if(pos>=deck.length){fc.innerHTML=`<div class="qq">Has dado la vuelta al mazo.</div><p>Sabías ${sa} de ${deck.length}. Pulsa «Barajar de nuevo» para repasar primero las que marcaste como pendientes.</p>`;bt.innerHTML='';return}
    const c=deck[pos];
    fc.style.setProperty('--pair',`var(--${CX.$('#'+c.id).dataset.color})`);   // la tarjeta lleva el color del tema
    fc.innerHTML=`<div class="from">${CX.esc(c.t)}. Pregunta ${pos+1} de ${deck.length}</div><div class="qq">${c.q}</div>${shown?`<div class="aa">${c.a}</div>`:''}`;
    bt.innerHTML=shown?`<button class="b pri" type="button" data-k="1">La sabía</button><button class="b" type="button" data-k="0">Repasar</button>`:`<button class="b pri" type="button" data-s="1">Ver respuesta</button><button class="b" type="button" data-sk="1">Saltar</button>`;
  }
  CX.$('#fcbtn').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.s){shown=true}
    else if(b.dataset.sk){pos++}
    else{know[deck[pos].q]=+b.dataset.k;CX.store.set('know',know);pos++;shown=false}
    draw()});
  sel.addEventListener('change',build);CX.$('#rrestart').addEventListener('click',build);

  paint();route();
};

document.addEventListener('DOMContentLoaded',CX.init);
