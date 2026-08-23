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

   PLANTILLA (vehículo): igual, pero tipo "Vehículo" y la ficha con
   ["Año","2025"], ["Kilometraje","2.200 km"], ["Documentos","SOAT y tecnomecánica vigentes"].
*/

var CINQ_OPORTUNIDADES = [

  {
    slug: "aluna-las-antillas",
    tipo: "Propiedad",
    subtipo: "Apartamento",
    operacion: "Venta",
    titulo: "Apartamento, Aluna",
    zona: "Envigado",
    zonaDetalle: "Las Antillas, Envigado, Antioquia",
    precio: 475000000,
    premium: false,
    ficha: [
      ["Área construida", "67,5 m²"],
      ["Alcobas", "2"],
      ["Baños", "2"],
      ["Parqueadero", "1"],
      ["Área privada", "62,5 m²"],
      ["Piso", "14 de 14"],
      ["Estrato", "4"],
      ["Administración", "$ 545.000 / mes"],
      ["Antigüedad", "1 a 8 años"],
      ["Permuta", "Se acepta"],
      ["Zonas comunes", "Piscina, gimnasio, sala de cine, pista de bolos, terraza BBQ, parque infantil, guardería, salón de juegos y terraza mirador"]
    ],
    descripcion: [
      "Las Antillas resume bien lo que busca quien se muda a Envigado: cerca de la Avenida El Poblado y de la zona de servicios, pero con la montaña al frente y el ruido lejos. Aluna Apartamentos está en la parte alta del sector, y ahí está buena parte del valor de este inmueble. El apartamento ocupa el último piso de la torre: vista panorámica sobre el valle, ventanales de piso a techo y luz natural durante todo el día.",
      "Son 67,5 m² construidos y 62,5 m² privados, con dos alcobas, dos baños, vestier, zona de ropas independiente y una cocina con isla abierta a la sala comedor. Viene con un parqueadero, y el edificio suma piscina, gimnasio, sala de cine, terraza BBQ y terraza mirador. Lo aceptamos porque lo declarado por el propietario coincide con lo que muestran las fotos de la visita, hechas con el apartamento desocupado, y porque un último piso con esta vista y esta iluminación no abunda en el sector. El propietario acepta permuta."
    ],
    fotos: [
      { archivo: "aluna-01-sala-comedor.jpg",     alt: "Sala comedor amplia con ventanales y vista, apartamento en Aluna, Las Antillas Envigado" },
      { archivo: "aluna-02-sala-balcon.jpg",      alt: "Sala con ventanal de piso a techo y salida al balcón" },
      { archivo: "aluna-03-balcon-vista.jpg",     alt: "Balcón con vista panorámica a Envigado desde el piso 14" },
      { archivo: "aluna-04-sala-cocina.jpg",      alt: "Cocina abierta integrada a la sala comedor" },
      { archivo: "aluna-05-cocina-isla.jpg",      alt: "Cocina con isla central y mesón en cuarzo blanco" },
      { archivo: "aluna-06-cocina-frontal.jpg",   alt: "Cocina integral con estufa a gas, horno y campana extractora" },
      { archivo: "aluna-07-alcoba-principal.jpg", alt: "Alcoba principal con ventana panorámica y piso laminado" },
      { archivo: "aluna-08-closet.jpg",           alt: "Closet de puertas corredizas con entrepaños en madera" },
      { archivo: "aluna-09-vestier.jpg",          alt: "Vestier con entrepaños, cajones y barra para colgar" },
      { archivo: "aluna-10-bano-principal.jpg",   alt: "Baño principal con ducha en vidrio templado y mueble de lavamanos" },
      { archivo: "aluna-11-alcoba-2.jpg",         alt: "Segunda alcoba con ventanal y vista a la montaña" },
      { archivo: "aluna-12-alcoba-2-vestier.jpg", alt: "Segunda alcoba con acceso a vestier" },
      { archivo: "aluna-13-bano-social.jpg",      alt: "Baño social con lavamanos, espejo y acabados en cerámica" },
      { archivo: "aluna-14-zona-ropas.jpg",       alt: "Zona de ropas independiente con lavadero y calentador a gas" }
    ]
  }

];
