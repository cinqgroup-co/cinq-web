# -*- coding: utf-8 -*-
"""Ficha de una oportunidad con su vista previa propia: /o/<slug>.

oportunidad.html se arma con JavaScript, y WhatsApp, Instagram y Google leen
la pagina sin ejecutarlo: al compartir una ficha, la vista previa salia con el
logo y un titulo generico. Esta funcion entrega la misma oportunidad.html,
pero con el titulo, la descripcion, la foto y el precio de esa oportunidad ya
escritos en las etiquetas que leen esos servicios. Lo demas lo sigue dibujando
site.js, que en /o/<slug> lee el slug de la direccion.

Lee la plantilla y el catalogo del propio sitio, asi que no hay nada que
regenerar cuando cambia una oportunidad: basta con publicar el catalogo.

    GET /o/<slug>                  (vercel.json lo reescribe a /api/ficha?id=)
    GET /o/<slug>?lang=en          las etiquetas en ingles
    GET /sitemap-oportunidades.xml (vercel.json lo reescribe a /api/ficha?mapa=1)

Solo libreria estandar, como el bot de WhatsApp.
"""
import html
import json
import re
import time
import urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

CACHE_SEGUNDOS = 300
_cache = {}
AFUERA = ("Dubái", "Abu Dabi")
VOCES = {"Dubái": "Dubai", "Abu Dabi": "Abu Dhabi"}


def traer(url):
    ahora = time.time()
    if url in _cache and ahora - _cache[url][0] < CACHE_SEGUNDOS:
        return _cache[url][1]
    with urllib.request.urlopen(url, timeout=8) as r:
        texto = r.read().decode("utf-8")
    _cache[url] = (ahora, texto)
    return texto


def js_a_json(texto):
    """El array CINQ_OPORTUNIDADES a JSON. Es la misma conversion del bot
    (api/whatsapp.py): llaves sin comillas, comentarios y comas colgantes.
    Va copiada y no importada porque Vercel empaqueta cada funcion aparte."""
    i = texto.index("[", texto.index("CINQ_OPORTUNIDADES"))
    salida, dentro, escapado, prof = [], False, False, 0
    while i < len(texto):
        c = texto[i]
        if dentro:
            salida.append(c)
            if escapado:
                escapado = False
            elif c == "\\":
                escapado = True
            elif c == '"':
                dentro = False
            i += 1
            continue
        if c == '"':
            dentro = True
            salida.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < len(texto) and texto[i + 1] in "*/":
            if texto[i + 1] == "*":
                i = texto.index("*/", i + 2) + 2
            else:
                fin = texto.find("\n", i)
                i = len(texto) if fin == -1 else fin
            continue
        if c == "[":
            prof += 1
        elif c == "]":
            prof -= 1
            salida.append(c)
            if prof == 0:
                break
            i += 1
            continue
        salida.append(c)
        i += 1
    crudo = "".join(salida)
    crudo = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)', r'\1"\2"\3', crudo)
    crudo = re.sub(r',(\s*[}\]])', r'\1', crudo)
    return json.loads(crudo)


def campo(op, nombre, ingles):
    if ingles and op.get("en", {}).get(nombre):
        return op["en"][nombre]
    return op.get(nombre)


def precio(op, ingles):
    """Igual que precio() de site.js."""
    v = op.get("precio")
    if not isinstance(v, (int, float)):
        return "Price on request" if ingles else "Precio a consultar"
    cifra = "{:,}".format(int(v))
    if not ingles:
        cifra = cifra.replace(",", ".")
    moneda = op.get("moneda") or "COP"
    texto = "%s %s" % (moneda, cifra) if moneda != "COP" else ("COP " + cifra if ingles else "$ " + cifra)
    if op.get("desde"):
        texto = ("From " if ingles else "Desde ") + texto
    return texto


def foto(op, base):
    fotos = op.get("fotos") or []
    if not fotos:
        return base + "/assets/img/og-cinq-2.jpg", None
    f = fotos[0]
    archivo = f if isinstance(f, str) else f.get("archivo")
    alt = None if isinstance(f, str) else f.get("alt")
    ruta = archivo if "/" in archivo else op["slug"] + "/" + archivo
    return base + "/assets/img/portafolio/" + ruta, alt


def zona(op, ingles):
    z = op.get("zonaDetalle") or op.get("zona") or ""
    if ingles and op.get("zona") in VOCES:
        z = z.replace(op["zona"], VOCES[op["zona"]])
    return z


def poner(plantilla, patron, valor):
    return re.sub(patron, lambda m: m.group(1) + html.escape(valor, quote=True) + m.group(2), plantilla, count=1)


def pagina(base, slug, ingles):
    plantilla = traer(base + "/oportunidad.html")
    ops = js_a_json(traer(base + "/assets/js/oportunidades.js"))
    op = next((o for o in ops if o.get("slug") == slug), None)
    # Las rutas de la plantilla son relativas; en /o/<slug> tienen que
    # partir de la raiz del sitio.
    plantilla = plantilla.replace("<head>", '<head>\n<base href="/">', 1)
    if not op:
        return 404, plantilla
    titulo = campo(op, "titulo", ingles) or "CINQ"
    lugar = zona(op, ingles)
    valor = precio(op, ingles)
    desc = (campo(op, "descripcion", ingles) or [""])[0]
    resumen = "%s. %s. %s" % (lugar, valor, desc)
    if len(resumen) > 190:
        resumen = resumen[:187].rsplit(" ", 1)[0] + "..."
    url = "%s/o/%s%s" % (base, slug, "?lang=en" if ingles else "")
    imagen, alt = foto(op, base)
    if ingles:
        alts = op.get("en", {}).get("alts") or []
        alt = alts[0] if alts else alt
    p = plantilla
    p = poner(p, r'(<title[^>]*>)[^<]*(</title>)', "%s | CINQ" % titulo)
    p = poner(p, r'(<meta name="description" content=")[^"]*(")', resumen)
    p = poner(p, r'(<link rel="canonical" href=")[^"]*(")', "%s/o/%s" % (base, slug))
    # La version en ingles es la misma direccion con ?lang=en.
    propia = "%s/o/%s" % (base, html.escape(slug, quote=True))
    p = re.sub(r'(<link rel="canonical"[^>]*>)', lambda m: m.group(1) +
               '\n<link rel="alternate" hreflang="es" href="%s">'
               '\n<link rel="alternate" hreflang="en" href="%s?lang=en">'
               '\n<link rel="alternate" hreflang="x-default" href="%s">' % (propia, propia, propia), p, count=1)
    p = poner(p, r'(<meta property="og:url" content=")[^"]*(")', url)
    p = poner(p, r'(<meta property="og:title" content=")[^"]*(")', "%s · %s" % (titulo, valor))
    p = poner(p, r'(<meta property="og:description" content=")[^"]*(")', resumen)
    p = poner(p, r'(<meta property="og:image" content=")[^"]*(")', imagen)
    p = poner(p, r'(<meta property="og:image:alt" content=")[^"]*(")', alt or titulo)
    p = re.sub(r'<meta property="og:image:(width|height)"[^>]*>\n?', "", p)
    if ingles:
        p = p.replace('<meta property="og:locale" content="es_CO">', '<meta property="og:locale" content="en_US">', 1)
    return 200, p


def mapa(base):
    ops = js_a_json(traer(base + "/assets/js/oportunidades.js"))
    filas = ["<url><loc>%s/o/%s</loc><priority>0.6</priority></url>" % (base, html.escape(o["slug"]))
             for o in ops if o.get("slug")]
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(filas) + "\n</urlset>\n")


class handler(BaseHTTPRequestHandler):

    def _responder(self, codigo, cuerpo, tipo):
        datos = cuerpo.encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(datos)))
        self.send_header("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400")
        self.end_headers()
        self.wfile.write(datos)

    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        base = "https://" + (self.headers.get("x-forwarded-host") or self.headers.get("host") or "cinq-web.vercel.app")
        try:
            if q.get("mapa"):
                return self._responder(200, mapa(base), "application/xml; charset=utf-8")
            slug = (q.get("id") or [""])[0]
            ingles = (q.get("lang") or [""])[0] == "en"
            codigo, cuerpo = pagina(base, slug, ingles)
            return self._responder(codigo, cuerpo, "text/html; charset=utf-8")
        except Exception:
            # Si algo falla, que la ficha abra igual: la ficha de siempre,
            # que se dibuja con JavaScript.
            destino = "/oportunidad.html?id=" + html.escape((q.get("id") or [""])[0], quote=True)
            cuerpo = '<!doctype html><meta http-equiv="refresh" content="0;url=%s"><a href="%s">CINQ</a>' % (destino, destino)
            return self._responder(200, cuerpo, "text/html; charset=utf-8")

    def log_message(self, *args):
        pass
