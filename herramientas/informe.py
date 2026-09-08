# -*- coding: utf-8 -*-
"""Informe de mercado para el propietario, al momento de captar un inmueble.

Es la pieza de acompañamiento de CINQ: el dueño dice un precio y en vez de
aceptarlo o discutirlo a ojo, recibe un documento con lo que pide el mercado
por metro cuadrado en su zona, de donde salio cada cifra y donde queda su
inmueble en ese rango.

    python herramientas/informe.py plantilla propiedad
    python herramientas/informe.py plantilla vehiculo
    python herramientas/informe.py generar informe.json

En una propiedad el comparador es el precio por metro cuadrado. En un vehiculo
no existe esa unidad, asi que se compara el precio contra vehiculos del mismo
modelo, año y kilometraje parecido, y el informe cambia sus columnas solo.

Sale un HTML listo para mandar por WhatsApp o imprimir a PDF desde el
navegador.

DOS REGLAS QUE NO SE NEGOCIAN, y estan puestas en el codigo, no en la buena
memoria de nadie:

1. Esto NO es un avaluo. La Ley 1673 de 2013 reserva los avaluos y los
   dictamenes de valuacion a quien este inscrito en el Registro Abierto de
   Avaluadores. Este documento es un estudio de precios de OFERTA y lo dice en
   su propio texto. Si algun dia CINQ quiere emitir avaluos, toca contratar a
   un avaluador inscrito.

2. Todo comparable necesita fuente, enlace y fecha. Sin eso el script se
   niega a generar el informe. Es la regla del sitio, nada simulado, aplicada
   al unico documento donde mentir seria rentable a corto plazo.
"""
import argparse
import datetime
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOGO = os.path.join(RAIZ, "assets", "js", "oportunidades.js")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


# --------------------------------------------------------------------------
# Numeros
# --------------------------------------------------------------------------

def pesos(valor):
    if valor is None:
        return "sin dato"
    return "$ " + "{:,.0f}".format(round(valor)).replace(",", ".")


def millones(valor):
    """620000000 -> '620 millones'. Es como habla la gente, no en cifras."""
    if valor is None:
        return "sin dato"
    m = valor / 1_000_000.0
    if abs(m - round(m)) < 0.05:
        return "%d millones" % round(m)
    return "%.1f millones" % m


def numero(texto):
    """Saca 66,93 de '66,93 m²'. Acepta ya un numero."""
    if isinstance(texto, (int, float)):
        return float(texto)
    m = re.search(r"([\d.]+(?:,\d+)?)", str(texto or ""))
    if not m:
        return None
    return float(m.group(1).replace(".", "").replace(",", "."))


def mediana(valores):
    if not valores:
        return None
    v = sorted(valores)
    n = len(v)
    return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2.0


def percentil(valores, p):
    if not valores:
        return None
    v = sorted(valores)
    k = (len(v) - 1) * p
    bajo, alto = int(k), min(int(k) + 1, len(v) - 1)
    return v[bajo] + (v[alto] - v[bajo]) * (k - bajo)


def hoy_largo():
    h = datetime.date.today()
    return "%d de %s de %d" % (h.day, MESES[h.month - 1], h.year)


# --------------------------------------------------------------------------
# Comparables propios: lo que CINQ ya tiene publicado
# --------------------------------------------------------------------------

def comparables_del_portafolio(zona, tipo="propiedad", excluir_slug=None):
    """Las oportunidades de CINQ que sirven de comparable, del mismo catalogo.

    Es el activo que va creciendo solo: cada inmueble o vehiculo que entra deja
    un dato verificado por CINQ, con foto y visita, no un anuncio de internet.
    """
    try:
        sys.path.insert(0, os.path.join(RAIZ, "api"))
        import whatsapp as bot
        with open(CATALOGO, encoding="utf-8") as fh:
            ops = json.loads(bot.js_a_json(fh.read()))
    except Exception as e:
        print("  aviso: no pude leer el portafolio propio (%s)" % e)
        return []
    salida = []
    for o in ops:
        # Un inmueble no puede ser comparable de si mismo. Pasa cuando se le
        # hace el informe a un dueño cuyo inmueble YA esta publicado: sin esto,
        # su propio precio entraria en la mediana contra la que se le compara.
        if excluir_slug and o.get("slug") == excluir_slug:
            continue
        es_vehiculo = o.get("tipo") == "Vehículo"
        if es_vehiculo != (tipo == "vehiculo"):
            continue
        base = {
            "descripcion": o.get("titulo", ""),
            "precio": o.get("precio"),
            "fuente": "Portafolio CINQ",
            "url": "https://cinq-web.vercel.app/oportunidad.html?id=%s"
                   % o.get("slug"),
            "fecha": "publicado",
            "propio": True,
        }
        if tipo == "vehiculo":
            # Un vehiculo no depende de la zona: el mercado es la ciudad
            # entera y se mueve solo.
            base["anio"] = bot.dato(o, "Año")
            base["kilometraje"] = bot.dato(o, "Kilometraje")
        else:
            if (o.get("zona") or "").lower() != (zona or "").lower():
                continue
            area = numero(bot.dato(o, "Área construida"))
            if not area:
                continue
            base["area"] = area
            base["alcobas"] = bot.dato(o, "Alcobas")
        salida.append(base)
    return salida


# --------------------------------------------------------------------------
# Informe
# --------------------------------------------------------------------------

def validar(datos):
    tipo = datos.get("tipo", "propiedad")
    problemas = []
    for campo in ("propietario", "inmueble", "zona", "precio_pedido"):
        if not datos.get(campo):
            problemas.append("falta '%s'" % campo)
    if tipo == "propiedad" and not datos.get("area"):
        problemas.append("falta 'area', sin ella no hay precio por m2")
    if tipo == "vehiculo":
        for campo in ("anio", "kilometraje"):
            if not datos.get(campo):
                problemas.append(
                    "falta '%s'. En un vehiculo el año y el kilometraje son lo "
                    "que hace comparable un precio con otro" % campo)
    for i, c in enumerate(datos.get("comparables", []), 1):
        for campo in ("fuente", "url", "fecha", "precio"):
            if not c.get(campo):
                problemas.append(
                    "comparable %d: falta '%s'. Sin fuente, enlace y fecha no "
                    "se publica: es la regla del sitio" % (i, campo))
        if tipo == "propiedad" and not c.get("area"):
            problemas.append("comparable %d: falta 'area'" % i)
        if tipo == "vehiculo" and not c.get("anio"):
            problemas.append("comparable %d: falta 'anio'" % i)
    return problemas


def analizar(datos):
    tipo = datos.get("tipo", "propiedad")
    comparables = list(datos.get("comparables", []))
    if datos.get("incluir_portafolio", True):
        comparables += comparables_del_portafolio(
            datos.get("zona"), tipo, datos.get("excluir_slug"))

    for c in comparables:
        c["area"] = numero(c.get("area"))
        c["precio"] = numero(c.get("precio"))
        c["por_m2"] = (c["precio"] / c["area"]
                       if tipo == "propiedad" and c["area"] else None)

    pedido = numero(datos["precio_pedido"])
    area = numero(datos.get("area"))
    propio_m2 = pedido / area if area else None

    if tipo == "propiedad":
        muestra = [c["por_m2"] for c in comparables if c["por_m2"]]
    else:
        muestra = [c["precio"] for c in comparables if c["precio"]]

    res = {
        "tipo": tipo,
        "comparables": sorted(comparables,
                              key=lambda c: c.get("por_m2") or c["precio"]),
        "pedido": pedido,
        "area": area,
        "propio_m2": propio_m2,
        "n": len(muestra),
        "mediana": mediana(muestra),
        "p25": percentil(muestra, 0.25),
        "p75": percentil(muestra, 0.75),
        "minimo": min(muestra) if muestra else None,
        "maximo": max(muestra) if muestra else None,
    }
    referencia = propio_m2 if tipo == "propiedad" else pedido
    if res["mediana"] and referencia:
        res["diferencia"] = (referencia / res["mediana"] - 1) * 100
        res["equivalente"] = (res["mediana"] * area if tipo == "propiedad"
                              and area else res["mediana"])
    else:
        res["diferencia"] = None
        res["equivalente"] = None
    return res


def lectura(res):
    """El parrafo de asesoria. Describe, no predice."""
    d = res.get("diferencia")
    if d is None:
        return ("No hay comparables suficientes para ubicar el inmueble en un "
                "rango. Conviene reunir al menos tres antes de fijar precio.")
    unidad = ("por metro cuadrado" if res["tipo"] == "propiedad"
              else "de precio de lista")
    if abs(d) < 5:
        return ("El precio esta practicamente en la mediana de la zona, una "
                "diferencia de %.0f%% %s. Es un precio alineado con lo que hoy "
                "se esta pidiendo por inmuebles parecidos." % (abs(d), unidad))
    if d > 0:
        return ("El precio esta %.0f%% por encima de la mediana de la zona %s. "
                "Eso no lo hace incorrecto: puede estar justificado por el "
                "estado, la vista, el piso o los acabados, y por eso el informe "
                "trae los comparables completos y no solo el promedio. Lo que "
                "si conviene tener claro es que un inmueble por encima del "
                "rango compite con menos comprador y necesita mas tiempo o un "
                "argumento muy visible." % (d, unidad))
    return ("El precio esta %.0f%% por debajo de la mediana de la zona %s. "
            "Vale la pena revisarlo antes de salir al mercado: si el inmueble "
            "esta en buen estado, puede haber espacio para pedir mas sin que "
            "por eso deje de venderse." % (abs(d), unidad))


# --------------------------------------------------------------------------
# HTML
# --------------------------------------------------------------------------

def logo():
    """El logo real, incrustado en el documento.

    El SVG ya viene con fill y stroke en currentColor, asi que el color sale
    del CSS y no del archivo, igual que en el sitio. Se incrusta porque el
    informe se manda por WhatsApp o se imprime a PDF: si el logo fuera un
    enlace al sitio, se veria roto sin conexion o dentro del PDF.

    Si algun dia falta el archivo, se cae al wordmark encasillado en Georgia,
    que es la misma red de seguridad que tiene styles.css.
    """
    ruta = os.path.join(RAIZ, "assets", "img", "cinq-logo.svg")
    try:
        with open(ruta, encoding="utf-8") as fh:
            svg = fh.read().strip()
        return svg.replace(
            "<svg ", '<svg class="logo" role="img" aria-label="CINQ" ', 1)
    except Exception as e:
        print("  aviso: no encontre el logo (%s), va el de respaldo" % e)
        return '<div class="marca-respaldo">CINQ</div>'


def html_informe(datos, res):
    tipo = res["tipo"]
    es_vehiculo = tipo == "vehiculo"

    if es_vehiculo:
        encabezados = ("<th>Vehículo</th><th class='n'>Año</th>"
                       "<th class='n'>Kilometraje</th><th class='n'>Precio</th>"
                       "<th>Fuente y fecha</th>")
    else:
        encabezados = ("<th>Inmueble</th><th>Alc.</th><th class='n'>Área</th>"
                       "<th class='n'>Precio</th><th class='n'>Por m²</th>"
                       "<th>Fuente y fecha</th>")

    filas = []
    for c in res["comparables"]:
        etiqueta = c["fuente"]
        if c.get("propio"):
            etiqueta = "<b>%s</b>" % etiqueta
        fuente = ("<td><a href='%s'>%s</a><br><span class='fecha'>%s</span>"
                  "</td>" % (c["url"], etiqueta, c["fecha"]))
        if es_vehiculo:
            km = c.get("kilometraje")
            celdas = ("<td>%s</td><td class='n'>%s</td><td class='n'>%s</td>"
                      "<td class='n'>%s</td>"
                      % (c.get("descripcion", ""), c.get("anio") or "",
                         km if km else "", pesos(c["precio"])))
        else:
            celdas = ("<td>%s</td><td>%s</td><td class='n'>%s</td>"
                      "<td class='n'>%s</td><td class='n'>%s</td>"
                      % (c.get("descripcion", ""), c.get("alcobas") or "",
                         ("%.0f m²" % c["area"]) if c.get("area") else "",
                         pesos(c["precio"]),
                         pesos(c["por_m2"]) if c.get("por_m2") else ""))
        filas.append("<tr%s>%s%s</tr>"
                     % (" class='propio'" if c.get("propio") else "",
                        celdas, fuente))

    if es_vehiculo:
        resumen = [
            ("Lo que usted pide", pesos(res["pedido"])),
            ("Año", str(datos.get("anio", ""))),
            ("Kilometraje", str(datos.get("kilometraje", ""))),
            ("Mediana del mercado", pesos(res["mediana"])),
            ("Rango habitual", "%s a %s" % (pesos(res["p25"]),
                                            pesos(res["p75"]))),
        ]
    else:
        resumen = [
            ("Lo que usted pide", pesos(res["pedido"])),
            ("Área construida", "%.2f m²" % res["area"] if res["area"] else ""),
            ("Su precio por m²", pesos(res["propio_m2"])),
            ("Mediana de la zona", pesos(res["mediana"])),
            ("Rango habitual", "%s a %s" % (pesos(res["p25"]),
                                            pesos(res["p75"]))),
        ]

    equivalente = ""
    if res.get("equivalente") and not es_vehiculo:
        equivalente = (
            "<p class='equiv'>A la mediana de la zona, un inmueble de %.2f m² "
            "se estaría pidiendo en <b>%s</b>. Usted pide %s.</p>"
            % (res["area"], millones(res["equivalente"]),
               millones(res["pedido"])))
    elif es_vehiculo and res.get("mediana"):
        equivalente = (
            "<p class='equiv'>La mediana de lo que se está pidiendo por "
            "vehículos comparables es <b>%s</b>. Usted pide %s.</p>"
            % (millones(res["mediana"]), millones(res["pedido"])))

    if es_vehiculo:
        glosa = ("vehículos comparables, es decir de modelo, año y kilometraje "
                 "parecidos")
        cosa = "vehículo"
    else:
        glosa = "inmuebles comparables"
        cosa = "inmueble"

    html = PLANTILLA
    html = html.replace("@@LOGO@@", logo())
    html = html.replace("@@ENCABEZADOS@@", encabezados)
    html = html.replace("@@GLOSA@@", glosa)
    html = html.replace("@@COSA@@", cosa)
    html = html.replace("@@INMUEBLE@@", datos["inmueble"])
    html = html.replace("@@PROPIETARIO@@", datos["propietario"])
    html = html.replace("@@ZONA@@", datos["zona"])
    html = html.replace("@@FECHA@@", hoy_largo())
    html = html.replace("@@RESUMEN@@", "\n".join(
        "<div class='dato'><span>%s</span><b>%s</b></div>" % (k, v)
        for k, v in resumen if v))
    html = html.replace("@@EQUIVALENTE@@", equivalente)
    html = html.replace("@@FILAS@@", "\n".join(filas))
    html = html.replace("@@N@@", str(res["n"]))
    html = html.replace("@@LECTURA@@", lectura(res))
    html = html.replace("@@NOTAS@@", datos.get("notas", ""))
    return html


PLANTILLA = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Referencia de mercado - @@INMUEBLE@@</title>
<style>
 /* Los mismos tokens de assets/css/styles.css. Si algun dia cambia el verde
    de la marca, cambia alla y se copia aqui: este documento viaja solo, por
    WhatsApp o en PDF, y no puede pedirle la hoja de estilos al sitio. */
 :root{
   --paper:#ffffff; --paper-alt:#f7f6f1;
   --ink:#20241a; --muted:#6b7263;
   --olive:#728f57; --olive-deep:#3c461b;
   --line:rgba(32,36,26,0.13); --line-soft:rgba(32,36,26,0.08);
   --font-display:Georgia,'Iowan Old Style','Palatino Linotype','Book Antiqua',serif;
   --font-body:Aptos,'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;
   --font-mono:ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;
 }
 *{box-sizing:border-box}
 body{margin:0;padding:46px 26px;background:var(--paper-alt);color:var(--ink);
      font-family:var(--font-body);font-size:14.5px;line-height:1.65;
      -webkit-print-color-adjust:exact;print-color-adjust:exact}
 .hoja{max-width:760px;margin:0 auto}
 /* El logo real, el trazado con la cola de la Q y su recuadro, no el wordmark
    rehecho en Georgia. Va incrustado para que el PDF no dependa de la red. */
 .logo{height:46px;width:auto;color:var(--olive-deep);margin-bottom:32px}
 .marca-respaldo{font-family:var(--font-display);font-size:15px;font-weight:600;
   letter-spacing:.22em;border:1px solid var(--olive-deep);color:var(--olive-deep);
   display:inline-block;padding:9px 11px 9px 13px;margin-bottom:32px}
 h1{font-family:var(--font-display);font-size:29px;font-weight:400;margin:0 0 8px;
    line-height:1.22;color:var(--ink)}
 .sub{color:var(--muted);margin:0 0 36px;font-size:14px}
 h2{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.04em;
    text-transform:uppercase;color:var(--muted);font-weight:400;
    margin:40px 0 14px;border-bottom:1px solid var(--line);padding-bottom:8px}
 .resumen{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0 26px}
 .dato{display:flex;justify-content:space-between;align-items:baseline;gap:12px;
       padding:10px 0;border-bottom:1px solid var(--line-soft)}
 .dato span{color:var(--muted);font-size:13.5px}
 .dato b{font-family:var(--font-display);font-weight:400;font-size:16px;white-space:nowrap}
 .equiv{background:var(--paper);border-left:2px solid var(--olive);
        padding:15px 18px;margin:24px 0 0;font-family:var(--font-display);font-size:16px}
 table{width:100%;border-collapse:collapse;font-size:13.5px}
 th{text-align:left;font-family:var(--font-mono);font-weight:400;color:var(--muted);
    font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;
    padding:0 8px 9px 0;border-bottom:1px solid var(--line)}
 td{padding:11px 8px 11px 0;border-bottom:1px solid var(--line-soft);vertical-align:top}
 td.n,th.n{text-align:right;white-space:nowrap}
 tr.propio{background:var(--paper)}
 a{color:var(--olive-deep)}
 .fecha{color:var(--muted);font-size:11.5px}
 .lectura{font-family:var(--font-display);font-size:16.5px;line-height:1.6}
 .aviso{margin-top:42px;padding-top:18px;border-top:1px solid var(--line);
        color:var(--muted);font-size:12.5px;line-height:1.62}
 .firma{margin-top:36px;font-family:var(--font-display);font-size:15px}
 @media print{body{padding:0;background:var(--paper)}.hoja{max-width:none}}
</style></head><body>
<div class="hoja">
@@LOGO@@

<h1>Referencia de mercado</h1>
<p class="sub">@@INMUEBLE@@ &middot; @@ZONA@@<br>
Preparado para @@PROPIETARIO@@ &middot; @@FECHA@@</p>

<h2>Su inmueble y la zona</h2>
<div class="resumen">@@RESUMEN@@</div>
@@EQUIVALENTE@@

<h2>Los @@N@@ comparables</h2>
<table>
<tr>@@ENCABEZADOS@@</tr>
@@FILAS@@
</table>

<h2>Cómo lo leemos</h2>
<p class="lectura">@@LECTURA@@</p>
@@NOTAS@@

<h2>Cómo leer estas cifras</h2>
<p>Son <b>precios de oferta</b>, es decir lo que hoy se está pidiendo por
@@GLOSA@@, no lo que efectivamente se pagó por ellos. El precio de cierre
suele quedar por debajo del de oferta. Sirven para ubicar un rango, no para
fijar un valor exacto.</p>
<p>Cada comparable trae su enlace y su fecha para que usted pueda verificarlo.
Si alguno le parece que no compara bien con su @@COSA@@, dígamelo y lo
sacamos: la muestra es discutible y esa conversación es justamente el punto de
este documento.</p>

<div class="aviso">
<b>Esto no es un avalúo.</b> Es un estudio de precios de oferta preparado por
CINQ con información pública. La Ley 1673 de 2013 reserva los avalúos y los
dictámenes de valuación a los avaluadores inscritos en el Registro Abierto de
Avaluadores, y CINQ no lo es. Si usted necesita un avalúo con validez legal,
para una hipoteca, una sucesión, una aseguradora o un proceso judicial, con
gusto lo remitimos a un avaluador inscrito.
</div>

<p class="firma">Samuel, CINQ<br>
<span class="fecha">Conectando oportunidades</span></p>
</div></body></html>"""


# --------------------------------------------------------------------------

EJEMPLO_PROPIEDAD = {
    "tipo": "propiedad",
    "propietario": "Nombre del dueño, como lo va a leer él",
    "inmueble": "Apartamento de 72 m², 3 alcobas",
    "zona": "Sabaneta",
    "area": "72 m²",
    "precio_pedido": 620000000,
    "incluir_portafolio": True,
    "notas": "",
    "comparables": [
        {"descripcion": "Apartamento, Alto de Las Flores", "alcobas": "3",
         "area": "74 m²", "precio": 544000000,
         "fuente": "Finca Raíz 193925322",
         "url": "https://www.fincaraiz.com.co/apartamento-en-venta-en-sabaneta/193925322",
         "fecha": "8 sep 2026"},
        {"descripcion": "", "alcobas": "", "area": "", "precio": 0,
         "fuente": "", "url": "", "fecha": ""}
    ],
}

EJEMPLO_VEHICULO = {
    "tipo": "vehiculo",
    "propietario": "Nombre del dueño, como lo va a leer él",
    "inmueble": "Mazda CX-30 Grand Touring 2023",
    "zona": "Medellín",
    "anio": 2023,
    "kilometraje": "38.000 km",
    "precio_pedido": 118000000,
    "incluir_portafolio": True,
    "notas": "",
    "comparables": [
        {"descripcion": "Mazda CX-30 Grand Touring", "anio": 2023,
         "kilometraje": "42.000 km", "precio": 0,
         "fuente": "TuCarro / Mercado Libre", "url": "", "fecha": "8 sep 2026"},
        {"descripcion": "", "anio": "", "kilometraje": "", "precio": 0,
         "fuente": "", "url": "", "fecha": ""}
    ],
}


def cmd_plantilla(args):
    tipo = (args.tipo or "propiedad").lower()
    if tipo not in ("propiedad", "vehiculo"):
        sys.exit("El tipo es 'propiedad' o 'vehiculo'.")
    ejemplo = EJEMPLO_PROPIEDAD if tipo == "propiedad" else EJEMPLO_VEHICULO
    destino = os.path.abspath(args.salida or "informe-%s.json" % tipo)
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(ejemplo, fh, ensure_ascii=False, indent=2)

    print("Escrito: %s\n" % destino)
    print("Viene con un comparable de ejemplo lleno y otro en blanco, para")
    print("copiar el formato. Borre los que no use.\n")
    if tipo == "propiedad":
        print("Cada comparable necesita fuente, url, fecha, precio y area.")
        print("El area es lo que permite comparar: sin ella no hay precio por")
        print("metro cuadrado y el informe no se genera.")
    else:
        print("Cada comparable necesita fuente, url, fecha, precio y año.")
        print("El kilometraje no es obligatorio pero cambia mucho el precio:")
        print("un comparable sin kilometraje compara a medias, y conviene")
        print("anotarlo aunque sea aproximado.")
    print("\nSin fuente, enlace y fecha el informe no se genera. No mandamos")
    print("cifras sin decir de donde salieron.")
    print("\nLo que CINQ ya tenga publicado del mismo tipo entra solo como")
    print("comparable propio. Se apaga con incluir_portafolio en false.")


def cmd_generar(args):
    with open(args.datos, encoding="utf-8") as fh:
        datos = json.load(fh)
    problemas = validar(datos)
    if problemas:
        print("No se puede generar el informe:\n")
        for p in problemas:
            print("   - " + p)
        sys.exit(1)
    res = analizar(datos)
    if res["n"] < 3:
        print("AVISO: solo %d comparables. Con menos de tres el rango dice"
              " poco." % res["n"])
    destino = os.path.abspath(
        args.salida or "informe-%s.html" % re.sub(
            r"[^a-z0-9]+", "-", datos["inmueble"].lower()).strip("-"))
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html_informe(datos, res))

    print("\n%s" % datos["inmueble"])
    print("  pide            %s" % pesos(res["pedido"]))
    if res["propio_m2"]:
        print("  por m2          %s" % pesos(res["propio_m2"]))
    print("  mediana zona    %s   (%d comparables)" % (pesos(res["mediana"]),
                                                       res["n"]))
    if res["diferencia"] is not None:
        print("  diferencia      %+.0f%%" % res["diferencia"])
    if res.get("equivalente"):
        print("  a la mediana    %s" % pesos(res["equivalente"]))
    print("\nInforme: %s" % destino)
    print("Abrirlo en el navegador e imprimir a PDF para mandarlo.")


def main():
    ap = argparse.ArgumentParser(description="Informe de mercado para el "
                                             "propietario")
    sub = ap.add_subparsers(dest="comando", required=True)
    a = sub.add_parser("plantilla")
    a.add_argument("tipo", nargs="?", default="propiedad",
                   choices=["propiedad", "vehiculo"])
    a.add_argument("--salida")
    a.set_defaults(func=cmd_plantilla)
    b = sub.add_parser("generar")
    b.add_argument("datos")
    b.add_argument("--salida")
    b.set_defaults(func=cmd_generar)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
