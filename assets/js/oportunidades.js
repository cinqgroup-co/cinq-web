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
     fotos: ["p14-01-fachada.jpg", "p14-02-sala.jpg"]   // la primera es la portada
   }

   PLANTILLA (vehículo): igual, pero tipo "Vehículo" y la ficha con
   ["Año","2025"], ["Kilometraje","2.200 km"], ["Documentos","SOAT y tecnomecánica vigentes"].
*/

var CINQ_OPORTUNIDADES = [
];
