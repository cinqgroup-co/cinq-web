/* CINQ — utilidades compartidas.
   Hoy solo contiene el nav que se solidifica al hacer scroll. El generador de
   texturas de reemplazo para fotos que no existían se eliminó al lanzar el
   sitio: todas las imágenes publicadas son fotografía real de CINQ. */

var CINQ = (function(){
  function initSolidNav(){
    var nav = document.getElementById('nav');
    if(!nav) return;
    function onScroll(){
      if(window.scrollY > 12){ nav.classList.add('solid'); } else { nav.classList.remove('solid'); }
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', initSolidNav);

  return {};
})();
