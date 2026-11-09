// Die Grunddatei lädt die Unterseiten und startet danach die Anwendung.
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
  ];

  try {
    const fragments = await Promise.all(pages.map(async (url) => {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Unterseite konnte nicht geladen werden: ${url}`);
      return response.text();
    }));
    content.innerHTML = fragments.join('\n');
    const script = document.createElement('script');
    script.src = 'app.js?v=20261104-robot-plan43';
    script.onerror = () => { content.textContent = 'Die Anwendung konnte nicht gestartet werden. Bitte lade die Seite erneut.'; };
    document.body.append(script);
  } catch (error) {
    content.textContent = 'Die Unterseiten konnten nicht geladen werden. Bitte lade die Seite erneut.';
    console.error(error);
  } finally {
    content.setAttribute('aria-busy', 'false');
  }
}

startApplication();
