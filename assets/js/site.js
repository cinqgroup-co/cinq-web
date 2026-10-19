/* CINQ — utilidades compartidas.
   Contiene el nav que se solidifica al hacer scroll y el render del portafolio
   a partir de assets/js/oportunidades.js. Todas las imágenes publicadas son
   fotografía real de CINQ: no hay generador de texturas de reemplazo.

   NECESITA assets/js/i18n.js CARGADO ANTES. Ni una sola de las palabras que
   dibuja este archivo está escrita aquí: todas salen de la tabla de i18n.js, y
   por eso el sitio puede pasarse a inglés sin una segunda copia del html. Las
   etiquetas <script> de las páginas van en ese orden: i18n, catálogo, site. */

var CINQ = (function(){

  var WHATSAPP = '573022758992';
  var RUTA_FOTOS = 'assets/img/portafolio/';
  var I18N = CINQ_I18N;
  var t = function(clave, datos){ return I18N.t(clave, datos); };

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

  /* En inglés el precio sale como "COP 455,000,000". No es solo el separador:
     un "$" a secas delante de un número de nueve cifras lo lee como dólares
     quien llega de afuera, y la diferencia es de tres ceros.

     Los proyectos de afuera vienen en dolares (moneda: "USD") y con precio
     de entrada (desde: true): ahi se escribe "Desde USD 195.000", porque el
     precio es el de la unidad mas barata del proyecto y no el de todas. */
  function precio(op){
    var valor = op.precio;
    if(typeof valor !== 'number' || !isFinite(valor)) return t('precioConsultar');
    var ingles = I18N.esIngles();
    var cifra = valor.toLocaleString(ingles ? 'en-US' : 'es-CO');
    var texto = op.moneda && op.moneda !== 'COP'
      ? op.moneda + ' ' + cifra
      : (ingles ? 'COP ' + cifra : '$ ' + cifra);
    return op.desde ? t('desde', { precio: texto }) : texto;
  }

  /* La direccion de una ficha. Absoluta desde la raiz para que sirva igual
     desde el home que desde otra ficha (/o/<slug>). /o/ existe solo en
     Vercel (vercel.json); abriendo el sitio en local va la plantilla con ?id=. */
  function enlaceFicha(slug){
    if(window.location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)){
      return 'oportunidad.html?id=' + encodeURIComponent(slug);
    }
    return '/o/' + encodeURIComponent(slug);
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
    var i = indice || 0;
    var dato = op.fotos && op.fotos[i];
    if(!dato) return null;
    var archivo = typeof dato === 'string' ? dato : dato.archivo;
    if(!archivo) return null;
    var jpg = RUTA_FOTOS + (archivo.indexOf('/') > -1 ? archivo : op.slug + '/' + archivo);
    return {
      jpg: jpg,
      webp: jpg.replace(/\.jpe?g$/i, '.webp'),
      alt: I18N.alt(op, i, (typeof dato === 'string' ? '' : dato.alt) || '')
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

  /* El mensaje prellenado usa el TITULO, no la zona. Antes usaba zonaDetalle
     porque los titulos eran solo el municipio y el sector, y repetirlos no
     identificaba nada. Eso dejo de ser cierto: los titulos ahora llevan el
     nombre del proyecto o del apartamento, asi que son lo unico que distingue
     dos inmuebles del mismo edificio.

     Con la zona pasaba esto, y es un problema real de atribucion: los dos
     apartamentos de Aluna generaban el MISMO mensaje salvo por el precio, o
     sea que si un precio cambia, un enlace viejo ya no dice por cual escriben. */
  function enlaceWhatsapp(op){
    var texto = op
      ? t('waFicha', { titulo: I18N.campo(op, 'titulo'), precio: precio(op) })
      : t('waPortafolio');
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  /* La categoria es lo que separa las secciones del portafolio: el subtipo
     (Apartamento, Lote, Casa). Sale del catalogo, asi que una categoria
     nueva aparece sola cuando entra su primera oportunidad. */
  function categoria(op){
    return op.subtipo || op.tipo;
  }

  /* El mercado separa lo de Colombia de lo de afuera. Colombia son los
     inmuebles que visitamos y fotografiamos; los Emiratos, proyectos sobre
     planos que llegan con el aliado en Dubai. Se deduce de la zona, asi que
     un proyecto nuevo en Dubai cae solo en su bloque. */
  var AFUERA = ['Dubái', 'Abu Dabi'];
  var MERCADOS = ['colombia', 'emiratos'];
  function mercado(op){ return AFUERA.indexOf(op.zona) >= 0 ? 'emiratos' : 'colombia'; }

  var PLURALES = { 'Apartamento': 'Apartamentos', 'Casa': 'Casas', 'Lote': 'Lotes',
    'Local': 'Locales', 'Oficina': 'Oficinas', 'Finca': 'Fincas', 'Proyecto': 'Proyectos' };

  function plural(cat){ return PLURALES[cat] || cat; }

  function tarjeta(op){
    var titulo = I18N.campo(op, 'titulo');
    var badge = op.premium ? '<span class="p-badge">' + esc(t('badgePremium')) + '</span>' : '';
    /* El mismo nombre que usa la foto grande de la ficha: es lo que hace
       que la imagen crezca de la tarjeta al detalle al navegar. */
    var img = imagen(foto(op, 0), titulo, true,
      ' style="view-transition-name:foto-' + op.slug + '"');
    return '' +
      '<a class="p-card" href="' + enlaceFicha(op.slug) + '">' +
        '<div class="frame"><span class="p-tag">' + esc(I18N.voz(categoria(op))) + '</span>' + badge + img + '</div>' +
        '<div class="p-meta">' +
          '<div><div class="place">' + esc(titulo) + '</div><div class="op">' + esc(I18N.voz(op.operacion)) + '</div></div>' +
          '<div class="price">' + esc(precio(op)) + '</div>' +
        '</div>' +
      '</a>';
  }

  /* Lo deja puesto initPortafolio para que el cambio de idioma pueda volver a
     dibujar la reticula sin rearmar los filtros ni perder el que este activo. */
  var repintarPortafolio = null;

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
    /* Primero las de Colombia y despues las de afuera, cada grupo en orden
       alfabetico: asi la barra de filtros tambien queda partida en dos. */
    zonas.sort(function(a, b){
      var ma = AFUERA.indexOf(a) >= 0, mb = AFUERA.indexOf(b) >= 0;
      return ma === mb ? a.localeCompare(b, 'es') : (ma ? 1 : -1);
    });

    var cats = [];
    ops.forEach(function(op){
      var c = categoria(op);
      if(cats.indexOf(c) < 0) cats.push(c);
    });

    var caja = document.getElementById('filtros');
    var cajaCat = document.getElementById('categorias');
    var actual = 'todas';
    var actualCat = 'todo';

    /* Las zonas cuentan dentro de la categoria elegida: con "Lotes" puesto,
       el boton de Sabaneta dice cuantos lotes hay en Sabaneta, no cuantas
       oportunidades en total. */
    function enCat(op){ return actualCat === 'todo' || categoria(op) === actualCat; }

    function cuantas(zona){
      return ops.filter(function(op){ return enCat(op) && op.zona === zona; }).length;
    }

    /* ?tipo=lotes abre el portafolio ya en esa seccion, para compartir el
       enlace de los lotes. Vale el singular o el plural, con o sin tilde. */
    function llano(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    var pedidaCat = new URLSearchParams(window.location.search).get('tipo');
    if(pedidaCat){
      cats.forEach(function(c){
        if(llano(c) === llano(pedidaCat) || llano(plural(c)) === llano(pedidaCat)) actualCat = c;
      });
    }

    /* ?zona=Sabaneta abre el portafolio ya filtrado, para poder compartir el
       enlace de un municipio. Si la zona no existe, se ignora. */
    var pedida = new URLSearchParams(window.location.search).get('zona');
    if(pedida){
      zonas.forEach(function(z){
        if(z.toLowerCase() === pedida.toLowerCase()) actual = z;
      });
    }

    /* Filtrar cuando todo esta en el mismo municipio no filtra nada, asi que
       la barra solo se dibuja si hay al menos dos zonas. Los nombres de los
       municipios no se traducen; el unico boton con texto es "Todas". */
    var hayFiltros = caja && zonas.length > 1;
    var hayCats = cajaCat && cats.length > 1;

    function pintaCats(){
      if(!hayCats) return;
      var botones = [['todo', t('filtroTodoTipo'), ops.length]];
      cats.forEach(function(c){
        botones.push([c, I18N.voz(plural(c)),
          ops.filter(function(op){ return categoria(op) === c; }).length]);
      });
      cajaCat.innerHTML = botones.map(function(b){
        return '<button type="button" data-cat="' + esc(b[0]) + '" aria-pressed="' +
          (b[0] === actualCat ? 'true' : 'false') + '">' +
          esc(b[1]) + '<span class="cuenta">' + b[2] + '</span></button>';
      }).join('');
      cajaCat.hidden = false;
    }

    function pintaFiltros(){
      if(!hayFiltros) return;
      var botones = [['todas', t('filtroTodas'), ops.filter(enCat).length]];
      /* Una zona sin nada en la categoria elegida no se muestra: seria un
         boton que lleva a una reticula vacia. */
      var antes = null;
      zonas.forEach(function(z){
        if(!cuantas(z)) return;
        var m = AFUERA.indexOf(z) >= 0;
        if(antes !== null && antes !== m) botones.push(null);
        antes = m;
        botones.push([z, I18N.voz(z), cuantas(z)]);
      });
      caja.innerHTML = botones.map(function(b){
        if(!b) return '<span class="sep" aria-hidden="true"></span>';
        return '<button type="button" data-zona="' + esc(b[0]) + '" aria-pressed="' +
          (b[0] === actual ? 'true' : 'false') + '">' +
          esc(b[1]) + '<span class="cuenta">' + b[2] + '</span></button>';
      }).join('');
      caja.hidden = false;
    }

    function pinta(){
      if(actual !== 'todas' && !cuantas(actual)) actual = 'todas';
      var visibles = ops.filter(function(op){
        return enCat(op) && (actual === 'todas' || op.zona === actual);
      });
      /* Un bloque por mercado, con su titulo, mientras el catalogo tenga
         los dos. Si solo hay uno, la reticula va sola, sin encabezado. */
      var hayDos = MERCADOS.every(function(m){ return ops.some(function(op){ return mercado(op) === m; }); });
      if(!hayDos){
        grid.innerHTML = '<div class="p-grid">' + visibles.map(tarjeta).join('') + '</div>';
      } else {
        grid.innerHTML = MERCADOS.map(function(m){
          var suyas = visibles.filter(function(op){ return mercado(op) === m; });
          if(!suyas.length) return '';
          var donde = [];
          suyas.forEach(function(op){ if(op.zona && donde.indexOf(op.zona) < 0) donde.push(op.zona); });
          /* La zona con mas oportunidades primero: "Dubai y Abu Dabi". */
          function n(z){ return suyas.filter(function(op){ return op.zona === z; }).length; }
          donde.sort(function(a, b){ return n(b) - n(a) || a.localeCompare(b, 'es'); });
          return '<section class="p-mercado" aria-labelledby="mercado-' + m + '">' +
            '<div class="p-mercado-head">' +
              '<h2 id="mercado-' + m + '">' + esc(t('mercado_' + m)) + '</h2>' +
              '<p>' + esc(donde.map(I18N.voz).join(t('y'))) + '. ' + esc(t('mercadoNota_' + m)) + '</p>' +
            '</div>' +
            '<div class="p-grid">' + suyas.map(tarjeta).join('') + '</div>' +
          '</section>';
        }).join('');
      }
      pintaCats();
      pintaFiltros();
      /* La sala 360 va debajo de las tarjetas solo si se estan viendo
         proyectos de afuera. Al aparecer se vuelve a medir: escondida no
         tiene ancho. */
      var sala360 = document.getElementById('dubai-sala-bloque');
      if(sala360){
        var conAfuera = visibles.some(function(op){ return mercado(op) === 'emiratos'; });
        var antes = sala360.hidden;
        sala360.hidden = !conAfuera;
        if(antes && conAfuera) window.dispatchEvent(new Event('resize'));
      }
      /* Las preguntas de Dubai siguen la misma regla. */
      var faq = document.getElementById('dubai-faq');
      if(faq) faq.hidden = !visibles.some(function(op){ return mercado(op) === 'emiratos'; });
    }

    /* El oyente va en la caja y no en cada boton, que se rehacen en cada
       pintado: si estuviera en los botones, cambiar de idioma los borraria y
       con ellos el filtro dejaria de responder. */
    if(hayFiltros){
      caja.addEventListener('click', function(e){
        var boton = e.target.closest('button');
        if(!boton) return;
        actual = boton.getAttribute('data-zona');
        /* Se cambia solo el parametro de la zona. Antes se reescribia la
           direccion entera, lo que hoy borraria el ?lang= que deja el boton
           de idioma y devolveria el enlace compartido al espanol. */
        var url = new URL(window.location.href);
        if(actual === 'todas'){ url.searchParams.delete('zona'); }
        else { url.searchParams.set('zona', actual); }
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
        pinta();
      });
    }

    if(hayCats){
      cajaCat.addEventListener('click', function(e){
        var boton = e.target.closest('button');
        if(!boton) return;
        actualCat = boton.getAttribute('data-cat');
        var url = new URL(window.location.href);
        if(actualCat === 'todo'){ url.searchParams.delete('tipo'); }
        else { url.searchParams.set('tipo', llano(plural(actualCat))); }
        pinta();
        /* pinta() puede soltar una zona que quedo vacia; la direccion
           tiene que decir lo mismo que se ve. */
        if(actual === 'todas'){ url.searchParams.delete('zona'); }
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      });
    }

    pinta();
    repintarPortafolio = pinta;
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

  /* zonaDetalle es nombre propio y no se traduce, salvo la zona con la que
     termina: "Dubai Islands, Dubái" se lee "Dubai Islands, Dubai" en ingles. */
  function detalleZona(op){
    if(!op.zonaDetalle || !op.zona) return op.zonaDetalle;
    return op.zonaDetalle.split(op.zona).join(I18N.voz(op.zona));
  }

  /* Seccion Dubai del home. Las cifras salen del catalogo: cuantos proyectos
     hay afuera, el precio de entrada mas bajo y el rango de entregas (el año
     se lee de la fila "Entrega" de cada ficha). Sin proyectos afuera se
     retira la seccion entera, como las destacadas. */
  function initDubai(){
    var seccion = document.getElementById('dubai');
    var caja = document.getElementById('dubai-datos');
    if(!seccion || !caja) return;
    var ops = catalogo().filter(function(op){ return AFUERA.indexOf(op.zona) >= 0; });
    if(!ops.length){ seccion.remove(); return; }
    var masBarato = ops.reduce(function(a, b){ return b.precio < a.precio ? b : a; });
    var anios = ops.map(function(op){
      var fila = (op.ficha || []).filter(function(f){ return f[0] === 'Entrega'; })[0];
      var m = fila && String(fila[1]).match(/\d{4}/);
      return m ? +m[0] : null;
    }).filter(Boolean);
    var zonas = AFUERA.filter(function(z){ return ops.some(function(op){ return op.zona === z; }); });
    var celdas = [[String(ops.length), t('dubaiProyectos', { zonas: zonas.map(I18N.voz).join(t('y')) })],
                  [precio({ precio: masBarato.precio, moneda: masBarato.moneda }), t('dubaiEntrada')]];
    if(anios.length){
      var min = Math.min.apply(null, anios), max = Math.max.apply(null, anios);
      celdas.push([min === max ? String(min) : t('rango', { a: min, b: max }), t('dubaiEntregas')]);
    }
    caja.innerHTML = celdas.map(function(c){ return '<div><b>' + esc(c[0]) + '</b>' + esc(c[1]) + '</div>'; }).join('');
  }

  /* La sala 360 de Dubai. Un panel por proyecto de afuera, ordenados por
     precio, en un anillo alrededor del visitante: la camara esta en el centro
     y girar el anillo es girar la cabeza.

     Se arrastra con el dedo o el mouse (con inercia), con las flechas del
     teclado o con los botones, y gira sola despacio mientras nadie la toca y
     esta en pantalla. Un toque sin arrastre abre la ficha del proyecto. Con
     movimiento reducido no gira sola ni tiene inercia.

     Los paneles que quedan detras de la camara se esconden: dibujarlos ahi
     no aporta nada y algunos navegadores los pintan raro. */
  var sala = null;
  function initDubaiSala(){
    var bloque = document.getElementById('dubai-sala-bloque');
    var caja = document.getElementById('dubai-sala');
    if(!bloque || !caja) return;
    var ops = catalogo().filter(function(op){ return AFUERA.indexOf(op.zona) >= 0 && foto(op, 0); })
      .sort(function(a, b){ return a.precio - b.precio; });
    if(ops.length < 5){ bloque.remove(); return; }
    var anillo = caja.querySelector('.anillo');
    var N = ops.length, PASO = 360 / N;
    anillo.innerHTML = ops.map(function(op, i){
      var titulo = I18N.campo(op, 'titulo');
      return '<a class="panel" data-i="' + i + '" href="' + enlaceFicha(op.slug) + '" draggable="false">' +
        imagen(foto(op, 0), titulo, true, ' draggable="false"') +
        '<div class="pie"><b>' + esc(titulo) + '</b><span>' +
        esc(I18N.voz(op.zona)) + ' · ' + esc(precio(op)) + '</span></div></a>';
    }).join('');
    var paneles = [].slice.call(anillo.querySelectorAll('.panel'));

    if(sala){ sala.paneles = paneles; sala.medir(); return; }   // cambio de idioma

    var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var s = sala = { paneles: paneles, angulo: 0, vel: 0, objetivo: null, ultimoToque: 0, visible: false };
    var R = 0, P = 0, gradosPorPx = 0.2, arrastre = null, ultimo = null;

    /* Respecto al frente, en grados de -180 a 180. */
    function desvio(i){ return ((i * PASO - s.angulo) % 360 + 540) % 360 - 180; }

    function pintar(){
      anillo.style.transform = 'translateZ(' + P + 'px) rotateY(' + s.angulo + 'deg)';
      s.paneles.forEach(function(el, i){
        var d = Math.abs(desvio(i));
        el.style.visibility = d < 100 ? 'visible' : 'hidden';
        el.tabIndex = d < PASO / 2 ? 0 : -1;
      });
    }

    s.medir = function(){
      var ancho = caja.clientWidth;
      /* La camara queda a la misma distancia de la pantalla que de los
         paneles (P = R): asi el panel del frente se ve a su tamano real y no
         se agranda borroso. El angulo de vision lo da el ancho del panel. */
      var w = Math.round(ancho * (ancho < 700 ? 0.7 : 0.52));
      var h = Math.round(w * 0.74);
      R = Math.round(w / (2 * Math.tan(Math.PI / N)) * 1.04);
      P = R;
      /* Los paneles de los lados quedan mas cerca de la camara en su borde
         y se ven mas altos que el del frente. La sala se hace tan alta como
         se vean en el borde de la pantalla, para que no queden cortados. */
      var fi = Math.atan((ancho / 2) / P), paso = PASO * Math.PI / 180;
      var crece = Math.max(1, Math.cos(fi - paso) / Math.cos(fi));
      caja.style.height = Math.round(h * crece + 28) + 'px';
      caja.style.perspective = P + 'px';
      s.paneles.forEach(function(el, i){
        el.style.width = w + 'px'; el.style.height = h + 'px';
        el.style.left = (-w / 2) + 'px'; el.style.top = (-h / 2) + 'px';
        // Hacia la derecha va el siguiente: el que cuesta mas.
        el.style.transform = 'rotateY(' + (-i * PASO) + 'deg) translateZ(' + (-R) + 'px)';
      });
      gradosPorPx = PASO / (w * P / R);
      pintar();
    };

    function cuadro(ahora){
      var dt = ultimo ? Math.min((ahora - ultimo) / 1000, 0.05) : 0;
      ultimo = ahora;
      if(!arrastre){
        if(s.objetivo !== null){
          var falta = s.objetivo - s.angulo;
          s.angulo += falta * Math.min(dt * 7, 1);
          if(Math.abs(falta) < 0.05){ s.angulo = s.objetivo; s.objetivo = null; }
        } else if(Math.abs(s.vel) > 2 && !quieto){
          s.angulo += s.vel * dt;
          s.vel *= Math.pow(0.04, dt);
          // Cuando la inercia se apaga, se acomoda en el proyecto mas cercano.
          if(Math.abs(s.vel) <= 25){ s.vel = 0; s.objetivo = Math.round(s.angulo / PASO) * PASO; }
        } else if(!quieto && s.visible && ahora - s.ultimoToque > 3500){
          s.vel = 0;
          s.angulo += 5 * dt;                                         // giro lento solo
        }
      }
      pintar();
      requestAnimationFrame(cuadro);
    }

    function girar(pasos){
      s.ultimoToque = performance.now();
      var base = s.objetivo !== null ? s.objetivo : Math.round(s.angulo / PASO) * PASO;
      s.objetivo = base + pasos * PASO;
      s.vel = 0;
      if(quieto){ s.angulo = s.objetivo; s.objetivo = null; pintar(); }
    }
    [].forEach.call(bloque.querySelectorAll('[data-giro]'), function(b){
      b.addEventListener('click', function(){ girar(+b.getAttribute('data-giro')); });
    });
    caja.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ e.preventDefault(); girar(-1); }
      if(e.key === 'ArrowRight'){ e.preventDefault(); girar(1); }
    });

    caja.addEventListener('pointerdown', function(e){
      if(e.button !== 0) return;
      arrastre = { x: e.clientX, y: e.clientY, x0: e.clientX, t: performance.now(), movio: false, id: e.pointerId };
      s.vel = 0; s.objetivo = null; s.ultimoToque = performance.now();
    });
    caja.addEventListener('pointermove', function(e){
      if(!arrastre || e.pointerId !== arrastre.id) return;
      if(!arrastre.movio){
        if(Math.abs(e.clientX - arrastre.x0) < 6) return;
        // En celular, un gesto vertical es scroll de la pagina, no giro.
        if(e.pointerType === 'touch' && Math.abs(e.clientY - arrastre.y) > Math.abs(e.clientX - arrastre.x0)){ arrastre = null; return; }
        arrastre.movio = true;
        caja.classList.add('agarrando');
        try{ caja.setPointerCapture(e.pointerId); }catch(err){}
      }
      var ahora = performance.now(), dt = Math.max((ahora - arrastre.t) / 1000, 0.001);
      var dx = e.clientX - arrastre.x;
      s.angulo -= dx * gradosPorPx;
      s.vel = -dx * gradosPorPx / dt;
      arrastre.x = e.clientX; arrastre.t = ahora;
      s.ultimoToque = ahora;
    });
    function soltar(){
      if(!arrastre) return;
      var movio = arrastre.movio;
      arrastre = null;
      caja.classList.remove('agarrando');
      s.ultimoToque = performance.now();
      if(!movio) return;
      // Un arrastre no es un toque: el click que lo sigue no abre la ficha.
      // Si el navegador no manda ese click (pasa con el dedo), el freno se
      // quita solo para no tragarse el toque siguiente.
      var frenar = function(ev){ ev.preventDefault(); ev.stopPropagation(); };
      caja.addEventListener('click', frenar, { capture: true, once: true });
      setTimeout(function(){ caja.removeEventListener('click', frenar, { capture: true }); }, 350);
      if(quieto || Math.abs(s.vel) < 30){ s.vel = 0; s.objetivo = Math.round(s.angulo / PASO) * PASO; }
    }
    caja.addEventListener('pointerup', soltar);
    caja.addEventListener('pointercancel', soltar);

    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entradas){
        entradas.forEach(function(e){ s.visible = e.isIntersecting; });
      }).observe(caja);
    } else {
      s.visible = true;
    }
    window.addEventListener('resize', function(){ s.medir(); });
    s.medir();
    requestAnimationFrame(cuadro);
  }

  /* Boton flotante de WhatsApp, presente en todas las paginas. Se inyecta
     desde aqui y no se escribe en los siete html: el numero ya vive en este
     archivo, asi que se cambia en un solo lugar.

     El mensaje es generico a proposito. El de las fichas lo arma
     enlaceWhatsapp() con el inmueble, pero este boton tambien aparece en
     Ofrecer y en las paginas legales, donde hablar del portafolio no venia
     al caso. */
  function initWhatsappFlotante(){
    var previo = document.querySelector('.wa-float');
    /* Al cambiar de idioma el boton no se rehace: solo se le cambian el
       mensaje que lleva y la etiqueta que lee el lector de pantalla. */
    if(previo){
      previo.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t('waGenerico'));
      previo.setAttribute('aria-label', t('waAria'));
      return;
    }
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t('waGenerico'));
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', t('waAria'));
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
    /* Se admiten los dos separadores decimales porque la misma cifra se lee
       "4,6 %" en espanol y "4.6 %" en ingles, y el bloque de mercado cambia de
       idioma sin rehacer el elemento. Se cuenta con el que traiga y se
       devuelve con el mismo. */
    var partes = /^(\D*)(\d+(?:[.,]\d+)?)([\s\S]*)$/.exec(original);
    if(!partes) return;

    var antes = partes[1], crudo = partes[2], despues = partes[3];
    var separador = crudo.indexOf(',') > -1 ? ',' : '.';
    var decimales = (crudo.split(separador)[1] || '').length;
    var destino = parseFloat(crudo.replace(',', '.'));
    if(!isFinite(destino)) return;

    var DURACION = 1100;
    var inicio = null;

    function paso(ahora){
      if(inicio === null) inicio = ahora;
      var t = Math.min((ahora - inicio) / DURACION, 1);
      var suave = 1 - Math.pow(1 - t, 3);
      if(t < 1){
        el.textContent = antes + (destino * suave).toFixed(decimales).replace('.', separador) + despues;
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
    var titulo = I18N.campo(op, 'titulo');
    var portada = foto(op, 0);
    var principal = '<div class="frame gallery-main"><picture>' +
      '<source id="gallery-main-src" srcset="' + esc(portada.webp) + '" type="image/webp">' +
      '<img id="gallery-main-img" style="view-transition-name:foto-' + esc(op.slug) + '" src="' +
      esc(portada.jpg) + '" alt="' + esc(portada.alt || titulo) + '"></picture></div>';
    if(op.fotos.length < 2) return principal;
    /* La miniatura es un boton: su aria-label describe la foto, asi que la
       imagen de adentro va con alt vacio para no repetirla dos veces. */
    var thumbs = op.fotos.map(function(_, i){
      var f = foto(op, i);
      var etiqueta = t('verFoto', { n: i + 1 }) + (f.alt ? ': ' + f.alt : '');
      return '<button type="button" class="frame' + (i === 0 ? ' active' : '') +
        '" data-jpg="' + esc(f.jpg) + '" data-webp="' + esc(f.webp) + '" data-alt="' +
        esc(f.alt || titulo) + '" aria-label="' + esc(etiqueta) + '">' +
        '<picture><source srcset="' + esc(f.webp) + '" type="image/webp">' +
        '<img src="' + esc(f.jpg) + '" alt="" loading="lazy"></picture></button>';
    }).join('');
    return principal + '<div class="thumb-row">' + thumbs + '</div>';
  }

  function initOportunidad(){
    var raiz = document.getElementById('detalle');
    if(!raiz) return;
    /* /o/<slug> es la direccion que se comparte (api/ficha.py le pone la
       vista previa); oportunidad.html?id=<slug> sigue sirviendo para los
       enlaces que ya andan por ahi. */
    var enRuta = window.location.pathname.match(/\/o\/([^\/?#]+)/);
    var id = enRuta ? decodeURIComponent(enRuta[1]) : new URLSearchParams(window.location.search).get('id');
    var ops = catalogo();
    var op = null;
    for(var i = 0; i < ops.length; i++){ if(ops[i].slug === id){ op = ops[i]; break; } }
    var migaActual = document.getElementById('breadcrumb-actual');

    if(!op){
      raiz.innerHTML = '<div class="container" style="padding:80px 0;text-align:center;">' +
        '<p style="font-size:14.5px;color:var(--muted);">' + esc(t('fichaRetirada')) + '</p>' +
        '<p style="margin-top:18px;"><a href="portafolio.html">' + esc(t('verPortafolio')) + '</a></p></div>';
      if(migaActual) migaActual.textContent = t('migaRetirada');
      var vacia = document.getElementById('related');
      if(vacia) vacia.remove();
      return;
    }

    var titulo = I18N.campo(op, 'titulo');
    document.title = titulo + ' | CINQ';
    /* Sin zona la meta se queda con el titulo solo. */
    var descripcion = op.zonaDetalle
      ? t('metaFicha', { titulo: titulo, zona: detalleZona(op) })
      : t('metaFichaSinZona', { titulo: titulo });
    var meta = document.querySelector('meta[name="description"]');
    if(meta) meta.setAttribute('content', descripcion);

    /* El html trae la canonical de la plantilla, sin el id. Dejarla asi le
       dice a Google que todas las fichas son la misma pagina, que es peor
       que no tener canonical. Aqui se le pone la de esta oportunidad. */
    var propia = 'https://cinq-web.vercel.app/o/' + encodeURIComponent(op.slug);
    var can = document.querySelector('link[rel="canonical"]');
    if(can) can.setAttribute('href', propia);
    var pares = [['og:url', propia], ['og:title', titulo],
                 ['og:description', descripcion]];
    pares.forEach(function(par){
      var m = document.querySelector('meta[property="' + par[0] + '"]');
      if(m) m.setAttribute('content', par[1]);
    });

    if(migaActual) migaActual.textContent = titulo;
    var migaTipo = document.getElementById('breadcrumb-tipo');
    if(migaTipo) migaTipo.textContent = t(mercado(op) === 'emiratos' ? 'migaProyectos' : 'migaPropiedades');

    var ficha = I18N.campo(op, 'ficha') || [];
    var fichaCompleta = [[t('filaTipo'), I18N.voz(op.subtipo || op.tipo)],
                         [t('filaOperacion'), I18N.voz(op.operacion)]];
    if(op.zona) fichaCompleta.push([t('filaZona'), I18N.voz(op.zona)]);
    fichaCompleta = fichaCompleta.concat(ficha);
    var parrafos = (I18N.campo(op, 'descripcion') || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');

    /* El panel va primero en el html aunque se vea a la derecha: dentro
       lleva el h1, y si fuera despues la pagina abriria con dos h2 por
       delante del titulo. El CSS lo devuelve a su columna. */
    raiz.innerHTML = '' +
      '<div class="container"><div class="detail-grid">' +
      '<div class="info-panel">' +
        /* Un proyecto de afuera se presenta como Proyecto, no como Propiedad. */
        '<div class="kicker">' + esc(I18N.voz(mercado(op) === 'emiratos' ? categoria(op) : op.tipo)) + ' · ' + esc(I18N.voz(op.operacion)) + '</div>' +
        '<div class="price">' + esc(precio(op)) + '</div>' +
        /* El h1 es el municipio cuando lo hay. Si falta, el h1 pasa a ser
           el titulo: la pagina no puede abrir sin encabezado. */
        '<h1 class="loc">' + esc(detalleZona(op) || titulo) + '</h1>' +
        '<ul class="spec-list">' + specs(ficha) + '</ul>' +
        '<a class="wa-btn" href="' + esc(enlaceWhatsapp(op)) + '" target="_blank" rel="noopener">' + esc(t('btnConversemos')) + '</a>' +
        '<p class="info-note">' + esc(t('notaPanel')) + '</p>' +
      '</div>' +
      '<div class="columna-principal">' +
        galeria(op) +
        (parrafos ? '<div class="description"><h2>' + esc(t('descripcion')) + '</h2>' + parrafos + '</div>' : '') +
        '<div class="ficha"><h2>' + esc(t('fichaTecnica')) + '</h2><div class="ficha-grid">' + filas(fichaCompleta) + '</div></div>' +
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

    /* Solo del mismo mercado: desde un proyecto en Dubai no se sugiere un
       lote en Envigado, ni al reves. Dentro del mercado, primero la misma
       zona. */
    var otras = ops.filter(function(o){ return o.slug !== op.slug && mercado(o) === mercado(op); });
    otras = otras.filter(function(o){ return o.zona === op.zona; })
      .concat(otras.filter(function(o){ return o.zona !== op.zona; }));
    var seccion = document.getElementById('related');
    if(!seccion) return;
    if(!otras.length){ seccion.remove(); return; }
    seccion.querySelector('.r-grid').innerHTML = otras.slice(0,3).map(function(o){
      var suTitulo = I18N.campo(o, 'titulo');
      var img = imagen(foto(o, 0), suTitulo, true);
      return '<a class="r-card" href="' + enlaceFicha(o.slug) + '">' +
        '<div class="frame">' + img + '</div>' +
        '<div class="r-meta"><span class="place">' + esc(suTitulo) + '</span>' +
        '<span class="price">' + esc(precio(o)) + '</span></div></a>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function(){
    initSolidNav();
    initWhatsappFlotante();
    initDestacadas();
    initDubai();
    initDubaiSala();
    initPortafolio();
    initOportunidad();
    initRevelado();
  });

  /* Al tocar ES/EN, i18n.js ya cambio lo que estaba escrito en el html. Falta
     lo que dibuja este archivo, que hay que volver a armar con los textos del
     otro idioma.

     initRevelado NO se vuelve a llamar, y es a proposito. Las tarjetas que
     nacen de este repintado no traen data-reveal, asi que se ven de una, que es
     lo que se quiere: el visitante ya esta mirando esa parte de la pagina.
     Llamarlo otra vez les pondria el atributo y las apagaria hasta el proximo
     barrido, y de paso volveria a apagar todo lo que ya estaba revelado. */
  CINQ_I18N.alCambiar(function(){
    initWhatsappFlotante();
    initDestacadas();
    initDubai();
    initDubaiSala();
    if(repintarPortafolio) repintarPortafolio();
    initOportunidad();
  });

  return { precio: precio, enlaceWhatsapp: enlaceWhatsapp };
})();
