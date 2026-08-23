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

El orden de la galeria es el orden de descarga (mtime ascendente), no el orden
alfabetico: WhatsApp nombra los archivos por hora de captura, que no es la
misma secuencia en la que se recorrio el inmueble.

El JPG se copia tal cual si ya viene por debajo del maximo; recomprimirlo solo
degrada una imagen que WhatsApp ya comprimio. El WebP se genera siempre.
"""
import argparse
import glob
import os
import shutil
import sys

from PIL import Image

MAX_LADO = 1920
CALIDAD = 82
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


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
                     key=os.path.getmtime)
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
