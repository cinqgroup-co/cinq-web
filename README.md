# CINQ | sitio web

Sitio estático (HTML + CSS + JS, sin build ni Node.js). No necesita ningún proceso de instalación: abrir cualquier `.html` directamente en el navegador ya funciona.

**Despliegue:** conectado a Vercel vía GitHub (`cinqgroup-co/cinq-web`, rama `main`). Cada push a `main` dispara un despliegue nuevo automáticamente.

**URL pública:** https://cinq-web.vercel.app

## Regla del sitio: nada simulado

El sitio publica **únicamente contenido real**. No hay fotos de relleno, precios de ejemplo ni oportunidades inventadas. Una sección solo entra al sitio cuando existe el contenido que la sustenta. Si algo no está listo, no se publica a medias: se deja fuera hasta que lo esté.

## Estructura

```
sitio/
├── index.html          Home
├── nosotros.html       Nosotros
├── portafolio.html     Grilla del portafolio (se dibuja desde oportunidades.js)
├── oportunidad.html    Ficha de detalle (una sola, recibe ?id=<slug>)
├── ofrecer.html        Formulario de captación (conectado a Formspree)
├── privacidad.html     Política de privacidad
├── terminos.html       Términos de uso
└── assets/
    ├── css/styles.css  Estilos compartidos (tokens de marca, nav, footer)
    ├── js/site.js      JS compartido (nav + render del portafolio)
    ├── js/oportunidades.js   Catálogo: el único archivo que se toca para sumar inventario
    └── img/            Fotografía real de CINQ
        └── portafolio/<slug>/   Fotos de cada oportunidad
```

El objetivo sigue siendo **captar inventario**: todos los caminos del sitio terminan en el formulario de Ofrecer, que es lo que alimenta el catálogo y el portafolio.

## Portafolio: cómo sumar una oportunidad

El portafolio se dibuja solo a partir de **un único archivo de datos**: `assets/js/oportunidades.js`.
No hay que editar HTML para publicar, editar o retirar una oportunidad.

Para sumar una:

1. Crea la carpeta `assets/img/portafolio/<slug>/` y mete ahí las fotos (mínimo 8 para propiedad,
   6 para vehículo, luz natural: el estándar de admisión del Brief Maestro). Cada foto va dos veces,
   `.jpg` y `.webp` con el mismo nombre; el sitio sirve el WebP y deja el JPG de respaldo.
2. Copia el bloque `PLANTILLA` que está comentado al inicio de `assets/js/oportunidades.js`,
   llénalo y añádelo al array `CINQ_OPORTUNIDADES`.
3. `git push` — Vercel despliega solo.

La primera foto del array es la portada de la tarjeta. El `slug` es la URL:
`oportunidad.html?id=<slug>`.

**Fotos compartidas entre dos fichas.** Cuando hay más de un apartamento en venta en el mismo
edificio, las zonas comunes son las mismas y no tiene sentido guardarlas dos veces. Si el
`archivo` trae una barra, se busca en esa ruta colgando de `assets/img/portafolio/` en lugar de en
la carpeta de la oportunidad:

```
{ archivo: "aluna-zonas-comunes/aluna-zc-01-piscina-adultos.jpg", alt: "Piscina de adultos..." }
```

Así lo hacen hoy las fichas del 1405 y el 1404 de Aluna: 11 fotos de zonas comunes, un solo
archivo de cada una, citadas desde las dos fichas. El `alt` sí se escribe en cada ficha.

Cada foto se escribe como `{ archivo: "nombre.jpg", alt: "qué se ve" }`. El `alt` no es opcional:
es lo que lee un lector de pantalla, lo que se ve si la imagen no carga, y lo que Google indexa.

**Optimizar las fotos.** No hay build ni dependencias de Node. El script
`herramientas/optimizar-fotos.py` (Python + Pillow, lo único que hay que tener instalado) toma una
carpeta de fotos, las ordena por fecha de descarga, las renombra con la lista que se le pase y
genera el par JPG + WebP a máximo 1920 px de lado largo y calidad 82:

```
python herramientas/optimizar-fotos.py ORIGEN SLUG nombres.txt --patron "*.jpeg"
```

Para retirar una oportunidad vendida, basta con borrar su bloque del array: desaparece de la
grilla, y su ficha muestra "esa oportunidad ya no está en el portafolio" sin romper enlaces
compartidos por WhatsApp.

**Por qué así y no un HTML por propiedad:** el plan es sumar inventario rápido. Con un archivo de
datos, agregar la oportunidad número 8 cuesta lo mismo que la número 2. La contrapartida es que
las fichas no tienen URL estática propia (van con `?id=`), lo cual es aceptable porque el canal
de conversión real es WhatsApp, no la búsqueda orgánica.

**Filtro por ubicación:** la grilla tiene una barra de botones con los municipios del catálogo.
Los botones se dibujan solos a partir del campo `zona` de cada oportunidad, con el conteo al lado,
así que al publicar en un municipio nuevo su botón aparece sin tocar código. La barra se esconde
sola si todo el portafolio está en la misma zona, porque ahí filtrar no filtra nada.

`portafolio.html?zona=Sabaneta` abre la grilla ya filtrada, que sirve para mandarle a alguien solo
lo de un municipio. Los demás filtros que hubo alguna vez (Tipo / Operación / Precio) siguen
fuera: con este volumen no aportan. La grilla es `auto-fill`, así que se acomoda sola a cualquier
cantidad de tarjetas.

**Regla del sitio, que sigue en pie:** nada simulado. Si no hay foto propia y precio real,
la oportunidad no se agrega al array.

## Pendiente antes de operar con clientes reales

1. **Revisar `privacidad.html` y `terminos.html` con un abogado.** Los avisos de "borrador de trabajo" se quitaron de ambas páginas por decisión de marca, pero los textos siguen sin revisión legal.
2. **Registrar el dominio `cinqgroup.co`** y conectarlo en Vercel (Settings → Domains).
3. **Ampliar el banco fotográfico propio.** Además del sticker en el vehículo, el sitio ya tiene 16 fotos del apartamento 1405 de Aluna, 15 del 1404 y 11 de las zonas comunes del edificio. `vehiculo-interior.jpg` sigue disponible en `assets/img/` por si se quiere reutilizar.

## Formulario de Ofrecer

Conectado a Formspree (`https://formspree.io/f/xnpaneoz`). El plan gratuito de Formspree no permite adjuntar archivos, así que el formulario no pide fotos directamente: le avisa a quien lo llena que se las pediremos por WhatsApp después.

Cada envío llega por correo a `hellocinqgroup@gmail.com` y también queda guardado en el panel de Formspree (pestaña "Submissions"), exportable a CSV.

## Cómo desplegarlo (sin necesitar Node.js ni instalar nada)

**Opción más rápida, Netlify Drop:**
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta `sitio/` completa.
3. En segundos tienes una URL pública. Crea una cuenta gratuita para poder actualizarla después y conectar el dominio propio.

**Opción con historial de versiones, Vercel o Netlify + GitHub (la que se usó aquí):**
1. Crea un repositorio en GitHub y sube esta carpeta (`git remote add origin ...` y `git push`).
2. Conecta ese repositorio desde vercel.com o netlify.com (cuenta gratuita); detectan que es un sitio estático automáticamente, sin configuración.
3. Cada vez que hagas `git push`, el sitio se actualiza solo.

Ambas opciones son gratuitas para este volumen de tráfico y no requieren Node.js instalado localmente: el sitio ya es HTML/CSS/JS puro.

## Por qué no se usó un framework (Next.js, etc.)

Este equipo no tiene Node.js instalado, y un framework moderno lo necesita para desarrollarse y probarse localmente. Un sitio estático hecho a mano evita esa barrera por completo: se edita, se abre en el navegador, y se despliega, sin instalar nada. Si más adelante el sitio crece (inventario grande, cuentas de usuario, panel de administración), ahí sí vale la pena migrar a un framework con backend real.
