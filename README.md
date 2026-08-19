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
├── ofrecer.html        Formulario de captación (conectado a Formspree)
├── privacidad.html     Política de privacidad
├── terminos.html       Términos de uso
└── assets/
    ├── css/styles.css  Estilos compartidos (tokens de marca, nav, footer)
    ├── js/site.js      JS compartido (nav al hacer scroll)
    └── img/            Fotografía real de CINQ
```

El objetivo de esta versión es **captar inventario**: todos los caminos del sitio terminan en el formulario de Ofrecer, que es lo que alimenta el catálogo y el portafolio.

## Portafolio: en pausa hasta tener oportunidades reales

`portafolio.html` y `oportunidad.html` se sacaron del sitio publicado porque su contenido era de ejemplo (precios `$ XXX.XXX.XXX`, fotos simuladas). Están guardados en `Web/_pendiente-portafolio/` y **no se despliegan**.

Para reactivar el portafolio cuando haya al menos 3 o 4 oportunidades reales:

1. Devolver ambos archivos a `sitio/`.
2. Reemplazar cada tarjeta de ejemplo por una oportunidad real, con su foto y su precio verdadero.
3. Duplicar `oportunidad.html` por cada oportunidad (por ejemplo `apartamento-envigado-01.html`) y quitar el aviso de "página de ejemplo" del inicio del archivo.
4. Sustituir los `<canvas data-tex="...">` por `<img>` reales. El contenedor `.frame` ya acepta imágenes sin tocar el CSS; los estilos de tarjeta (`.p-card`, `.p-tag`, `.p-meta`) siguen en `styles.css` esperando.
5. Volver a poner el enlace `Portafolio` en el menú y en el footer de todas las páginas.

Nota: el generador de texturas que dibujaba las fotos falsas se eliminó de `site.js`, así que esos `<canvas>` quedarán en blanco hasta que se reemplacen por fotos reales.

## Pendiente antes de operar con clientes reales

1. **Revisar `privacidad.html` y `terminos.html` con un abogado.** Los avisos de "borrador de trabajo" se quitaron de ambas páginas por decisión de marca, pero los textos siguen sin revisión legal.
2. **Registrar el dominio `cinqgroup.co`** y conectarlo en Vercel (Settings → Domains).
3. **Ampliar el banco fotográfico propio.** Hoy el sitio se sostiene con una sola fotografía (la del sticker en el vehículo). `vehiculo-interior.jpg` sigue disponible en `assets/img/` por si se quiere reutilizar.

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
