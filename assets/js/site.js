/* CINQ — utilidades compartidas: nav que se solidifica al hacer scroll,
   y el generador de texturas de reemplazo (gradiente + grano) para las fotos
   que aún no tenemos. Cada página define su propio objeto CINQ_TEX_STOPS
   antes de este script y llama a CINQ.paintAll() al final. */

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

  function rgb(c){ return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

  var noiseTile = null;
  function getNoiseTile(){
    if(noiseTile) return noiseTile;
    var size = 90, c = document.createElement('canvas');
    c.width = size; c.height = size;
    var cx = c.getContext('2d');
    var img = cx.createImageData(size, size);
    for(var i=0;i<img.data.length;i+=4){
      var v = 130 + Math.random()*70;
      img.data[i]=v; img.data[i+1]=v; img.data[i+2]=v; img.data[i+3]=255;
    }
    cx.putImageData(img,0,0);
    noiseTile = c;
    return c;
  }

  function paint(canvas, spec){
    if(!spec) return;
    var w = canvas.clientWidth || 400, h = canvas.clientHeight || 300;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    var dir = spec.dir === 0;
    var grad = dir ? ctx.createLinearGradient(w,0,0,h) : ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0, rgb(spec.a));
    grad.addColorStop(0.55, rgb(spec.b));
    grad.addColorStop(1, rgb(spec.c));
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    var pattern = ctx.createPattern(getNoiseTile(), 'repeat');
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = pattern;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    var vg = ctx.createRadialGradient(w*0.5,h*0.45,h*0.2, w*0.5,h*0.5, h*0.9);
    vg.addColorStop(0,'rgba(0,0,0,0)');
    vg.addColorStop(1,'rgba(0,0,0,' + (spec.vignette != null ? spec.vignette : 0.13) + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,w,h);
  }

  function paintAll(stops){
    stops = stops || window.CINQ_TEX_STOPS || {};
    var canvases = document.querySelectorAll('canvas[data-tex]');
    canvases.forEach(function(c){ paint(c, stops[c.getAttribute('data-tex')]); });
    window.addEventListener('resize', function(){
      canvases.forEach(function(c){ paint(c, stops[c.getAttribute('data-tex')]); });
    });
  }

  document.addEventListener('DOMContentLoaded', initSolidNav);

  return { paint: paint, paintAll: paintAll };
})();
