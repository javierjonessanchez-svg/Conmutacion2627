/* ===== Secuencias de mensajes sobre el reproductor común (CX.seq) ===== */
CX.seq=function(sc,uid){
  const spec=JSON.parse(sc.textContent);
  const sub=s=>CX.esc(s).replace(/_([A-Z])(?![A-Za-z0-9_])/g,'<tspan style="baseline-shift:sub" font-size="10">$1</tspan>');
  const n=spec.actors.length,W=spec.w||900,L=spec.l||80,RH=34,step=(W-2*L)/Math.max(1,n-1);
  const X=i=>L+i*step;
  const total=spec.steps.filter(s=>s.b===undefined&&s.n===undefined).length;
  let y=82,k=0,body='';const info=[''];
  spec.steps.forEach(s=>{
    if(s.b!==undefined){
      body+=`<g class="st" data-i="${Math.min(k+1,total)}"><rect class="band" x="8" y="${y-14}" width="${W-16}" height="26" rx="6"/><text class="bandt" x="${W/2}" y="${y+4}" text-anchor="middle">${sub(s.b)}</text></g>`;
    }else if(s.n!==undefined){
      const w=s.w||190,cx=Math.min(Math.max(X(s.at),8+w/2),W-8-w/2);
      body+=`<g class="st" data-i="${Math.min(k+1,total)}"><rect class="note" x="${cx-w/2}" y="${y-13}" width="${w}" height="26" rx="5"/><text class="notet" x="${cx}" y="${y+4}" text-anchor="middle">${sub(s.n)}</text></g>`;
    }else{
      k++;
      const x1=X(s.f),x2=X(s.t),kind=s.k||(s.l.startsWith('MAP')?'map':(spec.leg&&spec.leg.ntr&&!spec.leg.rad?'ntr':'rad'));
      info[k]={l:s.l,x:s.x||'',x1,x2,y,kind};
      body+=`<g class="st" data-i="${k}"><line class="ar ${kind}${s.d?' dash':''}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-end="url(#m${uid}${kind})"/><text class="lb" x="${(x1+x2)/2}" y="${y-9}" text-anchor="middle">${sub(s.l)}</text></g>`;
    }
    y+=RH;
  });
  const H=y+4;let head='';
  spec.actors.forEach((a,i)=>{head+=`<line class="life" x1="${X(i)}" y1="46" x2="${X(i)}" y2="${H-6}"/>`});
  spec.actors.forEach((a,i)=>{const w=Math.max(100,a.length*9+24);head+=`<rect class="ahead" x="${X(i)-w/2}" y="12" width="${w}" height="34" rx="8"/><text class="aht" x="${X(i)}" y="34" text-anchor="middle">${CX.esc(a)}</text>`});
  const mk=c=>`<marker id="m${uid}${c}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mk ${c}" d="M0 0L10 5L0 10z"/></marker>`;
  const leg=spec.leg?`<div class="leg">${Object.entries(spec.leg).map(([c,t])=>`<span><i style="border-color:var(--${c==='rad'?'rad':c==='map'?'map':'ink'})"></i>${CX.esc(t)}</span>`).join('')}</div>`:'';
  /* El diagrama va en el reproductor común: empieza completo (start:'last' + intro) y cada mensaje es un paso numerado */
  const wrap=document.createElement('div');
  wrap.className='seqw';wrap.innerHTML=leg;
  sc.after(wrap);
  const steps=info.slice(1).map((f,j)=>{
    const sel=`g.st[data-i="${j+1}"]`;
    return{pill:String(j+1),cap:`<span class="mono">${CX.esc(f.l)}</span> ${f.x}`,set:{[sel]:{on:1}},hl:sel,
      draw:sel+' .ar',fly:[{from:[f.x1,f.y],to:[f.x2,f.y],l:f.l,k:f.kind}]};   // la flecha se dibuja y su nombre viaja por ella
  });
  CX.play(wrap,{svg:`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${CX.esc('Secuencia de mensajes entre '+spec.actors.join(', '))}"><defs>${mk('rad')}${mk('map')}${mk('ntr')}</defs>${head}${body}</svg>`,
    steps,base:{'g.st':{on:0}},start:'last',label:'seq',title:'Secuencia de mensajes',
    intro:'Diagrama completo. Pulsa ▶ o un número para recorrerlo mensaje a mensaje.'});
};
