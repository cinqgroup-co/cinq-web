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
    /* El mismo nombre que usa la foto grande de la ficha: es lo que hace
       que la imagen crezca de la tarjeta al detalle al navegar. */
    var img = imagen(foto(op, 0), op.titulo, true,
      ' style="view-transition-name:foto-' + op.slug + '"');
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

  /* Boton flotante de WhatsApp, presente en todas las paginas. Se inyecta
     desde aqui y no se escribe en los siete html: el numero ya vive en este
     archivo, asi que se cambia en un solo lugar.

     El mensaje es generico a proposito. El de las fichas lo arma
     enlaceWhatsapp() con el inmueble, pero este boton tambien aparece en
     Ofrecer y en las paginas legales, donde hablar del portafolio no venia
     al caso. */
  function initWhatsappFlotante(){
    if(document.querySelector('.wa-float')) return;
    var texto = 'Hola CINQ, quisiera hacerles una consulta.';
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Escríbenos por WhatsApp');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    document.body.appendChild(a);
  }

  /* Que se revela al entrar en pantalla, y cada cuantos ms va uno detras de
     otro dentro del mismo grupo. Vive aqui y no repartido por el html para
     no tener que tocar siete archivos cada vez que se ajusta el ritmo.
     Nada de la primera pantalla entra aqui: el titular y la foto del hero se
     ven de una, sin esperar a ningun efecto. */
  var REVELADO = [
    ['.philosophy .inner', 0],
    ['.featured .section-head', 0],
    ['.featured .p-card', 90],
    ['.process .head', 0],
    ['.process .p-step', 90],
    ['.market .head', 0],
    ['.market .m-cell', 80],
    ['.territorio .head', 0],
    ['.territorio .t-zona', 90],
    ['.spread-quote .inner', 0],
    ['.cta-band .inner', 0],
    ['.page-head .inner', 0],
    ['.p-grid-section .p-card', 70],
    ['.prose-block', 80]
  ];

  /* Las cifras del bloque de mercado suben desde cero cuando su celda entra
     en pantalla. El valor final ya esta escrito en el html, asi que si el JS
     no corre se lee igual: esto solo lo anima.

     Se conserva lo que rodea al numero (el signo + y el % con su espacio
     duro) y los decimales que traiga, para no reformatear a mano algo que ya
     estaba bien escrito. Al terminar se restituye el texto original tal cual,
     para que no quede una version redondeada por el camino. */
  function contar(el){
    if(el.getAttribute('data-contado')) return;
    el.setAttribute('data-contado', '1');

    var original = el.textContent;
    var partes = /^(\D*)(\d+(?:,\d+)?)([\s\S]*)$/.exec(original);
    if(!partes) return;

    var antes = partes[1], crudo = partes[2], despues = partes[3];
    var decimales = (crudo.split(',')[1] || '').length;
    var destino = parseFloat(crudo.replace(',', '.'));
    if(!isFinite(destino)) return;

    var DURACION = 1100;
    var inicio = null;

    function paso(ahora){
      if(inicio === null) inicio = ahora;
      var t = Math.min((ahora - inicio) / DURACION, 1);
      var suave = 1 - Math.pow(1 - t, 3);
      if(t < 1){
        el.textContent = antes + (destino * suave).toFixed(decimales).replace('.', ',') + despues;
        window.requestAnimationFrame(paso);
      } else {
        el.textContent = original;
      }
    }
    window.requestAnimationFrame(paso);
  }

  function initRevelado(){
    var pendientes = [];

    /* Aparecer y empezar a contar son el mismo instante: asi la cifra sube
       justo cuando el ojo llega a ella, no antes de tiempo ni despues. */
    function revelar(el){
      el.classList.add('visible');
      var cifra = el.querySelector && el.querySelector('.figure');
      if(cifra) contar(cifra);
    }

    REVELADO.forEach(function(par){
      [].forEach.call(document.querySelectorAll(par[0]), function(el, i){
        el.setAttribute('data-reveal', i * par[1]);
        pendientes.push(el);
      });
    });
    if(!pendientes.length) return;

    function mostrarTodo(){
      pendientes.forEach(revelar);
      pendientes = [];
    }

    /* Si el sistema pide menos movimiento, se muestra todo de una vez en vez
       de dejarlo invisible esperando un efecto que no va a ocurrir. */
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      mostrarTodo();
      return;
    }

    /* Se revisa por posicion y no con IntersectionObserver a proposito. El
       observador solo avisa de lo que esta cruzando la pantalla, asi que un
       salto largo (la tecla Fin, un scroll de golpe) deja detras bloques que
       nunca llegaron a cruzarla y se quedan invisibles para siempre. Este
       barrido muestra todo lo que ya quedo por encima del borde inferior,
       se haya visto pasar o no. */
    function barrer(){
      var limite = window.innerHeight * 0.92;
      var quedan = [];
      pendientes.forEach(function(el){
        if(el.getBoundingClientRect().top < limite){
          var espera = parseInt(el.getAttribute('data-reveal'), 10) || 0;
          setTimeout(function(){ revelar(el); }, espera);
        } else {
          quedan.push(el);
        }
      });
      pendientes = quedan;
      if(!pendientes.length){
        window.removeEventListener('scroll', pedirBarrido);
        window.removeEventListener('resize', pedirBarrido);
      }
    }

    /* Un barrido por fotograma como mucho, aunque lleguen cien eventos. */
    var pedido = false;
    function pedirBarrido(){
      if(pedido) return;
      pedido = true;
      window.requestAnimationFrame(function(){ pedido = false; barrer(); });
    }

    window.addEventListener('scroll', pedirBarrido, { passive: true });
    window.addEventListener('resize', pedirBarrido);
    barrer();
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
      '<img id="gallery-main-img" style="view-transition-name:foto-' + esc(op.slug) + '" src="' +
      esc(portada.jpg) + '" alt="' + esc(portada.alt || op.titulo) + '"></picture></div>';
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
    var descripcion = op.titulo + ' en ' + op.zonaDetalle + '. Oportunidad evaluada y aceptada por CINQ.';
    var meta = document.querySelector('meta[name="description"]');
    if(meta) meta.setAttribute('content', descripcion);

    /* El html trae la canonical de la plantilla, sin el id. Dejarla asi le
       dice a Google que todas las fichas son la misma pagina, que es peor
       que no tener canonical. Aqui se le pone la de esta oportunidad. */
    var propia = 'https://cinq-web.vercel.app/oportunidad.html?id=' + encodeURIComponent(op.slug);
    var can = document.querySelector('link[rel="canonical"]');
    if(can) can.setAttribute('href', propia);
    var pares = [['og:url', propia], ['og:title', op.titulo],
                 ['og:description', descripcion]];
    pares.forEach(function(par){
      var m = document.querySelector('meta[property="' + par[0] + '"]');
      if(m) m.setAttribute('content', par[1]);
    });

    if(migaActual) migaActual.textContent = op.titulo;
    var migaTipo = document.getElementById('breadcrumb-tipo');
    if(migaTipo) migaTipo.textContent = op.tipo === 'Vehículo' ? 'Vehículos' : 'Propiedades';

    var ficha = op.ficha || [];
    var fichaCompleta = [['Tipo', op.subtipo || op.tipo], ['Operación', op.operacion], ['Zona', op.zona]].concat(ficha);
    var parrafos = (op.descripcion || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');

    /* El panel va primero en el html aunque se vea a la derecha: dentro
       lleva el h1, y si fuera despues la pagina abriria con dos h2 por
       delante del titulo. El CSS lo devuelve a su columna. */
    raiz.innerHTML = '' +
      '<div class="container"><div class="detail-grid">' +
      '<div class="info-panel">' +
        '<div class="kicker">' + esc(op.tipo) + ' · ' + esc(op.operacion) + '</div>' +
        '<div class="price">' + esc(precio(op.precio)) + '</div>' +
        '<h1 class="loc">' + esc(op.zonaDetalle) + '</h1>' +
        '<ul class="spec-list">' + specs(ficha) + '</ul>' +
        '<a class="wa-btn" href="' + esc(enlaceWhatsapp(op)) + '" target="_blank" rel="noopener">Conversemos sobre esta oportunidad →</a>' +
        '<p class="info-note">Un miembro de CINQ responde directamente, sin formularios de contacto genéricos ni intermediarios adicionales.</p>' +
      '</div>' +
      '<div class="columna-principal">' +
        galeria(op) +
        (parrafos ? '<div class="description"><h2>Descripción</h2>' + parrafos + '</div>' : '') +
        '<div class="ficha"><h2>Ficha técnica</h2><div class="ficha-grid">' + filas(fichaCompleta) + '</div></div>' +
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
    initWhatsappFlotante();
    initDestacadas();
    initPortafolio();
    initOportunidad();
    initRevelado();
  });

  return { precio: precio, enlaceWhatsapp: enlaceWhatsapp };
})();
