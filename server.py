"""ROBOplan-Nutzertest: Webserver, Ablaufsteuerung und Datenspeicher.

Start:   python3 server.py            (Port 8000)
         python3 server.py --port 8080

Nur Python-Standardbibliothek. iPad und Testleitungsrechner müssen im selben
WLAN sein. Die Adressen werden beim Start ausgegeben.

Datenfluss
- iPad (app.html?studie=1) und Testleitung (/testleitung) verbinden sich per
  Server-Sent Events mit /api/strom und erhalten darüber den Sitzungsstand,
  KI-Antworten und Live-Ereignisse.
- Beide Seiten ändern den Ablauf über POST /api/sitzung. Der Server ist die
  einzige Quelle für Phase, Zeiten und Ergebnisse; Zeitstempel setzt der Server.
- Rohereignisse (Taps, Ansichten, Aktionen) gehen per POST /api/protokoll in
  studien-daten/<sitzung>.ereignisse.jsonl.
"""
import argparse
import csv
import io
import json
import mimetypes
import os
import queue
import re
import socket
import threading
import time
import uuid
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'studien-daten'
LOCK = threading.RLock()
CLIENTS = []  # [{'rolle': 'ipad'|'leitung', 'q': Queue}]
STATE = {'sitzung': None}
PHASES = ('willkommen', 'intro', 'laeuft', 'seq', 'fragebogen', 'danke', 'beendet')
BLOCKED = ('studien-daten', '.git', '.claude')


def now_ms():
    return int(time.time() * 1000)


def iso(ms):
    if not ms:
        return ''
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(ms / 1000))


# ---------------------------------------------------------------- Speicher
def session_path(sid):
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,80}', sid or ''):
        raise ValueError('Ungültige Sitzungs-ID')
    return DATA / (sid + '.json')


def save_session(s):
    DATA.mkdir(exist_ok=True)
    path = session_path(s['id'])
    tmp = path.with_suffix('.tmp')
    tmp.write_text(json.dumps(s, ensure_ascii=False, indent=1), encoding='utf-8')
    os.replace(tmp, path)
    (DATA / 'aktiv.json').write_text(json.dumps({'id': s['id'] if s['phase'] != 'beendet' else None}), encoding='utf-8')


def load_session(sid):
    return json.loads(session_path(sid).read_text(encoding='utf-8'))


def all_sessions():
    if not DATA.exists():
        return []
    out = []
    for p in sorted(DATA.glob('*.json')):
        if p.name == 'aktiv.json':
            continue
        try:
            out.append(json.loads(p.read_text(encoding='utf-8')))
        except (OSError, ValueError):
            pass
    out.sort(key=lambda s: s.get('erstellt', 0))
    return out


def append_events(sid, events):
    DATA.mkdir(exist_ok=True)
    with open(DATA / (sid + '.ereignisse.jsonl'), 'a', encoding='utf-8') as fh:
        for ev in events:
            fh.write(json.dumps(ev, ensure_ascii=False) + '\n')


def restore_active():
    try:
        sid = json.loads((DATA / 'aktiv.json').read_text(encoding='utf-8')).get('id')
        if sid:
            STATE['sitzung'] = load_session(sid)
    except (OSError, ValueError):
        pass


# ---------------------------------------------------------------- Verteilung
def broadcast(event, payload, rolle=None):
    msg = 'event: %s\ndata: %s\n\n' % (event, json.dumps(payload, ensure_ascii=False))
    with LOCK:
        for c in CLIENTS:
            if rolle is None or c['rolle'] == rolle:
                c['q'].put(msg)


def device_status():
    with LOCK:
        return {'ipad': sum(c['rolle'] == 'ipad' for c in CLIENTS),
                'leitung': sum(c['rolle'] == 'leitung' for c in CLIENTS)}


def push_state():
    broadcast('sitzung', STATE['sitzung'])


# ---------------------------------------------------------------- Ablauf
def new_result(task):
    return {'id': task['id'], 'titel': task.get('titel', task['id']), 'start': None, 'ende': None,
            'dauerMs': None, 'ergebnis': None, 'bewertung': None, 'autoErfolg': False,
            'autoErfolgNachMs': None, 'seq': None, 'hinweise': 0, 'metriken': None, 'notizen': []}


def enter_intro(s, index):
    if index >= len(s['aufgaben']):
        s['phase'], s['index'] = 'fragebogen', None
    else:
        s['phase'], s['index'] = 'intro', index


def finish_running(s, ergebnis):
    r = s['ergebnisse'][s['index']]
    r['ende'] = now_ms()
    r['dauerMs'] = r['ende'] - r['start'] if r['start'] else None
    r['ergebnis'] = ergebnis
    s['phase'] = 'seq'


def apply_action(body):
    """Ändert den Sitzungsstand. Gibt (status, antwort) zurück."""
    a = body.get('aktion')
    s = STATE['sitzung']
    if a == 'neu':
        aufgaben = [t for t in body.get('aufgaben', []) if isinstance(t, dict) and t.get('id')]
        if not aufgaben:
            return 400, {'fehler': 'Keine Aufgaben ausgewählt'}
        if s and s['phase'] not in ('beendet',):
            s['phase'] = 'beendet'
            s['beendet'] = now_ms()
            save_session(s)
        code = re.sub(r'[^A-Za-z0-9_-]', '', str(body.get('teilnehmer', '')))[:20] or 'P'
        sid = time.strftime('%Y%m%d-%H%M%S') + '-' + code
        s = {'id': sid, 'teilnehmer': code, 'gruppe': str(body.get('gruppe', ''))[:60],
             'rolle': str(body.get('rolle', 'admin')), 'notiz': str(body.get('notiz', ''))[:500],
             'rollenrechte': bool(body.get('rollenrechte', True)), 'erstellt': now_ms(), 'beendet': None,
             'phase': 'willkommen', 'index': None, 'einwilligung': None, 'aufgaben': aufgaben,
             'ergebnisse': [new_result(t) for t in aufgaben], 'fragebogen': None, 'ki': [],
             'notizen': [], 'ausgeschlossen': False}
        STATE['sitzung'] = s
    elif not s:
        return 409, {'fehler': 'Keine aktive Sitzung'}
    elif a == 'beginnen':
        if s['phase'] != 'willkommen':
            return 409, {'fehler': 'Falsche Phase'}
        s['einwilligung'] = now_ms() if body.get('einwilligung') else None
        enter_intro(s, 0)
    elif a == 'start':
        if s['phase'] != 'intro' or body.get('index', s['index']) != s['index']:
            return 409, {'fehler': 'Falsche Phase'}
        r = s['ergebnisse'][s['index']]
        r.update({'start': now_ms(), 'ende': None, 'dauerMs': None, 'ergebnis': None,
                  'autoErfolg': False, 'autoErfolgNachMs': None, 'metriken': None})
        s['phase'] = 'laeuft'
    elif a == 'fertig':
        if s['phase'] != 'laeuft' or body.get('index') != s['index']:
            return 409, {'fehler': 'Falsche Phase'}
        finish_running(s, 'aufgegeben' if body.get('ergebnis') == 'aufgegeben' else 'fertig')
    elif a == 'auto':
        i = body.get('index')
        if isinstance(i, int) and 0 <= i < len(s['ergebnisse']):
            r = s['ergebnisse'][i]
            if not r['autoErfolg'] and r['start']:
                r['autoErfolg'] = True
                r['autoErfolgNachMs'] = now_ms() - r['start']
    elif a == 'metriken':
        i = body.get('index')
        if isinstance(i, int) and 0 <= i < len(s['ergebnisse']) and isinstance(body.get('metriken'), dict):
            s['ergebnisse'][i]['metriken'] = body['metriken']
            if body['metriken'].get('autoErfolg') and not s['ergebnisse'][i]['autoErfolg']:
                s['ergebnisse'][i]['autoErfolg'] = True
    elif a == 'seq':
        if s['phase'] != 'seq' or body.get('index') != s['index']:
            return 409, {'fehler': 'Falsche Phase'}
        v = body.get('wert')
        s['ergebnisse'][s['index']]['seq'] = v if isinstance(v, int) and 1 <= v <= 7 else None
        enter_intro(s, s['index'] + 1)
    elif a == 'fragebogen':
        if s['phase'] != 'fragebogen':
            return 409, {'fehler': 'Falsche Phase'}
        s['fragebogen'] = {'zeit': now_ms(), 'antworten': body.get('antworten', {})}
        s['phase'] = 'danke'
    # --- nur Testleitung
    elif a == 'weiter':
        if s['phase'] == 'willkommen':
            enter_intro(s, 0)
        elif s['phase'] == 'intro':
            apply_action({'aktion': 'start', 'index': s['index']})
        elif s['phase'] == 'laeuft':
            finish_running(s, 'durch Testleitung beendet')
        elif s['phase'] == 'seq':
            enter_intro(s, s['index'] + 1)
        elif s['phase'] == 'fragebogen':
            s['phase'] = 'danke'
    elif a == 'springen':
        i = body.get('index')
        if s['phase'] == 'laeuft':
            finish_running(s, 'durch Testleitung beendet')
        if i == 'fragebogen':
            s['phase'], s['index'] = 'fragebogen', None
        elif isinstance(i, int) and 0 <= i < len(s['aufgaben']):
            enter_intro(s, i)
    elif a == 'bewerten':
        i = body.get('index')
        if isinstance(i, int) and 0 <= i < len(s['ergebnisse']):
            v = body.get('bewertung')
            s['ergebnisse'][i]['bewertung'] = v if v in ('erfolg', 'hilfe', 'gescheitert') else None
    elif a == 'hinweis':
        i = body.get('index')
        if isinstance(i, int) and 0 <= i < len(s['ergebnisse']):
            s['ergebnisse'][i]['hinweise'] = max(0, s['ergebnisse'][i]['hinweise'] + int(body.get('delta', 1)))
    elif a == 'notiz':
        text = str(body.get('text', '')).strip()[:2000]
        if text:
            s['notizen'].append({'zeit': now_ms(), 'index': s['index'], 'phase': s['phase'], 'text': text})
    elif a == 'beenden':
        if s['phase'] == 'laeuft':
            finish_running(s, 'durch Testleitung beendet')
        s['phase'] = 'beendet'
        s['beendet'] = now_ms()
    else:
        return 400, {'fehler': 'Unbekannte Aktion'}
    save_session(s)
    push_state()
    return 200, s


# ---------------------------------------------------------------- Auswertung
SUS_IDS = ['sus%d' % i for i in range(1, 11)]
TLX_IDS = ['tlx_geistig', 'tlx_koerperlich', 'tlx_zeitlich', 'tlx_leistung', 'tlx_anstrengung', 'tlx_frustration']


def sus_score(ans):
    vals = [ans.get(k) for k in SUS_IDS]
    if not all(isinstance(v, int) for v in vals):
        return None
    total = sum((v - 1) if i % 2 == 0 else (5 - v) for i, v in enumerate(vals))
    return total * 2.5


def tlx_score(ans):
    vals = [ans.get(k) for k in TLX_IDS]
    if not all(isinstance(v, (int, float)) for v in vals):
        return None
    return sum(vals) / len(vals)


def final_rating(r):
    if r.get('bewertung'):
        return r['bewertung']
    if r.get('autoErfolg'):
        return 'erfolg'
    if r.get('ergebnis') == 'aufgegeben':
        return 'gescheitert'
    return ''


def num(v):
    if v is None or v == '':
        return ''
    if isinstance(v, float):
        return ('%.2f' % v).replace('.', ',')
    return str(v)


def csv_text(header, rows):
    buf = io.StringIO()
    buf.write('﻿')
    w = csv.writer(buf, delimiter=';', lineterminator='\r\n')
    w.writerow(header)
    w.writerows(rows)
    return buf.getvalue()


def export_tasks():
    keys = ['taps', 'tapsAktiv', 'tapsOhneWirkung', 'tapsDeaktiviert', 'tapsKarte', 'wischen',
            'ansichtswechsel', 'ansichtenEindeutig', 'ruecksprunge', 'kiAnfragen', 'zugriffVerweigert', 'neuGeladen']
    header = ['sitzung', 'teilnehmer', 'gruppe', 'rolle', 'ausgeschlossen', 'nr', 'aufgabe', 'titel', 'start', 'dauer_s',
              'ergebnis_teilnehmer', 'auto_erfolg', 'auto_erfolg_nach_s', 'bewertung_testleitung', 'erfolg_final',
              'hinweise', 'seq'] + keys + ['pfad', 'notizen']
    rows = []
    for s in all_sessions():
        for i, r in enumerate(s.get('ergebnisse', [])):
            if not r.get('start'):
                continue
            m = r.get('metriken') or {}
            notes = ' | '.join(n['text'] for n in s.get('notizen', []) if n.get('index') == i)
            rows.append([s['id'], s['teilnehmer'], s.get('gruppe', ''), s.get('rolle', ''), 'ja' if s.get('ausgeschlossen') else 'nein',
                         i + 1, r['id'], r.get('titel', ''), iso(r['start']),
                         num(r['dauerMs'] / 1000) if r.get('dauerMs') is not None else '',
                         r.get('ergebnis') or '', 'ja' if r.get('autoErfolg') else 'nein',
                         num(r['autoErfolgNachMs'] / 1000) if r.get('autoErfolgNachMs') is not None else '',
                         r.get('bewertung') or '', final_rating(r), r.get('hinweise', 0), num(r.get('seq'))]
                        + [num(m.get(k)) for k in keys] + [' > '.join(m.get('pfad', [])), notes])
    return csv_text(header, rows)


def export_questionnaire():
    sessions = [s for s in all_sessions() if s.get('fragebogen')]
    keys = []
    for s in sessions:
        for k in s['fragebogen']['antworten']:
            if k not in keys:
                keys.append(k)
    header = ['sitzung', 'teilnehmer', 'gruppe', 'rolle', 'ausgeschlossen', 'zeit', 'sus_score', 'tlx_roh'] + keys
    rows = []
    for s in sessions:
        ans = s['fragebogen']['antworten']
        rows.append([s['id'], s['teilnehmer'], s.get('gruppe', ''), s.get('rolle', ''), 'ja' if s.get('ausgeschlossen') else 'nein',
                     iso(s['fragebogen']['zeit']), num(sus_score(ans)), num(tlx_score(ans))]
                    + [num(ans.get(k)) if not isinstance(ans.get(k), str) else ans.get(k) for k in keys])
    return csv_text(header, rows)


def export_ki():
    header = ['sitzung', 'teilnehmer', 'rolle', 'zeit', 'aufgabe_nr', 'art', 'text', 'aktion', 'modus']
    rows = []
    for s in all_sessions():
        for k in s.get('ki', []):
            rows.append([s['id'], s['teilnehmer'], s.get('rolle', ''), iso(k.get('zeit')),
                         (k['index'] + 1) if isinstance(k.get('index'), int) else '', k.get('art', ''),
                         k.get('text', ''), k.get('aktion', ''), k.get('modus', '')])
    return csv_text(header, rows)


def export_events(sid=None):
    header = ['sitzung', 'zeit_server', 'zeit_client', 'aufgabe_nr', 'typ', 'ansicht', 'ziel', 'art', 'details']
    rows = []
    files = [DATA / (sid + '.ereignisse.jsonl')] if sid else sorted(DATA.glob('*.ereignisse.jsonl'))
    for p in files:
        if not p.exists():
            continue
        for line in p.read_text(encoding='utf-8').splitlines():
            try:
                e = json.loads(line)
            except ValueError:
                continue
            extra = {k: v for k, v in e.items() if k not in ('sitzung', 'ts', 't', 'aufgabe', 'typ', 'ansicht', 'ziel', 'art')}
            rows.append([e.get('sitzung', ''), iso(e.get('ts')), iso(e.get('t')),
                         (e['aufgabe'] + 1) if isinstance(e.get('aufgabe'), int) else '', e.get('typ', ''),
                         e.get('ansicht', ''), e.get('ziel', ''), e.get('art', ''),
                         json.dumps(extra, ensure_ascii=False) if extra else ''])
    return csv_text(header, rows)


# ---------------------------------------------------------------- HTTP
class Handler(SimpleHTTPRequestHandler):
    server_version = 'ROBOplanStudie/1.0'

    def log_message(self, fmt, *args):
        if args and '/api/protokoll' in str(args[0]):
            return
        super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def send_text(self, text, mime, filename=None):
        data = text.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', mime + '; charset=utf-8')
        if filename:
            self.send_header('Content-Disposition', 'attachment; filename="%s"' % filename)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_body(self):
        length = int(self.headers.get('Content-Length') or 0)
        if length > 2_000_000:
            raise ValueError('Anfrage zu groß')
        raw = self.rfile.read(length) if length else b'{}'
        body = json.loads(raw.decode('utf-8') or '{}')
        if not isinstance(body, dict):
            raise ValueError('Ungültige Daten')
        return body

    def redirect(self, target):
        self.send_response(HTTPStatus.FOUND)
        self.send_header('Location', target)
        self.end_headers()

    # ------------------------------------------------------------ GET
    def do_GET(self):
        url = urlparse(self.path)
        path = url.path
        q = parse_qs(url.query)
        if path in ('/ipad', '/ipad/'):
            return self.redirect('/app.html?studie=1')
        if path in ('/testleitung', '/testleitung/'):
            return self.redirect('/studie/testleitung.html')
        if path in ('/auswertung', '/auswertung/'):
            return self.redirect('/studie/auswertung.html')
        if path == '/api/strom':
            return self.stream(q.get('rolle', ['leitung'])[0])
        if path == '/api/status':
            with LOCK:
                return self.send_json(200, {'sitzung': STATE['sitzung'], 'geraete': device_status()})
        if path == '/api/sitzungen':
            return self.send_json(200, all_sessions())
        if path == '/api/ereignisse':
            sid = q.get('sitzung', [''])[0]
            try:
                session_path(sid)
            except ValueError:
                return self.send_json(400, {'fehler': 'Ungültige Sitzung'})
            p = DATA / (sid + '.ereignisse.jsonl')
            lines = p.read_text(encoding='utf-8').splitlines()[-3000:] if p.exists() else []
            out = []
            for line in lines:
                try:
                    out.append(json.loads(line))
                except ValueError:
                    pass
            return self.send_json(200, out)
        if path == '/api/export/aufgaben.csv':
            return self.send_text(export_tasks(), 'text/csv', 'roboplan-aufgaben.csv')
        if path == '/api/export/fragebogen.csv':
            return self.send_text(export_questionnaire(), 'text/csv', 'roboplan-fragebogen.csv')
        if path == '/api/export/ki.csv':
            return self.send_text(export_ki(), 'text/csv', 'roboplan-ki-assistent.csv')
        if path == '/api/export/ereignisse.csv':
            sid = q.get('sitzung', [None])[0]
            try:
                if sid:
                    session_path(sid)
            except ValueError:
                return self.send_json(400, {'fehler': 'Ungültige Sitzung'})
            return self.send_text(export_events(sid), 'text/csv', 'roboplan-ereignisse%s.csv' % ('-' + sid if sid else ''))
        if path == '/api/export/alles.json':
            return self.send_text(json.dumps(all_sessions(), ensure_ascii=False, indent=1), 'application/json', 'roboplan-sitzungen.json')
        parts = [p for p in path.split('/') if p]
        if parts and (parts[0] in BLOCKED or any(p.startswith('.') for p in parts)):
            return self.send_error(HTTPStatus.FORBIDDEN)
        return super().do_GET()

    def stream(self, rolle):
        rolle = 'ipad' if rolle == 'ipad' else 'leitung'
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Connection', 'keep-alive')
        self.send_header('X-Accel-Buffering', 'no')
        self.end_headers()
        client = {'rolle': rolle, 'q': queue.Queue()}
        with LOCK:
            CLIENTS.append(client)
            first = 'retry: 2000\nevent: sitzung\ndata: %s\n\n' % json.dumps(STATE['sitzung'], ensure_ascii=False)
        broadcast('geraete', device_status(), 'leitung')
        try:
            self.wfile.write(first.encode('utf-8'))
            self.wfile.flush()
            if rolle == 'leitung':
                client['q'].put('event: geraete\ndata: %s\n\n' % json.dumps(device_status()))
            while True:
                try:
                    msg = client['q'].get(timeout=15)
                except queue.Empty:
                    msg = ': ping\n\n'
                self.wfile.write(msg.encode('utf-8'))
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            with LOCK:
                if client in CLIENTS:
                    CLIENTS.remove(client)
            broadcast('geraete', device_status(), 'leitung')

    # ------------------------------------------------------------ POST
    def do_POST(self):
        path = urlparse(self.path).path
        try:
            body = self.read_body()
        except ValueError as err:
            return self.send_json(400, {'fehler': str(err)})
        with LOCK:
            if path == '/api/sitzung':
                status, payload = apply_action(body)
                return self.send_json(status, payload)
            if path == '/api/protokoll':
                return self.handle_log(body)
            if path == '/api/ki':
                return self.handle_ki(body)
            if path == '/api/befehl':
                if body.get('befehl') not in ('neu-laden', 'zuruecksetzen'):
                    return self.send_json(400, {'fehler': 'Unbekannter Befehl'})
                broadcast('befehl', {'befehl': body['befehl'], 'id': uuid.uuid4().hex}, 'ipad')
                return self.send_json(200, {'ok': True})
            if path == '/api/ausschliessen':
                try:
                    s = load_session(str(body.get('id')))
                except (ValueError, OSError):
                    return self.send_json(404, {'fehler': 'Sitzung nicht gefunden'})
                s['ausgeschlossen'] = bool(body.get('ausgeschlossen'))
                if STATE['sitzung'] and STATE['sitzung']['id'] == s['id']:
                    STATE['sitzung']['ausgeschlossen'] = s['ausgeschlossen']
                    s = STATE['sitzung']
                path_ = session_path(s['id'])
                path_.write_text(json.dumps(s, ensure_ascii=False, indent=1), encoding='utf-8')
                return self.send_json(200, {'ok': True})
        self.send_json(404, {'fehler': 'Unbekannte Adresse'})

    def handle_log(self, body):
        s = STATE['sitzung']
        events = body.get('ereignisse')
        if not isinstance(events, list):
            return self.send_json(400, {'fehler': 'Keine Ereignisse'})
        sid = body.get('sitzung')
        if not s or sid != s['id']:
            return self.send_json(200, {'ok': False, 'grund': 'Keine passende Sitzung'})
        ts = now_ms()
        clean, ki_entries = [], []
        for e in events[:500]:
            if isinstance(e, dict) and isinstance(e.get('typ'), str):
                e = dict(e, sitzung=sid, ts=ts)
                clean.append(e)
                if e['typ'] in ('ki-start', 'ki-stop', 'ki-aktion'):
                    entry = {'zeit': ts, 'index': e.get('aufgabe'), 'art': e['typ'],
                             'text': e.get('ziel', ''), 'aktion': e.get('aktion', ''), 'modus': e.get('quelle', '')}
                    s['ki'].append(entry)
                    ki_entries.append(entry)
        if clean:
            append_events(sid, clean)
            if ki_entries:
                save_session(s)
            broadcast('live', clean, 'leitung')
            for entry in ki_entries:
                broadcast('ki-protokoll', entry, 'leitung')
        return self.send_json(200, {'ok': True})

    def handle_ki(self, body):
        s = STATE['sitzung']
        art = body.get('art')
        if art not in ('antwort', 'denkt', 'transkript', 'ausblenden'):
            return self.send_json(400, {'fehler': 'Unbekannte Art'})
        msg = {'art': art, 'text': str(body.get('text', ''))[:2000], 'vorlesen': bool(body.get('vorlesen')),
               'aktion': str(body.get('aktion', ''))[:80], 'aktionLabel': str(body.get('aktionLabel', ''))[:80],
               'modus': body.get('modus') if body.get('modus') in ('direkt', 'vorschlag') else '',
               'absender': str(body.get('absender', ''))[:40], 'meldung': bool(body.get('meldung')),
               'optionen': [{'label': str(o.get('label', ''))[:40], 'aktion': str(o.get('aktion', ''))[:80]}
                            for o in (body.get('optionen') or [])[:4] if isinstance(o, dict) and o.get('label')],
               'id': uuid.uuid4().hex}
        if s:
            optionen = ' / '.join(o['label'] for o in msg['optionen'])
            entry = {'zeit': now_ms(), 'index': s['index'], 'art': 'testleitung-' + art,
                     'text': (msg['absender'] + ': ' if msg['absender'] else '') + msg['text'] + (' [' + optionen + ']' if optionen else ''),
                     'aktion': msg['aktion'], 'modus': 'meldung' if msg['meldung'] else msg['modus']}
            s['ki'].append(entry)
            save_session(s)
            append_events(s['id'], [dict(entry, typ='ki-' + art, sitzung=s['id'], ts=entry['zeit'], aufgabe=s['index'])])
        if art != 'transkript':
            broadcast('ki', msg, 'ipad')
        broadcast('ki-protokoll', s['ki'][-1] if s else msg, 'leitung')
        return self.send_json(200, {'ok': True})


def lan_addresses():
    addrs = set()
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(('10.255.255.255', 1))
            addrs.add(sock.getsockname()[0])
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            addrs.add(info[4][0])
    except OSError:
        pass
    return sorted(a for a in addrs if not a.startswith('127.'))


def main():
    parser = argparse.ArgumentParser(description='ROBOplan-Nutzertest starten')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    mimetypes.add_type('text/javascript', '.js')
    restore_active()
    ThreadingHTTPServer.daemon_threads = True
    httpd = ThreadingHTTPServer(('0.0.0.0', args.port), partial(Handler, directory=str(ROOT)))
    print('ROBOplan-Nutzertest läuft. Beenden mit Ctrl+C.\n')
    for host in lan_addresses() or ['localhost']:
        print('  iPad (Testperson):  http://%s:%d/ipad' % (host, args.port))
    print('  Testleitung:        http://localhost:%d/testleitung' % args.port)
    print('  Auswertung:         http://localhost:%d/auswertung' % args.port)
    print('  Daten:              %s\n' % DATA)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nBeendet.')


if __name__ == '__main__':
    main()
