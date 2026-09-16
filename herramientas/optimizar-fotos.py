# -*- coding: utf-8 -*-
"""Prepara las fotos de una oportunidad para el portafolio de CINQ.

Toma una carpeta con las fotos originales (por ejemplo las que llegan por
WhatsApp), las ordena por fecha de descarga, las renombra con los nombres que
se le pasen y deja en la carpeta de la oportunidad el par JPG + WebP que espera
el sitio.

    python herramientas/optimizar-fotos.py ORIGEN SLUG NOMBRES.TXT [--patron "*.jpeg"]

  ORIGEN       carpeta donde estan las fotos originales
  SLUG         slug de la oportunidad; la salida va a assets/img/portafolio/SLUG/
  NOMBRES.TXT  un nombre de archivo por linea, en el orden final de la galeria

El orden de la galeria es el orden alfabetico del nombre del archivo, con los
numeros comparados como numeros (asi -2- va antes de -10-, y no al reves).

Antes ordenaba por mtime, y estaba mal. Cuando un lote llega de WhatsApp Web de
un solo golpe, las descargas comparten el segundo de mtime: 31 fotos de un
inmueble cayeron todas dentro del mismo segundo. Con el empate, sorted() cae al
orden en que el sistema de archivos devuelve los nombres, que no es cronologico,
y como aqui el orden decide que nombre y que alt text le toca a cada foto, un
empate publica el bano con el nombre de la cocina. No avisa: se ve en la pagina.

Por eso el origen tiene que venir ya con el indice en el nombre (-01-, -02-, ...),
que es lo que deja mapear.py al emparejar cada descarga con su nombre final. El
orden se lee del nombre, no se deduce de una fecha.

El JPG se copia tal cual si ya viene por debajo del maximo; recomprimirlo solo
degrada una imagen que WhatsApp ya comprimio. El WebP se genera siempre.
"""
import argparse
import glob
import os
import re
import shutil
import sys

from PIL import Image

MAX_LADO = 1920
CALIDAD = 82
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def clave_natural(ruta):
    """Ordena por nombre tratando los numeros como numeros.

    Sin esto, -10- se ordena antes que -2-, que es justo lo que rompe una
    galeria de mas de nueve fotos.
    """
    nombre = os.path.basename(ruta).lower()
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", nombre)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("origen")
    ap.add_argument("slug")
    ap.add_argument("nombres")
    ap.add_argument("--patron", default="*.jpg")
    args = ap.parse_args()

    with open(args.nombres, encoding="utf-8") as fh:
        nombres = [l.strip() for l in fh if l.strip() and not l.startswith("#")]

    fuentes = sorted(glob.glob(os.path.join(args.origen, args.patron)),
                     key=clave_natural)
    if len(fuentes) != len(nombres):
        sys.exit("Hay %d fotos en el origen y %d nombres en la lista." %
                 (len(fuentes), len(nombres)))

    destino = os.path.join(RAIZ, "assets", "img", "portafolio", args.slug)
    os.makedirs(destino, exist_ok=True)

    for origen, nombre in zip(fuentes, nombres):
        jpg = os.path.join(destino, nombre)
        im = Image.open(origen).convert("RGB")
        if max(im.size) > MAX_LADO:
            im.thumbnail((MAX_LADO, MAX_LADO), Image.LANCZOS)
            im.save(jpg, "JPEG", quality=CALIDAD, optimize=True)
        else:
            shutil.copyfile(origen, jpg)

        webp = os.path.splitext(jpg)[0] + ".webp"
        im.save(webp, "WEBP", quality=CALIDAD, method=6)

        print("%-40s %4dx%-5d jpg %4d KB  webp %4d KB" % (
            nombre, im.size[0], im.size[1],
            os.path.getsize(jpg) // 1024, os.path.getsize(webp) // 1024))

    print("\n%d fotos en %s" % (len(nombres), destino))
    print("Falta el alt de cada foto en assets/js/oportunidades.js.")


if __name__ == "__main__":
    main()
