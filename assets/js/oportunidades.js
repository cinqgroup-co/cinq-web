/* CINQ — catálogo del portafolio.
   Este es el único archivo que se toca para sumar, editar o retirar una oportunidad.
   El portafolio y las fichas de detalle se dibujan solos a partir de este array.

   PARA SUMAR UNA OPORTUNIDAD:
   1. Crea la carpeta  assets/img/portafolio/<slug>/  y mete ahí las fotos.
   2. Copia el bloque de PLANTILLA de abajo, llénalo y añádelo al array.
   3. Listo. No hay que editar portafolio.html ni oportunidad.html.

   REGLA DEL SITIO: nada simulado. Si no hay foto propia y precio real, no se agrega.

   EL TÍTULO. Va siempre igual: tipo de inmueble, municipio y sector, en ese
   orden y sin comas. "Apartamento Sabaneta Monteazul". No lleva el número del
   apartamento ni nada que lo identifique por dentro: el título nombra el
   lugar, no la unidad.

   Tampoco lleva el nombre del proyecto o del edificio: el 710 es "Apartamento
   Sabaneta Loma de San José", sin "Ecoh".

   Por eso dos inmuebles del mismo sector comparten título, y hoy pasa con los
   dos de Las Antillas y con los dos de Loma de San José. Es una decisión de
   Samuel del 13 de septiembre de 2026, tomada sabiendo lo que cuesta: lo que
   los distingue en la tarjeta pasa a ser el precio y la foto de portada, y el
   mensaje de WhatsApp que arma la ficha también queda igual salvo por el
   precio, así que un enlace viejo deja de decir por cuál de los dos escriben
   si un precio cambia. Si eso llega a estorbar, hay que buscar otra forma de
   distinguirlos: el número del apartamento y el nombre del proyecto ya se
   descartaron.

   PLANTILLA (propiedad):
   {
     slug: "apartamento-las-antillas-01",     // sin tildes ni espacios; es la URL
     tipo: "Propiedad",                        // "Propiedad" o "Vehículo"
     subtipo: "Apartamento",
     operacion: "Venta",                       // "Venta" o "Arriendo"
     titulo: "Apartamento Envigado Las Antillas",
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
     en: { ... },                              // opcional; ver abajo
     fotos: [                                  // la primera es la portada
       { archivo: "p14-01-fachada.jpg", alt: "Fachada del edificio desde la calle" },
       { archivo: "p14-02-sala.jpg",    alt: "Sala comedor con ventanal" }
     ]
   }

   EL BLOQUE en. Es lo que se lee cuando el visitante pone el sitio en inglés
   con el botón ES/EN de la barra. Todo lo de adentro es opcional: lo que falte
   cae al español, así que una ficha sin bloque en igual se ve, y una foto nueva
   sin su alt en inglés no rompe nada.

     en: {
       titulo: "Apartment in Envigado, Las Antillas",
       ficha: [["Built area", "67.5 m²"], ["Stratum", "5"]],   // punto decimal
       descripcion: ["First paragraph.", "Second paragraph."],
       alts: ["Building facade from the street", "Living room with window"]
     }

   Los alts van en el MISMO orden que fotos[], uno por foto. Lo que no se
   traduce nunca: tipo, subtipo, operación y zona, que son palabras de una lista
   cerrada y las traduce site.js, y zonaDetalle, que son nombres propios.

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
    slug: "sabaneta-las-lomitas",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Apartamento Sabaneta Las Lomitas",
    zona: "Sabaneta",
    zonaDetalle: "Las Lomitas, Sabaneta, Antioquia",
    precio: 1290000000,
    premium: false,
    /* Nuevo ingreso del 22 de septiembre de 2026, por referido familiar de Samuel. Los datos de la ficha los paso el propietario; estrato, administracion y antiguedad no llegaron y por eso no salen. Las fotos son del album de WhatsApp de ese dia. Pendientes: repetir cocina y bano con los mesones despejados, sumar garajes, fachada y una vista de dia. El titulo va sin el nombre del proyecto, como manda la cabecera. */
    ficha: [
      ["Área", "172 m²"],
      ["Alcobas", "3, incluida la del servicio"],
      ["Baños", "4"],
      ["Piso", "23"],
      ["Parqueadero", "2 paralelos en sótano 1, frente al ascensor"],
      ["Cuarto útil", "Sí, en el mismo sótano"],
      ["Estudio", "Sí"],
      ["Balcón", "Corrido, a lo largo de todo el apartamento"],
      ["Pisos", "Porcelanato"],
      ["Seguridad", "Puerta blindada"]
    ],
    descripcion: [
      "Las Lomitas está en la parte alta de Sabaneta, en la ladera, y desde ahí la altura se convierte en vista. En un piso 23 eso quiere decir el valle entero al frente, de día y de noche, sin edificios que lo tapen. Es la razón por la que este sector pesa en el precio: la vista no se construye después, viene con la ubicación.",
      "Son 172 m² en el piso 23, con un balcón que corre a lo largo de todo el apartamento y da vista e iluminación de lado a lado. La terraza funciona como una segunda sala, con jardín vertical y la ciudad al fondo, y se abre por completo a la sala, el comedor y la cocina. Tiene tres alcobas contando la del servicio, cuatro baños y un estudio. La alcoba principal trae vestier y baño propio, y la segunda un clóset de pared completa. Pisos en porcelanato, iluminación empotrada tipo galería, puerta blindada, dos parqueaderos paralelos en el sótano 1 frente al ascensor y cuarto útil en el mismo piso. Lo aceptamos porque a este tamaño y con esta vista no hay muchos en Sabaneta, y porque el balcón corrido es de esas cosas que no tienen arreglo en otro apartamento."
    ],
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui
       cae al espanol. */
    en: {
      titulo: "Apartment in Sabaneta, Las Lomitas",
      ficha: [
        ["Area", "172 m²"],
        ["Bedrooms", "3, including the service room"],
        ["Bathrooms", "4"],
        ["Floor", "23"],
        ["Parking", "2 tandem spaces on basement level 1, facing the lift"],
        ["Storage room", "Yes, on the same basement level"],
        ["Study", "Yes"],
        ["Balcony", "Runs the full length of the apartment"],
        ["Floors", "Porcelain tile"],
        ["Security", "Armoured front door"]
      ],
      descripcion: [
        "Las Lomitas sits in the upper part of Sabaneta, on the hillside, and from there height turns into a view. On the 23rd floor that means the whole valley in front of you, by day and by night, with no buildings in the way. That is why this sector carries weight in the price: the view cannot be built later, it comes with the location.",
        "It has 172 m² on the 23rd floor, with a balcony that runs the full length of the apartment and brings in views and light from end to end. The terrace works as a second living room, with a vertical garden and the city behind it, and opens completely onto the living room, dining room and kitchen. There are three bedrooms counting the service room, four bathrooms and a study. The main bedroom has a walk in closet and its own bathroom, and the second a full wall closet. Porcelain tile floors, gallery style recessed lighting, an armoured front door, two tandem parking spaces on basement level 1 facing the lift and a storage room on the same level. We accepted it because there are not many apartments of this size with this view in Sabaneta, and because a full length balcony is something no other apartment can make up for."
      ],
      alts: [
        "Furnished terrace with a night view over the valley, apartment in Las Lomitas, Sabaneta",
        "Outdoor lounge on the terrace with a vertical garden and the city behind, Sabaneta",
        "Living room open to the terrace with the city view, Las Lomitas, Sabaneta",
        "Living and dining room in one space with the kitchen behind, Sabaneta",
        "Dining room with pendant lamps next to the living room, Sabaneta",
        "Living room, dining room and kitchen seen from the balcony, Sabaneta",
        "Covered terrace with patterned tile floor and a glass railing, Sabaneta",
        "Panoramic view of the valley at sunset from the 23rd floor, Sabaneta",
        "Night view of the city from the apartment, Las Lomitas, Sabaneta",
        "Open kitchen with a breakfast bar and gas hob, connected to the terrace, Sabaneta",
        "Bedroom with a floor to ceiling window and a city view, Sabaneta",
        "Bedroom with a wood panelled wall and a bed with drawers, Sabaneta",
        "Bedroom doors opening onto the balcony at sunset, Sabaneta",
        "Bathroom with a glass shower and a built in niche, Sabaneta"
      ]
    },
    fotos: [
      { archivo: "sabaneta-las-lomitas-01-terraza-vista-nocturna.jpg",   alt: "Terraza amoblada con vista nocturna sobre el valle, apartamento en Las Lomitas, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-02-terraza-sala-exterior.jpg",    alt: "Sala exterior en la terraza con jardín vertical y la ciudad al fondo, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-03-sala-vista-ciudad.jpg",        alt: "Sala abierta a la terraza con la vista de la ciudad, Las Lomitas, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-04-sala-comedor.jpg",             alt: "Sala y comedor en un solo espacio con la cocina al fondo, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-05-comedor.jpg",                  alt: "Comedor con lámparas colgantes junto a la sala, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-06-sala-desde-balcon.jpg",        alt: "Sala, comedor y cocina vistos desde el balcón, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-07-terraza.jpg",                  alt: "Terraza cubierta con piso de baldosa decorada y baranda de vidrio, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-08-vista-atardecer.jpg",          alt: "Vista panorámica del valle al atardecer desde el piso 23, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-09-vista-nocturna.jpg",           alt: "Vista nocturna de la ciudad desde el apartamento, Las Lomitas, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-10-cocina.jpg",                   alt: "Cocina abierta con barra y estufa a gas, conectada a la terraza, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-11-alcoba-ventanal.jpg",          alt: "Alcoba con ventanal de piso a techo y vista a la ciudad, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-12-alcoba-madera.jpg",            alt: "Alcoba con pared en madera y cama con cajones, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-13-alcoba-salida-balcon.jpg",     alt: "Puertas de la alcoba hacia el balcón al atardecer, Sabaneta" },
      { archivo: "sabaneta-las-lomitas-14-bano.jpg",                     alt: "Baño con ducha en vidrio y nicho empotrado, Sabaneta" }
    ]
  },

  /* Nuevo ingreso del 16 de septiembre de 2026. Precio, unidad y ciudad los
     confirmo la propietaria; areas, alcobas, banos, estrato y amenidades salen
     del anuncio de Finca Raiz, codigo 192110031. Cual foto es cual no se
     dedujo de la fecha de descarga: esta emparejado por sha256 en el manifest
     del inmueble, en Inventario Activo.

     El titulo va sin el numero de la unidad y sin el nombre del proyecto,
     como manda la cabecera de este archivo, y ademas sin el sector. Es el
     unico del catalogo que no nombra su sector, y no lo nombra en ninguna
     parte: ni en el titulo, ni en zonaDetalle, ni en los alt, ni en la
     descripcion. Es una decision de Samuel del 16 de septiembre de 2026. El
     sector, la direccion exacta y el resto del dato interno viven en
     Inventario Activo, que no es publico.

     Quedan fuera del sitio a proposito el numero del parqueadero, la direccion
     exacta y el nombre de la propietaria. Identifican la unidad y a una
     persona, y este archivo lo sirve el navegador a cualquiera. Viven en
     Inventario Activo, que no es publico. */
  {
    slug: "civita-1944",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Apartamento Envigado",
    zona: "Envigado",
    zonaDetalle: "Envigado, Antioquia",
    precio: 620000000,
    premium: false,
    ficha: [
      ["Área construida", "62 m²"],
      ["Área privada", "55 m²"],
      ["Alcobas", "2"],
      ["Baños", "2"],
      ["Parqueadero", "1 privado + depósito"],
      ["Piso", "19"],
      ["Estrato", "4"],
      ["Administración", "$ 400.000 / mes"],
      ["Antigüedad", "Menos de 1 año"],
      ["Zonas comunes", "Piscina para adultos y niños, gimnasio, salón de yoga, coworking con sala de juntas, salón social con cocina gourmet, salón de videojuegos, cancha recreativa, parque infantil, pista de triciclos, lavandería comunal, peluquería de mascotas y portería 24 horas"]
    ],
    descripcion: [
      "Este costado de Envigado da sobre el límite con Sabaneta, en la Calle 50 Sur, y es de los pocos sitios donde se vive con el valle al frente sin quedar lejos del centro de Envigado ni de la Regional. Lo que distingue a este conjunto no es una amenidad suelta sino el paquete entero: piscina para adultos y niños, gimnasio, salón de yoga, una zona de coworking con sala de juntas, salón social con cocina gourmet, lavandería comunal y portería 24 horas. El coworking y la lavandería comunal no son habituales a este precio, y son los dos que más cambian el día a día de quien trabaja desde la casa.",
      "Son 62 m² construidos y 55 m² privados en el piso 19. Dos alcobas, dos baños, zona de ropas independiente, cocina integral con horno empotrado, un balcón que mira al valle y un espacio adicional que sirve de estudio o de alcoba auxiliar. Viene con parqueadero privado cubierto y depósito, y tiene menos de un año. Lo aceptamos porque lo declarado coincide con lo que muestran las fotos, tomadas con el apartamento desocupado, y porque a este precio lo corriente en el sector es un edificio con la mitad de estas zonas comunes. Las amenidades que no salen en las fotos, la cancha, el parque infantil, la pista de triciclos y la peluquería de mascotas, van declaradas por el anuncio y todavía no las hemos visto."
    ],
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui cae al
       espanol, asi que una foto nueva sin alt en ingles no rompe nada. */
    en: {
      titulo: "Apartment in Envigado",
      ficha: [
        ["Built area", "62 m²"],
        ["Private area", "55 m²"],
        ["Bedrooms", "2"],
        ["Bathrooms", "2"],
        ["Parking space", "1 private + storage room"],
        ["Floor", "19"],
        ["Socioeconomic stratum", "4"],
        ["HOA fee", "COP 400,000 / month"],
        ["Age", "Under 1 year"],
        ["Amenities", "Pool for adults and children, gym, yoga room, coworking area with meeting room, social room with gourmet kitchen, games room, sports court, playground, tricycle track, communal laundry, pet grooming and a 24 hour gatehouse"]
      ],
      descripcion: [
        "This side of Envigado runs along the border with Sabaneta, on Calle 50 Sur, and is one of the few places where you live with the valley in front of you without being far from the centre of Envigado or from the Regional. What sets this complex apart is not one amenity but the whole set: a pool for adults and children, a gym, a yoga room, a coworking area with a meeting room, a social room with a gourmet kitchen, a communal laundry and a 24 hour gatehouse. The coworking area and the communal laundry are unusual at this price, and they are the two that change daily life the most for someone who works from home.",
        "It has 62 m² built and 55 m² private on the 19th floor. Two bedrooms, two bathrooms, a separate laundry area, a fitted kitchen with a built in oven, a balcony looking over the valley and an extra room that works as a study or a spare bedroom. It comes with a private covered parking space and a storage room, and it is under a year old. We accepted it because what was declared matches what the photos show, taken with the apartment empty, and because at this price the norm in the sector is a building with half these common areas. The amenities that do not appear in the photos, the sports court, the playground, the tricycle track and the pet grooming, are declared by the listing and we have not seen them yet."
      ],
      /* Un alt por foto, en el mismo orden que fotos[]. */
      alts: [
        "Living and dining room with access to the balcony, apartment in Envigado",
        "Living room with a full height window and access to the balcony, Envigado",
        "Fitted kitchen in wood and grey with a built in oven, Envigado",
        "Close up of the kitchen countertop and gas hob, Envigado",
        "The kitchen seen from the living room, Envigado",
        "Main bedroom with a full height window and a view of the mountains, Envigado",
        "Main bedroom from the other angle, Envigado",
        "Wooden closet in the main bedroom, Envigado",
        "Second bedroom with a window, Envigado",
        "Open closet with wooden shelves and drawers, Envigado",
        "Extra room suited to a study or a spare bedroom, Envigado",
        "Main bathroom with a tiled shower and a wooden vanity unit, Envigado",
        "Second bathroom with a mosaic tiled shower, Envigado",
        "Separate laundry area, Envigado",
        "Entrance hall with laminate flooring, Envigado",
        "Balcony with an open view over the valley, Envigado",
        "Panoramic view from the building towards the mountains, Envigado",
        "Swimming pool of the complex, Envigado",
        "Pool area with a pergola, Envigado",
        "Social room with a gourmet kitchen and island, Envigado",
        "Social room from the other angle, Envigado",
        "Coworking area with work tables, Envigado",
        "Meeting room with full height windows, Envigado",
        "Equipped gym of the complex, Envigado",
        "Gym with cardio machines and a view outside, Envigado",
        "Yoga and multipurpose room, Envigado",
        "Terrace and pathways in the common areas, Envigado",
        "Communal laundry room of the building, Envigado",
        "Private covered parking space, Envigado",
        "Storage room included with the apartment, Envigado"
      ]
    },
    fotos: [
      { archivo: "civita-1944-01-sala-comedor.jpg",           alt: "Sala comedor con salida al balcón, apartamento en Envigado" },
      { archivo: "civita-1944-02-sala-balcon.jpg",            alt: "Sala con ventanal y acceso al balcón, Envigado" },
      { archivo: "civita-1944-03-cocina.jpg",                 alt: "Cocina integral en madera y gris con horno empotrado, Envigado" },
      { archivo: "civita-1944-04-cocina-detalle.jpg",         alt: "Detalle del mesón y la estufa a gas de la cocina, Envigado" },
      { archivo: "civita-1944-05-cocina-angulo.jpg",          alt: "Cocina vista desde la sala, Envigado" },
      { archivo: "civita-1944-06-alcoba-principal.jpg",       alt: "Alcoba principal con ventanal y vista a las montañas, Envigado" },
      { archivo: "civita-1944-07-alcoba-principal-vista.jpg", alt: "Alcoba principal desde el otro ángulo, Envigado" },
      { archivo: "civita-1944-08-closet-principal.jpg",       alt: "Clóset en madera de la alcoba principal, Envigado" },
      { archivo: "civita-1944-09-alcoba-secundaria.jpg",      alt: "Segunda alcoba con ventana, Envigado" },
      { archivo: "civita-1944-10-closet-alcoba.jpg",          alt: "Clóset abierto con entrepaños y cajones en madera, Envigado" },
      { archivo: "civita-1944-11-alcoba-estudio.jpg",         alt: "Espacio adicional apto para estudio o alcoba auxiliar, Envigado" },
      { archivo: "civita-1944-12-bano-principal.jpg",         alt: "Baño principal con ducha enchapada y mueble en madera, Envigado" },
      { archivo: "civita-1944-13-bano-social.jpg",            alt: "Segundo baño con ducha en mosaico, Envigado" },
      { archivo: "civita-1944-14-zona-ropas.jpg",             alt: "Zona de ropas independiente, Envigado" },
      { archivo: "civita-1944-15-hall-acceso.jpg",            alt: "Hall de acceso con piso laminado, Envigado" },
      { archivo: "civita-1944-16-balcon.jpg",                 alt: "Balcón con vista abierta al valle, Envigado" },
      { archivo: "civita-1944-17-vista-panoramica.jpg",       alt: "Vista panorámica desde el edificio hacia las montañas, Envigado" },
      { archivo: "civita-1944-18-piscina.jpg",                alt: "Piscina del conjunto, Envigado" },
      { archivo: "civita-1944-19-piscina-pergola.jpg",        alt: "Zona de piscina con pérgola, Envigado" },
      { archivo: "civita-1944-20-salon-social.jpg",           alt: "Salón social con cocina gourmet e isla, Envigado" },
      { archivo: "civita-1944-21-salon-social-2.jpg",         alt: "Salón social desde el otro ángulo, Envigado" },
      { archivo: "civita-1944-22-coworking.jpg",              alt: "Zona de coworking con mesas de trabajo, Envigado" },
      { archivo: "civita-1944-23-sala-juntas.jpg",            alt: "Sala de juntas con ventanales, Envigado" },
      { archivo: "civita-1944-24-gimnasio.jpg",               alt: "Gimnasio equipado del conjunto, Envigado" },
      { archivo: "civita-1944-25-gimnasio-2.jpg",             alt: "Gimnasio con máquinas cardiovasculares y vista al exterior, Envigado" },
      { archivo: "civita-1944-26-salon-yoga.jpg",             alt: "Salón de yoga y usos múltiples, Envigado" },
      { archivo: "civita-1944-27-terraza-comun.jpg",          alt: "Terraza y senderos de las zonas comunes, Envigado" },
      { archivo: "civita-1944-28-lavanderia-comunal.jpg",     alt: "Lavandería comunal del edificio, Envigado" },
      { archivo: "civita-1944-29-parqueadero.jpg",            alt: "Parqueadero privado cubierto, Envigado" },
      { archivo: "civita-1944-30-deposito.jpg",               alt: "Depósito o cuarto útil incluido, Envigado" }
    ]
  },

  {
    slug: "aluna-las-antillas",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    /* Este es el 1405. El numero ya no va en el titulo, por la decision que
       explica la regla EL TITULO del encabezado: el titulo nombra el lugar, no
       la unidad, asi que comparte nombre con el 1404 de aqui abajo.
       El slug NO se cambia: es la URL y ya se ha compartido por WhatsApp. */
    titulo: "Apartamento Envigado Las Antillas",
    zona: "Envigado",
    zonaDetalle: "Las Antillas, Envigado, Antioquia",
    /* Bajado de 475 a 455 millones el 9 de septiembre de 2026, por decisión
       del propietario. El 1404 se mantiene en 465. */
    precio: 455000000,
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
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui cae al
       espanol, asi que una foto nueva sin alt en ingles no rompe nada. */
    en: {
      titulo: "Apartment in Envigado, Las Antillas",
      ficha: [
        ["Built area", "67.5 m²"],
        ["Bedrooms", "2"],
        ["Bathrooms", "2"],
        ["Parking space", "1"],
        ["Storage room", "Yes"],
        ["Private area", "62.5 m²"],
        ["Floor", "14 of 14"],
        ["Socioeconomic stratum", "4"],
        ["HOA fee", "COP 545,000 / month"],
        ["Age", "1 to 8 years"],
        ["Property exchange", "Accepted"],
        ["Amenities", "Children's and adults' pools, gym, steam room, cinema room, bowling alley, BBQ terrace, playground, daycare, games room and rooftop viewpoint"]
      ],
      descripcion: [
        "Las Antillas sums up what people look for when they move to Envigado: close to Avenida El Poblado and to the shops and services, but with the mountain in front and the noise far away. The building sits in the upper part of the sector, and much of the value of this home is right there. The apartment occupies the top floor of the tower: panoramic views over the valley, floor to ceiling windows and natural light all day long.",
        "It has 67.5 m² built and 62.5 m² private, with two bedrooms, two bathrooms, a walk in closet, a storage room, a separate laundry area and a kitchen with an island open to the living and dining room. It comes with one parking space. We accepted it because what the owner declared matches what the photos from our visit show, taken with the apartment empty and untouched, and because a top floor with this view and this light is not common in the sector. The owner accepts a property exchange."
      ],
      /* Un alt por foto, en el mismo orden que fotos[]. */
      alts: [
        "Living and dining room with floor to ceiling windows and panoramic views, unit 1405 at Aluna, Las Antillas, Envigado",
        "Living room with floor to ceiling window opening onto the balcony, unit 1405 at Aluna, Las Antillas, Envigado",
        "Living and dining room facing the balcony, with the kitchen bar in front, unit 1405 at Aluna, Las Antillas, Envigado",
        "Open kitchen integrated into the living and dining room, unit 1405 at Aluna, Las Antillas, Envigado",
        "Kitchen with central island and white quartz countertop, unit 1405 at Aluna, Las Antillas, Envigado",
        "Kitchen with sink and island seen from the dining room, unit 1405 at Aluna, Las Antillas, Envigado",
        "Fitted kitchen with gas stove, oven and extractor hood, unit 1405 at Aluna, Las Antillas, Envigado",
        "Main bedroom with panoramic window and laminate flooring, unit 1405 at Aluna, Las Antillas, Envigado",
        "Sliding door closet with wooden shelving, unit 1405 at Aluna, Las Antillas, Envigado",
        "Walk in closet with shelving, drawers and hanging rail, unit 1405 at Aluna, Las Antillas, Envigado",
        "Main bathroom with tempered glass shower, window and vanity unit, unit 1405 at Aluna, Las Antillas, Envigado",
        "Second bedroom with large window and mountain views, unit 1405 at Aluna, Las Antillas, Envigado",
        "Second bedroom with access to the walk in closet, unit 1405 at Aluna, Las Antillas, Envigado",
        "Guest bathroom with sink, mirror and ceramic finishes, unit 1405 at Aluna, Las Antillas, Envigado",
        "Separate laundry area with wash basin and gas water heater, unit 1405 at Aluna, Las Antillas, Envigado",
        "Adults' pool at Aluna, Las Antillas, Envigado",
        "Children's pool with water features at Aluna, Las Antillas, Envigado",
        "Water playground next to the children's pool at Aluna, Las Antillas, Envigado",
        "Rooftop viewpoint terrace with benches and mountain views at Aluna, Las Antillas, Envigado",
        "Walkway along the viewpoint terrace with open views at Aluna, Las Antillas, Envigado",
        "BBQ terrace with gas grill at Aluna, Las Antillas, Envigado",
        "Social room with floor to ceiling windows at Aluna, Las Antillas, Envigado",
        "Games room with ping pong table at Aluna, Las Antillas, Envigado",
        "Bowling alley at Aluna, Las Antillas, Envigado",
        "Cinema room with reclining seats at Aluna, Las Antillas, Envigado",
        "Gym with machines and free weights at Aluna, Las Antillas, Envigado"
      ]
    },
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
    /* Este es el 1404, y comparte titulo con el 1405 de aqui arriba a
       proposito. Ver la regla EL TITULO del encabezado. */
    titulo: "Apartamento Envigado Las Antillas",
    zona: "Envigado",
    zonaDetalle: "Las Antillas, Envigado, Antioquia",
    precio: 465000000,
    premium: false,
    /* Administración estimada: la del 1405 más $10.000, como la calculó el
       cliente. Depende del área, así que hay que confirmarla con la propietaria
       antes de desplegar. Piso y estrato se deducen del edificio (mismo que el
       1405). La fila de Permuta no está porque todavía no hay dato: no se
       inventa ninguna.

       PENDIENTE: esta es la única ficha con la etiqueta "Área" a secas. No se
       sabe si los 69,5 m² son construidos o privados, y por eso no se puede
       comparar por metro cuadrado contra el 1405, que está al lado y hoy pide
       menos en total. Preguntárselo a la propietaria y renombrar la fila. */
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
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui cae al
       espanol, asi que una foto nueva sin alt en ingles no rompe nada. */
    en: {
      titulo: "Apartment in Envigado, Las Antillas",
      ficha: [
        ["Area", "69.5 m²"],
        ["Bedrooms", "2"],
        ["Bathrooms", "2"],
        ["Parking space", "1"],
        ["Storage room", "Yes"],
        ["Floor", "14 of 14"],
        ["Socioeconomic stratum", "4"],
        ["HOA fee", "COP 555,000 / month"],
        ["Age", "1 to 8 years"],
        ["Amenities", "Children's and adults' pools, gym, steam room, cinema room, bowling alley, BBQ terrace, playground, daycare, games room and rooftop viewpoint"]
      ],
      descripcion: [
        "In the upper part of Las Antillas, the side of Envigado that has the schools, the supermarkets and Avenida El Poblado a few minutes away, but without the congestion of the flat part of town. This apartment is on the 14th floor, the top one in the tower, with the balcony facing the hillside and nothing blocking the morning light.",
        "It has 69.5 m² with two bedrooms, two bathrooms, a storage room and a separate laundry area. The main bedroom reaches the bathroom through a walk through closet with shelving on both sides, and the kitchen, with a granite countertop, a movable island, an oven and a gas stove, opens onto the dining room, which leads out to the balcony. One parking space is included. It came to us through a referral from another owner in the same building. We accepted it because it is empty and untouched, exactly as the photos show, and because the area and the finishes hold up the asking price."
      ],
      /* Un alt por foto, en el mismo orden que fotos[]. */
      alts: [
        "Living and dining room with large window, kitchen bar and access to the balcony, unit 1404 at Aluna, Las Antillas, Envigado",
        "Living and dining room towards the kitchen and the balcony window, unit 1404 at Aluna, Las Antillas, Envigado",
        "Living and dining room seen lengthwise, unit 1404 at Aluna, Las Antillas, Envigado",
        "Balcony with hillside views from the 14th floor, unit 1404 at Aluna, Las Antillas, Envigado",
        "Kitchen with movable island, gas stove and oven, unit 1404 at Aluna, Las Antillas, Envigado",
        "Kitchen with granite countertop and sink under the window, unit 1404 at Aluna, Las Antillas, Envigado",
        "Main bedroom with laminate flooring and access to the walk in closet, unit 1404 at Aluna, Las Antillas, Envigado",
        "Main bedroom looking towards the walk in closet and the bathroom, unit 1404 at Aluna, Las Antillas, Envigado",
        "Walk through closet with shelving on both sides, unit 1404 at Aluna, Las Antillas, Envigado",
        "Walk in closet with shelving, drawers and hanging rail, unit 1404 at Aluna, Las Antillas, Envigado",
        "Main bathroom with tempered glass shower, mirror and vanity unit, unit 1404 at Aluna, Las Antillas, Envigado",
        "Second bedroom with sliding door closet and window, unit 1404 at Aluna, Las Antillas, Envigado",
        "Second bedroom with large window and mountain views, unit 1404 at Aluna, Las Antillas, Envigado",
        "Guest bathroom with tempered glass shower and window, unit 1404 at Aluna, Las Antillas, Envigado",
        "Separate laundry area with wash basin and gas water heater, unit 1404 at Aluna, Las Antillas, Envigado",
        "Adults' pool at Aluna, Las Antillas, Envigado",
        "Children's pool with water features at Aluna, Las Antillas, Envigado",
        "Water playground next to the children's pool at Aluna, Las Antillas, Envigado",
        "Rooftop viewpoint terrace with benches and mountain views at Aluna, Las Antillas, Envigado",
        "Walkway along the viewpoint terrace with open views at Aluna, Las Antillas, Envigado",
        "BBQ terrace with gas grill at Aluna, Las Antillas, Envigado",
        "Social room with floor to ceiling windows at Aluna, Las Antillas, Envigado",
        "Games room with ping pong table at Aluna, Las Antillas, Envigado",
        "Bowling alley at Aluna, Las Antillas, Envigado",
        "Cinema room with reclining seats at Aluna, Las Antillas, Envigado",
        "Gym with machines and free weights at Aluna, Las Antillas, Envigado"
      ]
    },
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
    titulo: "Apartamento Sabaneta Loma de San José",
    zona: "Sabaneta",
    zonaDetalle: "Loma de San José, Sabaneta, Antioquia",
    precio: 350000000,
    premium: false,
    /* Datos del anuncio de Finca Raíz, código 193795108, confirmados con la
       propietaria. El gimnasio lo confirmo ella despues. Siguen por fuera, sin
       confirmar, si esta remodelado y si acepta permuta: no se agregan filas
       sin dato. */
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
      ["Zonas comunes", "Piscina, gimnasio, placa deportiva, salón social, salón de juegos, juegos infantiles, zonas verdes y portería"]
    ],
    descripcion: [
      "La Loma de San José es de las zonas de Sabaneta donde todavía se vive con la ladera al frente sin quedar lejos de nada: el centro y la Avenida El Poblado están a pocos minutos. Lo que cambia el día a día aquí es el alimentador del Metro, que sube hasta la portería, así que se llega al sistema sin sacar el carro. El conjunto es cerrado y suma piscina, gimnasio, placa deportiva, salón social, salón de juegos, juegos infantiles y zonas verdes.",
      "Son 57 m² construidos y 53 m² privados en el piso 7. La sala comedor abre a la cocina integral por una barra estilo americano y termina en el balcón, que mira a la piscina y a la montaña. Tres habitaciones, dos baños enchapados de piso a techo, zona de ropas independiente, estufa y calentador a gas, piso en baldosa y un parqueadero privado. La tercera habitación sirve bien como estudio. Lo aceptamos porque lo declarado por la propietaria coincide con lo que muestran las fotos, tomadas con el apartamento desocupado, y porque tres habitaciones con parqueadero propio a este precio no es lo corriente en el sector."
    ],
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui cae al
       espanol, asi que una foto nueva sin alt en ingles no rompe nada. */
    en: {
      titulo: "Apartment in Sabaneta, Loma de San José",
      ficha: [
        ["Built area", "57 m²"],
        ["Bedrooms", "3"],
        ["Bathrooms", "2"],
        ["Parking space", "1 private"],
        ["Private area", "53 m²"],
        ["Floor", "7"],
        ["Socioeconomic stratum", "2"],
        ["HOA fee", "COP 313,000 / month"],
        ["Age", "1 to 8 years"],
        ["Amenities", "Pool, gym, sports court, social room, games room, playground, green areas and gated entrance"]
      ],
      descripcion: [
        "Loma de San José is one of those parts of Sabaneta where you still live with the hillside in front of you without being far from anything: the town centre and Avenida El Poblado are a few minutes away. What changes daily life here is the Metro feeder bus, which climbs all the way up to the gate, so you reach the system without taking the car out. The complex is gated and adds a pool, a gym, a sports court, a social room, a games room, a playground and green areas.",
        "It has 57 m² built and 53 m² private on the 7th floor. The living and dining room opens to the fitted kitchen through a breakfast bar and ends at the balcony, which looks onto the pool and the mountain. Three bedrooms, two bathrooms tiled floor to ceiling, a separate laundry area, a gas stove and water heater, tiled flooring and one private parking space. The third bedroom works well as a study. We accepted it because what the owner declared matches what the photos show, taken with the apartment empty, and because three bedrooms with a private parking space at this price is not the norm in the sector."
      ],
      /* Un alt por foto, en el mismo orden que fotos[]. */
      alts: [
        "Living and dining room with breakfast bar open to the kitchen and access to the balcony, apartment in Loma de San José, Sabaneta",
        "Living and dining room with tiled flooring and passage to the kitchen, apartment in Loma de San José, Sabaneta",
        "Fitted kitchen with gas stove, extractor hood and wall units, Loma de San José, Sabaneta",
        "Hallway leading to the bedrooms and back to the kitchen, Loma de San José, Sabaneta",
        "Bedroom with sliding door closet and tiled flooring, Loma de San José, Sabaneta",
        "Second bedroom with built in closet and access to the hallway, Loma de San José, Sabaneta",
        "Main bathroom with glass shower, dark floor to ceiling tiling and countertop basin, Loma de San José, Sabaneta",
        "Second bathroom with floor to ceiling tiled shower and vanity unit, Loma de San José, Sabaneta",
        "View from the balcony towards the other towers and the mountain, Loma de San José, Sabaneta",
        "View from the balcony towards the complex pool, Loma de San José, Sabaneta",
        "Separate laundry area with wash basin and gas water heater, Loma de San José, Sabaneta",
        "Complex pool between the towers, Loma de San José, Sabaneta",
        "Playground on artificial turf next to the hillside, Loma de San José, Sabaneta",
        "Sports court with goal and basketball hoops, Loma de San José, Sabaneta",
        "Open plan social room with windows onto the green areas, Loma de San José, Sabaneta",
        "Private covered parking space in the basement, Loma de San José, Sabaneta"
      ]
    },
    fotos: [
      { archivo: "loma-san-jose-01-sala-comedor-balcon.jpg", alt: "Sala comedor con barra estilo americano abierta a la cocina y salida al balcón, apartamento en Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-02-sala-comedor.jpg",     alt: "Sala comedor con piso en baldosa y paso a la cocina, apartamento en Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-03-cocina.jpg",           alt: "Cocina integral con estufa a gas, campana extractora y muebles aéreos, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-04-pasillo.jpg",          alt: "Pasillo que reparte a las alcobas y devuelve a la cocina, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-05-alcoba.jpg",           alt: "Alcoba con clóset de puertas corredizas y piso en baldosa, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-06-alcoba-2.jpg",         alt: "Segunda alcoba con clóset empotrado y salida al pasillo, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-07-bano-principal.jpg",   alt: "Baño principal con ducha en vidrio, enchape oscuro de piso a techo y lavamanos de sobreponer, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-08-bano-auxiliar.jpg",    alt: "Baño auxiliar con ducha enchapada de piso a techo y mueble bajo el lavamanos, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-09-vista-montana.jpg",    alt: "Vista desde el balcón hacia las torres de la unidad y la montaña, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-10-vista-piscina.jpg",    alt: "Vista desde el balcón hacia la piscina de la unidad, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-11-zona-ropas.jpg",       alt: "Zona de ropas independiente con lavadero y calentador a gas, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-12-piscina.jpg",          alt: "Piscina de la unidad entre las torres, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-13-juegos-infantiles.jpg", alt: "Juegos infantiles sobre grama sintética junto a la ladera, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-14-placa-deportiva.jpg",  alt: "Placa deportiva con arco y tableros de baloncesto, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-15-salon-social.jpg",     alt: "Salón social diáfano con ventanal hacia las zonas verdes, Loma de San José, Sabaneta" },
      { archivo: "loma-san-jose-16-parqueadero.jpg",      alt: "Parqueadero privado cubierto en el sótano, Loma de San José, Sabaneta" }
    ]
  },

  {
    slug: "ecoh-710-loma-san-jose",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Apartamento Sabaneta Loma de San José",
    zona: "Sabaneta",
    zonaDetalle: "Loma de San José, Sabaneta, Antioquia",
    precio: 540000000,
    premium: false,
    /* Apto 710 del proyecto Ecoh. Datos del anuncio de Finca Raíz, código
       193978538, y de las 57 fotos del propietario del 2 de septiembre de 2026.
       La dirección sale de la ficha del proyecto en Google Maps, que lo lista
       como "Ecoh | Apartamentos | Loma San José | Sabaneta".
       El parqueadero y el cuarto útil están marcados 99050, no 99060.
       Siguen por fuera, sin confirmar: si acepta permuta y si ya está listo
       para escriturar. No se agregan filas sin dato.

       Las primeras cuatro filas de esta lista son las que salen en el panel
       del precio, así que la dirección va después de Baños a propósito. */
    ficha: [
      ["Área construida", "66,93 m²"],
      ["Área privada", "59,98 m²"],
      ["Alcobas", "3"],
      ["Baños", "2"],
      ["Dirección", "Calle 77 Sur # 34-82"],
      ["Parqueadero", "1"],
      ["Cuarto útil", "Sí"],
      ["Piso", "7"],
      ["Estrato", "4"],
      ["Administración", "$ 491.000 / mes"],
      ["Antigüedad", "Menos de 1 año"],
      ["Zonas comunes", "Piscina en terraza, salón social con coworking y salón de eventos"]
    ],
    descripcion: [
      "La Loma de San José concentra hoy buena parte de la obra nueva de Sabaneta, y este proyecto está en la parte alta del sector: la montaña al frente, y el centro del municipio y la Avenida El Poblado a pocos minutos. Las zonas comunes ya están entregadas: piscina en terraza con vista a la montaña, salón social con coworking y salón de eventos de doble altura sobre el guadual.",
      "Son 66,93 m² construidos y 59,98 m² privados en el piso 7. La cocina, con isla en cuarzo, abre a la sala comedor, que termina en un balcón amplio con vista a la montaña. Tres alcobas, la principal con vestier y baño propio, dos baños con espejo circular retroiluminado, zona de ropas independiente, cuarto útil y un parqueadero, estos dos últimos en obra gris. Es un apartamento nuevo, con acabados listos y desocupado en las fotos. Lo aceptamos porque lo que muestran las fotos coincide con lo declarado y porque tres alcobas con estos acabados y esta vista no es lo corriente a este precio en el sector."
    ],
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui cae al
       espanol, asi que una foto nueva sin alt en ingles no rompe nada. */
    en: {
      titulo: "Apartment in Sabaneta, Loma de San José",
      ficha: [
        ["Built area", "66.93 m²"],
        ["Private area", "59.98 m²"],
        ["Bedrooms", "3"],
        ["Bathrooms", "2"],
        ["Address", "Calle 77 Sur # 34-82"],
        ["Parking space", "1"],
        ["Storage room", "Yes"],
        ["Floor", "7"],
        ["Socioeconomic stratum", "4"],
        ["HOA fee", "COP 491,000 / month"],
        ["Age", "Less than 1 year"],
        ["Amenities", "Rooftop pool, social room with coworking space and events hall"]
      ],
      descripcion: [
        "Loma de San José concentrates much of Sabaneta's new construction today, and this project sits in the upper part of the sector: the mountain in front, and the town centre and Avenida El Poblado a few minutes away. The shared amenities are already delivered: a rooftop pool with mountain views, a social room with a coworking space, and a double height events hall overlooking the bamboo grove.",
        "It has 66.93 m² built and 59.98 m² private on the 7th floor. The kitchen, with a quartz island, opens onto the living and dining room, which ends in a wide balcony with mountain views. Three bedrooms, the main one with a walk in closet and its own bathroom, two bathrooms with backlit round mirrors, a separate laundry area, a storage room and one parking space, the last two in bare concrete. It is a new apartment, with the finishes complete and empty in the photos. We accepted it because what the photos show matches what was declared, and because three bedrooms with these finishes and this view is not the norm at this price in the sector."
      ],
      /* Un alt por foto, en el mismo orden que fotos[]. */
      alts: [
        "Open kitchen with quartz island integrated into the living and dining room, unit 710 in Loma San José, Sabaneta",
        "Fitted kitchen with gas stove, oven, microwave and lighting under the wall units, unit 710 in Loma San José, Sabaneta",
        "Quartz kitchen countertop with sink, gas stove and built in oven, unit 710 in Loma San José, Sabaneta",
        "Living and dining room with corner window and laminate flooring, unit 710 in Loma San José, Sabaneta",
        "Living and dining room towards the window, with the mountain behind, unit 710 in Loma San José, Sabaneta",
        "Balcony with glass railing and mountain views, unit 710 in Loma San José, Sabaneta",
        "View from the balcony towards the rooftop pool and the mountain, unit 710 in Loma San José, Sabaneta",
        "View from the balcony towards the artificial turf pitch and the playground, unit 710 in Loma San José, Sabaneta",
        "View from the balcony towards the neighbouring towers and the trees on the hillside, unit 710 in Loma San José, Sabaneta",
        "Main bedroom with access to the walk in closet and its own bathroom, unit 710 in Loma San José, Sabaneta",
        "Main bedroom seen from the door, with the window at the back, unit 710 in Loma San José, Sabaneta",
        "Walk in closet with wooden shelving, drawers and hanging rails, unit 710 in Loma San José, Sabaneta",
        "Main bathroom with backlit round mirror, quartz countertop and wooden slats, unit 710 in Loma San José, Sabaneta",
        "Main bathroom shower tiled floor to ceiling, with a recessed niche, unit 710 in Loma San José, Sabaneta",
        "Second bedroom with sliding window and laminate flooring, unit 710 in Loma San José, Sabaneta",
        "Third bedroom seen from the door, with a sliding window, unit 710 in Loma San José, Sabaneta",
        "Third bedroom window overlooking the neighbouring towers, unit 710 in Loma San José, Sabaneta",
        "Guest bathroom with backlit round mirror and wooden slats, unit 710 in Loma San José, Sabaneta",
        "Separate laundry area with wash basin, gas water heater and electrical panel, unit 710 in Loma San José, Sabaneta",
        "Storage room in bare concrete, unit 710 in Loma San José, Sabaneta",
        "Covered parking space in bare concrete, unit 710 in Loma San José, Sabaneta",
        "Rooftop pool with mountain views in Loma San José, Sabaneta",
        "Pool terrace with sun loungers and mountain views in Loma San José, Sabaneta",
        "Social room with coworking tables and hanging chairs in Loma San José, Sabaneta",
        "Events hall with double height windows over the bamboo grove in Loma San José, Sabaneta",
        "Bar and kitchen of the events hall in Loma San José, Sabaneta"
      ]
    },
    fotos: [
      { archivo: "ecoh-710-01-cocina-isla.jpg",              alt: "Cocina abierta con isla en cuarzo integrada a la sala comedor, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-02-cocina-frontal.jpg",           alt: "Cocina integral con estufa a gas, horno, microondas y luz bajo los muebles aéreos, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-03-cocina-meson.jpg",             alt: "Mesón de la cocina en cuarzo con lavaplatos, estufa a gas y horno empotrado, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-04-sala-comedor.jpg",             alt: "Sala comedor con ventanal en esquina y piso laminado, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-05-sala-comedor-ventanal.jpg",    alt: "Sala comedor hacia el ventanal, con la montaña al fondo, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-06-balcon.jpg",                   alt: "Balcón con baranda en vidrio y vista a la montaña, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-07-vista-piscina.jpg",            alt: "Vista desde el balcón hacia la piscina en terraza y la montaña, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-08-vista-canchas.jpg",            alt: "Vista desde el balcón hacia la cancha sintética y los juegos infantiles del proyecto, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-09-vista-entorno.jpg",            alt: "Vista desde el balcón hacia las torres vecinas y la arborización de la loma, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-10-alcoba-principal.jpg",         alt: "Alcoba principal con acceso al vestier y al baño propio, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-11-alcoba-principal-ventana.jpg", alt: "Alcoba principal vista desde la puerta, con la ventana al fondo, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-12-vestier.jpg",                  alt: "Vestier con entrepaños en madera, cajones y barras para colgar, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-13-bano-principal.jpg",           alt: "Baño principal con espejo circular retroiluminado, mesón en cuarzo y lamas en madera, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-14-bano-principal-ducha.jpg",     alt: "Ducha del baño principal enchapada de piso a techo, con nicho, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-15-alcoba-2.jpg",                 alt: "Segunda alcoba con ventana corrediza y piso laminado, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-16-alcoba-3.jpg",                 alt: "Tercera alcoba vista desde la puerta, con ventana corrediza, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-17-alcoba-3-ventana.jpg",         alt: "Ventana de la tercera alcoba con vista a las torres vecinas, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-18-bano-social.jpg",              alt: "Baño social con espejo circular retroiluminado y lamas en madera, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-19-zona-ropas.jpg",               alt: "Zona de ropas independiente con lavadero, calentador a gas y tablero eléctrico, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-20-cuarto-util.jpg",              alt: "Cuarto útil en obra gris, apartamento 710 en Loma San José, Sabaneta" },
      { archivo: "ecoh-710-21-parqueadero.jpg",              alt: "Parqueadero cubierto en obra gris, apartamento 710 en Loma San José, Sabaneta" },

      { archivo: "ecoh-zonas-comunes/ecoh-zc-01-piscina.jpg",             alt: "Piscina en terraza con vista a la montaña en Loma San José, Sabaneta" },
      { archivo: "ecoh-zonas-comunes/ecoh-zc-02-piscina-terraza.jpg",     alt: "Terraza de la piscina con asoleadoras y vista a la montaña en Loma San José, Sabaneta" },
      { archivo: "ecoh-zonas-comunes/ecoh-zc-03-coworking.jpg",           alt: "Salón social con mesas de coworking y sillas colgantes en Loma San José, Sabaneta" },
      { archivo: "ecoh-zonas-comunes/ecoh-zc-04-salon-eventos.jpg",       alt: "Salón de eventos con ventanales de doble altura sobre el guadual en Loma San José, Sabaneta" },
      { archivo: "ecoh-zonas-comunes/ecoh-zc-05-salon-eventos-barra.jpg", alt: "Barra y cocina del salón de eventos en Loma San José, Sabaneta" }
    ]
  },

  {
    slug: "rio-secreto-sabaneta",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Apartamento Sabaneta Monteazul",
    zona: "Sabaneta",
    zonaDetalle: "Monteazul, Sabaneta, Antioquia",
    precio: 620000000,
    premium: false,
    /* Datos del informe de mercado del 9 de septiembre de 2026, hecho sobre 15
       comparables de Ancón Sur y Monteazul. El área privada no está declarada,
       así que no se publica esa fila.

       De las 39 fotos que envió el propietario se publicaron 19. Las 5 que
       quedaron fuera por no ser de este apartamento están apartadas en la
       carpeta del inmueble, en Inventario Activo.

       OJO: en el comedor y el balcón se ve el pendón de "SE VENDE" con un
       celular colgado en la baranda, y en la sala se alcanza a leer de lejos.
       Eso le da al comprador una vía directa por fuera de CINQ. Se publicaron
       así por decisión de Samuel el 9 de septiembre de 2026, sabiéndolo. Si el
       propietario quita el pendón, vale la pena rehacer esas tres. */
    ficha: [
      ["Área construida", "85 m²"],
      ["Alcobas", "3"],
      ["Baños", "3"],
      ["Parqueadero", "1 privado, 16 m²"],
      ["Estudio", "Independiente"],
      ["Cuarto útil", "4 m²"],
      ["Piso", "5"],
      ["Estrato", "4"],
      ["Administración", "$ 366.000 / mes"],
      ["Antigüedad", "1 a 8 años"],
      ["Zonas comunes", "Piscina, gimnasio, cancha sintética, minigolf, zona BBQ, juegos infantiles y plazoleta"]
    ],
    descripcion: [
      "Monteazul es de los sectores de Sabaneta donde la vida de conjunto pesa tanto como el apartamento: aquí la unidad tiene piscina con vista a la montaña, gimnasio equipado, cancha sintética, minigolf, zona de asados y plazoleta con juegos infantiles. El centro de Sabaneta y la Avenida El Poblado quedan a pocos minutos, y la administración es de $ 366.000, por debajo de lo que cobran la mayoría de las unidades comparables del sector.",
      "Son 85 m² en el piso 5, con tres alcobas, tres baños, estudio independiente con biblioteca, zona de ropas independiente, cuarto útil, balcón y parqueadero privado de 16 m². El apartamento está remodelado con un proyecto de diseño interior: la cocina se amplió y se integró a una barra circular en cuarzo, con muro texturizado y carpintería a la medida. Lo aceptamos porque, comparado metro a metro contra quince avisos del sector, queda por debajo de la mediana, y porque compite con acabados de diseño contra apartamentos entregados en obra gris."
    ],
    /* Lo que se lee en pantalla, en ingles. Lo que falte aqui cae al
       espanol, asi que una foto nueva sin alt en ingles no rompe nada. */
    en: {
      titulo: "Apartment in Sabaneta, Monteazul",
      ficha: [
        ["Built area", "85 m²"],
        ["Bedrooms", "3"],
        ["Bathrooms", "3"],
        ["Parking space", "1 private, 16 m²"],
        ["Study", "Separate"],
        ["Storage room", "4 m²"],
        ["Floor", "5"],
        ["Socioeconomic stratum", "4"],
        ["HOA fee", "COP 366,000 / month"],
        ["Age", "1 to 8 years"],
        ["Amenities", "Pool, gym, artificial turf football pitch, mini golf, BBQ area, playground and central plaza"]
      ],
      descripcion: [
        "Monteazul is one of the parts of Sabaneta where life in the complex counts as much as the apartment itself: here the development has a pool with mountain views, an equipped gym, an artificial turf football pitch, mini golf, a barbecue area and a central plaza with a playground. The centre of Sabaneta and Avenida El Poblado are a few minutes away, and the HOA fee is COP 366,000, below what most comparable complexes in the sector charge.",
        "It has 85 m² on the 5th floor, with three bedrooms, three bathrooms, a separate study with bookshelves, a separate laundry area, a storage room, a balcony and a private 16 m² parking space. The apartment has been renovated under an interior design project: the kitchen was extended and integrated into a circular quartz bar, with a textured wall and custom joinery. We accepted it because, compared square metre by square metre against fifteen listings in the sector, it comes in below the median, and because it competes with designer finishes against apartments delivered in bare concrete."
      ],
      /* Un alt por foto, en el mismo orden que fotos[]. */
      alts: [
        "Extended fitted kitchen with circular quartz bar, textured wall and custom joinery, Río Secreto, Monteazul, Sabaneta",
        "Living room with sliding window onto the balcony and white porcelain flooring, apartment at Río Secreto, Monteazul, Sabaneta",
        "Dining area with circular quartz bar, pendant light and textured wall, open to the balcony, Río Secreto, Monteazul, Sabaneta",
        "Balcony with table, views over the complex green areas and the mountain, Río Secreto, Monteazul, Sabaneta",
        "Separate study with bookshelves and custom desk, Río Secreto, Monteazul, Sabaneta",
        "Main bedroom with floor to ceiling wooden closet, Río Secreto, Monteazul, Sabaneta",
        "Second bedroom with laminate flooring, custom chest of drawers and window with blind, Río Secreto, Monteazul, Sabaneta",
        "Third bedroom with bunk bed, desk and custom drawer unit, Río Secreto, Monteazul, Sabaneta",
        "Bathroom with tempered glass shower, floor to ceiling tiling and full length mirror, Río Secreto, Monteazul, Sabaneta",
        "Separate laundry area with wash basin, gas water heater and tall cabinet, Río Secreto, Monteazul, Sabaneta",
        "Private covered parking space in the basement, Río Secreto, Monteazul, Sabaneta",
        "Complex pool with mountain views, Río Secreto, Monteazul, Sabaneta",
        "Pool terrace and children's pool, Río Secreto, Monteazul, Sabaneta",
        "Gym with treadmills, spinning bikes and multi station machine, Río Secreto, Monteazul, Sabaneta",
        "Artificial turf football pitch between the towers, Río Secreto, Monteazul, Sabaneta",
        "Mini golf on the terrace with mountain views, Río Secreto, Monteazul, Sabaneta",
        "Playground on artificial turf, Río Secreto, Monteazul, Sabaneta",
        "BBQ area with built in counter and gas grill, next to the playground, Río Secreto, Monteazul, Sabaneta",
        "Central plaza with gazebo and green areas, Río Secreto, Monteazul, Sabaneta"
      ]
    },
    fotos: [
      { archivo: "rio-secreto-01-cocina-barra.jpg",      alt: "Cocina integral ampliada con barra circular en cuarzo, muro texturizado y carpintería a la medida, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-02-sala.jpg",              alt: "Sala con ventanal corredizo al balcón y piso en porcelanato blanco, apartamento en Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-03-comedor-barra.jpg",     alt: "Comedor con barra circular en cuarzo, lámpara colgante y muro texturizado, abierto al balcón, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-04-balcon.jpg",            alt: "Balcón con mesa, vista a las zonas verdes de la unidad y a la montaña, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-05-estudio.jpg",           alt: "Estudio independiente con biblioteca y escritorio a la medida, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-06-alcoba-principal.jpg",  alt: "Alcoba principal con clóset en madera de piso a techo, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-07-alcoba-2.jpg",          alt: "Segunda alcoba con piso laminado, cómoda a la medida y ventana con persiana, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-08-alcoba-3.jpg",          alt: "Tercera alcoba con camarote, escritorio y cajonera a la medida, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-09-bano.jpg",              alt: "Baño con ducha en vidrio templado, enchape de piso a techo y espejo de cuerpo entero, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-10-zona-ropas.jpg",        alt: "Zona de ropas independiente con lavadero, calentador a gas y mueble alto, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-11-parqueadero.jpg",       alt: "Parqueadero privado cubierto en el sótano, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-12-piscina.jpg",           alt: "Piscina de la unidad con vista a la montaña, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-13-piscina-terraza.jpg",   alt: "Terraza de la piscina y piscina de niños, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-14-gimnasio.jpg",          alt: "Gimnasio con caminadoras, bicicletas de spinning y máquina multifuerza, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-15-cancha.jpg",            alt: "Cancha sintética de fútbol entre las torres, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-16-minigolf.jpg",          alt: "Minigolf en la terraza con vista a la montaña, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-17-juegos-infantiles.jpg", alt: "Juegos infantiles sobre grama sintética, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-18-zona-bbq.jpg",          alt: "Zona de asados con mesón en obra y parrilla a gas, junto al parque infantil, Río Secreto, Monteazul, Sabaneta" },
      { archivo: "rio-secreto-19-plazoleta.jpg",         alt: "Plazoleta central con gazebo y zonas verdes, Río Secreto, Monteazul, Sabaneta" }
    ]
  }

];
