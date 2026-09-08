# -*- coding: utf-8 -*-
"""Publica una oportunidad en el portafolio de CINQ, de las fotos al sitio.

Automatiza lo que se hacia a mano: revisar las fotos, detectar repetidas,
renombrarlas en orden de galeria, optimizarlas, escribir los alt y meter el
bloque en oportunidades.js. Solo Pillow, que ya esta instalado.

    python herramientas/oportunidad.py contactos CARPETA
        Recorre la carpeta, arma una hoja de contactos HTML con todas las
        miniaturas numeradas y marca las parejas casi identicas. Se abre en el
        navegador y se decide cuales entran.

    python herramientas/oportunidad.py plantilla SLUG
        Escribe un datos.json de ejemplo con todos los campos que pide la
        ficha, para llenarlo con lo verificado.

    python herramientas/oportunidad.py publicar CARPETA datos.json
        Optimiza las fotos del orden, las deja en assets/img/portafolio/SLUG/
        con nombres correctos y agrega el bloque a oportunidades.js.

    python herramientas/oportunidad.py verificar
        Revisa TODO el portafolio publicado: que cada foto exista en jpg y
        webp, que ninguna quede sin alt, que no se cuelen guiones medios y que
        no haya slugs repetidos. Correr antes de cada push.

REGLA DEL SITIO: nada simulado. El script no inventa datos: lo que no este en
el datos.json no sale publicado.
"""
import argparse
import glob
import json
import os
import re
import shutil
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTAFOLIO = os.path.join(RAIZ, "assets", "img", "portafolio")
CATALOGO = os.path.join(RAIZ, "assets", "js", "oportunidades.js")
MAX_LADO = 1920
CALIDAD = 82

# La consola de Windows llega en cp1252 y los nombres traen tildes. Se
# reconfigura en vez de envolver sys.stdout: envolverlo cierra el anterior y
# rompe a quien importe este modulo, por ejemplo una prueba.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------

def fotos_de(carpeta):
    encontradas = []
    for patron in ("*.jpg", "*.jpeg", "*.JPG", "*.JPEG"):
        encontradas += glob.glob(os.path.join(carpeta, "**", patron),
                                 recursive=True)
    return sorted(set(encontradas))


def dhash(ruta, lado=16):
    """Huella perceptual. Dos fotos casi iguales dan huellas casi iguales."""
    im = Image.open(ruta).convert("L").resize((lado + 1, lado), Image.LANCZOS)
    px = list(im.getdata())
    bits = 0
    for y in range(lado):
        fila = px[y * (lado + 1):(y + 1) * (lado + 1)]
        for x in range(lado):
            bits = (bits << 1) | (1 if fila[x] > fila[x + 1] else 0)
    return bits


def distancia(a, b):
    return bin(a ^ b).count("1")


def titulo_espacio(espacio):
    """'sala-comedor' -> 'Sala comedor'. Es el arranque del alt."""
    limpio = espacio.replace("-", " ").replace("_", " ").strip()
    return limpio[:1].upper() + limpio[1:] if limpio else ""


# --------------------------------------------------------------------------
# contactos
# --------------------------------------------------------------------------

def cmd_contactos(args):
    carpeta = os.path.abspath(args.carpeta)
    fotos = fotos_de(carpeta)
    if not fotos:
        sys.exit("No hay fotos en %s" % carpeta)
    print("Leyendo %d fotos..." % len(fotos))

    huellas = {f: dhash(f) for f in fotos}
    parejas = []
    for i in range(len(fotos)):
        for j in range(i + 1, len(fotos)):
            d = distancia(huellas[fotos[i]], huellas[fotos[j]])
            if d <= 22:
                parejas.append((d, fotos[i], fotos[j]))
    parejas.sort()

    repetidas = {}
    for d, a, b in parejas:
        repetidas.setdefault(a, []).append((d, b))
        repetidas.setdefault(b, []).append((d, a))

    filas = []
    for n, f in enumerate(fotos, 1):
        rel = os.path.relpath(f, carpeta).replace("\\", "/")
        marca = ""
        if f in repetidas:
            cerca = sorted(repetidas[f])[0]
            clase = "casi" if cerca[0] <= 10 else "par"
            marca = ('<span class="m %s">parecida a %s (d=%d)</span>'
                     % (clase, os.path.basename(cerca[1]), cerca[0]))
        filas.append(
            '<figure><a href="%s" target="_blank"><img src="%s" loading="lazy"'
            ' alt=""></a><figcaption><b>%02d</b> %s<br>%s</figcaption></figure>'
            % (rel, rel, n, os.path.basename(f), marca))

    html = PLANTILLA_CONTACTOS.replace("@@TITULO@@", os.path.basename(carpeta))
    html = html.replace("@@RESUMEN@@", "%d fotos, %d parejas parecidas"
                        % (len(fotos), len(parejas)))
    html = html.replace("@@FILAS@@", "\n".join(filas))
    destino = os.path.join(carpeta, "hoja-de-contactos.html")
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html)

    print("\n%d parejas parecidas:" % len(parejas))
    for d, a, b in parejas[:25]:
        print("   d=%-3d %-38s %s" % (d, os.path.basename(a),
                                      os.path.basename(b)))
    if len(parejas) > 25:
        print("   ... y %d mas" % (len(parejas) - 25))

    print("\nHoja de contactos: %s" % destino)
    print("Abrala, elija las fotos y escriba el orden en un orden.txt asi:")
    print("\n   IMG_2201.jpg  sala-comedor")
    print("   IMG_2214.jpg  cocina-isla   | Cocina con isla en cuarzo abierta")
    print("\nUna linea por foto, en el orden de la galeria. La primera es la")
    print("portada. El texto despues de la barra es el alt: si no lo escribe,")
    print("se arma uno decente con el nombre del espacio.")


PLANTILLA_CONTACTOS = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hoja de contactos - @@TITULO@@</title>
<style>
 body{font:15px/1.5 system-ui,sans-serif;background:#111;color:#eee;margin:0;padding:24px}
 h1{font-size:21px;margin:0 0 4px} p.sub{color:#999;margin:0 0 26px}
 .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}
 figure{margin:0;background:#1b1b1b;border-radius:6px;overflow:hidden}
 img{width:100%;display:block;aspect-ratio:3/4;object-fit:cover}
 figcaption{padding:7px 8px;font-size:11.5px;color:#bbb;word-break:break-all}
 figcaption b{color:#fff;font-size:13px}
 .m{display:block;margin-top:4px;padding:2px 5px;border-radius:3px;font-size:10.5px}
 .casi{background:#5a1d1d;color:#ffb4b4} .par{background:#4a3c14;color:#ffd98a}
</style></head><body>
<h1>@@TITULO@@</h1>
<p class="sub">@@RESUMEN@@. Clic en cualquiera para verla completa.</p>
<div class="grid">
@@FILAS@@
</div></body></html>"""


# --------------------------------------------------------------------------
# plantilla
# --------------------------------------------------------------------------

EJEMPLO = {
    "slug": "",
    "titulo": "",
    "zona": "",
    "zonaDetalle": "",
    "subtipo": "Apartamento",
    "operacion": "Venta",
    "precio": 0,
    "premium": False,
    "alt_sufijo": "",
    "nota": "",
    "ficha": [["Área construida", ""], ["Área privada", ""], ["Alcobas", ""],
              ["Baños", ""], ["Parqueadero", ""], ["Piso", ""],
              ["Estrato", ""], ["Administración", ""], ["Antigüedad", ""]],
    "descripcion": ["", ""],
    "orden": "orden.txt",
}


def cmd_plantilla(args):
    datos = dict(EJEMPLO)
    datos["slug"] = args.slug
    destino = os.path.abspath(args.salida or "datos.json")
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(datos, fh, ensure_ascii=False, indent=2)
    print("Escrito: %s\n" % destino)
    print("Campos que conviene entender:")
    print("  alt_sufijo   se pega al final de cada alt. Por ejemplo:")
    print("               'apartamento 710 en Ecoh, Loma San José, Sabaneta'")
    print("  nota         comentario que queda en el codigo, para dejar")
    print("               escrito de donde salio cada dato y que falta")
    print("  ficha        las primeras CUATRO filas son las que salen en el")
    print("               panel del precio. Ponga ahi lo que mas pesa")
    print("  descripcion  dos parrafos: la zona, y el inmueble con la razon")
    print("               por la que CINQ lo acepto")


# --------------------------------------------------------------------------
# publicar
# --------------------------------------------------------------------------

def leer_orden(ruta, carpeta):
    """Cada linea: archivo  espacio  [| alt escrito a mano]"""
    entradas = []
    with open(ruta, encoding="utf-8") as fh:
        for numero, linea in enumerate(fh, 1):
            linea = linea.strip()
            if not linea or linea.startswith("#"):
                continue
            alt = None
            if "|" in linea:
                linea, alt = linea.split("|", 1)
                alt = alt.strip()
            partes = linea.split()
            if len(partes) < 2:
                sys.exit("Linea %d de %s: falta el espacio despues del archivo"
                         % (numero, ruta))
            archivo, espacio = partes[0], partes[1]
            candidatos = [f for f in fotos_de(carpeta)
                          if os.path.basename(f) == archivo]
            if not candidatos:
                sys.exit("Linea %d: no encuentro %s dentro de %s"
                         % (numero, archivo, carpeta))
            entradas.append({"origen": candidatos[0], "espacio": espacio,
                             "alt": alt})
    return entradas


def cmd_publicar(args):
    with open(args.datos, encoding="utf-8") as fh:
        datos = json.load(fh)
    faltan = [c for c in ("slug", "titulo", "zona", "zonaDetalle", "precio")
              if not datos.get(c)]
    if faltan:
        sys.exit("Faltan campos en %s: %s" % (args.datos, ", ".join(faltan)))

    slug = datos["slug"]
    carpeta = os.path.abspath(args.carpeta)
    ruta_orden = datos.get("orden") or "orden.txt"
    if not os.path.isabs(ruta_orden):
        ruta_orden = os.path.join(os.path.dirname(os.path.abspath(args.datos)),
                                  ruta_orden)
    entradas = leer_orden(ruta_orden, carpeta)
    if len(entradas) < 8:
        print("AVISO: %d fotos. El estandar de CINQ son 8 minimo." %
              len(entradas))

    destino = os.path.join(PORTAFOLIO, slug)
    if os.path.exists(destino) and not args.forzar:
        sys.exit("Ya existe %s. Use --forzar si quiere reemplazarla." % destino)
    os.makedirs(destino, exist_ok=True)

    sufijo = datos.get("alt_sufijo") or datos["titulo"]
    fotos_js = []
    print("Optimizando %d fotos en %s\n" % (len(entradas), destino))
    for i, e in enumerate(entradas, 1):
        nombre = "%s-%02d-%s.jpg" % (slug, i, e["espacio"])
        jpg = os.path.join(destino, nombre)
        im = Image.open(e["origen"]).convert("RGB")
        if max(im.size) > MAX_LADO:
            im.thumbnail((MAX_LADO, MAX_LADO), Image.LANCZOS)
            im.save(jpg, "JPEG", quality=CALIDAD, optimize=True)
        else:
            shutil.copyfile(e["origen"], jpg)  # no reencodear lo ya comprimido
        im.save(os.path.splitext(jpg)[0] + ".webp", "WEBP", quality=CALIDAD,
                method=6)
        alt = e["alt"] or "%s, %s" % (titulo_espacio(e["espacio"]), sufijo)
        fotos_js.append((nombre, alt))
        print("  %-46s %4d KB" % (nombre, os.path.getsize(jpg) // 1024))

    bloque = componer_bloque(datos, fotos_js)
    insertar_en_catalogo(bloque)
    print("\nBloque agregado a assets/js/oportunidades.js")
    print("Ahora: revise los alt uno por uno. Los que genera el script son")
    print("correctos pero genericos, y describir lo que se ve vale mas.")
    print("Despues corra:  python herramientas/oportunidad.py verificar")


def componer_bloque(datos, fotos_js):
    ancho = max([len(n) for n, _ in fotos_js] or [0]) + 3
    lineas = ["", "  {"]
    lineas.append('    slug: "%s",' % datos["slug"])
    lineas.append('    tipo: "%s",' % datos.get("tipo", "Propiedad"))
    lineas.append('    subtipo: "%s",' % datos.get("subtipo", "Apartamento"))
    lineas.append('    operacion: "%s",' % datos.get("operacion", "Venta"))
    lineas.append('    titulo: "%s",' % datos["titulo"])
    lineas.append('    zona: "%s",' % datos["zona"])
    lineas.append('    zonaDetalle: "%s",' % datos["zonaDetalle"])
    lineas.append('    precio: %d,' % int(datos["precio"]))
    lineas.append('    premium: %s,' % ("true" if datos.get("premium")
                                        else "false"))
    if datos.get("nota"):
        lineas.append("    /* %s */" % datos["nota"])
    lineas.append("    ficha: [")
    filas = [f for f in datos.get("ficha", []) if len(f) == 2 and f[1]]
    for i, (etiqueta, valor) in enumerate(filas):
        coma = "" if i == len(filas) - 1 else ","
        lineas.append('      ["%s", "%s"]%s' % (etiqueta, valor, coma))
    lineas.append("    ],")
    lineas.append("    descripcion: [")
    parrafos = [p for p in datos.get("descripcion", []) if p.strip()]
    for i, p in enumerate(parrafos):
        coma = "" if i == len(parrafos) - 1 else ","
        lineas.append('      "%s"%s' % (p.replace('"', '\\"'), coma))
    lineas.append("    ],")
    lineas.append("    fotos: [")
    for i, (nombre, alt) in enumerate(fotos_js):
        coma = "" if i == len(fotos_js) - 1 else ","
        relleno = " " * (ancho - len(nombre))
        lineas.append('      { archivo: "%s",%salt: "%s" }%s'
                      % (nombre, relleno, alt, coma))
    lineas.append("    ]")
    lineas.append("  }")
    return "\n".join(lineas)


def insertar_en_catalogo(bloque):
    with open(CATALOGO, encoding="utf-8") as fh:
        texto = fh.read()
    corte = texto.rstrip().rfind("];")
    if corte == -1:
        sys.exit("No encuentro el cierre del array en oportunidades.js")
    antes = texto[:corte].rstrip()
    if antes.endswith("}"):
        antes += ","
    nuevo = antes + "\n" + bloque + "\n\n];\n"
    with open(CATALOGO, "w", encoding="utf-8") as fh:
        fh.write(nuevo)


# --------------------------------------------------------------------------
# verificar
# --------------------------------------------------------------------------

def cargar_catalogo():
    sys.path.insert(0, os.path.join(RAIZ, "api"))
    import whatsapp as bot  # reutiliza el parser del bot, uno solo
    with open(CATALOGO, encoding="utf-8") as fh:
        return json.loads(bot.js_a_json(fh.read()))


def cmd_verificar(args):
    ops = cargar_catalogo()
    problemas = []
    print("Revisando %d oportunidades publicadas\n" % len(ops))

    slugs = {}
    for op in ops:
        slug = op.get("slug", "")
        if slug in slugs:
            problemas.append("slug repetido: %s" % slug)
        slugs[slug] = True

        fotos = op.get("fotos") or []
        faltan_archivos = 0
        sin_alt = 0
        for f in fotos:
            archivo = f.get("archivo", "")
            if "/" in archivo:
                base = os.path.join(PORTAFOLIO, archivo)
            else:
                base = os.path.join(PORTAFOLIO, slug, archivo)
            for ruta in (base, os.path.splitext(base)[0] + ".webp"):
                if not os.path.exists(ruta):
                    faltan_archivos += 1
                    problemas.append("%s: falta %s" % (
                        slug, os.path.relpath(ruta, PORTAFOLIO)))
            if not (f.get("alt") or "").strip():
                sin_alt += 1
                problemas.append("%s: %s sin alt" % (slug, archivo))

        if len(fotos) < 8:
            problemas.append("%s: solo %d fotos, el minimo son 8"
                             % (slug, len(fotos)))
        if not isinstance(op.get("precio"), int):
            problemas.append("%s: el precio no es un numero" % slug)
        if not (op.get("descripcion") or [""])[0].strip():
            problemas.append("%s: sin descripcion" % slug)

        texto = json.dumps(op, ensure_ascii=False)
        for guion in ("—", "–"):
            if guion in texto:
                problemas.append("%s: tiene un guion medio o largo" % slug)

        print("  %-34s %2d fotos  %s%s" % (
            slug, len(fotos),
            "archivos ok" if not faltan_archivos else
            "FALTAN %d archivos" % faltan_archivos,
            "" if not sin_alt else "  %d SIN ALT" % sin_alt))

    print()
    if problemas:
        print("%d problemas:" % len(problemas))
        for p in problemas:
            print("   - " + p)
        sys.exit(1)
    print("Todo en orden. Se puede publicar.")


# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(
        description="Publica una oportunidad en el portafolio de CINQ")
    sub = ap.add_subparsers(dest="comando", required=True)

    a = sub.add_parser("contactos", help="hoja de contactos y repetidas")
    a.add_argument("carpeta")
    a.set_defaults(func=cmd_contactos)

    b = sub.add_parser("plantilla", help="datos.json de ejemplo")
    b.add_argument("slug")
    b.add_argument("--salida")
    b.set_defaults(func=cmd_plantilla)

    c = sub.add_parser("publicar", help="optimiza y agrega al catalogo")
    c.add_argument("carpeta")
    c.add_argument("datos")
    c.add_argument("--forzar", action="store_true")
    c.set_defaults(func=cmd_publicar)

    d = sub.add_parser("verificar", help="revisa todo el portafolio")
    d.set_defaults(func=cmd_verificar)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
