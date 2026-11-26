// ROBOplan-Nutzertest: Teilnehmerseite auf dem iPad.
// Wird von bootstrap.js nach app.js geladen, wenn app.html?studie=1 geöffnet ist.
// Zeigt Aufgabenkarten, protokolliert Interaktionen, prüft Aufgabenerfolg und
// stellt den von der Testleitung gesteuerten KI-Assistenten dar.
(function () {
  'use strict';
  const K = window.STUDIE_KONFIG;
  if (!K) { console.error('Studienkonfiguration fehlt.'); return; }
  const SS = window.sessionStorage;
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  let sitzung = null, vorher = {phase: null, index: null};
  let puffer = [], verbunden = false, ansicht = '';

  // ------------------------------------------------------------ Netzwerk
  function post(url, body) {
    return fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), keepalive: true});
  }
  async function aktion(name, extra = {}) {
    try {
      const res = await post('/api/sitzung', {aktion: name, ...extra});
      const data = await res.json();
      if (res.ok) onSitzung(data);
      return res.ok;
    } catch (err) { console.warn(err); return false; }
  }
  function flush(beacon = false) {
    if (!sitzung || !puffer.length) return;
    const body = JSON.stringify({sitzung: sitzung.id, ereignisse: puffer.splice(0, 400)});
    if (beacon && navigator.sendBeacon) { navigator.sendBeacon('/api/protokoll', new Blob([body], {type: 'application/json'})); return; }
    fetch('/api/protokoll', {method: 'POST', headers: {'Content-Type': 'application/json'}, body, keepalive: true})
      .catch(() => { puffer = JSON.parse(body).ereignisse.concat(puffer).slice(-2000); });
  }
  setInterval(flush, 1500);
  window.addEventListener('pagehide', () => flush(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });

  // ------------------------------------------------------------ Kennzahlen je Aufgabe
  const laufend = () => sitzung?.phase === 'laeuft' && Number.isInteger(sitzung.index);
  const mKey = i => `studie-m-${sitzung.id}-${i}-${sitzung.ergebnisse[i]?.start || 0}`;
  function neueMetriken() {
    return {taps: 0, tapsAktiv: 0, tapsOhneWirkung: 0, tapsDeaktiviert: 0, tapsKarte: 0, wischen: 0, ansichtswechsel: 0,
      ansichtenEindeutig: 0, ruecksprunge: 0, kiAnfragen: 0, zugriffVerweigert: 0, neuGeladen: 0, pfad: [], aktionen: [], autoErfolg: false};
  }
  function metriken(i = sitzung?.index) {
    if (!sitzung || !Number.isInteger(i)) return null;
    try { return JSON.parse(SS.getItem(mKey(i))) || neueMetriken(); } catch { return neueMetriken(); }
  }
  function metrikenAendern(fn) {
    if (!laufend()) return;
    const m = metriken();
    fn(m);
    m.ansichtenEindeutig = new Set(m.pfad).size;
    SS.setItem(mKey(sitzung.index), JSON.stringify(m));
  }
  function metrikenSenden(i) {
    const m = metriken(i);
    if (!m) return Promise.resolve();
    m.ansichtenEindeutig = new Set(m.pfad).size;
    const {aktionen, ...rest} = m;
    return aktion('metriken', {index: i, metriken: {...rest, aktionen: aktionen.map(a => a.name)}});
  }

  function protokoll(typ, daten = {}) {
    if (!sitzung) return;
    puffer.push({t: Date.now(), typ, aufgabe: laufend() ? sitzung.index : null, phase: sitzung.phase, ansicht, ...daten});
    if (puffer.length > 40) flush();
  }

  // ------------------------------------------------------------ Taps und Gesten
  const AKTIV = 'a[href],button,input,select,textarea,label,summary,[onclick],[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="slider"],[role="option"],[role="switch"],[data-drag-task],[contenteditable="true"]';
  const KARTE = '.map,.field-map,.dispatch-map,.weather-radar-map,[id$="-map"],[id$="-map-content"]';
  function beschreibe(el) {
    if (!el || el.nodeType !== 1) return '';
    const tag = el.tagName.toLowerCase(), id = el.id ? '#' + el.id : '';
    let text = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    if (!text && el.childElementCount < 8) text = el.textContent || '';
    text = text.replace(/\s+/g, ' ').trim().slice(0, 60);
    const ort = !id && el.closest('[id]') ? ' in #' + el.closest('[id]').id : '';
    return tag + id + (text ? ' „' + text + '“' : '') + ort;
  }
  function deaktiviertBei(x, y) {
    return [...document.querySelectorAll('button:disabled,input:disabled,select:disabled,textarea:disabled,[aria-disabled="true"]')].find(el => {
      const r = el.getBoundingClientRect();
      return r.width && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }
  function klassifiziere(el, x, y) {
    const aus = deaktiviertBei(x, y);
    if (aus) return ['deaktiviert', aus];
    const ziel = el.closest(AKTIV);
    if (ziel) return ['aktiv', ziel];
    if (el.closest(KARTE)) return ['karte', el];
    return ['ohne-wirkung', el];
  }
  let zeiger = null;
  document.addEventListener('pointerdown', e => {
    if (!e.isPrimary) return;
    zeiger = {x: e.clientX, y: e.clientY, t: Date.now(), ziel: e.target, bewegt: false};
  }, true);
  document.addEventListener('pointermove', e => {
    if (zeiger && e.isPrimary && Math.hypot(e.clientX - zeiger.x, e.clientY - zeiger.y) > 12) zeiger.bewegt = true;
  }, true);
  function zeigerEnde(e, abgebrochen) {
    if (!zeiger || !e.isPrimary) return;
    const z = zeiger; zeiger = null;
    if (!(z.ziel instanceof Element)) return;
    if (z.ziel.closest('[data-studie-ui]')) return;
    if (!sitzung || !['laeuft'].includes(sitzung.phase)) return;
    if (z.bewegt || abgebrochen) {
      metrikenAendern(m => { m.wischen++; });
      protokoll('wisch', {ziel: beschreibe(z.ziel.closest('[id]') || z.ziel), dauer: Date.now() - z.t});
      return;
    }
    const [art, el] = klassifiziere(z.ziel, z.x, z.y);
    const feld = {aktiv: 'tapsAktiv', 'ohne-wirkung': 'tapsOhneWirkung', deaktiviert: 'tapsDeaktiviert', karte: 'tapsKarte'}[art];
    metrikenAendern(m => { m.taps++; m[feld]++; });
    protokoll('tipp', {art, ziel: beschreibe(el), x: Math.round(z.x), y: Math.round(z.y), halten: Date.now() - z.t > 500 || undefined});
  }
  document.addEventListener('pointerup', e => zeigerEnde(e, false), true);
  document.addEventListener('pointercancel', e => zeigerEnde(e, true), true);

  document.addEventListener('change', e => {
    const el = e.target;
    if (!(el instanceof Element) || el.closest('[data-studie-ui]')) return;
    const frei = el.matches('input[type="text"],input[type="email"],input[type="search"],input:not([type]),textarea');
    protokoll('eingabe', {ziel: beschreibe(el), wert: frei ? `(${String(el.value).length} Zeichen)` : el.type === 'checkbox' ? el.checked : String(el.value).slice(0, 60)});
  }, true);
  window.addEventListener('error', e => protokoll('js-fehler', {ziel: String(e.message).slice(0, 200)}));

  // ------------------------------------------------------------ Ansichten
  function ansichtBestimmen() {
    let v = location.hash.slice(1) || userAccount.startPage;
    if (document.body.dataset.area === 'ackerschlagskarte') {
      if ($('field-planner') && !$('field-planner').hidden) v = 'ackerschlagskarte/aufgabenplanung';
      else if ($('field-record') && !$('field-record').hidden) v = 'ackerschlagskarte/schlagkartei';
    }
    const dialoge = [...document.querySelectorAll('main dialog[open], body > dialog[open]')].map(d => d.id).filter(Boolean);
    if (dialoge.length) v += ' + ' + dialoge.join(' + ');
    return v;
  }
  let ansichtTimer = 0;
  function ansichtPruefen() {
    clearTimeout(ansichtTimer);
    ansichtTimer = setTimeout(() => {
      const neu = ansichtBestimmen();
      if (neu === ansicht) return;
      ansicht = neu;
      metrikenAendern(m => {
        if (m.pfad.length && m.pfad.includes(neu)) m.ruecksprunge++;
        m.pfad.push(neu); m.ansichtswechsel++;
      });
      protokoll('ansicht', {ziel: neu});
      overlaysVerankern();
      autoPruefen();
    }, 80);
  }
  new MutationObserver(ansichtPruefen).observe(document.body, {subtree: true, attributes: true, attributeFilter: ['hidden', 'open']});
  window.addEventListener('hashchange', ansichtPruefen);

  // ------------------------------------------------------------ Aktionen der App protokollieren
  const primitiv = v => v === null || ['string', 'number', 'boolean'].includes(typeof v);
  ['saveFieldTask', 'confirmTaskAssignment', 'acceptDispatchPlan', 'toggleDispatchSuggestion', 'setRobotDemoAction', 'applyPlanTaskAction',
    'undoPlanTaskAction', 'moveTaskInPlan', 'openFieldRecord', 'openFieldPlanner', 'openTaskOverview', 'openTaskAssignment', 'openFaultOverview',
    'toggleRobotTile', 'setWeatherView', 'setRobotCamera', 'createManagedUser', 'setManagedUserRole', 'logoutUserDemo', 'resumeUserDemo',
    'openCustomerPicker', 'toggleDispatchMap', 'filterOverviewRobots', 'focusOverviewRobot', 'openRobotPlan', 'toggleInlineSearch',
    'selectTaskAssignmentVehicle', 'setTaskAssignmentMode', 'openOverviewWeather'].forEach(name => {
    const original = window[name];
    if (typeof original !== 'function') return;
    window[name] = function (...args) {
      const ergebnis = original.apply(this, args);
      const a = args.filter(primitiv);
      metrikenAendern(m => { m.aktionen.push({name, args: a}); });
      protokoll('aktion', {ziel: name, args: a, ergebnis: primitiv(ergebnis) ? ergebnis : undefined});
      setTimeout(autoPruefen, 0);
      return ergebnis;
    };
  });

  // ------------------------------------------------------------ Automatische Erfolgsprüfung
  function aufgabeKonfig(i = sitzung?.index) {
    const id = sitzung?.aufgaben?.[i]?.id;
    return K.aufgaben.find(a => a.id === id) || sitzung?.aufgaben?.[i] || null;
  }
  function autoPruefen() {
    if (!laufend()) return;
    const m = metriken();
    if (!m || m.autoErfolg) return;
    const a = aufgabeKonfig();
    if (!a || typeof a.pruefen !== 'function') return;
    const ctx = {
      hat: (name, fn) => m.aktionen.some(x => x.name === name && (!fn || fn(x))),
      besucht: v => m.pfad.some(p => p === v || p.startsWith(v + ' ') || p.startsWith(v + '/')),
      metriken: m
    };
    let ok = false;
    try { ok = !!a.pruefen(ctx); } catch (err) { ok = false; }
    if (!ok) return;
    metrikenAendern(x => { x.autoErfolg = true; });
    protokoll('auto-erfolg', {ziel: a.id});
    aktion('auto', {index: sitzung.index});
  }
  setInterval(autoPruefen, 1000);

  // ------------------------------------------------------------ Rollen
  const origIdentity = window.updateUserAccountIdentity;
  window.updateUserAccountIdentity = function () {
    origIdentity();
    const r = K.rollen[sitzung?.rolle];
    if (r) document.querySelectorAll('[data-user-role]').forEach(n => { n.textContent = r.label; });
  };
  function rolleAnwenden() {
    const r = K.rollen[sitzung?.rolle];
    if (!r) return;
    userAccount.name = r.person;
    userAccount.startPage = r.start.replace('#', '');
    window.updateUserAccountIdentity();
    const rechte = r.rechte, alles = sitzung.rollenrechte === false;
    document.querySelectorAll('nav a[data-page]').forEach(a => { a.style.display = alles || rechte.includes(a.dataset.page) ? '' : 'none'; });
    document.querySelectorAll('[data-account-tab="benutzerverwaltung"]').forEach(a => { a.style.display = alles || rechte.includes('benutzerverwaltung') ? '' : 'none'; });
    document.querySelectorAll('#home [data-plan-suggestion]').forEach(b => { b.style.display = alles || rechte.includes('auftragsverwaltung') ? '' : 'none'; });
  }
  function zugriffPruefen() {
    if (!sitzung || sitzung.rollenrechte === false || !['laeuft', 'intro'].includes(sitzung.phase)) return;
    const r = K.rollen[sitzung.rolle];
    if (!r) return;
    const area = document.body.dataset.area, h = location.hash.slice(1);
    const erlaubt = area === 'account' ? (h !== 'konto-benutzerverwaltung' || r.rechte.includes('benutzerverwaltung')) : r.rechte.includes(area);
    if (erlaubt) return;
    metrikenAendern(m => { m.zugriffVerweigert++; });
    protokoll('zugriff-verweigert', {ziel: h});
    toast('Für diesen Bereich hat deine Rolle keinen Zugriff.');
    location.replace(r.start);
  }
  window.addEventListener('hashchange', zugriffPruefen);

  // ------------------------------------------------------------ Oberfläche
  document.body.classList.add('studie-aktiv');
  document.body.insertAdjacentHTML('beforeend', `
    <div id="studie-schirm" class="studie-schirm" data-studie-ui hidden><div class="studie-karte" id="studie-karte"></div></div>
    <div id="studie-leiste" class="studie-leiste" data-studie-ui hidden></div>
    <div id="studie-ki" class="studie-ki" role="status" aria-live="polite" hidden></div>
    <div id="studie-toast" class="studie-toast" role="status" aria-live="polite" hidden></div>
    <span id="studie-verbindung" class="studie-verbindung" data-studie-ui title="Verbindung zur Testleitung"></span>`);

  function toast(text) {
    const t = $('studie-toast');
    t.textContent = text; t.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 3500);
  }
  // Modale Dialoge liegen in der obersten Ebene; Leiste und KI-Fenster ziehen dorthin um.
  function overlaysVerankern() {
    let modal = null;
    try { modal = [...document.querySelectorAll('dialog[open]')].find(d => d.matches(':modal')); } catch {}
    const ziel = modal || document.body;
    ['studie-ki', 'studie-toast'].forEach(id => { if ($(id).parentElement !== ziel) ziel.append($(id)); });
    const leiste = $('studie-leiste');
    if (modal) { if (leiste.parentElement !== modal) modal.append(leiste); }
    else if (leiste.previousElementSibling !== $('page-content')) $('page-content').after(leiste);
    leiste.classList.toggle('im-dialog', !!modal);
    const kopf = document.querySelector('header');
    $('studie-ki').style.top = (kopf ? kopf.getBoundingClientRect().bottom + 10 : 90) + 'px';
  }
  function dialogeSchliessen() {
    document.querySelectorAll('dialog[open]').forEach(d => { try { d.close(); } catch {} });
  }

  function karte(html) {
    dialogeSchliessen();
    $('studie-karte').innerHTML = html;
    $('studie-schirm').hidden = false;
    $('studie-schirm').scrollTop = 0;
  }
  function render() {
    const s = sitzung, p = s?.phase;
    $('studie-leiste').hidden = p !== 'laeuft';
    document.body.classList.toggle('studie-laeuft', p === 'laeuft');
    if (p !== 'laeuft') $('studie-ki').hidden = true;
    if (!s || p === 'beendet') return karte(`<span class="studie-marke">${esc(K.titel)}</span><h1>Gleich geht’s los</h1><p>Die Testleitung bereitet den Test vor. Bitte warte einen Moment.</p>`);
    const n = s.aufgaben.length, rolle = K.rollen[s.rolle];
    if (p === 'willkommen') {
      karte(`<span class="studie-marke">${esc(K.titel)}</span><h1>Willkommen!</h1>
        <p>Danke, dass du mitmachst. Wir testen ROBOplan, eine App zur Steuerung von Feldrobotern – <strong>nicht dich</strong>. Es gibt keine falschen Antworten.</p>
        <p>Du bekommst nacheinander <strong>${n} kleine Aufgaben</strong>. Bitte sag dabei laut, was du denkst, suchst und erwartest.</p>
        <ul class="studie-liste"><li>Tippe auf <strong>Fertig</strong>, wenn du meinst, die Aufgabe erledigt zu haben.</li><li>Tippe auf <strong>Aufgeben</strong>, wenn du nicht weiterkommst. Das ist völlig in Ordnung.</li><li>Oben rechts findest du den <strong>KI-Assistenten</strong>. Du kannst ihn antippen und ihm Fragen stellen.</li></ul>
        ${rolle ? `<p class="studie-rolle">Du bist angemeldet als <strong>${esc(rolle.person)}</strong> mit der Rolle <strong>${esc(rolle.label)}</strong>.</p>` : ''}
        <label class="studie-einwilligung"><input type="checkbox" id="studie-ok"><span>${esc(K.einwilligung)}</span></label>
        <div class="studie-knoepfe"><button type="button" class="studie-primaer" id="studie-los" disabled>Los geht’s</button></div>`);
      $('studie-ok').onchange = e => { $('studie-los').disabled = !e.target.checked; };
      $('studie-los').onclick = () => { sprachFreischalten(); aktion('beginnen', {einwilligung: $('studie-ok').checked}); };
      return;
    }
    if (p === 'intro') {
      const a = s.aufgaben[s.index];
      karte(`<span class="studie-marke">Aufgabe ${s.index + 1} von ${n}</span><div class="studie-fortschritt">${fortschritt(s.index, n)}</div>
        <p class="studie-aufgabentext">${esc(a.text)}</p>
        <p class="studie-hinweis">Lies die Aufgabe in Ruhe. Du kannst sie während der Bearbeitung jederzeit wieder einblenden.</p>
        <div class="studie-knoepfe"><button type="button" class="studie-primaer" id="studie-start">Aufgabe starten</button></div>`);
      $('studie-start').onclick = () => { sprachFreischalten(); aktion('start', {index: s.index}); };
      return;
    }
    if (p === 'laeuft') {
      $('studie-schirm').hidden = true;
      leisteZeichnen();
      overlaysVerankern();
      return;
    }
    if (p === 'seq') {
      const q = K.seq;
      karte(`<span class="studie-marke">Aufgabe ${s.index + 1} von ${n} · abgeschlossen</span><h2>${esc(q.frage)}</h2>
        <div class="studie-skala studie-skala-7" role="radiogroup" aria-label="${esc(q.frage)}">${[1, 2, 3, 4, 5, 6, 7].map(v => `<button type="button" role="radio" aria-checked="false" data-wert="${v}">${v}</button>`).join('')}</div>
        <div class="studie-anker"><span>${esc(q.links)}</span><span>${esc(q.rechts)}</span></div>
        <div class="studie-knoepfe"><button type="button" class="studie-primaer" id="studie-seq-weiter" disabled>${s.index + 1 < n ? 'Weiter zur nächsten Aufgabe' : 'Weiter zum Fragebogen'}</button></div>`);
      let wert = null;
      $('studie-karte').querySelectorAll('[data-wert]').forEach(b => b.onclick = () => {
        wert = Number(b.dataset.wert);
        $('studie-karte').querySelectorAll('[data-wert]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
        $('studie-seq-weiter').disabled = false;
      });
      $('studie-seq-weiter').onclick = () => aktion('seq', {index: s.index, wert});
      return;
    }
    if (p === 'fragebogen') return fragebogen();
    if (p === 'danke') return karte(`<span class="studie-marke">${esc(K.titel)}</span><h1>Vielen Dank!</h1><p>Du hast alles geschafft. Deine Antworten sind gespeichert.</p><p>Bitte gib das iPad an die Testleitung zurück.</p>`);
  }
  function fortschritt(i, n) {
    return Array.from({length: n}, (_, k) => `<i class="${k < i ? 'fertig' : k === i ? 'aktuell' : ''}"></i>`).join('');
  }

  let leisteModus = 'normal';
  function leisteZeichnen() {
    const s = sitzung, a = s.aufgaben[s.index], l = $('studie-leiste');
    const kopf = `<span class="studie-leiste-nr">Aufgabe ${s.index + 1} von ${s.aufgaben.length}</span>`;
    if (leisteModus === 'fertig' || leisteModus === 'aufgeben') {
      l.innerHTML = `${kopf}<span class="studie-frage">${leisteModus === 'fertig' ? 'Hast du die Aufgabe erledigt?' : 'Aufgabe wirklich aufgeben?'}</span>
        <button type="button" class="studie-ja">${leisteModus === 'fertig' ? 'Ja, fertig' : 'Ja, aufgeben'}</button><button type="button" class="studie-nein">Zurück zur Aufgabe</button>`;
      l.querySelector('.studie-ja').onclick = async () => {
        const ergebnis = leisteModus === 'fertig' ? 'fertig' : 'aufgegeben';
        leisteModus = 'normal';
        const index = s.index;
        await metrikenSenden(index);
        aktion('fertig', {index, ergebnis});
      };
      l.querySelector('.studie-nein').onclick = () => { leisteModus = 'normal'; leisteZeichnen(); };
      return;
    }
    l.innerHTML = `${kopf}<span class="studie-leiste-kurz">${esc(a.text)}</span>${leisteModus === 'text' ? `<p class="studie-leiste-text">${esc(a.text)}</p>` : ''}
      <button type="button" class="studie-zeigen" aria-expanded="${leisteModus === 'text'}">${leisteModus === 'text' ? 'Ausblenden' : 'Aufgabe zeigen'}</button>
      <button type="button" class="studie-fertig">Fertig</button><button type="button" class="studie-aufgeben">Aufgeben</button>`;
    l.querySelector('.studie-zeigen').onclick = () => {
      leisteModus = leisteModus === 'text' ? 'normal' : 'text';
      if (leisteModus === 'text') protokoll('aufgabe-eingeblendet');
      leisteZeichnen();
    };
    l.querySelector('.studie-fertig').onclick = () => { leisteModus = 'fertig'; leisteZeichnen(); };
    l.querySelector('.studie-aufgeben').onclick = () => { leisteModus = 'aufgeben'; leisteZeichnen(); };
  }

  // ------------------------------------------------------------ Fragebogen
  function fragebogen() {
    const key = 'studie-fb-' + sitzung.id;
    let stand;
    try { stand = JSON.parse(SS.getItem(key)) || {schritt: 0, antworten: {}}; } catch { stand = {schritt: 0, antworten: {}}; }
    const teile = K.fragebogen, teil = teile[stand.schritt], ant = stand.antworten;
    const speichern = () => SS.setItem(key, JSON.stringify(stand));
    const pflicht = t => t.typ === 'tlx' || t.typ === 'likert';
    let inhalt = '';
    if (teil.typ === 'likert') {
      inhalt = teil.fragen.map(f => `<fieldset class="studie-item" data-id="${f.id}"><legend>${esc(f.text)}</legend>
        <div class="studie-skala studie-skala-5">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-wert="${v}" aria-pressed="${ant[f.id] === v}">${v}</button>`).join('')}${teil.keineAngabe ? `<button type="button" class="studie-ka" data-wert="ka" aria-pressed="${ant[f.id] === 'k. A.'}">k. A.</button>` : ''}</div>
        <div class="studie-anker"><span>${esc(teil.links)}</span><span>${esc(teil.rechts)}</span></div></fieldset>`).join('');
    } else if (teil.typ === 'tlx') {
      inhalt = teil.fragen.map(f => `<fieldset class="studie-item" data-id="${f.id}"><legend><strong>${esc(f.text)}</strong><small>${esc(f.erklaerung)}</small></legend>
        <div class="studie-tlx">${Array.from({length: 21}, (_, k) => `<button type="button" data-wert="${k * 5}" aria-label="${k * 5}" aria-pressed="${ant[f.id] === k * 5}" class="${Number.isFinite(ant[f.id]) && k * 5 <= ant[f.id] ? 'voll' : ''}"></button>`).join('')}</div>
        <div class="studie-anker"><span>${esc(f.links)}</span><span>${esc(f.rechts)}</span></div></fieldset>`).join('');
    } else if (teil.typ === 'text') {
      inhalt = teil.fragen.map(f => `<label class="studie-item studie-text"><span>${esc(f.text)}</span><textarea data-id="${f.id}" rows="3">${esc(ant[f.id] || '')}</textarea></label>`).join('');
    } else if (teil.typ === 'auswahl') {
      inhalt = teil.fragen.map(f => `<fieldset class="studie-item" data-id="${f.id}"><legend>${esc(f.text)}</legend><div class="studie-optionen">${f.optionen.map(o => `<button type="button" data-wert="${esc(o)}" aria-pressed="${ant[f.id] === o}">${esc(o)}</button>`).join('')}</div></fieldset>`).join('');
    }
    const letzter = stand.schritt === teile.length - 1;
    karte(`<span class="studie-marke">Fragebogen · Teil ${stand.schritt + 1} von ${teile.length}</span><div class="studie-fortschritt">${fortschritt(stand.schritt, teile.length)}</div>
      <h2>${esc(teil.titel)}</h2>${teil.hinweis ? `<p class="studie-hinweis">${esc(teil.hinweis)}</p>` : ''}
      ${teil.typ === 'text' || teil.typ === 'auswahl' ? '<p class="studie-hinweis">Freiwillig.</p>' : ''}
      <div class="studie-fragen">${inhalt}</div><p class="studie-fehlt" id="studie-fehlt" hidden>Bitte beantworte alle markierten Fragen.</p>
      <div class="studie-knoepfe">${stand.schritt ? '<button type="button" class="studie-sekundaer" id="studie-zurueck">Zurück</button>' : ''}<button type="button" class="studie-primaer" id="studie-weiter">${letzter ? 'Absenden' : 'Weiter'}</button></div>`);
    const box = $('studie-karte');
    box.querySelectorAll('fieldset.studie-item').forEach(fs => {
      const id = fs.dataset.id;
      fs.querySelectorAll('[data-wert]').forEach(b => b.onclick = () => {
        const roh = b.dataset.wert;
        ant[id] = roh === 'ka' ? 'k. A.' : teil.typ === 'auswahl' ? roh : Number(roh);
        fs.classList.remove('studie-offen');
        fs.querySelectorAll('[data-wert]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        if (teil.typ === 'tlx') fs.querySelectorAll('[data-wert]').forEach(x => x.classList.toggle('voll', Number(x.dataset.wert) <= ant[id]));
        speichern();
      });
    });
    box.querySelectorAll('textarea[data-id]').forEach(t => t.oninput = () => { ant[t.dataset.id] = t.value.slice(0, 3000); speichern(); });
    if ($('studie-zurueck')) $('studie-zurueck').onclick = () => { stand.schritt--; speichern(); fragebogen(); };
    $('studie-weiter').onclick = () => {
      if (pflicht(teil)) {
        const offen = [...box.querySelectorAll('fieldset.studie-item')].filter(fs => ant[fs.dataset.id] === undefined);
        offen.forEach(fs => fs.classList.add('studie-offen'));
        if (offen.length) { $('studie-fehlt').hidden = false; offen[0].scrollIntoView({behavior: 'smooth', block: 'center'}); return; }
      }
      if (letzter) {
        $('studie-weiter').disabled = true;
        aktion('fragebogen', {antworten: ant}).then(ok => { if (ok) SS.removeItem(key); else $('studie-weiter').disabled = false; });
        return;
      }
      stand.schritt++; speichern(); fragebogen();
    };
  }

  // ------------------------------------------------------------ KI-Assistent (Wizard of Oz)
  let sprachFrei = false, stimme = null, kiTimer = 0;
  function stimmeWaehlen() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices();
    stimme = v.find(x => x.lang === 'de-DE' && /Anna|Helena|Petra|Markus|Google/i.test(x.name)) || v.find(x => x.lang?.startsWith('de')) || null;
  }
  if ('speechSynthesis' in window) { stimmeWaehlen(); speechSynthesis.onvoiceschanged = stimmeWaehlen; }
  // iOS spielt Sprache erst nach einer Berührung ab; ein stummer Satz schaltet sie frei.
  function sprachFreischalten() {
    if (sprachFrei || !('speechSynthesis' in window)) return;
    sprachFrei = true;
    const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u);
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch {}
  }
  function sprechen(text) {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; if (stimme) u.voice = stimme; u.rate = 1.02;
    speechSynthesis.speak(u);
  }
  const hoertZu = () => $('voice-assistant').getAttribute('aria-pressed') === 'true';
  const origAufnahme = window.setVoiceAssistantRecording;
  let stopQuelle = 'teilnehmer';
  window.setVoiceAssistantRecording = function (an) {
    const war = hoertZu();
    origAufnahme(an);
    if (!sitzung || !['laeuft', 'intro'].includes(sitzung.phase)) return;
    if (an && !war) {
      sprachFreischalten();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      metrikenAendern(m => { m.kiAnfragen++; });
      protokoll('ki-start');
      kiZeigen({hoert: true});
    } else if (!an && war) {
      protokoll('ki-stop', {quelle: stopQuelle});
      if (stopQuelle === 'teilnehmer') kiZeigen({denkt: true});
      stopQuelle = 'teilnehmer';
    }
  };
  // Antwort-Buttons: einzelne Aktion (modus 'vorschlag') oder mehrere Optionen.
  function kiZeigen({text = '', hoert = false, denkt = false, aktion: aktionId = '', modus = '', label = '', optionen = [], absender = '', meldung = false}) {
    const box = $('studie-ki');
    clearTimeout(kiTimer);
    const aktionDef = K.kiAktionen.find(a => a.id === aktionId);
    let knoepfe = Array.isArray(optionen) ? optionen.filter(o => o && o.label) : [];
    if (!knoepfe.length && aktionDef && modus === 'vorschlag') knoepfe = [{label: label || aktionDef.label.replace(/^[^:]+: /, ''), aktion: aktionId}];
    box.className = 'studie-ki' + (hoert ? ' hoert' : '') + (denkt ? ' denkt' : '') + (meldung ? ' meldung' : '');
    box.innerHTML = `<div class="studie-ki-kopf"><span class="studie-ki-name"><i aria-hidden="true">${absender ? '●' : '✦'}</i> ${esc(absender || 'KI-Assistent')}${meldung ? ' <small>Meldung</small>' : ''}</span><button type="button" class="studie-ki-zu" aria-label="Schließen">×</button></div>
      ${hoert ? '<p class="studie-ki-status">Ich höre zu …</p><span class="studie-ki-wellen" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' : ''}
      ${denkt ? '<p class="studie-ki-status">Einen Moment …</p><span class="studie-ki-punkte" aria-hidden="true"><i></i><i></i><i></i></span>' : ''}
      ${text ? `<p class="studie-ki-text">${esc(text)}</p>` : ''}
      ${knoepfe.length ? `<div class="studie-ki-aktionen">${knoepfe.map((o, i) => `<button type="button" class="studie-ki-aktion${i ? ' zweit' : ''}" data-i="${i}">${esc(o.label)}</button>`).join('')}</div>` : ''}`;
    box.hidden = false;
    overlaysVerankern();
    box.querySelector('.studie-ki-zu').onclick = () => {
      box.hidden = true;
      if (hoertZu()) { stopQuelle = 'geschlossen'; origAufnahme(false); protokoll('ki-stop', {quelle: 'geschlossen'}); }
      protokoll('ki-geschlossen');
    };
    box.querySelectorAll('.studie-ki-aktion').forEach(b => b.onclick = () => {
      const o = knoepfe[Number(b.dataset.i)];
      protokoll('ki-aktion', {ziel: o.label, aktion: o.aktion || '', quelle: absender ? 'meldung' : 'vorschlag'});
      metrikenAendern(m => { m.aktionen.push({name: 'ki-option', args: [o.label]}); });
      if (o.aktion) kiAktion(o.aktion); else setTimeout(autoPruefen, 0);
      box.hidden = true;
    });
    if (denkt) kiTimer = setTimeout(() => { box.hidden = true; }, 30000);
    else if (text && !knoepfe.length && !meldung) kiTimer = setTimeout(() => { box.hidden = true; }, 25000);
  }
  // Kurzer Signalton für Push-Meldungen (nach der ersten Berührung freigeschaltet).
  let audio = null;
  function signalton() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      [0, .18].forEach((t, i) => {
        const o = audio.createOscillator(), g = audio.createGain(), start = audio.currentTime + t;
        o.frequency.value = i ? 1046 : 784; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(0.25, start + .02); g.gain.exponentialRampToValueAtTime(0.0001, start + .3);
        o.connect(g).connect(audio.destination); o.start(start); o.stop(start + .32);
      });
    } catch {}
  }
  function kiAktion(id) {
    const a = K.kiAktionen.find(x => x.id === id);
    if (!a) return;
    try { a.ausfuehren(); } catch (err) { console.warn(err); }
    metrikenAendern(m => { m.aktionen.push({name: 'ki-aktion', args: [id]}); });
    setTimeout(autoPruefen, 200);
  }
  function onKi(m) {
    if (!sitzung || !['laeuft', 'intro'].includes(sitzung.phase)) return;
    if (m.art === 'ausblenden') { $('studie-ki').hidden = true; return; }
    if (m.art === 'denkt') { kiZeigen({denkt: true}); return; }
    if (hoertZu()) { stopQuelle = 'testleitung'; window.setVoiceAssistantRecording(false); }
    kiZeigen({text: m.text, aktion: m.aktion, modus: m.modus, label: m.aktionLabel, optionen: m.optionen, absender: m.absender, meldung: m.meldung});
    if (m.meldung) signalton();
    if (m.vorlesen) setTimeout(() => sprechen(m.text), m.meldung ? 450 : 0);
    metrikenAendern(x => { x.aktionen.push({name: 'ki-antwort', args: []}); });
    protokoll('ki-antwort', {ziel: m.text.slice(0, 160), aktion: m.aktion || undefined, modus: m.modus || undefined, absender: m.absender || undefined, meldung: m.meldung || undefined});
    if (m.aktion && m.modus === 'direkt') { protokoll('ki-aktion', {ziel: m.aktion, aktion: m.aktion, quelle: 'direkt'}); kiAktion(m.aktion); }
    setTimeout(autoPruefen, 0);
  }

  // ------------------------------------------------------------ Sitzungsstand
  function zuruecksetzenUndLaden(start, schluessel) {
    if (schluessel) SS.setItem(schluessel, '1');
    Object.keys(localStorage).filter(k => k.startsWith('roboplan-')).forEach(k => localStorage.removeItem(k));
    flush(true);
    history.replaceState(null, '', location.pathname + location.search + (start || '#home'));
    location.reload();
  }
  function onSitzung(s) {
    const alt = vorher;
    sitzung = s;
    vorher = {phase: s?.phase ?? null, index: s?.index ?? null, id: s?.id ?? null};
    if (s && (alt.id !== s.id || !document.body.dataset.studieRolle || document.body.dataset.studieRolle !== s.rolle)) {
      document.body.dataset.studieRolle = s.rolle;
      rolleAnwenden();
    }
    // Neue Sitzung: App vollständig zurücksetzen.
    if (s && s.phase === 'willkommen') {
      const key = `studie-reset-${s.id}-w`;
      if (!SS.getItem(key)) return zuruecksetzenUndLaden(K.rollen[s.rolle]?.start || '#home', key);
    }
    if (s && s.phase === 'intro') {
      const a = s.aufgaben[s.index], key = `studie-reset-${s.id}-${s.index}-${s.ergebnisse[s.index].start || 0}`;
      if (a.zuruecksetzen && !SS.getItem(key)) return zuruecksetzenUndLaden(a.start, key);
      if (!SS.getItem(key)) { SS.setItem(key, '1'); }
      if (a.start && location.hash !== a.start && !(alt.phase === 'intro' && alt.index === s.index)) location.hash = a.start;
    }
    // Aufgabe von außen beendet: Kennzahlen nachreichen.
    if (alt.phase === 'laeuft' && !(s?.phase === 'laeuft' && s.index === alt.index) && Number.isInteger(alt.index) && s?.id === alt.id) {
      metrikenSenden(alt.index);
      if (hoertZu()) origAufnahme(false);
    }
    if (s?.phase === 'laeuft' && !(alt.phase === 'laeuft' && alt.index === s.index)) {
      leisteModus = 'normal';
      const m = metriken();
      if (m && (m.taps || m.pfad.length)) metrikenAendern(x => { x.neuGeladen++; });
      else metrikenAendern(x => { x.pfad.push(ansichtBestimmen()); });
      ansicht = ansichtBestimmen();
      protokoll(alt.phase === null ? 'neu-geladen' : 'aufgabe-start', {ziel: s.aufgaben[s.index].id});
    }
    if (alt.phase !== s?.phase || alt.index !== s?.index) render();
    else if (s?.phase === 'laeuft') leisteZeichnen();
    zugriffPruefen();
  }
  function onBefehl(b) {
    if (b.befehl === 'neu-laden') { flush(true); location.reload(); }
    if (b.befehl === 'zuruecksetzen') {
      const a = sitzung && Number.isInteger(sitzung.index) ? sitzung.aufgaben[sitzung.index] : null;
      zuruecksetzenUndLaden(a?.start || K.rollen[sitzung?.rolle]?.start || '#home');
    }
  }

  function verbinden() {
    const es = new EventSource('/api/strom?rolle=ipad');
    es.addEventListener('sitzung', e => { verbunden = true; $('studie-verbindung').className = 'studie-verbindung ok'; onSitzung(JSON.parse(e.data)); });
    es.addEventListener('ki', e => onKi(JSON.parse(e.data)));
    es.addEventListener('befehl', e => onBefehl(JSON.parse(e.data)));
    es.onerror = () => { verbunden = false; $('studie-verbindung').className = 'studie-verbindung fehler'; };
  }
  ansicht = ansichtBestimmen();
  render();
  verbinden();
})();
