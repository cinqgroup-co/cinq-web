/* CINQ — el sitio en dos idiomas.

   No hay una copia del sitio en inglés: hay un solo html, en español, y este
   archivo lo cambia en el momento en que el visitante toca ES/EN en la barra.
   Se eligió así y no con una carpeta /en/ porque una carpeta obliga a editar
   dos veces cada texto, y ese es exactamente el trabajo que no se va a hacer.

   DE DÓNDE SALE CADA TEXTO. De dos sitios, y no hay un tercero:

   1. Lo que está escrito en el html lleva su traducción encima, en un atributo.
      El español es lo que se ve sin JavaScript, y el inglés viaja al lado:

        <h1 data-en="Opportunities exist for everyone.">Las oportunidades existen para todos.</h1>

      Para traducir un atributo en vez del texto, se le antepone data-en- al
      nombre del atributo. Están habilitados los de la lista ATRIBUTOS de abajo:

        <input placeholder="Ej. 85" data-en-placeholder="e.g. 85">
        <a title="Ofrece tu propiedad" data-en-title="Offer your property">

      El valor puede traer html (un <br>, un <span>): se cambia el contenido
      completo, no solo el texto suelto.

   2. Lo que dibuja el JavaScript (las tarjetas del portafolio, la ficha de una
      oportunidad) sale de la tabla TEXTOS de este archivo, y los datos de cada
      inmueble del bloque en: {} de oportunidades.js.

   CÓMO SE ELIGE EL IDIOMA AL ABRIR. El sitio abre en español. Solo se va a
   inglés si la dirección trae ?lang=en, o si el visitante ya lo había escogido
   antes en este navegador, en ese orden. Así, un enlace con ?lang=en abre en
   inglés para quien llega de afuera, y el sitio sigue abriendo en español para
   todos los demás. Al tocar el botón, la dirección se actualiza sola, así que
   el enlace que se copie de la barra ya lleva el idioma que se está viendo.

   LO QUE ESTE ARCHIVO NO HACE. Google indexa el html tal como se sirve, o sea
   en español. Esto pone el sitio en inglés para quien lo visita, no crea
   páginas en inglés para que las encuentren buscando en inglés. Eso último
   necesita direcciones propias, y es otra decisión. */

var CINQ_I18N = (function(){

  var CLAVE = 'cinq-idioma';
  var IDIOMAS = ['es', 'en'];

  /* Los atributos que se pueden traducir con data-en-<atributo>. Es una lista
     cerrada a propósito: recorrer todos los atributos de todos los elementos
     para buscar los que empiecen por data-en- cuesta más y no hace falta. */
  var ATRIBUTOS = ['placeholder', 'title', 'aria-label', 'alt', 'content', 'value'];

  /* Los textos que no están en el html porque los escribe el JavaScript.
     {titulo} y {precio} se reemplazan con los datos del inmueble. */
  var TEXTOS = {
    es: {
      precioConsultar: 'Precio a consultar',
      badgePremium:    'Curaduría premium',
      filtroTodas:     'Todas',
      filtroTodoTipo:  'Todo',
      verFoto:         'Ver foto {n}',
      descripcion:     'Descripción',
      fichaTecnica:    'Ficha técnica',
      filaTipo:        'Tipo',
      filaOperacion:   'Operación',
      filaZona:        'Zona',
      btnConversemos:  'Conversemos sobre esta oportunidad →',
      notaPanel:       'Un miembro de CINQ responde directamente, sin formularios de contacto genéricos ni intermediarios adicionales.',
      fichaRetirada:   'Esa oportunidad ya no está en el portafolio.',
      verPortafolio:   'Ver el portafolio →',
      migaRetirada:    'Oportunidad no disponible',
      migaPropiedades: 'Propiedades',
      migaVehiculos:   'Vehículos',
      metaFicha:       '{titulo} en {zona}. Oportunidad evaluada y aceptada por CINQ.',
      waAria:          'Escríbenos por WhatsApp',
      waGenerico:      'Hola CINQ, quisiera hacerles una consulta.',
      waPortafolio:    'Hola CINQ, quiero saber mas sobre el portafolio.',
      waFicha:         'Hola CINQ, me interesa esta oportunidad: {titulo}, {precio}.'
    },
    en: {
      precioConsultar: 'Price on request',
      badgePremium:    'Premium selection',
      filtroTodas:     'All',
      filtroTodoTipo:  'Everything',
      verFoto:         'View photo {n}',
      descripcion:     'Description',
      fichaTecnica:    'Specifications',
      filaTipo:        'Type',
      filaOperacion:   'Transaction',
      /* "Zona" no es "Area": en la misma tabla esta "Built area" con los
         metros cuadrados, y las dos filas juntas se leian como lo mismo. */
      filaZona:        'Location',
      btnConversemos:  'Let us talk about this opportunity →',
      notaPanel:       'A member of CINQ answers you directly, with no generic contact forms and no extra middlemen.',
      fichaRetirada:   'That opportunity is no longer in the portfolio.',
      verPortafolio:   'See the portfolio →',
      migaRetirada:    'Opportunity no longer available',
      migaPropiedades: 'Properties',
      migaVehiculos:   'Vehicles',
      metaFicha:       '{titulo} in {zona}. An opportunity evaluated and accepted by CINQ.',
      waAria:          'Message us on WhatsApp',
      waGenerico:      'Hello CINQ, I would like to ask you something.',
      waPortafolio:    'Hello CINQ, I would like to know more about the portfolio.',
      waFicha:         'Hello CINQ, I am interested in this opportunity: {titulo}, {precio}.'
    }
  };

  /* Las palabras de lista cerrada del catálogo. No viven en cada ficha porque
     son siempre las mismas cinco o seis, y repetirlas en oportunidades.js sería
     escribir "Apartamento" en inglés una vez por inmueble. */
  var VOCES = {
    'Propiedad': 'Property',
    'Vehículo': 'Vehicle',
    'Apartamento': 'Apartment',
    'Casa': 'House',
    'Lote': 'Lot',
    'Local': 'Retail space',
    'Oficina': 'Office',
    'Finca': 'Country house',
    'Venta': 'For sale',
    'Arriendo': 'For rent',
    /* Los plurales son los botones de categoria del portafolio. */
    'Apartamentos': 'Apartments',
    'Casas': 'Houses',
    'Lotes': 'Lots',
    'Locales': 'Retail spaces',
    'Oficinas': 'Offices',
    'Fincas': 'Country houses',
    'Vehículos': 'Vehicles'
  };

  var actual = 'es';
  var oyentes = [];
  var piezas = null;   /* lo que hay que cambiar en el html, recogido una vez */

  function normalizar(valor){
    valor = String(valor || '').slice(0, 2).toLowerCase();
    return IDIOMAS.indexOf(valor) > -1 ? valor : null;
  }

  /* El navegador puede tener el almacenamiento bloqueado (modo privado de
     algunos navegadores, o el visitante lo apagó). Sin esto, un sitio que solo
     quería recordar un idioma se cae entero. */
  function guardado(){
    try { return normalizar(window.localStorage.getItem(CLAVE)); }
    catch(e){ return null; }
  }
  function guardar(valor){
    try { window.localStorage.setItem(CLAVE, valor); } catch(e){}
  }

  /* El sitio abre en español salvo que alguien pida lo contrario, y el idioma
     del navegador no cuenta como pedirlo: CINQ es una marca de Envigado y su
     cara por defecto es el español.

     El ?lang= de la dirección le gana a lo que el visitante haya escogido
     antes, y ese orden importa: un enlace con ?lang=en que se manda por
     WhatsApp tiene que abrir en inglés SIEMPRE, incluso si esa persona ya
     habia entrado al sitio y lo habia visto en español. Al reves, el enlace
     funcionaria para unos si y para otros no, sin manera de saber cual.

     Para que el idioma del navegador también decida, se le suma al final:
       || normalizar(navigator.language) */
  function inicial(){
    return normalizar(new URLSearchParams(window.location.search).get('lang'))
      || guardado()
      || 'es';
  }

  /* Se recoge una sola vez, al arrancar, con el español todavía intacto en la
     página. Después de la primera traducción ya no se podría: el html que se
     lee sería el inglés, y volver a español no tendría de dónde sacarlo. */
  function recoger(){
    piezas = [];
    [].forEach.call(document.querySelectorAll('[data-en]'), function(el){
      piezas.push({ el: el, attr: null, es: el.innerHTML, en: el.getAttribute('data-en') });
    });
    ATRIBUTOS.forEach(function(attr){
      [].forEach.call(document.querySelectorAll('[data-en-' + attr + ']'), function(el){
        piezas.push({
          el: el, attr: attr,
          es: el.getAttribute(attr) || '',
          en: el.getAttribute('data-en-' + attr)
        });
      });
    });
  }

  function pintar(){
    document.documentElement.setAttribute('lang', actual);
    piezas.forEach(function(p){
      var valor = actual === 'en' ? p.en : p.es;
      if(valor === null || valor === undefined) return;
      if(p.attr){ p.el.setAttribute(p.attr, valor); } else { p.el.innerHTML = valor; }
    });
    [].forEach.call(document.querySelectorAll('.lang-toggle button'), function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === actual ? 'true' : 'false');
    });
  }

  /* La dirección se queda con ?lang= del idioma que se está viendo, para que
     copiar la barra y mandarla por WhatsApp lleve el idioma puesto. El español
     no lo escribe: es el idioma de la casa y la dirección limpia es la suya. */
  function sellarUrl(){
    if(!window.history || !window.history.replaceState) return;
    var url = new URL(window.location.href);
    if(actual === 'en'){ url.searchParams.set('lang', 'en'); }
    else { url.searchParams.delete('lang'); }
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  function poner(valor, sellar){
    valor = normalizar(valor) || 'es';
    if(valor === actual) return;
    actual = valor;
    guardar(actual);
    pintar();
    if(sellar) sellarUrl();
    oyentes.forEach(function(fn){ fn(actual); });
  }

  /* El botón vive aquí y no en los siete html porque sin JavaScript no serviría
     de nada: si no puede cambiar el idioma, tampoco tiene que verse. */
  function ponerBoton(){
    var nav = document.querySelector('.chrome-nav nav');
    if(!nav || nav.querySelector('.lang-toggle')) return;
    var caja = document.createElement('div');
    caja.className = 'lang-toggle';
    caja.setAttribute('role', 'group');
    caja.setAttribute('aria-label', 'Idioma / Language');
    caja.innerHTML = IDIOMAS.map(function(id){
      return '<button type="button" data-lang="' + id + '" aria-pressed="false">' +
        id.toUpperCase() + '</button>';
    }).join('');
    caja.addEventListener('click', function(e){
      var boton = e.target.closest('button');
      if(boton) poner(boton.getAttribute('data-lang'), true);
    });
    nav.appendChild(caja);
  }

  function t(clave, datos){
    var texto = (TEXTOS[actual] && TEXTOS[actual][clave]) || TEXTOS.es[clave] || '';
    if(datos){
      Object.keys(datos).forEach(function(k){
        texto = texto.split('{' + k + '}').join(datos[k]);
      });
    }
    return texto;
  }

  /* Una palabra del catálogo que sí tiene traducción fija. Lo que no esté en
     VOCES se devuelve tal cual: es preferible que salga en español a que
     desaparezca de la tarjeta. */
  function voz(palabra){
    return actual === 'en' && VOCES[palabra] ? VOCES[palabra] : palabra;
  }

  /* Un campo de una oportunidad, en el idioma que toque. Si el bloque en: {} no
     trae ese campo, cae al español. */
  function campo(op, nombre){
    if(actual === 'en' && op && op.en && op.en[nombre]) return op.en[nombre];
    return op ? op[nombre] : undefined;
  }

  /* El alt de la foto numero i. Igual que campo(): si no hay alt en inglés para
     esa foto, se usa el que trae fotos[i]. */
  function alt(op, i, respaldo){
    if(actual === 'en' && op && op.en && op.en.alts && op.en.alts[i]) return op.en.alts[i];
    return respaldo;
  }

  /* El script va al final del body, así que a esta altura la página ya está
     armada y se puede traducir de una. Hacerlo en DOMContentLoaded dejaría ver
     el español un instante antes de cambiar. */
  actual = inicial();
  recoger();
  ponerBoton();
  pintar();
  if(actual === 'en') sellarUrl();

  return {
    idioma: function(){ return actual; },
    esIngles: function(){ return actual === 'en'; },
    poner: poner,
    t: t,
    voz: voz,
    campo: campo,
    alt: alt,
    alCambiar: function(fn){ oyentes.push(fn); }
  };
})();
