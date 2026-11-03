"""Erzeugt die portable Offline-Demo aus den aktuellen Arbeitsdateien.

Aufruf: python3 mmk/build_demo.py
"""
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent


def build_demo():
    app = (ROOT / 'app.html').read_text()
    css = (ROOT / 'styles.css').read_text()
    javascript = (ROOT / 'app.js').read_text()
    pages = [
        'uebersicht.html',
        'ackerschlaege.html',
        'roboterverwaltung.html',
        'auftragsverwaltung.html',
    ]
    content = '\n'.join((ROOT / 'pages' / page).read_text() for page in pages)

    # Alle Ressourcen werden direkt eingebettet; fetch und Webserver entfallen.
    app = re.sub(r'<link\s+rel="stylesheet"\s+href="styles.css(?:\?[^"\s]*)?"\s*>',
                 lambda _: '<style>\n' + css + '\n</style>', app)
    app = re.sub(r'<script\s+src="bootstrap.js(?:\?[^"\s]*)?"\s+defer>\s*</script>', '', app)
    app, count = re.subn(
        r'<main id="page-content" aria-busy="true">\s*</main>',
        lambda _: '<main id="page-content">\n' + content + '\n</main>', app,
    )
    if count != 1:
        raise ValueError('Inhaltsbereich der Grunddatei nicht gefunden.')
    app = app.replace('</body>', '<script>\n' + javascript + '\n</script>\n</body>')

    # srcdoc erhält die unabhängige Anwendung innerhalb des iPad-Rahmens.
    frame = (ROOT / 'index.html').read_text()
    frame, frame_count = re.subn(r'src="app\.html(?:\?[^"\s]*)?"',
                                  lambda _: 'srcdoc="' + escape(app, quote=True) + '"', frame)
    if frame_count != 1:
        raise ValueError('iPad-Rahmen mit app.html nicht gefunden.')
    frame = frame.replace('<title>ROBOplan – iPad</title>',
                          '<title>ROBOplan – Offline-Demo</title>')
    target = ROOT / 'ROBOplan-Demo.html'
    target.write_text(frame)
    print(f'Erstellt: {target.name} ({target.stat().st_size:,} Bytes)')


if __name__ == '__main__':
    build_demo()
