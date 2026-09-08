# -*- coding: utf-8 -*-
"""Informe de mercado para el propietario, al momento de captar un inmueble.

Es la pieza de acompañamiento de CINQ: el dueño dice un precio y en vez de
aceptarlo o discutirlo a ojo, recibe un documento con lo que pide el mercado
por metro cuadrado en su zona, de donde salio cada cifra y donde queda su
inmueble en ese rango.

    python herramientas/informe.py plantilla
    python herramientas/informe.py generar informe.json

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

def comparables_del_portafolio(zona):
    """Las oportunidades de CINQ en la misma zona, como comparables propios.

    Es el activo que va creciendo solo: cada inmueble que entra deja un dato
    verificado por CINQ, con foto y visita, no un anuncio de internet.
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
        if (o.get("zona") or "").lower() != (zona or "").lower():
            continue
        area = numero(bot.dato(o, "Área construida"))
        if not area:
            continue
        salida.append({
            "descripcion": o.get("titulo", ""),
            "area": area,
            "precio": o.get("precio"),
            "alcobas": bot.dato(o, "Alcobas"),
            "fuente": "Portafolio CINQ",
            "url": "https://cinq-web.vercel.app/oportunidad.html?id=%s"
                   % o.get("slug"),
            "fecha": "publicado",
            "propio": True,
        })
    return salida


# --------------------------------------------------------------------------
# Informe
# --------------------------------------------------------------------------

def validar(datos):
    problemas = []
    for campo in ("propietario", "inmueble", "zona", "precio_pedido"):
        if not datos.get(campo):
            problemas.append("falta '%s'" % campo)
    if datos.get("tipo", "propiedad") == "propiedad" and not datos.get("area"):
        problemas.append("falta 'area', sin ella no hay precio por m2")
    for i, c in enumerate(datos.get("comparables", []), 1):
        for campo in ("fuente", "url", "fecha", "precio"):
            if not c.get(campo):
                problemas.append(
                    "comparable %d: falta '%s'. Sin fuente, enlace y fecha no "
                    "se publica: es la regla del sitio" % (i, campo))
        if datos.get("tipo", "propiedad") == "propiedad" and not c.get("area"):
            problemas.append("comparable %d: falta 'area'" % i)
    return problemas


def analizar(datos):
    tipo = datos.get("tipo", "propiedad")
    comparables = list(datos.get("comparables", []))
    if datos.get("incluir_portafolio", True):
        comparables += comparables_del_portafolio(datos.get("zona"))

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

def html_informe(datos, res):
    tipo = res["tipo"]
    filas = []
    for c in res["comparables"]:
        etiqueta = c["fuente"]
        if c.get("propio"):
            etiqueta = "<b>%s</b>" % etiqueta
        filas.append(
            "<tr%s><td>%s</td><td>%s</td><td class='n'>%s</td>"
            "<td class='n'>%s</td><td class='n'>%s</td>"
            "<td><a href='%s'>%s</a><br><span class='fecha'>%s</span></td></tr>"
            % (" class='propio'" if c.get("propio") else "",
               c.get("descripcion", ""),
               c.get("alcobas") or "",
               ("%.0f m²" % c["area"]) if c.get("area") else "",
               pesos(c["precio"]),
               pesos(c["por_m2"]) if c.get("por_m2") else "",
               c["url"], etiqueta, c["fecha"]))

    if tipo == "propiedad":
        cabecera_unidad = "Por m²"
        resumen = [
            ("Lo que usted pide", pesos(res["pedido"])),
            ("Área construida", "%.2f m²" % res["area"] if res["area"] else ""),
            ("Su precio por m²", pesos(res["propio_m2"])),
            ("Mediana de la zona", pesos(res["mediana"])),
            ("Rango habitual (%d de cada 2)" % 1,
             "%s a %s" % (pesos(res["p25"]), pesos(res["p75"]))),
        ]
    else:
        cabecera_unidad = ""
        resumen = [
            ("Lo que usted pide", pesos(res["pedido"])),
            ("Mediana de la zona", pesos(res["mediana"])),
            ("Rango habitual", "%s a %s" % (pesos(res["p25"]),
                                            pesos(res["p75"]))),
        ]

    equivalente = ""
    if res.get("equivalente") and tipo == "propiedad":
        equivalente = (
            "<p class='equiv'>A la mediana de la zona, un inmueble de %.2f m² "
            "se estaria pidiendo en <b>%s</b>. Usted pide %s.</p>"
            % (res["area"], millones(res["equivalente"]),
               millones(res["pedido"])))

    html = PLANTILLA
    html = html.replace("@@INMUEBLE@@", datos["inmueble"])
    html = html.replace("@@PROPIETARIO@@", datos["propietario"])
    html = html.replace("@@ZONA@@", datos["zona"])
    html = html.replace("@@FECHA@@", hoy_largo())
    html = html.replace("@@RESUMEN@@", "\n".join(
        "<div class='dato'><span>%s</span><b>%s</b></div>" % (k, v)
        for k, v in resumen))
    html = html.replace("@@EQUIVALENTE@@", equivalente)
    html = html.replace("@@UNIDAD@@", cabecera_unidad)
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
 :root{--tinta:#1c1c1a;--suave:#6d6d66;--linea:#e2e0da;--verde:#3d4a2a;--papel:#fbfaf7}
 *{box-sizing:border-box}
 body{margin:0;padding:44px 26px;background:var(--papel);color:var(--tinta);
      font:15px/1.65 Georgia,'Times New Roman',serif}
 .hoja{max-width:760px;margin:0 auto}
 .marca{font:600 15px/1 Georgia,serif;letter-spacing:.22em;border:1px solid var(--tinta);
        display:inline-block;padding:9px 13px;margin-bottom:30px}
 h1{font-size:27px;font-weight:400;margin:0 0 6px;line-height:1.25}
 .sub{color:var(--suave);margin:0 0 34px;font-size:14px}
 h2{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--suave);
    font-weight:400;margin:38px 0 14px;border-bottom:1px solid var(--linea);padding-bottom:7px}
 .resumen{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:2px 22px}
 .dato{display:flex;justify-content:space-between;align-items:baseline;gap:12px;
       padding:9px 0;border-bottom:1px solid var(--linea)}
 .dato span{color:var(--suave);font-size:14px}
 .dato b{font-weight:600;white-space:nowrap}
 .equiv{background:#fff;border-left:3px solid var(--verde);padding:13px 16px;margin:22px 0 0}
 table{width:100%;border-collapse:collapse;font-size:13.5px}
 th{text-align:left;font-weight:400;color:var(--suave);font-size:12px;
    text-transform:uppercase;letter-spacing:.08em;padding:0 8px 8px 0;
    border-bottom:1px solid var(--linea)}
 td{padding:10px 8px 10px 0;border-bottom:1px solid var(--linea);vertical-align:top}
 td.n,th.n{text-align:right;white-space:nowrap}
 tr.propio{background:#fff}
 a{color:var(--verde)}
 .fecha{color:var(--suave);font-size:11.5px}
 .lectura{font-size:16px}
 .aviso{margin-top:40px;padding-top:18px;border-top:1px solid var(--linea);
        color:var(--suave);font-size:12.5px;line-height:1.6}
 .firma{margin-top:34px;font-size:14px}
 @media print{body{padding:0;background:#fff}.hoja{max-width:none}}
</style></head><body>
<div class="hoja">
<div class="marca">CINQ</div>

<h1>Referencia de mercado</h1>
<p class="sub">@@INMUEBLE@@ &middot; @@ZONA@@<br>
Preparado para @@PROPIETARIO@@ &middot; @@FECHA@@</p>

<h2>Su inmueble y la zona</h2>
<div class="resumen">@@RESUMEN@@</div>
@@EQUIVALENTE@@

<h2>Los @@N@@ comparables</h2>
<table>
<tr><th>Inmueble</th><th>Alc.</th><th class="n">Área</th><th class="n">Precio</th>
<th class="n">@@UNIDAD@@</th><th>Fuente y fecha</th></tr>
@@FILAS@@
</table>

<h2>Cómo lo leemos</h2>
<p class="lectura">@@LECTURA@@</p>
@@NOTAS@@

<h2>Cómo leer estas cifras</h2>
<p>Son <b>precios de oferta</b>, es decir lo que hoy se está pidiendo por
inmuebles comparables, no lo que efectivamente se pagó por ellos. El precio de
cierre suele quedar por debajo del de oferta. Sirven para ubicar un rango, no
para fijar un valor exacto.</p>
<p>Cada comparable trae su enlace y su fecha para que usted pueda verificarlo.
Si alguno le parece que no compara bien con su inmueble, dígamelo y lo
sacamos: la muestra es discutible y esa conversación es justamente el punto de
este documento.</p>

<div class="aviso">
<b>Esto no es un avalúo.</b> Es un estudio de precios de oferta preparado por
CINQ con información pública. La Ley 1673 de 2013 reserva los avalúos y los
dictámenes de valuación a los avaluadores inscritos en el Registro Abierto de
Avaluadores, y CINQ no lo es. Si usted necesita un avalúo con validez legal,
para una hipoteca, una sucesión o un proceso judicial, con gusto lo remitimos
a un avaluador inscrito.
</div>

<p class="firma">Samuel, CINQ<br>
<span class="fecha">Conectando oportunidades</span></p>
</div></body></html>"""


# --------------------------------------------------------------------------

EJEMPLO = {
    "tipo": "propiedad",
    "propietario": "",
    "inmueble": "",
    "zona": "",
    "area": "",
    "precio_pedido": 0,
    "incluir_portafolio": True,
    "notas": "",
    "comparables": [
        {"descripcion": "", "alcobas": "", "area": "", "precio": 0,
         "fuente": "Finca Raíz", "url": "", "fecha": ""}
    ],
}


def cmd_plantilla(args):
    destino = os.path.abspath(args.salida or "informe.json")
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(EJEMPLO, fh, ensure_ascii=False, indent=2)
    print("Escrito: %s\n" % destino)
    print("Cada comparable necesita fuente, url, fecha, precio y area. Sin eso")
    print("el informe no se genera: no publicamos cifras sin de donde salieron.")
    print("\nLas oportunidades que CINQ ya tiene en esa zona entran solas como")
    print("comparables propios. Se apaga con incluir_portafolio en false.")


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
