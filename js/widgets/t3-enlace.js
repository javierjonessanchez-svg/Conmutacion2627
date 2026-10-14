/* ===== Widgets del tema 3: enlace (relleno de bits y campo de control) ===== */
/* ---------- Tema 3: relleno de bits ---------- */
CX.w.stuff=function(root){
  const EX={tx:['01111101111110','11111111','0101111100'],rx:['0111110011111010','01111110','111110111110']};
  let mode='tx',ei=0;
  root.innerHTML=`<p class="wt">Relleno de bits <span>Escribe bits y mira cómo los trata el transmisor y el receptor.</span></p>
  <div class="ctrl"><div class="seg" role="group" aria-label="Modo"><button class="b" type="button" data-m="tx">Transmisor: insertar</button><button class="b" type="button" data-m="rx">Receptor: quitar</button></div>
  <input id="sb" type="text" maxlength="80" aria-label="Bits" spellcheck="false"><button class="b" type="button" id="sex">Otro ejemplo</button></div>
  <div class="frm stuf" style="display:block;padding:10px;word-break:break-all;line-height:1.9" id="sout"></div><div class="info" id="sinfo"></div>`;
  const sb=CX.$('#sb',root),out=CX.$('#sout',root),info=CX.$('#sinfo',root);
  function run(){
    CX.$$('[data-m]',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===mode));
    const bits=(sb.value.match(/[01]/g)||[]).join('');let ones=0,html='',k=0,clean='',flag=false;
    if(mode==='tx'){
      for(const b of bits){html+=b;if(b==='1'){ones++;if(ones===5){html+='<i>0</i>';k++;ones=0}}else ones=0}
      out.innerHTML=`<span class="mu">Bandera </span>01111110 ${html||'…'} 01111110<span class="mu"> Bandera</span>`;
      info.innerHTML=`Entran <b>${bits.length}</b> bits y salen <b>${bits.length+k}</b>: <b>${k}</b> ${k===1?'cero insertado':'ceros insertados'} (en rojo). Se inserta aunque el bit siguiente ya fuera un 0, porque el receptor no puede saberlo de antemano.`;
    }else{
      for(const b of bits){
        if(ones===5){if(b==='0'){html+='<u>0</u>';ones=0;k++;continue}flag=true}
        html+=b;clean+=b;if(b==='1')ones++;else ones=0;
      }
      out.innerHTML=html||'…';
      info.innerHTML=`Se han quitado <b>${k}</b> ${k===1?'cero (subrayado)':'ceros (subrayados)'} que seguían a cinco 1. Datos recuperados: <span class="mono">${clean||'—'}</span>.`+(flag?` <b>Ojo:</b> hay seis 1 seguidos. Eso no puede ser un dato relleno: es una bandera (01111110) o un aborto, así que el receptor daría por terminada la trama aquí.`:'');
    }
  }
  root.addEventListener('click',e=>{
    const m=e.target.closest('[data-m]');if(m){mode=m.dataset.m;ei=0;sb.value=EX[mode][0];return run()}
    if(e.target.id==='sex'){ei=(ei+1)%EX[mode].length;sb.value=EX[mode][ei];run()}
  });
  sb.addEventListener('input',run);
  sb.value=EX.tx[0];run();
};

/* ---------- Tema 3: decodificador del campo de control ---------- */
CX.w.ctrl=function(root){
  const SS={RR:['00','Receiver Ready: confirmación. «He recibido bien hasta la N(R)−1 y espero la N(R)».'],RNR:['01','Receiver Not Ready: confirma como RR pero añade control de flujo: «no admito más tramas por ahora».'],REJ:['10','Reject: fallo de secuencia. Pide retransmitir todo desde la N(R). El receptor solo procesa en orden.'],SREJ:['11','Selective Reject: pide retransmitir solo la trama N(R). El receptor puede guardar las tramas que llegan fuera de orden.']};
  const UU={SABM:['001','11','Set Asynchronous Balanced Mode: pide abrir la conexión en modo ABM con secuencia de 3 bits.'],UA:['011','00','Unnumbered Acknowledgement: confirma la apertura o el cierre de la conexión.'],DM:['000','11','Disconnected Mode: rechaza la conexión (o confirma el cierre).'],DISC:['010','00','Disconnect: pide liberar la conexión, desde cualquier extremo.'],UI:['000','00','Unnumbered Information: datos en modo no fiable, sin confirmación.']};
  const sel=(id,n,v)=>`<select id="${id}" aria-label="${id}">${Array.from({length:n},(_,i)=>`<option${i===v?' selected':''}>${i}</option>`).join('')}</select>`;
  root.innerHTML=`<p class="wt">Decodificador del campo de control <span>Con contadores de 3 bits (un octeto), como en LAPDm. Tú eliges la trama y ves sus bits.</span></p>
  <div class="ctrl"><div class="seg" role="group" aria-label="Tipo de trama"><button class="b" type="button" data-ty="I">I: información</button><button class="b" type="button" data-ty="S">S: supervisión</button><button class="b" type="button" data-ty="U">U: sin numerar</button></div></div>
  <div class="ctrl" id="cf"></div><div class="frm" id="cb"></div><div class="info" id="ci"></div>`;
  let ty='I';
  const st={ns:2,nr:1,p:0,s:'RR',u:'SABM'};
  const b3=n=>n.toString(2).padStart(3,'0');
  function ctl(){
    let h='';
    if(ty==='I')h=`<label>N(S) ${sel('ns',8,st.ns)}</label><label>N(R) ${sel('nr',8,st.nr)}</label>`;
    if(ty==='S')h=`<label>Tipo <select id="ss">${Object.keys(SS).map(k=>`<option${k===st.s?' selected':''}>${k}</option>`).join('')}</select></label><label>N(R) ${sel('nr',8,st.nr)}</label>`;
    if(ty==='U')h=`<label>Tipo <select id="uu">${Object.keys(UU).map(k=>`<option${k===st.u?' selected':''}>${k}</option>`).join('')}</select></label>`;
    h+=`<label><input type="checkbox" id="pp"${st.p?' checked':''}> bit P/F</label>`;
    CX.$('#cf',root).innerHTML=h;
  }
  function draw(){
    CX.$$('[data-ty]',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.ty===ty));
    const p=st.p?'1':'0';let f,d;
    if(ty==='I'){f=[[b3(st.nr),'N(R)','k3',3],[p,'P/F','k5',1],[b3(st.ns),'N(S)','k1',3],['0','tipo I','k7',1]];
      d=`Trama de <b>información</b> número ${st.ns}. Confirma las tramas recibidas hasta la ${(st.nr+7)%8} y dice que la siguiente que espera es la <b>${st.nr}</b>. Se escribe <span class="mono">I(${st.ns},${st.nr})</span>.`}
    if(ty==='S'){f=[[b3(st.nr),'N(R)','k3',3],[p,'P/F','k5',1],[SS[st.s][0],'tipo S','k4',2],['01','trama S','k7',2]];
      d=`<b>${st.s}</b> con N(R)=${st.nr}. ${SS[st.s][1]} No lleva campo de datos.`}
    if(ty==='U'){const u=UU[st.u];f=[[u[0],'tipo','k4',3],[p,'P/F','k5',1],[u[1],'tipo','k4',2],['11','trama U','k7',2]];
      d=`<b>${st.u}</b>. ${u[2]} No lleva número de secuencia.`}
    CX.$('#cb',root).innerHTML=f.map(x=>`<span class="${x[2]}" style="flex:${x[3]}"><b>${x[0]}</b><br><small>${x[1]}</small></span>`).join('');
    const oct=f.map(x=>x[0]).join('');
    CX.$('#ci',root).innerHTML=`Octeto de control (bit 8 a bit 1): <span class="mono"><b>${oct}</b></span> = 0x${parseInt(oct,2).toString(16).toUpperCase().padStart(2,'0')}. ${d}`;
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-ty]');if(b){ty=b.dataset.ty;ctl();draw()}});
  root.addEventListener('change',e=>{const t=e.target;
    if(t.id==='ns')st.ns=+t.value;if(t.id==='nr')st.nr=+t.value;if(t.id==='ss')st.s=t.value;if(t.id==='uu')st.u=t.value;if(t.id==='pp')st.p=t.checked?1:0;draw()});
  ctl();draw();
};

