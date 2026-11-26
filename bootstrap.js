// Die Grunddatei lädt die Unterseiten und startet danach die Anwendung.
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Skript konnte nicht geladen werden: ' + src));
    document.body.append(script);
  });
}

async function startApplication() {
  const content = document.getElementById('page-content');
  const pages = [
    'pages/uebersicht.html',
    'pages/wetter.html',
    'pages/ackerschlaege.html',
    'pages/roboterverwaltung.html',
    'pages/robotereinsatz.html',
    'pages/fehler.html',
    'pages/auftragsverwaltung.html',
    'pages/benutzerkonto.html',
  ];

  try {
    const fragments = await Promise.all(pages.map(async (url) => {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Unterseite konnte nicht geladen werden: ${url}`);
      return response.text();
    }));
    content.innerHTML = fragments.join('\n');
    await loadScript('app.js?v=20261125-studie');
    // Nutzertest: app.html?studie=1 lädt Testmodus und Verbindung zur Testleitung.
    if (new URLSearchParams(location.search).has('studie')) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = 'studie/teilnehmer.css?v=20261125';
      document.head.append(style);
      await loadScript('studie/konfiguration.js?v=20261125');
      await loadScript('studie/teilnehmer.js?v=20261125');
    }
  } catch (error) {
    content.textContent = 'Die Anwendung konnte nicht gestartet werden. Bitte lade die Seite erneut.';
    console.error(error);
  } finally {
    content.setAttribute('aria-busy', 'false');
  }
}

startApplication();
