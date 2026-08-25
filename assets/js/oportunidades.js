/* CINQ — catálogo del portafolio.
   Este es el único archivo que se toca para sumar, editar o retirar una oportunidad.
   El portafolio y las fichas de detalle se dibujan solos a partir de este array.

   PARA SUMAR UNA OPORTUNIDAD:
   1. Crea la carpeta  assets/img/portafolio/<slug>/  y mete ahí las fotos.
   2. Copia el bloque de PLANTILLA de abajo, llénalo y añádelo al array.
   3. Listo. No hay que editar portafolio.html ni oportunidad.html.

   REGLA DEL SITIO: nada simulado. Si no hay foto propia y precio real, no se agrega.

   PLANTILLA (propiedad):
   {
     slug: "apartamento-las-antillas-01",     // sin tildes ni espacios; es la URL
     tipo: "Propiedad",                        // "Propiedad" o "Vehículo"
     subtipo: "Apartamento",
     operacion: "Venta",                       // "Venta" o "Arriendo"
     titulo: "Apartamento, Las Antillas",
     zona: "Envigado",
     zonaDetalle: "Las Antillas, Envigado, Antioquia",
     precio: 459000000,                        // número, sin puntos ni comillas
     premium: false,                           // true = badge "Curaduría premium"
     ficha: [
       ["Área", "67,5 m²"],
       ["Estrato", "5"],
       ["Alcobas", "3"],
       ["Baños", "2"],
       ["Parqueadero", "1"],
       ["Administración", "$ 320.000 / mes"],
       ["Documentos", "Al día"]
     ],
     descripcion: [
       "Primer párrafo: la zona y por qué importa.",
       "Segundo párrafo: el inmueble y por qué CINQ lo aceptó."
     ],
     fotos: [                                  // la primera es la portada
       { archivo: "p14-01-fachada.jpg", alt: "Fachada del edificio desde la calle" },
       { archivo: "p14-02-sala.jpg",    alt: "Sala comedor con ventanal" }
     ]
   }

   Cada foto necesita su alt: es lo que lee un lector de pantalla y lo que se
   ve si la imagen no carga. Junto a cada .jpg debe existir su .webp con el
   mismo nombre; el sitio sirve el WebP y deja el JPG de respaldo.

   FOTOS COMPARTIDAS ENTRE DOS FICHAS. Si el archivo trae una barra, se busca
   en esa ruta colgando de assets/img/portafolio/ en vez de en la carpeta de la
   oportunidad. Sirve para las zonas comunes de un edificio donde hay más de un
   apartamento en venta: el archivo vive una sola vez y las dos fichas lo citan.

       { archivo: "aluna-zonas-comunes/aluna-zc-01-piscina-adultos.jpg", alt: "..." }

   El alt sí se escribe en cada ficha: la foto es la misma, pero el texto puede
   cambiar según el apartamento del que se esté hablando.

   PLANTILLA (vehículo): igual, pero tipo "Vehículo" y la ficha con
   ["Año","2025"], ["Kilometraje","2.200 km"], ["Documentos","SOAT y tecnomecánica vigentes"].
*/

var CINQ_OPORTUNIDADES = [

  {
    slug: "aluna-las-antillas",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Envigado, Las Antillas",
    zona: "Envigado",
    zonaDetalle: "Las Antillas, Envigado, Antioquia",
    precio: 475000000,
    premium: false,
    ficha: [
      ["Área construida", "67,5 m²"],
      ["Alcobas", "2"],
      ["Baños", "2"],
      ["Parqueadero", "1"],
      ["Cuarto útil", "Sí"],
      ["Área privada", "62,5 m²"],
      ["Piso", "14 de 14"],
      ["Estrato", "4"],
      ["Administración", "$ 545.000 / mes"],
      ["Antigüedad", "1 a 8 años"],
      ["Permuta", "Se acepta"],
      ["Zonas comunes", "Piscina de niños y de adultos, gimnasio, turco, sala de cine, pista de bolos, terraza BBQ, parque infantil, guardería, salón de juegos y terraza mirador"]
    ],
    descripcion: [
      "Las Antillas resume bien lo que busca quien se muda a Envigado: cerca de la Avenida El Poblado y de la zona de servicios, pero con la montaña al frente y el ruido lejos. El edificio está en la parte alta del sector, y ahí está buena parte del valor de este inmueble. El apartamento ocupa el último piso de la torre: vista panorámica sobre el valle, ventanales de piso a techo y luz natural durante todo el día.",
      "Son 67,5 m² construidos y 62,5 m² privados, con dos alcobas, dos baños, vestier, cuarto útil, zona de ropas independiente y una cocina con isla abierta a la sala comedor. Viene con un parqueadero. Lo aceptamos porque lo declarado por el propietario coincide con lo que muestran las fotos de la visita, tomadas con el apartamento desocupado y sin intervenir, y porque un último piso con esta vista y esta iluminación no abunda en el sector. El propietario acepta permuta."
    ],
    fotos: [
      { archivo: "aluna-1405-01-sala-comedor.jpg",     alt: "Sala comedor con ventanales y vista panorámica, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-02-sala-balcon.jpg",      alt: "Sala con ventanal de piso a techo y salida al balcón, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-03-sala-barra-cocina.jpg", alt: "Sala comedor hacia el balcón, con la barra de la cocina al frente, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-04-sala-cocina.jpg",      alt: "Cocina abierta integrada a la sala comedor, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-05-cocina-isla.jpg",      alt: "Cocina con isla central y mesón en cuarzo blanco, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-06-cocina-lavaplatos.jpg", alt: "Cocina con lavaplatos e isla vista desde el comedor, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-07-cocina-frontal.jpg",   alt: "Cocina integral con estufa a gas, horno y campana extractora, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-08-alcoba-principal.jpg", alt: "Alcoba principal con ventana panorámica y piso laminado, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-09-closet.jpg",           alt: "Closet de puertas corredizas con entrepaños en madera, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-10-vestier.jpg",          alt: "Vestier con entrepaños, cajones y barra para colgar, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-11-bano-principal.jpg",   alt: "Baño principal con ducha en vidrio templado, ventana y mueble de lavamanos, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-12-alcoba-2.jpg",         alt: "Segunda alcoba con ventanal y vista a la montaña, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-13-alcoba-2-vestier.jpg", alt: "Segunda alcoba con acceso al vestier, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-14-bano-social.jpg",      alt: "Baño social con lavamanos, espejo y acabados en cerámica, apartamento 1405 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1405-15-zona-ropas.jpg",       alt: "Zona de ropas independiente con lavadero y calentador a gas, apartamento 1405 en Aluna, Las Antillas, Envigado" },

      { archivo: "aluna-zonas-comunes/aluna-zc-01-piscina-adultos.jpg", alt: "Piscina de adultos de Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-02-piscina-ninos.jpg",   alt: "Piscina de niños con juegos de agua en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-03-parque-acuatico.jpg", alt: "Parque infantil acuático junto a la piscina de niños en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-04-terraza-mirador.jpg", alt: "Terraza mirador con bancas y vista a la montaña en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-05-terraza-corredor.jpg", alt: "Corredor de la terraza mirador con vista abierta en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-06-terraza-bbq.jpg",     alt: "Terraza BBQ con asador a gas en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-07-salon-social.jpg",    alt: "Salón social con ventanales en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-08-salon-juegos.jpg",    alt: "Salón de juegos con mesa de ping pong en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-09-pista-bolos.jpg",     alt: "Pista de bolos en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-10-sala-cine.jpg",       alt: "Sala de cine con sillas reclinables en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-11-gimnasio.jpg",        alt: "Gimnasio con máquinas y peso libre en Aluna, Las Antillas, Envigado" }
    ]
  },

  {
    slug: "aluna-1404",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Envigado, Las Antillas",
    zona: "Envigado",
    zonaDetalle: "Las Antillas, Envigado, Antioquia",
    precio: 465000000,
    premium: false,
    /* Administración estimada: la del 1405 más $10.000, como la calculó el
       cliente. Depende del área, así que hay que confirmarla con la propietaria
       antes de desplegar. Piso y estrato se deducen del edificio (mismo que el
       1405). La fila de Permuta no está porque todavía no hay dato: no se
       inventa ninguna. */
    ficha: [
      ["Área", "69,5 m²"],
      ["Alcobas", "2"],
      ["Baños", "2"],
      ["Parqueadero", "1"],
      ["Cuarto útil", "Sí"],
      ["Piso", "14 de 14"],
      ["Estrato", "4"],
      ["Administración", "$ 555.000 / mes"],
      ["Antigüedad", "1 a 8 años"],
      ["Zonas comunes", "Piscina de niños y de adultos, gimnasio, turco, sala de cine, pista de bolos, terraza BBQ, parque infantil, guardería, salón de juegos y terraza mirador"]
    ],
    descripcion: [
      "En la parte alta de Las Antillas, el costado de Envigado que tiene los colegios, los supermercados y la Avenida El Poblado a pocos minutos, pero sin la congestión de la zona plana. Este apartamento está en el piso 14, el último de la torre, con el balcón mirando a la ladera y sin nada que le corte la luz de la mañana.",
      "Son 69,5 m² con dos alcobas, dos baños, cuarto útil y zona de ropas independiente. La alcoba principal llega al baño a través de un vestier de paso, con entrepaños a lado y lado, y la cocina, con mesón en granito, isla móvil, horno y estufa a gas, abre al comedor, que sale al balcón. Incluye un parqueadero. Nos llegó por referido de otro propietario del mismo edificio. Lo aceptamos porque está desocupado y sin intervenir, tal como se ve en las fotos, y porque el área y los acabados sostienen el precio que pide."
    ],
    fotos: [
      { archivo: "aluna-1404-01-sala-comedor.jpg",     alt: "Sala comedor con ventanal, barra de cocina y salida al balcón, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-02-sala-cocina.jpg",      alt: "Sala comedor hacia la cocina y el ventanal del balcón, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-03-sala-comedor-amplitud.jpg", alt: "Sala comedor vista a lo largo, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-04-balcon-vista.jpg",     alt: "Balcón con vista a la ladera desde el piso 14, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-05-cocina-isla.jpg",      alt: "Cocina con isla móvil, estufa a gas y horno, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-06-cocina-meson.jpg",     alt: "Cocina con mesón en granito y lavaplatos bajo la ventana, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-07-alcoba-principal.jpg", alt: "Alcoba principal con piso laminado y acceso al vestier, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-08-alcoba-principal-vestier.jpg", alt: "Alcoba principal vista hacia el vestier y el baño, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-09-vestier.jpg",          alt: "Vestier de paso con entrepaños a lado y lado, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-10-vestier-entrepanos.jpg", alt: "Vestier con entrepaños, cajones y barra para colgar, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-11-bano-principal.jpg",   alt: "Baño principal con ducha en vidrio templado, espejo y mueble de lavamanos, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-12-alcoba-2.jpg",         alt: "Segunda alcoba con closet de puertas corredizas y ventana, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-13-alcoba-2-ventanal.jpg", alt: "Segunda alcoba con ventanal y vista a la montaña, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-14-bano-social.jpg",      alt: "Baño social con ducha en vidrio templado y ventana, apartamento 1404 en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-1404-15-zona-ropas.jpg",       alt: "Zona de ropas independiente con lavadero y calentador a gas, apartamento 1404 en Aluna, Las Antillas, Envigado" },

      { archivo: "aluna-zonas-comunes/aluna-zc-01-piscina-adultos.jpg", alt: "Piscina de adultos de Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-02-piscina-ninos.jpg",   alt: "Piscina de niños con juegos de agua en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-03-parque-acuatico.jpg", alt: "Parque infantil acuático junto a la piscina de niños en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-04-terraza-mirador.jpg", alt: "Terraza mirador con bancas y vista a la montaña en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-05-terraza-corredor.jpg", alt: "Corredor de la terraza mirador con vista abierta en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-06-terraza-bbq.jpg",     alt: "Terraza BBQ con asador a gas en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-07-salon-social.jpg",    alt: "Salón social con ventanales en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-08-salon-juegos.jpg",    alt: "Salón de juegos con mesa de ping pong en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-09-pista-bolos.jpg",     alt: "Pista de bolos en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-10-sala-cine.jpg",       alt: "Sala de cine con sillas reclinables en Aluna, Las Antillas, Envigado" },
      { archivo: "aluna-zonas-comunes/aluna-zc-11-gimnasio.jpg",        alt: "Gimnasio con máquinas y peso libre en Aluna, Las Antillas, Envigado" }
    ]
  },

  {
    slug: "sabaneta-loma-san-jose",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Sabaneta, Loma de San José",
    zona: "Sabaneta",
    zonaDetalle: "Loma de San José, Sabaneta, Antioquia",
    precio: 350000000,
    premium: false,
    /* Datos del anuncio de Finca Raíz, código 193795108, confirmados con la
       propietaria. Tres cosas quedaron por fuera a propósito porque no están
       confirmadas: si hay gimnasio, si está remodelado y si acepta permuta.
       No se agregan filas sin dato. */
    ficha: [
      ["Área construida", "57 m²"],
      ["Alcobas", "3"],
      ["Baños", "2"],
      ["Parqueadero", "1 privado"],
      ["Área privada", "53 m²"],
      ["Piso", "7"],
      ["Estrato", "2"],
      ["Administración", "$ 313.000 / mes"],
      ["Antigüedad", "1 a 8 años"],
      ["Zonas comunes", "Piscina, placa deportiva, canchas deportivas, salón social, salón de juegos, juegos infantiles, zonas verdes, portería y circuito cerrado de televisión"]
    ],
    descripcion: [
      "La Loma de San José es de las zonas de Sabaneta donde todavía se tiene la ladera al frente y el centro a pocos minutos. La unidad está sobre la loma, en conjunto cerrado con portería y circuito cerrado de televisión, y el alimentador del Metro sube hasta la portería, que es lo que le cambia el día a día a quien no quiere depender del carro. Piscina, placa deportiva, canchas, salón social, salón de juegos, juegos infantiles y zonas verdes completan el conjunto.",
      "Son 57 m² construidos y 53 m² privados en el piso 7, con tres habitaciones, dos baños enchapados de piso a techo, zona de ropas independiente y balcón con vista a la piscina y a la montaña. La sala comedor abre a la cocina integral por una barra estilo americano, con estufa y calentador a gas. Piso en baldosa en todo el apartamento, ascensor y un parqueadero privado. La tercera habitación funciona bien como estudio. Lo aceptamos porque lo declarado por la propietaria coincide con lo que muestran las fotos, tomadas con el apartamento desocupado, y porque tres habitaciones con parqueadero propio a este precio no es lo corriente en el sector."
    ],
    fotos: [
      { archivo: "loma-san-jose-01-sala-comedor-balcon.jpg", alt: "Sala comedor con barra estilo americano abierta a la cocina y salida al balcón, apartamento en Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-02-sala-comedor.jpg",     alt: "Sala comedor con piso en baldosa y paso a la cocina, apartamento en Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-03-cocina.jpg",           alt: "Cocina integral con estufa a gas, campana extractora y muebles aéreos, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-04-alcoba.jpg",           alt: "Alcoba con clóset de puertas corredizas y piso en baldosa, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-05-alcoba-2.jpg",         alt: "Segunda alcoba con clóset empotrado y salida al pasillo, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-06-bano-principal.jpg",   alt: "Baño principal con ducha en vidrio, enchape oscuro de piso a techo y lavamanos de sobreponer, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-07-bano-auxiliar.jpg",    alt: "Baño auxiliar con ducha enchapada de piso a techo y mueble bajo el lavamanos, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-08-vista-montana.jpg",    alt: "Vista desde el balcón hacia las torres de la unidad y la montaña, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-09-vista-piscina.jpg",    alt: "Vista desde el balcón hacia la piscina de la unidad, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-10-zona-ropas.jpg",       alt: "Zona de ropas independiente con lavadero y calentador a gas, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-11-piscina.jpg",          alt: "Piscina de la unidad entre las torres, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-12-juegos-infantiles.jpg", alt: "Juegos infantiles sobre grama sintética junto a la ladera, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-13-placa-deportiva.jpg",  alt: "Placa deportiva con arco y tableros de baloncesto, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-14-salon-social.jpg",     alt: "Salón social diáfano con ventanal hacia las zonas verdes, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-15-parqueadero.jpg",      alt: "Parqueadero privado cubierto en el sótano, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-16-pasillo.jpg",          alt: "Pasillo de circulación que reparte a las alcobas y a la cocina, Loma de San José, Sabaneta" }
    ]
  }

];
