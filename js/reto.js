/* ===== Modo reto: un interruptor global (apagado por defecto) que comparten todos los reproductores ===== */
/* Se lee una vez de localStorage (clave cx-reto) y se guarda en memoria: si el almacenamiento falla, sigue valiendo en esta sesión */
CX.reto=(()=>{
  let v=CX.store.get('reto',false)===true;
  return{
    get:()=>v,
    set(x){v=!!x;CX.store.set('reto',v);document.dispatchEvent(new CustomEvent('cx-reto',{detail:{on:v}}))}
  };
})();
