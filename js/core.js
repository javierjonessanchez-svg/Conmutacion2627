/* ===== Núcleo: objeto CX, ayudantes ($, $$, esc, store, fmt) y matemática de tráfico (Erlang) ===== */
/* =====================================================================
   Marco de la aplicación: rutas, índice, búsqueda, progreso, secuencias,
   repaso. Los widgets de cada tema están más abajo (CX.w.<nombre>).
   ===================================================================== */
const CX={w:{},erl:{}};
CX.$=(s,r=document)=>r.querySelector(s);
CX.$$=(s,r=document)=>[...r.querySelectorAll(s)];
CX.esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
CX.store={
  get(k,d){try{const v=localStorage.getItem('cx-'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem('cx-'+k,JSON.stringify(v))}catch(e){}}
};
CX.fmt=(n,d=2)=>Number(n).toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:d});
CX.norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

/* ---------- Matemática de tráfico (la usan varios temas) ---------- */
CX.erl.B=(A,N)=>{let b=1;for(let k=1;k<=N;k++)b=A*b/(k+A*b);return b};           // Erlang B recursivo
CX.erl.C=(A,N)=>{if(A>=N)return 1;const b=CX.erl.B(A,N);return N*b/(N-A*(1-b))};  // Erlang C a partir de B
CX.erl.minN=(A,pb)=>{let n=1;while(CX.erl.B(A,n)>pb&&n<2000)n++;return n};
CX.erl.maxA=(N,pb)=>{let lo=0,hi=N*2+10;for(let i=0;i<60;i++){const m=(lo+hi)/2;CX.erl.B(m,N)>pb?hi=m:lo=m}return lo};

