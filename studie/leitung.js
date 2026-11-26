// ROBOplan-Nutzertest: Konsole der Testleitung.
'use strict';
const K = window.STUDIE_KONFIG;
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const uhr = ms => ms ? new Date(ms).toLocaleTimeString('de-DE') : '';
const dauer = ms => { if (ms == null) return '–'; const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const PHASEN = {willkommen: 'Begrüßung', intro: 'Aufgabe lesen', laeuft: 'Aufgabe läuft', seq: 'Bewertung (SEQ)', fragebogen: 'Fragebogen', danke: 'Abgeschlossen', beendet: 'Beendet'};
const NOTIZ_CHIPS = ['Zögert', 'Sucht Funktion', 'Falscher Weg', 'Fragt nach', 'Positiver Kommentar', 'Negativer Kommentar', 'Missverständnis'];

let sitzung = null, ereignisse = [], kiStatus = 'aus';

async function post(url, body) {
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { console.warn(data); alert(data.fehler || 'Aktion nicht möglich'); return null; }
  return data;
}
const aktion = (name, extra = {}) => post('/api/sitzung', {aktion: name, ...extra}).then(s => { if (s && s.id) setSitzung(s); return s; });

// ------------------------------------------------------------ Darstellung
function setSitzung(s) {
  const neu = s?.id !== sitzung?.id;
  sitzung = s;
  if (neu) { ereignisse = []; ladeEreignisse(); }
  render();
}
function render() {
  const s = sitzung, aktiv = s && s.phase !== 'beendet';
  $('sitzung-info').textContent = aktiv ? `${s.teilnehmer} · ${s.gruppe || 'ohne Gruppe'} · ${K.rollen[s.rolle]?.label || s.rolle}` : 'Keine aktive Sitzung';
  $('phase').textContent = aktiv ? PHASEN[s.phase] + (Number.isInteger(s.index) ? ` · ${s.index + 1}/${s.aufgaben.length}` : '') : '';
  ['btn-reload', 'btn-reset', 'btn-ende'].forEach(id => { $(id).disabled = !aktiv; });
  renderAktuell(); renderListe(); renderNotizen(); renderFeed(); renderKiVerlauf(); renderMikro();
}
function zaehler(i) {
  const z = {taps: 0, ohne: 0, deakt: 0, wisch: 0, ansichten: 0, rueck: 0, ki: 0, verweigert: 0};
  const pfad = [];
  ereignisse.forEach(e => {
    if (e.aufgabe !== i) return;
    if (e.typ === 'tipp') { z.taps++; if (e.art === 'ohne-wirkung') z.ohne++; if (e.art === 'deaktiviert') z.deakt++; }
    if (e.typ === 'wisch') z.wisch++;
    if (e.typ === 'ansicht') { if (pfad.includes(e.ziel)) z.rueck++; pfad.push(e.ziel); z.ansichten++; }
    if (e.typ === 'ki-start') z.ki++;
    if (e.typ === 'zugriff-verweigert') z.verweigert++;
  });
  return z;
}
function renderAktuell() {
  const s = sitzung, box = $('aktuell');
  if (!s || s.phase === 'beendet') { box.innerHTML = '<p>Starte eine neue Sitzung, sobald die Testperson bereit ist.</p><button type="button" class="primaer weiter" onclick="neueSitzung()">Neue Sitzung</button>'; return; }
  const weiterText = {willkommen: 'Begrüßung überspringen', intro: 'Aufgabe für Testperson starten', laeuft: 'Aufgabe beenden (Testleitung)', seq: 'SEQ überspringen', fragebogen: 'Fragebogen überspringen', danke: ''}[s.phase];
  if (!Number.isInteger(s.index)) {
    const text = {willkommen: `Die Testperson liest die Begrüßung und bestätigt die Einwilligung. Rolle: <b>${esc(K.rollen[s.rolle]?.person)}</b>.`, fragebogen: 'Die Testperson füllt den Evaluationsbogen aus.', danke: s.fragebogen ? 'Fragebogen gespeichert. Die Sitzung kann beendet werden.' : 'Abgeschlossen.'}[s.phase] || '';
    box.innerHTML = `<div class="label">${esc(PHASEN[s.phase])}</div><p>${text}</p>
      ${s.einwilligung ? `<p class="meta">Einwilligung erteilt um ${uhr(s.einwilligung)}</p>` : ''}
      ${weiterText ? `<button type="button" class="weiter" onclick="aktion('weiter')">${weiterText}</button>` : `<button type="button" class="primaer weiter" onclick="sitzungBeenden()">Sitzung beenden</button>`}`;
    return;
  }
  const a = s.aufgaben[s.index], r = s.ergebnisse[s.index], konf = K.aufgaben.find(x => x.id === a.id) || {};
  const z = zaehler(s.index), laeuft = s.phase === 'laeuft';
  box.innerHTML = `<div class="label">Aufgabe ${s.index + 1} von ${s.aufgaben.length} · ${esc(PHASEN[s.phase])}</div>
    <div class="gross">${esc(a.titel)}</div>
    <div class="reihe"><span class="zeit" id="uhr">${dauer(laeuft ? Date.now() - r.start : r.dauerMs)}</span>
      ${konf.pruefen ? `<span class="auto ${r.autoErfolg ? 'ja' : ''}">${r.autoErfolg ? '✓ Kriterium erreicht' + (r.autoErfolgNachMs != null ? ' nach ' + dauer(r.autoErfolgNachMs) : '') : 'Kriterium offen'}</span>` : '<span class="auto">manuell bewerten</span>'}
      ${r.ergebnis ? `<span class="auto">${esc(r.ergebnis)}</span>` : ''}</div>
    <div class="kriterium">${konf.bezug ? `<span class="meta">${esc(konf.bezug)}</span><br>` : ''}<b>Erfolg:</b> ${esc(konf.erfolg || '–')}${konf.wizard ? `<br><b>Wizard:</b> ${esc(konf.wizard)}` : ''}</div>
    <div class="zahlen">
      <div class="zahl"><b>${z.taps}</b><span>Taps</span></div>
      <div class="zahl ${z.ohne ? 'warn' : ''}"><b>${z.ohne}</b><span>ohne Wirkung</span></div>
      <div class="zahl ${z.deakt ? 'warn' : ''}"><b>${z.deakt}</b><span>deaktiviert</span></div>
      <div class="zahl"><b>${z.wisch}</b><span>Wischen</span></div>
      <div class="zahl"><b>${z.ansichten}</b><span>Ansichten</span></div>
      <div class="zahl ${z.rueck ? 'warn' : ''}"><b>${z.rueck}</b><span>Rücksprünge</span></div>
      <div class="zahl"><b>${z.ki}</b><span>KI-Anfragen</span></div>
      <div class="zahl ${z.verweigert ? 'warn' : ''}"><b>${z.verweigert}</b><span>kein Zugriff</span></div>
    </div>
    <div class="reihe hinweise">Hinweise gegeben: <button type="button" onclick="aktion('hinweis',{index:${s.index},delta:-1})">−</button><b>${r.hinweise}</b><button type="button" onclick="aktion('hinweis',{index:${s.index},delta:1})">+ Hinweis</button></div>
    <div class="reihe bewertung">Bewertung:
      ${[['erfolg', 'Erfolg'], ['hilfe', 'Mit Hilfe'], ['gescheitert', 'Gescheitert']].map(([k, l]) => `<button type="button" class="b-${k}" aria-pressed="${r.bewertung === k}" onclick="bewerten(${s.index},'${k}')">${l}</button>`).join('')}
      ${r.seq ? `<span class="auto">SEQ ${r.seq}/7</span>` : ''}</div>
    ${weiterText ? `<button type="button" class="weiter ${laeuft ? 'warnung' : s.phase === 'intro' ? '' : ''}" onclick="aktion('weiter')">${weiterText}</button>` : ''}`;
}
function bewerten(i, k) { aktion('bewerten', {index: i, bewertung: sitzung.ergebnisse[i].bewertung === k ? null : k}); }
function renderListe() {
  const s = sitzung, ol = $('aufgabenliste');
  if (!s || s.phase === 'beendet') { ol.innerHTML = ''; return; }
  ol.innerHTML = s.aufgaben.map((a, i) => {
    const r = s.ergebnisse[i], erledigt = r.ende, aktiv = s.index === i;
    const b = {erfolg: '✓ Erfolg', hilfe: '◐ mit Hilfe', gescheitert: '✗ gescheitert'}[r.bewertung] || '';
    return `<li class="${aktiv ? 'aktiv' : ''} ${erledigt ? 'erledigt' : ''}"><span class="nr">${i + 1}</span>
      <span><b>${esc(a.titel)}</b><br><span class="meta">${erledigt ? dauer(r.dauerMs) + ' · ' + esc(r.ergebnis) : r.start && aktiv ? 'läuft' : 'offen'}${r.autoErfolg ? ' · Kriterium ✓' : ''}${b ? ' · ' + b : ''}${r.seq ? ' · SEQ ' + r.seq : ''}${r.hinweise ? ' · ' + r.hinweise + ' Hinweis(e)' : ''}</span></span>
      <button type="button" onclick="springen(${i})" ${aktiv && s.phase === 'intro' ? 'disabled' : ''}>${erledigt ? 'Wiederholen' : 'Springen'}</button></li>`;
  }).join('') + `<li><span class="nr">✎</span><span><b>Evaluationsbogen</b><br><span class="meta">${s.fragebogen ? 'ausgefüllt ' + uhr(s.fragebogen.zeit) : 'offen'}</span></span><button type="button" onclick="springen('fragebogen')" ${s.phase === 'fragebogen' ? 'disabled' : ''}>Springen</button></li>`;
}
function springen(i) {
  if (sitzung.phase === 'laeuft' && !confirm('Die laufende Aufgabe wird beendet. Fortfahren?')) return;
  aktion('springen', {index: i});
}
function renderNotizen() {
  const s = sitzung;
  $('notizen').innerHTML = (s?.notizen || []).slice().reverse().map(n => `<li><time>${uhr(n.zeit)}</time>${Number.isInteger(n.index) ? `<b>A${n.index + 1}</b> ` : ''}${esc(n.text)}</li>`).join('');
}
function notiz(text) { if (sitzung && text.trim()) aktion('notiz', {text}); }

// ------------------------------------------------------------ Ereignisse
async function ladeEreignisse() {
  if (!sitzung) return;
  try { ereignisse = await (await fetch('/api/ereignisse?sitzung=' + encodeURIComponent(sitzung.id))).json(); } catch { ereignisse = []; }
  const letzte = [...ereignisse].reverse().find(e => e.typ === 'ansicht');
  if (letzte) $('ansicht').textContent = letzte.ziel;
  kiStatusAusEreignissen();
  render();
}
function kategorie(e) {
  if (e.typ === 'tipp' || e.typ === 'wisch') return 'tipp';
  if (e.typ === 'ansicht') return 'ansicht';
  if (e.typ === 'aktion' || e.typ === 'auto-erfolg') return 'aktion';
  if (e.typ.startsWith('ki-')) return 'ki';
  return 'sonst';
}
function feedText(e) {
  if (e.typ === 'tipp') return `${e.art === 'aktiv' ? '' : `<b>${esc(e.art)}</b> · `}${esc(e.ziel)}`;
  if (e.typ === 'ansicht') return `→ <b>${esc(e.ziel)}</b>`;
  if (e.typ === 'aktion') return `<b>${esc(e.ziel)}</b>(${esc((e.args || []).join(', '))})${e.ergebnis !== undefined ? ' = ' + esc(e.ergebnis) : ''}`;
  if (e.typ === 'auto-erfolg') return '<b>Erfolgskriterium erreicht</b>';
  if (e.typ === 'ki-start') return '<b>Testperson startet Spracheingabe</b>';
  if (e.typ === 'ki-stop') return 'Spracheingabe beendet (' + esc(e.quelle || '') + ')';
  return esc(e.ziel || e.text || '');
}
function renderFeed() {
  const an = new Set([...$('feed-filter').querySelectorAll('input:checked')].map(i => i.value));
  $('feed').innerHTML = ereignisse.slice(-400).reverse().filter(e => an.has(kategorie(e))).slice(0, 250).map(e =>
    `<li class="t-${esc(e.art === 'ohne-wirkung' || e.art === 'deaktiviert' ? e.art : kategorie(e) === 'ki' ? 'ki' : e.typ)}"><time>${uhr(e.ts || e.t)}</time><span class="typ">${esc(e.typ)}${Number.isInteger(e.aufgabe) ? ' A' + (e.aufgabe + 1) : ''}</span><span>${feedText(e)}</span></li>`).join('');
}
$('feed-filter').addEventListener('change', renderFeed);

// ------------------------------------------------------------ KI-Assistent
function kiStatusAusEreignissen() {
  const letzte = [...ereignisse].reverse().find(e => ['ki-start', 'ki-stop', 'ki-antwort', 'ki-geschlossen'].includes(e.typ));
  kiStatus = !letzte ? 'aus' : letzte.typ === 'ki-start' ? 'spricht' : letzte.typ === 'ki-stop' && letzte.quelle === 'teilnehmer' ? 'wartet' : 'aus';
}
function renderMikro() {
  const m = $('mikro');
  m.className = 'karte mikro ' + (kiStatus === 'spricht' ? 'spricht' : kiStatus === 'wartet' ? 'wartet' : '');
  $('mikro-text').textContent = kiStatus === 'spricht' ? 'Testperson spricht mit dem Assistenten …' : kiStatus === 'wartet' ? 'Testperson wartet auf eine Antwort' : 'Assistent inaktiv';
}
function renderKiVerlauf() {
  const wer = {'ki-start': 'Testperson', 'ki-stop': 'Testperson', 'ki-aktion': 'Testperson', 'testleitung-antwort': 'Assistent', 'testleitung-denkt': 'Assistent', 'testleitung-transkript': 'Gesagt', 'testleitung-ausblenden': 'Assistent'};
  const was = k => ({'ki-start': 'startet Spracheingabe', 'ki-stop': 'beendet Spracheingabe', 'ki-aktion': 'nutzt Aktion ' + (k.aktion || k.text), 'testleitung-denkt': '„Einen Moment …“', 'testleitung-ausblenden': 'ausgeblendet'}[k.art] || k.text + (k.aktion ? ` [${k.aktion}${k.modus ? ', ' + k.modus : ''}]` : ''));
  $('ki-verlauf').innerHTML = (sitzung?.ki || []).slice(-60).reverse().map(k => `<li><time>${uhr(k.zeit)}</time><span class="wer">${wer[k.art] || k.art}:</span>${esc(was(k))}</li>`).join('');
}
let vorlageExtra = null;  // Absender/Optionen der zuletzt übernommenen Vorlage
function kiSenden(art, extra = {}) { return post('/api/ki', {art, ...extra}); }
async function antwortSenden(text = $('antwort').value.trim(), aktionId = $('ki-aktion').value, modus = $('ki-modus').value, label = '', extra = vorlageExtra) {
  if (!text && !aktionId) return;
  const def = K.kiAktionen.find(a => a.id === aktionId);
  const ok = await kiSenden('antwort', {text, vorlesen: $('vorlesen').checked, aktion: aktionId, modus: aktionId ? modus : '', aktionLabel: label || (def ? def.label.replace(/^[^:]+: /, '') : ''),
    absender: extra?.absender || '', meldung: !!extra?.meldung, optionen: extra?.optionen || []});
  vorlageExtra = null;
  if (ok) { $('antwort').value = ''; $('ki-aktion').value = ''; kiStatus = 'aus'; renderMikro(); }
}
$('btn-senden').onclick = () => antwortSenden();
$('antwort').addEventListener('input', () => { if (!$('antwort').value.trim()) vorlageExtra = null; });
$('antwort').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); antwortSenden(); } });
$('btn-denkt').onclick = () => kiSenden('denkt');
$('btn-ausblenden').onclick = () => kiSenden('ausblenden');
$('transkript-form').onsubmit = e => { e.preventDefault(); const t = $('transkript').value.trim(); if (t) kiSenden('transkript', {text: t}).then(() => { $('transkript').value = ''; }); };
$('ki-aktion').innerHTML += K.kiAktionen.map(a => `<option value="${esc(a.id)}">${esc(a.label)}</option>`).join('');
(function vorlagen() {
  const gruppen = [...new Set(K.kiVorlagen.map(v => v.gruppe))];
  $('vorlagen').innerHTML = gruppen.map(g => `<h3>${esc(g)}</h3>` + K.kiVorlagen.map((v, i) => v.gruppe !== g ? '' : `<div class="vorlage"><button type="button" class="text" data-v="${i}">${esc(v.text)}${v.absender || v.meldung ? `<small>${v.meldung ? '🔔 Meldung · ' : ''}${esc(v.absender || 'KI-Assistent')}</small>` : ''}${v.optionen ? `<small>Buttons: ${v.optionen.map(o => esc(o.label)).join(' / ')}</small>` : ''}${v.aktion ? `<small>${esc(K.kiAktionen.find(a => a.id === v.aktion)?.label || v.aktion)} · ${v.modus === 'direkt' ? 'direkt' : 'als Button'}</small>` : ''}</button><button type="button" class="los" data-los="${i}" title="Sofort senden">▶</button></div>`).join('')).join('');
  $('vorlagen').onclick = e => {
    const b = e.target.closest('[data-v],[data-los]');
    if (!b) return;
    const v = K.kiVorlagen[Number(b.dataset.v ?? b.dataset.los)];
    const extra = {absender: v.absender, meldung: v.meldung, optionen: v.optionen};
    if (b.dataset.los !== undefined) { antwortSenden(v.text, v.aktion || '', v.modus || 'vorschlag', v.aktionLabel || '', extra); return; }
    vorlageExtra = extra;
    $('antwort').value = v.text; $('ki-aktion').value = v.aktion || ''; $('ki-modus').value = v.modus || 'vorschlag'; $('antwort').focus();
  };
})();

// ------------------------------------------------------------ Sitzung anlegen
$('neu-rolle').innerHTML = Object.entries(K.rollen).map(([k, r]) => `<option value="${k}">${esc(r.label)}</option>`).join('');
$('gruppen').innerHTML = K.gruppen.map(g => `<option value="${esc(g)}">`).join('');
function aufgabenFuerRolle() {
  const rolle = $('neu-rolle').value;
  $('neu-aufgaben').innerHTML = K.aufgaben.map(a => `<label><input type="checkbox" value="${esc(a.id)}" ${a.rollen.includes(rolle) ? 'checked' : ''}> ${esc(a.titel)} <small>· ${a.rollen.map(r => K.rollen[r]?.label).join(', ')}</small></label>`).join('');
}
$('neu-rolle').onchange = aufgabenFuerRolle;
async function neueSitzung() {
  let n = 1;
  try { n = (await (await fetch('/api/sitzungen')).json()).length + 1; } catch {}
  $('neu-code').value = 'P' + String(n).padStart(2, '0');
  aufgabenFuerRolle();
  $('dlg-neu').showModal();
}
$('btn-neu').onclick = neueSitzung;
$('neu-abbrechen').onclick = () => $('dlg-neu').close();
$('form-neu').onsubmit = async e => {
  e.preventDefault();
  if (sitzung && !['beendet', 'danke'].includes(sitzung.phase) && !confirm(`Die laufende Sitzung ${sitzung.teilnehmer} wird beendet. Fortfahren?`)) return;
  let ids = [...$('neu-aufgaben').querySelectorAll('input:checked')].map(i => i.value);
  if (!ids.length) { alert('Bitte mindestens eine Aufgabe auswählen.'); return; }
  if ($('neu-mischen').checked) for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  const aufgaben = ids.map(id => { const a = K.aufgaben.find(x => x.id === id); return {id: a.id, titel: a.titel, text: a.text, start: a.start, zuruecksetzen: a.zuruecksetzen !== false}; });
  const s = await aktion('neu', {teilnehmer: $('neu-code').value.trim(), gruppe: $('neu-gruppe').value.trim(), rolle: $('neu-rolle').value, rollenrechte: $('neu-rechte').checked, notiz: $('neu-notiz').value.trim(), aufgaben});
  if (s) $('dlg-neu').close();
};
function sitzungBeenden() { if (confirm('Sitzung beenden? Die Daten bleiben gespeichert.')) aktion('beenden'); }
$('btn-ende').onclick = sitzungBeenden;
$('btn-reload').onclick = () => post('/api/befehl', {befehl: 'neu-laden'});
$('btn-reset').onclick = () => { if (confirm('App auf dem iPad in den Ausgangszustand der aktuellen Aufgabe zurücksetzen?')) post('/api/befehl', {befehl: 'zuruecksetzen'}); };
$('notiz-chips').innerHTML = NOTIZ_CHIPS.map(c => `<button type="button">${esc(c)}</button>`).join('');
$('notiz-chips').onclick = e => { if (e.target.matches('button')) { const t = $('notiz').value.trim(); notiz(e.target.textContent + (t ? ': ' + t : '')); $('notiz').value = ''; } };
$('notiz-form').onsubmit = e => { e.preventDefault(); notiz($('notiz').value); $('notiz').value = ''; };

// ------------------------------------------------------------ Verbindung
function verbinden() {
  const es = new EventSource('/api/strom?rolle=leitung');
  es.addEventListener('sitzung', e => setSitzung(JSON.parse(e.data)));
  es.addEventListener('geraete', e => {
    const g = JSON.parse(e.data);
    $('ipad-status').textContent = g.ipad ? `iPad verbunden${g.ipad > 1 ? ' (' + g.ipad + ')' : ''}` : 'iPad nicht verbunden';
    $('ipad-status').className = 'geraet' + (g.ipad ? ' ok' : '');
  });
  es.addEventListener('live', e => {
    const neu = JSON.parse(e.data);
    ereignisse.push(...neu);
    if (ereignisse.length > 5000) ereignisse = ereignisse.slice(-4000);
    const v = [...neu].reverse().find(x => x.typ === 'ansicht');
    if (v) $('ansicht').textContent = v.ziel;
    kiStatusAusEreignissen();
    renderFeed(); renderMikro();
    if (sitzung && Number.isInteger(sitzung.index)) renderAktuell();
  });
  es.addEventListener('ki-protokoll', e => {
    const k = JSON.parse(e.data);
    if (sitzung && k.zeit && !sitzung.ki.includes(k)) sitzung.ki.push(k);
    renderKiVerlauf();
  });
  es.onerror = () => { $('ipad-status').textContent = 'Server nicht erreichbar'; $('ipad-status').className = 'geraet'; };
}
setInterval(() => { if (sitzung?.phase === 'laeuft' && $('uhr')) $('uhr').textContent = dauer(Date.now() - sitzung.ergebnisse[sitzung.index].start); }, 500);
verbinden();
