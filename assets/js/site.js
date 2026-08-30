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

  /* Cada foto es {archivo, alt}. Se acepta tambien el formato viejo (solo el
     nombre del archivo) para no romper bloques del catalogo escritos antes.

     Un archivo con "/" adentro no se busca en la carpeta de la oportunidad
     sino en la ruta que diga, colgando de portafolio/. Es lo que permite que
     dos fichas del mismo edificio compartan las fotos de zonas comunes sin
     tener el mismo archivo guardado dos veces. */
  function foto(op, indice){
    var dato = op.fotos && op.fotos[indice || 0];
    if(!dato) return null;
    var archivo = typeof dato === 'string' ? dato : dato.archivo;
    if(!archivo) return null;
    var jpg = RUTA_FOTOS + (archivo.indexOf('/') > -1 ? archivo : op.slug + '/' + archivo);
    return {
      jpg: jpg,
      webp: jpg.replace(/\.jpe?g$/i, '.webp'),
      alt: (typeof dato === 'string' ? '' : dato.alt) || ''
    };
  }

  /* WebP con el JPG de respaldo. El alt de la foto manda; si el bloque del
     catalogo no lo trae, cae al titulo de la oportunidad. */
  function imagen(f, altRespaldo, lazy, atributos){
    if(!f) return '';
    return '<picture>' +
      '<source srcset="' + esc(f.webp) + '" type="image/webp">' +
      '<img src="' + esc(f.jpg) + '" alt="' + esc(f.alt || altRespaldo || '') + '"' +
      (lazy ? ' loading="lazy"' : '') + (atributos || '') + '>' +
    '</picture>';
  }

  /* El mensaje prellenado no usa el titulo: ahora los titulos son solo la zona
     y repetirlos junto a zonaDetalle decia dos veces lo mismo sin identificar
     el inmueble. Con subtipo y precio, quien escribe deja claro cual es. */
  function enlaceWhatsapp(op){
    var texto = op
      ? 'Hola CINQ, me interesa esta oportunidad: ' + op.subtipo + ' en ' +
        op.zonaDetalle + ', ' + precio(op.precio) + '.'
      : 'Hola CINQ, quiero saber mas sobre el portafolio.';
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  function tarjeta(op){
    var badge = op.premium ? '<span class="p-badge">Curaduría premium</span>' : '';
    var img = imagen(foto(op, 0), op.titulo, true);
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

    /* Las zonas salen del catalogo, no de una lista fija: al sumar una
       oportunidad en un municipio nuevo, su boton aparece solo. */
    var zonas = [];
    ops.forEach(function(op){
      if(op.zona && zonas.indexOf(op.zona) < 0) zonas.push(op.zona);
    });
    zonas.sort();

    function cuantas(zona){
      return ops.filter(function(op){ return op.zona === zona; }).length;
    }

    var caja = document.getElementById('filtros');
    var actual = 'todas';

    /* ?zona=Sabaneta abre el portafolio ya filtrado, para poder compartir el
       enlace de un municipio. Si la zona no existe, se ignora. */
    var pedida = new URLSearchParams(window.location.search).get('zona');
    if(pedida){
      zonas.forEach(function(z){
        if(z.toLowerCase() === pedida.toLowerCase()) actual = z;
      });
    }

    function pinta(){
      var visibles = actual === 'todas' ? ops : ops.filter(function(op){ return op.zona === actual; });
      grid.innerHTML = visibles.map(tarjeta).join('');
      if(caja){
        [].forEach.call(caja.querySelectorAll('button'), function(b){
          b.setAttribute('aria-pressed', b.getAttribute('data-zona') === actual ? 'true' : 'false');
        });
      }
    }

    /* Filtrar cuando todo esta en el mismo municipio no filtra nada, asi que
       la barra solo se dibuja si hay al menos dos zonas. */
    if(caja && zonas.length > 1){
      var botones = [['todas', 'Todas', ops.length]];
      zonas.forEach(function(z){ botones.push([z, z, cuantas(z)]); });
      caja.innerHTML = botones.map(function(b){
        return '<button type="button" data-zona="' + esc(b[0]) + '" aria-pressed="false">' +
          esc(b[1]) + '<span class="cuenta">' + b[2] + '</span></button>';
      }).join('');
      caja.hidden = false;
      caja.addEventListener('click', function(e){
        var boton = e.target.closest('button');
        if(!boton) return;
        actual = boton.getAttribute('data-zona');
        window.history.replaceState(null, '', actual === 'todas'
          ? window.location.pathname
          : window.location.pathname + '?zona=' + encodeURIComponent(actual));
        pinta();
      });
    }

    pinta();
  }

  /* Portafolio destacado del home: las tres primeras del catalogo, con la
     misma tarjeta del portafolio completo. Si el catalogo esta vacio se
     retira la seccion entera, para no dejar un titulo sin nada debajo:
     la regla del sitio es no mostrar espacios de relleno. */
  function initDestacadas(){
    var grid = document.getElementById('home-grid');
    if(!grid) return;
    var seccion = grid.closest('.featured');
    var ops = catalogo();
    if(!ops.length){
      if(seccion) seccion.remove();
      return;
    }
    grid.innerHTML = ops.slice(0, 3).map(tarjeta).join('');
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
    var portada = foto(op, 0);
    var principal = '<div class="frame gallery-main"><picture>' +
      '<source id="gallery-main-src" srcset="' + esc(portada.webp) + '" type="image/webp">' +
      '<img id="gallery-main-img" src="' + esc(portada.jpg) + '" alt="' +
      esc(portada.alt || op.titulo) + '"></picture></div>';
    if(op.fotos.length < 2) return principal;
    /* La miniatura es un boton: su aria-label describe la foto, asi que la
       imagen de adentro va con alt vacio para no repetirla dos veces. */
    var thumbs = op.fotos.map(function(_, i){
      var f = foto(op, i);
      var etiqueta = 'Ver foto ' + (i+1) + (f.alt ? ': ' + f.alt : '');
      return '<button type="button" class="frame' + (i === 0 ? ' active' : '') +
        '" data-jpg="' + esc(f.jpg) + '" data-webp="' + esc(f.webp) + '" data-alt="' +
        esc(f.alt || op.titulo) + '" aria-label="' + esc(etiqueta) + '">' +
        '<picture><source srcset="' + esc(f.webp) + '" type="image/webp">' +
        '<img src="' + esc(f.jpg) + '" alt="" loading="lazy"></picture></button>';
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
    var fuentePrincipal = document.getElementById('gallery-main-src');
    raiz.querySelectorAll('.thumb-row .frame').forEach(function(thumb){
      thumb.addEventListener('click', function(){
        raiz.querySelectorAll('.thumb-row .frame').forEach(function(t){ t.classList.remove('active'); });
        thumb.classList.add('active');
        /* El <source> hay que moverlo tambien: dentro de un <picture> le gana
           al src del <img>, y sin esto la foto grande no cambiaria. */
        if(fuentePrincipal) fuentePrincipal.srcset = thumb.getAttribute('data-webp');
        if(principal){
          principal.src = thumb.getAttribute('data-jpg');
          principal.alt = thumb.getAttribute('data-alt');
        }
      });
    });

    var otras = ops.filter(function(o){ return o.slug !== op.slug; });
    var seccion = document.getElementById('related');
    if(!seccion) return;
    if(!otras.length){ seccion.remove(); return; }
    seccion.querySelector('.r-grid').innerHTML = otras.slice(0,3).map(function(o){
      var img = imagen(foto(o, 0), o.titulo, true);
      return '<a class="r-card" href="oportunidad.html?id=' + encodeURIComponent(o.slug) + '">' +
        '<div class="frame">' + img + '</div>' +
        '<div class="r-meta"><span class="place">' + esc(o.titulo) + '</span>' +
        '<span class="price">' + esc(precio(o.precio)) + '</span></div></a>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function(){
    initSolidNav();
    initDestacadas();
    initPortafolio();
    initOportunidad();
  });

  return { precio: precio, enlaceWhatsapp: enlaceWhatsapp };
})();
