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
     quien llega de afuera, y la diferencia es de tres ceros. */
  function precio(valor){
    if(typeof valor !== 'number' || !isFinite(valor)) return t('precioConsultar');
    return I18N.esIngles()
      ? 'COP ' + valor.toLocaleString('en-US')
      : '$ ' + valor.toLocaleString('es-CO');
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
      ? t('waFicha', { titulo: I18N.campo(op, 'titulo'), precio: precio(op.precio) })
      : t('waPortafolio');
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  /* La categoria es lo que separa las secciones del portafolio: el subtipo
     para las propiedades (Apartamento, Lote, Casa) y el tipo para los
     vehiculos, que no se parten por marca. Sale del catalogo, asi que una
     categoria nueva aparece sola cuando entra su primera oportunidad. */
  function categoria(op){
    return op.tipo === 'Vehículo' ? 'Vehículo' : (op.subtipo || op.tipo);
  }

  var PLURALES = { 'Apartamento': 'Apartamentos', 'Casa': 'Casas', 'Lote': 'Lotes',
    'Local': 'Locales', 'Oficina': 'Oficinas', 'Finca': 'Fincas', 'Vehículo': 'Vehículos' };

  function plural(cat){ return PLURALES[cat] || cat; }

  function tarjeta(op){
    var titulo = I18N.campo(op, 'titulo');
    var badge = op.premium ? '<span class="p-badge">' + esc(t('badgePremium')) + '</span>' : '';
    /* El mismo nombre que usa la foto grande de la ficha: es lo que hace
       que la imagen crezca de la tarjeta al detalle al navegar. */
    var img = imagen(foto(op, 0), titulo, true,
      ' style="view-transition-name:foto-' + op.slug + '"');
    return '' +
      '<a class="p-card" href="oportunidad.html?id=' + encodeURIComponent(op.slug) + '">' +
        '<div class="frame"><span class="p-tag">' + esc(I18N.voz(categoria(op))) + '</span>' + badge + img + '</div>' +
        '<div class="p-meta">' +
          '<div><div class="place">' + esc(titulo) + '</div><div class="op">' + esc(I18N.voz(op.operacion)) + '</div></div>' +
          '<div class="price">' + esc(precio(op.precio)) + '</div>' +
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
    zonas.sort();

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
      zonas.forEach(function(z){ if(cuantas(z)) botones.push([z, z, cuantas(z)]); });
      caja.innerHTML = botones.map(function(b){
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
      grid.innerHTML = visibles.map(tarjeta).join('');
      pintaCats();
      pintaFiltros();
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
    var id = new URLSearchParams(window.location.search).get('id');
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
    /* Un vehiculo no tiene municipio: no esta en ningun sitio, se entrega
       donde se acuerde. Sin zona la meta se queda con el titulo solo. */
    var descripcion = op.zonaDetalle
      ? t('metaFicha', { titulo: titulo, zona: op.zonaDetalle })
      : t('metaFichaSinZona', { titulo: titulo });
    var meta = document.querySelector('meta[name="description"]');
    if(meta) meta.setAttribute('content', descripcion);

    /* El html trae la canonical de la plantilla, sin el id. Dejarla asi le
       dice a Google que todas las fichas son la misma pagina, que es peor
       que no tener canonical. Aqui se le pone la de esta oportunidad. */
    var propia = 'https://cinq-web.vercel.app/oportunidad.html?id=' + encodeURIComponent(op.slug);
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
    if(migaTipo) migaTipo.textContent = t(op.tipo === 'Vehículo' ? 'migaVehiculos' : 'migaPropiedades');

    var ficha = I18N.campo(op, 'ficha') || [];
    var fichaCompleta = [[t('filaTipo'), I18N.voz(op.subtipo || op.tipo)],
                         [t('filaOperacion'), I18N.voz(op.operacion)]];
    if(op.zona) fichaCompleta.push([t('filaZona'), op.zona]);
    fichaCompleta = fichaCompleta.concat(ficha);
    var parrafos = (I18N.campo(op, 'descripcion') || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');

    /* El panel va primero en el html aunque se vea a la derecha: dentro
       lleva el h1, y si fuera despues la pagina abriria con dos h2 por
       delante del titulo. El CSS lo devuelve a su columna. */
    raiz.innerHTML = '' +
      '<div class="container"><div class="detail-grid">' +
      '<div class="info-panel">' +
        '<div class="kicker">' + esc(I18N.voz(op.tipo)) + ' · ' + esc(I18N.voz(op.operacion)) + '</div>' +
        '<div class="price">' + esc(precio(op.precio)) + '</div>' +
        /* El h1 es el municipio cuando lo hay. Un vehiculo no lo tiene, y
           entonces el h1 pasa a ser el titulo: la pagina no puede abrir sin
           encabezado. */
        '<h1 class="loc">' + esc(op.zonaDetalle || titulo) + '</h1>' +
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

    var otras = ops.filter(function(o){ return o.slug !== op.slug; });
    var seccion = document.getElementById('related');
    if(!seccion) return;
    if(!otras.length){ seccion.remove(); return; }
    seccion.querySelector('.r-grid').innerHTML = otras.slice(0,3).map(function(o){
      var suTitulo = I18N.campo(o, 'titulo');
      var img = imagen(foto(o, 0), suTitulo, true);
      return '<a class="r-card" href="oportunidad.html?id=' + encodeURIComponent(o.slug) + '">' +
        '<div class="frame">' + img + '</div>' +
        '<div class="r-meta"><span class="place">' + esc(suTitulo) + '</span>' +
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
    if(repintarPortafolio) repintarPortafolio();
    initOportunidad();
  });

  return { precio: precio, enlaceWhatsapp: enlaceWhatsapp };
})();
