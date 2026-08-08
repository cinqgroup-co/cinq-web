# CINQ | sitio web

Sitio estático (HTML + CSS + JS, sin build ni Node.js) con las 5 páginas del sitio de CINQ. No necesita ningún proceso de instalación: abrir cualquier `.html` directamente en el navegador ya funciona.

**Despliegue:** conectado a Vercel vía GitHub (`cinqgroup-co/cinq-web`, rama `main`). Cada push a `main` dispara un despliegue nuevo automáticamente.

**URL pública:** https://cinq-web.vercel.app

## Estructura

```
sitio/
├── index.html          Home
├── portafolio.html      Portafolio (con filtros funcionales)
├── oportunidad.html     Detalle de oportunidad, plantilla de ejemplo
├── nosotros.html        Nosotros
├── ofrecer.html          Formulario de captación (conectado a Formspree)
├── privacidad.html       Política de privacidad
├── terminos.html         Términos de uso
└── assets/
    ├── css/styles.css    Estilos compartidos (tokens de marca, nav, footer)
    ├── js/site.js        JS compartido (nav al hacer scroll, texturas de fotos)
    └── img/               Fotografía real de CINQ
```

## Pendiente antes de publicar con clientes reales

1. **Publicar una sola oportunidad real** duplicando `oportunidad.html` (por ejemplo `apartamento-envigado-01.html`) y enlazándola desde `portafolio.html` e `index.html` en vez del archivo de ejemplo.
2. **Reemplazar los placeholders de foto** (los `<canvas data-tex="...">` con textura de gradiente) por `<img>` reales a medida que haya banco fotográfico propio. La estructura `.frame` ya acepta ambos sin tocar el CSS.
3. **Revisar `privacidad.html` y `terminos.html` con un abogado** antes de operar con clientes reales. Quedan marcadas como borrador de trabajo.
4. **Registrar el dominio `cinqgroup.co`** y conectarlo en Vercel (Settings → Domains).

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
