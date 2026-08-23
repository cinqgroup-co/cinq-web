/* CINQ — utilidades compartidas.
   Contiene el nav que se solidifica al hacer scroll y el render del portafolio
   a partir de assets/js/oportunidades.js. Todas las imágenes publicadas son
   fotografía real de CINQ: no hay generador de texturas de reemplazo. */

var CINQ = (function(){

  var WHATSAPP = '573022758992';
  var RUTA_FOTOS = 'assets/img/portafolio/';

  function initSolidNav(){
    var nav = document.getElementById('nav');
    if(!nav) return;
    function onScroll(){
      if(window.scrollY > 12){ nav.classList.add('solid'); } else { nav.classList.remove('solid'); }
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  function catalogo(){
    return (typeof CINQ_OPORTUNIDADES !== 'undefined' && CINQ_OPORTUNIDADES) ? CINQ_OPORTUNIDADES : [];
  }

  function precio(valor){
    if(typeof valor !== 'number' || !isFinite(valor)) return 'Precio a consultar';
    return '$ ' + valor.toLocaleString('es-CO');
  }

  function esc(texto){
    return String(texto === undefined || texto === null ? '' : texto)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function rutaFoto(op, indice){
    if(!op.fotos || !op.fotos.length) return '';
    return RUTA_FOTOS + op.slug + '/' + op.fotos[indice || 0];
  }

  function enlaceWhatsapp(op){
    var texto = op
      ? 'Hola CINQ, me interesa esta oportunidad: ' + op.titulo + ' (' + op.zonaDetalle + ').'
      : 'Hola CINQ, quiero saber mas sobre el portafolio.';
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  function tarjeta(op){
    var badge = op.premium ? '<span class="p-badge">Curaduría premium</span>' : '';
    var img = op.fotos && op.fotos.length
      ? '<img src="' + esc(rutaFoto(op,0)) + '" alt="' + esc(op.titulo) + '" loading="lazy">'
      : '';
    return '' +
      '<a class="p-card" href="oportunidad.html?id=' + encodeURIComponent(op.slug) + '">' +
        '<div class="frame"><span class="p-tag">' + esc(op.tipo) + '</span>' + badge + img + '</div>' +
        '<div class="p-meta">' +
          '<div><div class="place">' + esc(op.titulo) + '</div><div class="op">' + esc(op.operacion) + '</div></div>' +
          '<div class="price">' + esc(precio(op.precio)) + '</div>' +
        '</div>' +
      '</a>';
  }

  function initPortafolio(){
    var grid = document.getElementById('grid');
    if(!grid) return;
    var ops = catalogo();
    var vacio = document.getElementById('empty-state');
    if(!ops.length){
      grid.innerHTML = '';
      if(vacio) vacio.hidden = false;
      return;
    }
    if(vacio) vacio.hidden = true;
    grid.innerHTML = ops.map(tarjeta).join('');
  }

  function filas(pares){
    return pares.map(function(par){
      return '<div class="row"><span>' + esc(par[0]) + '</span><span>' + esc(par[1]) + '</span></div>';
    }).join('');
  }

  function specs(pares){
    return pares.slice(0,4).map(function(par){
      return '<li><span>' + esc(par[0]) + '</span><span>' + esc(par[1]) + '</span></li>';
    }).join('');
  }

  function galeria(op){
    if(!op.fotos || !op.fotos.length){
      return '<div class="frame gallery-main"></div>';
    }
    var principal = '<div class="frame gallery-main"><img id="gallery-main-img" src="' +
      esc(rutaFoto(op,0)) + '" alt="' + esc(op.titulo) + '"></div>';
    if(op.fotos.length < 2) return principal;
    var thumbs = op.fotos.map(function(nombre, i){
      var src = RUTA_FOTOS + op.slug + '/' + nombre;
      return '<button type="button" class="frame' + (i === 0 ? ' active' : '') + '" data-src="' +
        esc(src) + '" aria-label="Ver foto ' + (i+1) + '">' +
        '<img src="' + esc(src) + '" alt="" loading="lazy"></button>';
    }).join('');
    return principal + '<div class="thumb-row">' + thumbs + '</div>';
  }

  function initOportunidad(){
    var raiz = document.getElementById('detalle');
    if(!raiz) return;
    var id = new URLSearchParams(window.location.search).get('id');
    var ops = catalogo();
    var op = null;
    for(var i = 0; i < ops.length; i++){ if(ops[i].slug === id){ op = ops[i]; break; } }
    var migaActual = document.getElementById('breadcrumb-actual');

    if(!op){
      raiz.innerHTML = '<div class="container" style="padding:80px 0;text-align:center;">' +
        '<p style="font-size:14.5px;color:var(--muted);">Esa oportunidad ya no está en el portafolio.</p>' +
        '<p style="margin-top:18px;"><a href="portafolio.html">Ver el portafolio →</a></p></div>';
      if(migaActual) migaActual.textContent = 'Oportunidad no disponible';
      var vacia = document.getElementById('related');
      if(vacia) vacia.remove();
      return;
    }

    document.title = op.titulo + ' | CINQ';
    var meta = document.querySelector('meta[name="description"]');
    if(meta) meta.setAttribute('content', op.titulo + ' en ' + op.zonaDetalle + '. Oportunidad evaluada y aceptada por CINQ.');

    if(migaActual) migaActual.textContent = op.titulo;
    var migaTipo = document.getElementById('breadcrumb-tipo');
    if(migaTipo) migaTipo.textContent = op.tipo === 'Vehículo' ? 'Vehículos' : 'Propiedades';

    var ficha = op.ficha || [];
    var fichaCompleta = [['Tipo', op.subtipo || op.tipo], ['Operación', op.operacion], ['Zona', op.zona]].concat(ficha);
    var parrafos = (op.descripcion || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');

    raiz.innerHTML = '' +
      '<div class="container"><div class="detail-grid"><div>' +
        galeria(op) +
        (parrafos ? '<div class="description"><h2>Descripción</h2>' + parrafos + '</div>' : '') +
        '<div class="ficha"><h2>Ficha técnica</h2><div class="ficha-grid">' + filas(fichaCompleta) + '</div></div>' +
      '</div>' +
      '<div class="info-panel">' +
        '<div class="kicker">' + esc(op.tipo) + ' · ' + esc(op.operacion) + '</div>' +
        '<div class="price">' + esc(precio(op.precio)) + '</div>' +
        '<div class="loc">' + esc(op.zonaDetalle) + '</div>' +
        '<ul class="spec-list">' + specs(ficha) + '</ul>' +
        '<a class="wa-btn" href="' + esc(enlaceWhatsapp(op)) + '" target="_blank" rel="noopener">Conversemos sobre esta oportunidad →</a>' +
        '<p class="info-note">Un miembro de CINQ responde directamente, sin formularios de contacto genéricos ni intermediarios adicionales.</p>' +
      '</div></div></div>';

    var principal = document.getElementById('gallery-main-img');
    raiz.querySelectorAll('.thumb-row .frame').forEach(function(thumb){
      thumb.addEventListener('click', function(){
        raiz.querySelectorAll('.thumb-row .frame').forEach(function(t){ t.classList.remove('active'); });
        thumb.classList.add('active');
        if(principal) principal.src = thumb.getAttribute('data-src');
      });
    });

    var otras = ops.filter(function(o){ return o.slug !== op.slug; });
    var seccion = document.getElementById('related');
    if(!seccion) return;
    if(!otras.length){ seccion.remove(); return; }
    seccion.querySelector('.r-grid').innerHTML = otras.slice(0,3).map(function(o){
      var img = o.fotos && o.fotos.length
        ? '<img src="' + esc(rutaFoto(o,0)) + '" alt="' + esc(o.titulo) + '" loading="lazy">' : '';
      return '<a class="r-card" href="oportunidad.html?id=' + encodeURIComponent(o.slug) + '">' +
        '<div class="frame">' + img + '</div>' +
        '<div class="r-meta"><span class="place">' + esc(o.titulo) + '</span>' +
        '<span class="price">' + esc(precio(o.precio)) + '</span></div></a>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function(){
    initSolidNav();
    initPortafolio();
    initOportunidad();
  });

  return { precio: precio, enlaceWhatsapp: enlaceWhatsapp };
})();
