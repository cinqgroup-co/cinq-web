# -*- coding: utf-8 -*-
"""Prueba el bot de WhatsApp sin tocar la red ni la API de Meta.

    python herramientas/probar-bot.py

Lee el catalogo real del disco, simula mensajes entrantes y muestra que
contestaria el bot en cada caso. No envia nada: intercepta el envio.
"""
import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "api"))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import whatsapp as bot  # noqa: E402

ENVIADO = []


def falso_post(carga):
    ENVIADO.append(carga)
    return {"messages": [{"id": "fingido"}]}


bot._post = falso_post

CORREOS = []


def falso_correo(asunto, cuerpo):
    CORREOS.append({"asunto": asunto, "cuerpo": cuerpo})
    return True


bot._enviar_correo = falso_correo

fallos = []


def revisar(condicion, descripcion, detalle=""):
    print("  %s %s%s" % ("ok  " if condicion else "FALLA", descripcion,
                         "" if condicion else "   <- " + str(detalle)))
    if not condicion:
        fallos.append(descripcion)


def resumen(carga):
    t = carga.get("type")
    if t == "text":
        return "texto: " + carga["text"]["body"].replace("\n", " ")[:90]
    if t == "image":
        return "imagen: " + carga["image"]["link"].split("/")[-1] + \
               " | pie: " + carga["image"]["caption"].replace("\n", " ")[:70]
    if t == "interactive":
        i = carga["interactive"]
        if i["type"] == "button":
            op = [b["reply"]["title"] for b in i["action"]["buttons"]]
        else:
            op = [f["title"] for f in i["action"]["sections"][0]["rows"]]
        return "%s: %s" % (i["type"], " / ".join(op))
    if carga.get("status") == "read":
        return "marcar leido"
    return json.dumps(carga)[:90]


print("\n1. LECTURA DEL CATALOGO REAL\n")
ruta = os.path.join(RAIZ, "assets", "js", "oportunidades.js")
with open(ruta, encoding="utf-8") as fh:
    ops = json.loads(bot.js_a_json(fh.read()))
bot._cache["datos"] = ops
bot._cache["cuando"] = 9e18  # no vencer nunca durante la prueba

revisar(len(ops) == 4, "salen 4 oportunidades", len(ops))
for o in ops:
    print("     %-32s %-14s %s  %2d fotos" % (
        o["slug"], o["zona"], bot.precio_legible(o["precio"]), len(o["fotos"])))

ecoh = [o for o in ops if o["slug"] == "ecoh-710-loma-san-jose"][0]
revisar(ecoh["precio"] == 540000000, "precio del 710 intacto", ecoh["precio"])
revisar(len(ecoh["fotos"]) == 26, "26 fotos del 710", len(ecoh["fotos"]))
revisar(bot.dato(ecoh, "Dirección") == "Calle 77 Sur # 34-82",
        "la direccion se lee de la ficha", bot.dato(ecoh, "Dirección"))
revisar("guadual" in ecoh["descripcion"][0],
        "la descripcion no se corrompio al parsear")
revisar(bot.foto_portada(ecoh).endswith(
    "/ecoh-710-loma-san-jose/ecoh-710-01-sala-comedor.jpg"),
    "url de portada bien armada", bot.foto_portada(ecoh))
comunes = [f for f in ecoh["fotos"] if "/" in f["archivo"]][0]
url_comun = "%s/assets/img/portafolio/%s" % (bot.SITIO, comunes["archivo"])
revisar("/ecoh-zonas-comunes/" in url_comun,
        "las fotos compartidas no se cuelgan del slug")

print("\n2. INTENCIONES\n")
casos = [
    ("Hola, buenas tardes", "saludo"),
    ("que apartamentos tienen disponibles?", "portafolio"),
    ("quiero vender mi apartamento en sabaneta", "ofrecer"),
    ("busco apartamento en venta en envigado", "portafolio"),
    ("tengo una casa que quiero poner en venta", "ofrecer"),
    ("Necesito hablar con Samuel", "asesor"),
    ("Buenos dias", "saludo"),
    ("el area privada del 710 incluye el balcon?", None),
    ("ok", None),
    ("", None),
]
for texto, esperada in casos:
    obtenida = bot.intencion(texto)
    revisar(obtenida == esperada, '"%s" -> %s' % (texto[:42], obtenida),
            "esperaba %s" % esperada)

print("\n3. CONVERSACIONES\n")


def correr(titulo, **kwargs):
    ENVIADO.clear()
    accion = bot.responder("573001112233", **kwargs)
    print("  %s  [%s]" % (titulo, accion))
    for c in ENVIADO:
        print("      -> " + resumen(c))
    print()
    return accion, list(ENVIADO)


accion, msgs = correr("Escribe 'Hola'", texto="Hola")
revisar(accion == "menu", "un saludo abre el menu")
revisar(msgs[0]["interactive"]["action"]["buttons"][0]["reply"]["id"]
        == "menu:portafolio", "el primer boton lleva al portafolio")
for b in msgs[0]["interactive"]["action"]["buttons"]:
    revisar(len(b["reply"]["title"]) <= 20,
            "boton '%s' cabe en 20 caracteres" % b["reply"]["title"])

accion, msgs = correr("Toca 'Ver oportunidades'", boton="menu:portafolio")
revisar(accion == "zonas", "muestra las zonas")
filas = msgs[0]["interactive"]["action"]["sections"][0]["rows"]
revisar([f["id"] for f in filas] == ["zona:Envigado", "zona:Sabaneta",
                                     "zona:*"],
        "las zonas salen del catalogo, no de una lista fija",
        [f["id"] for f in filas])

accion, msgs = correr("Elige Sabaneta", boton="zona:Sabaneta")
revisar(accion == "oportunidades", "lista las de Sabaneta")
filas = msgs[0]["interactive"]["action"]["sections"][0]["rows"]
revisar(len(filas) == 2, "son dos en Sabaneta", len(filas))
for f in filas:
    revisar(len(f["title"]) <= 24, "titulo '%s' cabe en 24" % f["title"])
    revisar(len(f["description"]) <= 72, "descripcion cabe en 72")

accion, msgs = correr("Elige el 710", boton="op:ecoh-710-loma-san-jose")
revisar(accion == "ficha", "manda la ficha")
revisar(msgs[0]["type"] == "image", "la ficha entra por la foto de portada")
pie = msgs[0]["image"]["caption"]
revisar("540.000.000" in pie, "el precio va formateado en pesos")
revisar("oportunidad.html?id=ecoh-710" in pie, "lleva el enlace a la ficha")
revisar(len(pie) <= 1024, "el pie cabe en el limite de WhatsApp", len(pie))
revisar("—" not in pie and "–" not in pie, "sin guiones medios en el pie")

accion, _ = correr("Toca 'Ofrecer un inmueble'", boton="menu:ofrecer")
revisar(accion == "ofrecer", "explica el filtro de CINQ")

accion, _ = correr("Toca 'Hablar con Samuel'", boton="menu:asesor")
revisar(accion == "asesor", "deriva a Samuel")

print("4. LO QUE NO ENTIENDE Y LAS ALERTAS\n")
ENVIADO.clear()
CORREOS.clear()
bot.en_horario = lambda ahora=None: True
accion = bot.responder("573001112233", texto="el area privada incluye balcon?",
                       nombre="Claudia Lopez")
revisar(accion == "silencio" and not ENVIADO,
        "en horario no le contesta nada al cliente", accion)
revisar(len(CORREOS) == 1, "pero si le avisa a Samuel por correo", len(CORREOS))
if CORREOS:
    correo = CORREOS[0]
    print("      asunto: " + correo["asunto"])
    print("      cuerpo: " + correo["cuerpo"].replace("\n", " | ")[:130])
    revisar("Claudia Lopez" in correo["asunto"],
            "la alerta trae el nombre del perfil, no solo el numero")
    revisar("incluye balcon" in correo["cuerpo"],
            "la alerta trae lo que escribio el cliente")
    revisar("https://wa.me/573001112233" in correo["cuerpo"],
            "trae el enlace para contestarle desde el celular")

ENVIADO.clear()
CORREOS.clear()
bot.en_horario = lambda ahora=None: False
accion = bot.responder("573001112233", texto="el area privada incluye balcon?")
revisar(accion == "ausencia" and len(ENVIADO) == 1,
        "fuera de horario si manda el mensaje de ausencia", accion)
revisar(len(CORREOS) == 1, "y tambien avisa por correo")

ENVIADO.clear()
CORREOS.clear()
bot.responder("573001112233", boton="menu:asesor", nombre="Claudia Lopez")
revisar(len(CORREOS) == 1 and "hablar con usted" in CORREOS[0]["asunto"],
        "pedir hablar con Samuel dispara alerta",
        CORREOS[0]["asunto"] if CORREOS else "ninguna")

ENVIADO.clear()
CORREOS.clear()
bot.responder("573001112233", boton="menu:portafolio")
revisar(not CORREOS, "mirar el portafolio no molesta a Samuel")

print()
print("   Sin GMAIL_USUARIO configurado el correo no se envia y el bot sigue:")
CORREOS.clear()
correo_real = bot._enviar_correo
bot._enviar_correo = lambda a, c: False  # simula que no hay credenciales
ENVIADO.clear()
accion = bot.responder("573001112233", boton="menu:asesor")
revisar(accion == "asesor" and len(ENVIADO) == 1,
        "el cliente recibe su respuesta igual", accion)
bot._enviar_correo = correo_real

print("\n5. HORARIO (hora de Colombia, sin tzdata)\n")
import calendar  # noqa: E402
import importlib  # noqa: E402
import time as _t  # noqa: E402

importlib.reload(bot)
bot._post = falso_post


def colombia(anio, mes, dia, hora, minuto=0):
    """Epoch de una hora de Colombia. UTC-5 todo el año, no hay horario de
    verano, asi que basta sumar cinco horas para llegar a UTC."""
    return calendar.timegm((anio, mes, dia, hora + 5, minuto, 0, 0, 0, 0))


pruebas = [
    (colombia(2026, 9, 8, 10, 10), True, "martes 10:10 a.m."),
    (colombia(2026, 9, 8, 7, 59), False, "martes 7:59 a.m., antes de abrir"),
    (colombia(2026, 9, 8, 19, 0), False, "martes 7:00 p.m., ya cerrado"),
    (colombia(2026, 9, 12, 10, 0), True, "sabado 10:00 a.m."),
    (colombia(2026, 9, 12, 14, 0), False, "sabado 2:00 p.m."),
    (colombia(2026, 9, 13, 12, 0), False, "domingo mediodia"),
]
for marca, esperado, etiqueta in pruebas:
    col = _t.gmtime(marca - 5 * 3600)
    revisar(bot.en_horario(marca) == esperado,
            "%s -> %s" % (etiqueta, bot.en_horario(marca)),
            "el reloj dice %s" % _t.strftime("%a %H:%M", col))

print("\n6. SEGURIDAD DEL WEBHOOK\n")
os.environ["WHATSAPP_APP_SECRET"] = "secreto-de-prueba"
cuerpo = b'{"object":"whatsapp_business_account"}'
import hashlib as _h  # noqa: E402
import hmac as _hm  # noqa: E402
buena = "sha256=" + _hm.new(b"secreto-de-prueba", cuerpo, _h.sha256).hexdigest()
revisar(bot.firma_valida(cuerpo, buena), "acepta la firma correcta")
revisar(not bot.firma_valida(cuerpo, "sha256=" + "0" * 64),
        "rechaza una firma falsa")
revisar(not bot.firma_valida(cuerpo, None), "rechaza si no viene firma")
revisar(not bot.firma_valida(cuerpo + b" ", buena),
        "rechaza si el cuerpo fue alterado")

print("\n7. PAYLOAD REAL DE META\n")
ENVIADO.clear()
payload = {
    "object": "whatsapp_business_account",
    "entry": [{"id": "0", "changes": [{"field": "messages", "value": {
        "messaging_product": "whatsapp",
        "metadata": {"display_phone_number": "573022758992",
                     "phone_number_id": "000"},
        "contacts": [{"profile": {"name": "Prueba"}, "wa_id": "573001112233"}],
        "messages": [{"from": "573001112233", "id": "wamid.XXX",
                      "timestamp": "1757345400", "type": "text",
                      "text": {"body": "Hola, que tienen disponible?"}}]}}]}]}
hechos = bot.procesar(payload)
revisar(hechos == ["zonas"], "el payload de Meta llega hasta la respuesta",
        hechos)
revisar(any(c.get("status") == "read" for c in ENVIADO),
        "marca el mensaje como leido")

ENVIADO.clear()
payload["entry"][0]["changes"][0]["value"]["messages"] = [{
    "from": "573001112233", "id": "wamid.YYY", "type": "image",
    "image": {"id": "1", "mime_type": "image/jpeg"}}]
hechos = bot.procesar(payload)
revisar(hechos == ["material"], "una foto entrante se agradece", hechos)

ENVIADO.clear()
payload["entry"][0]["changes"][0]["value"] = {
    "statuses": [{"id": "wamid.ZZZ", "status": "delivered"}]}
hechos = bot.procesar(payload)
revisar(hechos == [] and not ENVIADO,
        "los acuses de entrega no disparan nada", hechos)

print("\n" + "=" * 62)
if fallos:
    print("%d comprobaciones fallaron:" % len(fallos))
    for f in fallos:
        print("   - " + f)
    sys.exit(1)
print("Todo en orden. El bot no envio nada a la red durante la prueba.")
