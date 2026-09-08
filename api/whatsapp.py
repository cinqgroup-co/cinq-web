# -*- coding: utf-8 -*-
"""Bot de WhatsApp de CINQ, sobre la API de WhatsApp Cloud de Meta.

Funcion serverless de Vercel. Solo libreria estandar: no hay requirements.txt
ni build, igual que el resto del sitio.

    GET  /api/whatsapp   verificacion del webhook (hub.challenge)
    POST /api/whatsapp   mensajes entrantes

Variables de entorno (Vercel: Settings -> Environment Variables):

    WHATSAPP_TOKEN         token permanente del usuario del sistema
    WHATSAPP_PHONE_ID      id del numero, no el numero
    WHATSAPP_VERIFY_TOKEN  cadena inventada, la misma que se pega en Meta
    WHATSAPP_APP_SECRET    clave secreta de la app, para validar la firma
    CINQ_CATALOGO_URL      opcional, por si el sitio cambia de dominio

REGLA DE ORO: el bot solo habla cuando entiende. Si llega un mensaje que no
encaja con ninguna intencion y estamos en horario, se queda callado para que
conteste Samuel. Un bot que interrumpe una conversacion real hace mas daño que
uno que no existe.
"""
import hashlib
import hmac
import json
import os
import re
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

VERSION_API = "v23.0"
CATALOGO_URL = os.environ.get(
    "CINQ_CATALOGO_URL",
    "https://cinq-web.vercel.app/assets/js/oportunidades.js")
SITIO = "https://cinq-web.vercel.app"

# Horario de atencion, hora de Colombia (UTC-5). Fuera de esto el bot manda el
# mensaje de ausencia en vez de quedarse callado.
HORARIO = {0: (8, 19), 1: (8, 19), 2: (8, 19), 3: (8, 19), 4: (8, 19),
           5: (9, 13), 6: None}


# --------------------------------------------------------------------------
# Catalogo: se lee del mismo archivo que dibuja el portafolio, para que no
# existan dos listas de inmuebles que se puedan desincronizar.
# --------------------------------------------------------------------------

_cache = {"cuando": 0, "datos": []}
CACHE_SEGUNDOS = 300


def js_a_json(texto):
    """Convierte el array CINQ_OPORTUNIDADES a JSON.

    El archivo es JavaScript, no JSON: las llaves van sin comillas y hay
    comentarios. Se recorre caracter por caracter para no tocar nada que este
    dentro de una cadena, que es donde viven las descripciones con comillas,
    los '//' de las URLs y los ':' de las horas.
    """
    inicio = texto.index("CINQ_OPORTUNIDADES")
    inicio = texto.index("[", inicio)
    salida = []
    dentro_cadena = False
    escapado = False
    i = inicio
    profundidad = 0
    while i < len(texto):
        c = texto[i]
        if dentro_cadena:
            salida.append(c)
            if escapado:
                escapado = False
            elif c == "\\":
                escapado = True
            elif c == '"':
                dentro_cadena = False
            i += 1
            continue
        if c == '"':
            dentro_cadena = True
            salida.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < len(texto):
            if texto[i + 1] == "*":
                fin = texto.index("*/", i + 2)
                i = fin + 2
                continue
            if texto[i + 1] == "/":
                fin = texto.find("\n", i)
                i = len(texto) if fin == -1 else fin
                continue
        if c == "[":
            profundidad += 1
        elif c == "]":
            profundidad -= 1
            salida.append(c)
            if profundidad == 0:
                break
            i += 1
            continue
        salida.append(c)
        i += 1

    crudo = "".join(salida)
    # llaves sin comillas -> con comillas
    crudo = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)',
                   r'\1"\2"\3', crudo)
    # comas colgantes antes de cerrar
    crudo = re.sub(r',(\s*[}\]])', r'\1', crudo)
    return crudo


def catalogo():
    """Oportunidades publicadas. Cachea en memoria entre invocaciones tibias."""
    if _cache["datos"] and time.time() - _cache["cuando"] < CACHE_SEGUNDOS:
        return _cache["datos"]
    try:
        with urllib.request.urlopen(CATALOGO_URL, timeout=6) as r:
            texto = r.read().decode("utf-8")
        datos = json.loads(js_a_json(texto))
        datos = [o for o in datos if o.get("slug") and o.get("titulo")]
        _cache["datos"] = datos
        _cache["cuando"] = time.time()
    except Exception as e:  # el bot sigue vivo aunque el catalogo falle
        log("no se pudo leer el catalogo: %s" % e)
        return _cache["datos"]
    return datos


def precio_legible(valor):
    try:
        return "$ " + "{:,.0f}".format(int(valor)).replace(",", ".")
    except Exception:
        return ""


def foto_portada(op):
    fotos = op.get("fotos") or []
    if not fotos:
        return None
    archivo = fotos[0].get("archivo", "")
    if not archivo:
        return None
    if "/" in archivo:  # foto compartida entre fichas del mismo edificio
        return "%s/assets/img/portafolio/%s" % (SITIO, archivo)
    return "%s/assets/img/portafolio/%s/%s" % (SITIO, op["slug"], archivo)


def enlace_ficha(op):
    return "%s/oportunidad.html?id=%s" % (SITIO, op["slug"])


def dato(op, etiqueta):
    for fila in op.get("ficha") or []:
        if len(fila) == 2 and fila[0].lower().startswith(etiqueta.lower()):
            return fila[1]
    return None


# --------------------------------------------------------------------------
# Envio
# --------------------------------------------------------------------------

def log(mensaje):
    print("[cinq-wa] %s" % mensaje)


def _post(carga):
    token = os.environ.get("WHATSAPP_TOKEN")
    phone_id = os.environ.get("WHATSAPP_PHONE_ID")
    if not token or not phone_id:
        log("faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_ID, no se envia nada")
        return None
    url = "https://graph.facebook.com/%s/%s/messages" % (VERSION_API, phone_id)
    datos = json.dumps(carga).encode("utf-8")
    pedido = urllib.request.Request(url, data=datos, method="POST")
    pedido.add_header("Authorization", "Bearer %s" % token)
    pedido.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(pedido, timeout=10) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        log("error %s de Meta: %s" % (e.code, e.read().decode("utf-8")[:400]))
    except Exception as e:
        log("error enviando: %s" % e)
    return None


def enviar_texto(a, cuerpo, vista_previa=True):
    return _post({"messaging_product": "whatsapp", "to": a, "type": "text",
                  "text": {"preview_url": vista_previa, "body": cuerpo}})


def enviar_imagen(a, url, pie):
    return _post({"messaging_product": "whatsapp", "to": a, "type": "image",
                  "image": {"link": url, "caption": pie}})


def recortar(texto, n):
    texto = " ".join((texto or "").split())
    return texto if len(texto) <= n else texto[:n - 1].rstrip() + "…"


def enviar_botones(a, cuerpo, botones, pie=None):
    """Maximo 3 botones. El titulo aguanta 20 caracteres."""
    inter = {
        "type": "button",
        "body": {"text": cuerpo},
        "action": {"buttons": [
            {"type": "reply",
             "reply": {"id": b["id"], "title": recortar(b["titulo"], 20)}}
            for b in botones[:3]]}}
    if pie:
        inter["footer"] = {"text": recortar(pie, 60)}
    return _post({"messaging_product": "whatsapp", "to": a,
                  "type": "interactive", "interactive": inter})


def enviar_lista(a, cuerpo, boton, filas, pie=None):
    """Maximo 10 filas. Titulo 24 caracteres, descripcion 72."""
    inter = {
        "type": "list",
        "body": {"text": cuerpo},
        "action": {"button": recortar(boton, 20), "sections": [{
            "title": "Opciones",
            "rows": [{"id": f["id"],
                      "title": recortar(f["titulo"], 24),
                      "description": recortar(f.get("detalle", ""), 72)}
                     for f in filas[:10]]}]}}
    if pie:
        inter["footer"] = {"text": recortar(pie, 60)}
    return _post({"messaging_product": "whatsapp", "to": a,
                  "type": "interactive", "interactive": inter})


def marcar_leido(id_mensaje):
    return _post({"messaging_product": "whatsapp", "status": "read",
                  "message_id": id_mensaje})


# --------------------------------------------------------------------------
# Textos. Registro de usted, sin emojis y sin guiones medios, como el sitio.
# --------------------------------------------------------------------------

MENU = ("Gracias por escribir a CINQ.\n\n"
        "Para atenderlo mejor, digame que lo trae por aqui.")

AUSENCIA = ("Gracias por escribir a CINQ. En este momento estamos fuera de "
            "horario de atencion.\n\n"
            "Le respondemos el siguiente dia habil. Mientras tanto puede ver "
            "el portafolio completo en " + SITIO + "/portafolio.html")

OFRECER = (
    "CINQ no publica todo lo que llega: evaluamos cada inmueble antes de "
    "aceptarlo, y por eso el portafolio es corto.\n\n"
    "Para empezar necesitamos la direccion o el sector, el precio que tiene en "
    "mente, el area y unas fotos con luz natural. Puede enviarlas por aqui "
    "mismo.\n\n"
    "Si prefiere dejarlo por escrito, este es el formulario: "
    + SITIO + "/ofrecer.html\n\n"
    "Revisamos y le damos respuesta dentro de 24 a 48 horas habiles, sea cual "
    "sea.")

ASESOR = ("Con gusto. Ya le avisamos a Samuel y le escribe en el transcurso "
          "del dia.\n\n"
          "Si quiere adelantar, cuenteme aqui mismo de que se trata y asi "
          "llega con contexto.")

SIN_INVENTARIO = (
    "En este momento no tenemos oportunidades publicadas en esa zona.\n\n"
    "Si me dice que esta buscando, le aviso apenas entre algo que encaje.")


# --------------------------------------------------------------------------
# Intenciones
# --------------------------------------------------------------------------

# El orden importa y no es alfabetico: se evalua de lo mas especifico a lo mas
# generico. "Quiero vender mi apartamento" tiene que caer en ofrecer, no en
# portafolio, aunque contenga la palabra apartamento. Por eso tampoco estan
# "apartamento" ni "inmueble" sueltas en portafolio: las dice tanto el que
# compra como el que vende, asi que no distinguen nada.
CLAVES = [
    ("ofrecer", ["vender", "vendo", "ofrecer", "ofrezco", "tengo un",
                 "tengo una", "consignar", "mi apartamento", "mi casa",
                 "mi carro", "mi finca", "quiero que me lo vendan",
                 "para la venta", "poner en venta"]),
    ("asesor", ["asesor", "samuel", "hablar con", "una persona", "humano",
                "llamar", "llamada", "cita", "visita", "agendar"]),
    ("portafolio", ["portafolio", "oportunidad", "disponible", "que tienen",
                    "qué tienen", "que hay", "qué hay", "comprar", "arriendo",
                    "venden", "catalogo", "catálogo", "opciones", "busco",
                    "estoy buscando", "en venta"]),
    ("saludo", ["hola", "buenas", "buenos dias", "buenos días", "buen dia",
                "buenas tardes", "buenas noches", "que tal", "qué tal",
                "menu", "menú", "info", "informacion", "información"]),
]


def normalizar(texto):
    return " ".join((texto or "").lower().split())


def intencion(texto):
    t = normalizar(texto)
    if not t:
        return None
    for nombre, claves in CLAVES:
        for clave in claves:
            if clave in t:
                return nombre
    return None


def en_horario(ahora=None):
    """Hora de Colombia sin depender de tzdata, que no esta en el runtime."""
    ahora = ahora if ahora is not None else time.time()
    col = time.gmtime(ahora - 5 * 3600)
    franja = HORARIO.get(col.tm_wday)
    if not franja:
        return False
    return franja[0] <= col.tm_hour < franja[1]


# --------------------------------------------------------------------------
# Conversacion
# --------------------------------------------------------------------------

def mostrar_menu(a):
    enviar_botones(a, MENU, [
        {"id": "menu:portafolio", "titulo": "Ver oportunidades"},
        {"id": "menu:ofrecer", "titulo": "Ofrecer un inmueble"},
        {"id": "menu:asesor", "titulo": "Hablar con Samuel"},
    ], pie="CINQ, conectando oportunidades")


def mostrar_zonas(a):
    ops = catalogo()
    if not ops:
        enviar_texto(a, SIN_INVENTARIO)
        return
    zonas = []
    for op in ops:
        z = op.get("zona")
        if z and z not in zonas:
            zonas.append(z)
    if len(zonas) < 2:
        mostrar_oportunidades(a, zonas[0] if zonas else None)
        return
    filas = []
    for z in zonas:
        cuantas = len([o for o in ops if o.get("zona") == z])
        filas.append({"id": "zona:%s" % z, "titulo": z,
                      "detalle": "%d %s" % (
                          cuantas,
                          "oportunidad" if cuantas == 1 else "oportunidades")})
    filas.append({"id": "zona:*", "titulo": "Ver todas",
                  "detalle": "%d en total" % len(ops)})
    enviar_lista(a, "Estas son las zonas donde CINQ tiene inventario hoy.",
                 "Elegir zona", filas)


def mostrar_oportunidades(a, zona=None):
    ops = catalogo()
    if zona and zona != "*":
        ops = [o for o in ops if o.get("zona") == zona]
    if not ops:
        enviar_texto(a, SIN_INVENTARIO)
        return
    if len(ops) == 1:
        enviar_ficha(a, ops[0])
        return
    filas = [{"id": "op:%s" % o["slug"],
              "titulo": o.get("titulo", ""),
              "detalle": "%s  %s" % (precio_legible(o.get("precio")),
                                     o.get("subtipo", ""))}
             for o in ops]
    enviar_lista(a, "Esto es lo que hay publicado hoy. Todas con fotos "
                    "propias, tomadas en la visita.",
                 "Ver oportunidades", filas)


def enviar_ficha(a, op):
    lineas = ["*%s*" % op.get("titulo", ""), precio_legible(op.get("precio"))]
    for etiqueta in ("Área construida", "Alcobas", "Baños", "Parqueadero",
                     "Estrato", "Administración"):
        valor = dato(op, etiqueta)
        if valor:
            lineas.append("%s: %s" % (etiqueta, valor))
    descripcion = (op.get("descripcion") or [""])[0]
    if descripcion:
        lineas.append("")
        lineas.append(recortar(descripcion, 380))
    lineas.append("")
    lineas.append("Ficha completa con todas las fotos:")
    lineas.append(enlace_ficha(op))
    texto = "\n".join([l for l in lineas if l is not None])

    portada = foto_portada(op)
    if portada:
        enviar_imagen(a, portada, texto)
    else:
        enviar_texto(a, texto)
    enviar_botones(a, "¿Quiere que Samuel le cuente lo que no sale publicado?",
                   [{"id": "menu:asesor", "titulo": "Si, que me escriba"},
                    {"id": "menu:portafolio", "titulo": "Ver otras"}])


def responder(a, texto=None, boton=None, id_mensaje=None):
    """Decide que hacer con un mensaje. Devuelve la accion, para las pruebas."""
    if id_mensaje:
        marcar_leido(id_mensaje)

    if boton:
        if boton == "menu:portafolio":
            mostrar_zonas(a)
            return "zonas"
        if boton == "menu:ofrecer":
            enviar_texto(a, OFRECER)
            return "ofrecer"
        if boton == "menu:asesor":
            enviar_texto(a, ASESOR)
            avisar_a_samuel(a)
            return "asesor"
        if boton.startswith("zona:"):
            mostrar_oportunidades(a, boton.split(":", 1)[1])
            return "oportunidades"
        if boton.startswith("op:"):
            slug = boton.split(":", 1)[1]
            for op in catalogo():
                if op.get("slug") == slug:
                    enviar_ficha(a, op)
                    return "ficha"
            enviar_texto(a, SIN_INVENTARIO)
            return "ficha-no-encontrada"
        return "boton-desconocido"

    quiere = intencion(texto)
    if quiere == "portafolio":
        mostrar_zonas(a)
        return "zonas"
    if quiere == "ofrecer":
        enviar_texto(a, OFRECER)
        return "ofrecer"
    if quiere == "asesor":
        enviar_texto(a, ASESOR)
        avisar_a_samuel(a)
        return "asesor"
    if quiere == "saludo":
        mostrar_menu(a)
        return "menu"

    # No se entendio. En horario se calla para que conteste Samuel.
    if not en_horario():
        enviar_texto(a, AUSENCIA)
        return "ausencia"
    return "silencio"


def avisar_a_samuel(de_quien):
    """Le pasa el numero a Samuel, si hay un destino configurado.

    Requiere que ese numero le haya escrito al bot en las ultimas 24 horas, o
    una plantilla aprobada. Sin NOTIFICAR_A configurado no hace nada.
    """
    destino = os.environ.get("NOTIFICAR_A")
    if not destino:
        return
    enviar_texto(destino, "Lead nuevo en el WhatsApp de CINQ: +%s pidio "
                          "hablar con usted." % de_quien, vista_previa=False)


# --------------------------------------------------------------------------
# Webhook
# --------------------------------------------------------------------------

def firma_valida(cuerpo, cabecera):
    secreto = os.environ.get("WHATSAPP_APP_SECRET")
    if not secreto:
        log("sin WHATSAPP_APP_SECRET no se puede validar la firma")
        return False
    if not cabecera or not cabecera.startswith("sha256="):
        return False
    esperada = hmac.new(secreto.encode("utf-8"), cuerpo,
                        hashlib.sha256).hexdigest()
    return hmac.compare_digest(esperada, cabecera.split("=", 1)[1])


def procesar(carga):
    """Recorre el payload de Meta y contesta cada mensaje. Devuelve acciones."""
    hechos = []
    for entrada in carga.get("entry", []):
        for cambio in entrada.get("changes", []):
            valor = cambio.get("value", {})
            for mensaje in valor.get("messages", []):
                de = mensaje.get("from")
                tipo = mensaje.get("type")
                id_msg = mensaje.get("id")
                if tipo == "text":
                    hechos.append(responder(
                        de, texto=(mensaje.get("text") or {}).get("body"),
                        id_mensaje=id_msg))
                elif tipo == "interactive":
                    inter = mensaje.get("interactive") or {}
                    respuesta = (inter.get("button_reply")
                                 or inter.get("list_reply") or {})
                    hechos.append(responder(de, boton=respuesta.get("id"),
                                            id_mensaje=id_msg))
                elif tipo in ("image", "document", "video", "audio"):
                    # Casi siempre es un propietario mandando fotos. Se agradece
                    # y se deja la conversacion en manos de Samuel.
                    enviar_texto(de, "Recibimos el material, gracias. Lo "
                                     "revisamos y le damos respuesta dentro de "
                                     "24 a 48 horas habiles.")
                    avisar_a_samuel(de)
                    hechos.append("material")
                else:
                    hechos.append("ignorado:%s" % tipo)
    return hechos


class handler(BaseHTTPRequestHandler):

    def _responder(self, codigo, cuerpo="", tipo="text/plain; charset=utf-8"):
        datos = cuerpo.encode("utf-8") if isinstance(cuerpo, str) else cuerpo
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def do_GET(self):
        from urllib.parse import parse_qs, urlparse
        q = parse_qs(urlparse(self.path).query)
        modo = (q.get("hub.mode") or [""])[0]
        token = (q.get("hub.verify_token") or [""])[0]
        reto = (q.get("hub.challenge") or [""])[0]
        esperado = os.environ.get("WHATSAPP_VERIFY_TOKEN")
        if modo == "subscribe" and esperado and token == esperado:
            log("webhook verificado")
            return self._responder(200, reto)
        log("verificacion rechazada")
        return self._responder(403, "no")

    def do_POST(self):
        largo = int(self.headers.get("Content-Length") or 0)
        cuerpo = self.rfile.read(largo) if largo else b""
        if not firma_valida(cuerpo, self.headers.get("X-Hub-Signature-256")):
            log("firma invalida, se descarta")
            return self._responder(403, "no")
        # Meta reintenta si no ve un 200 rapido, y un reintento son mensajes
        # repetidos para el cliente. Se responde antes de trabajar.
        self._responder(200, "ok")
        try:
            procesar(json.loads(cuerpo.decode("utf-8")))
        except Exception as e:
            log("error procesando: %s" % e)

    def log_message(self, *args):
        pass
