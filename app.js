// Lokale Benutzereinstellungen; das Demo-Konto hat keine Server-Anmeldung.
const userAccountStorageKey='roboplan-user-settings-v1';
const userAccountDefaults={name:'Hans Admin',business:'Hof Grünpark',email:'',startPage:'home',reduceMotion:false};
function readUserAccount(){
  try{
    const saved=JSON.parse(localStorage.getItem(userAccountStorageKey)||'{}')||{};
    return {name:typeof saved.name==='string'&&saved.name.trim()?saved.name.trim().slice(0,80):userAccountDefaults.name,business:typeof saved.business==='string'?saved.business.slice(0,120):userAccountDefaults.business,email:typeof saved.email==='string'?saved.email.slice(0,160):'',startPage:['home','ackerschlagskarte','roboterverwaltung','auftragsverwaltung'].includes(saved.startPage)?saved.startPage:'home',reduceMotion:saved.reduceMotion===true};
  }catch{return {...userAccountDefaults};}
}
let userAccount=readUserAccount(),userDemoSignedOut=false;
// Rollen und weitere Profile sind lokale Demo-Daten; aktuell ist Hans Admin angemeldet.
const managedUsersStorageKey='roboplan-managed-users-v1';
const currentManagedUserId='hans-admin';
const managedUserRoles={
  admin:{label:'Admin',access:'Alle Arbeitsbereiche und Benutzerrollen verwalten',permissions:['overview','robots','fields','createTasks','dispatch','manageUsers']},
  helper:{label:'Hilfsarbeiter',access:'Nur Übersicht und Roboter',permissions:['overview','robots']},
  office:{label:'Bürokraft',access:'Nur Aufgaben anlegen',permissions:['createTasks']},
  full:{label:'Vollbenutzer',access:'Alle Arbeitsbereiche, ohne Benutzerverwaltung',permissions:['overview','robots','fields','createTasks','dispatch']}
};
const defaultManagedUsers=[
  {id:'hans-admin',name:'Hans Admin',email:userAccount.email,role:'admin'},
  {id:'otto-hilfsarbeiter',name:'Otto Hilfsarbeiter',email:'',role:'helper'},
  {id:'frank-buerokraft',name:'Frank Bürokraft',email:'',role:'office'},
  {id:'anna-vollbenutzer',name:'Anna Vollbenutzer',email:'',role:'full'}
];
function readManagedUsers(){
  const users=new Map(defaultManagedUsers.map(user=>[user.id,{...user}]));
  try{
    const saved=JSON.parse(localStorage.getItem(managedUsersStorageKey)||'[]');
    if(Array.isArray(saved))saved.slice(0,100).forEach(user=>{
      if(!user||typeof user.id!=='string'||!(/^[a-z0-9-]{1,80}$/).test(user.id)||typeof user.name!=='string'||!user.name.trim()||!Object.hasOwn(managedUserRoles,user.role))return;
      users.set(user.id,{id:user.id,name:user.name.trim().slice(0,80),email:typeof user.email==='string'?user.email.slice(0,160):'',role:user.id===currentManagedUserId?'admin':user.role});
    });
  }catch{}
  return [...users.values()];
}
let managedUsers=readManagedUsers();
userAccount={...userAccount,name:managedUsers[0].name,email:managedUsers[0].email};

// Gemeinsame Kartendaten, Darstellung und Interaktionen.
const taskPriorities={immediate:{label:'Sofort',time:'So bald wie möglich'},week:{label:'Zeitnah',time:'Innerhalb einer Woche'},month:{label:'Geplant',time:'Innerhalb von vier Wochen'},flexible:{label:'Flexibel',time:'Ohne Zeitvorgabe'}};
function priorityBadge(task){const key=Object.hasOwn(taskPriorities,task.priority)?task.priority:'flexible';const p=taskPriorities[key];return `<span class="priority-badge priority-${key}" title="${p.time}"><i aria-hidden="true"></i>${p.label} · ${p.time}</span>`;}

// Gemeinsame Fahrzeugidentitäten für Übersicht, Flotte und Disposition.
const fleetVehicles=[
  {id:1,name:'AgXeed AgBot T2 5 SERIES · 1',shortName:'AgBot · 1',type:'Geräteträger',mount:'Wechselbare Anbaugeräte'},
  {id:2,name:'FarmDroid FD20 · 1',shortName:'FarmDroid · 1',type:'Hackroboter',fixed:'Hacke',mount:'Integrierte Hackeinheit'},
  {id:3,name:'FarmDroid FD20 · 2',shortName:'FarmDroid · 2',type:'Hackroboter',fixed:'Hacke',mount:'Integrierte Hackeinheit'},
  {id:4,name:'AgXeed AgBot T2 5 SERIES · 2',shortName:'AgBot · 2',type:'Geräteträger',mount:'Wechselbare Anbaugeräte'},
  {id:5,name:'John Deere 6R 215',shortName:'JD 6R 215',type:'Autonomer Traktor',mount:'Wechselbare Anbaugeräte'},
  {id:6,name:'CLAAS ARION 640',shortName:'ARION 640',type:'Autonomer Traktor',mount:'Wechselbare Anbaugeräte'}
];
function robotDisplayName(id){return fleetVehicles.find(r=>r.id===id)?.name||'Roboter '+id;}
function robotShortName(id){return fleetVehicles.find(r=>r.id===id)?.shortName||'Roboter '+id;}

const fields=[
  {
    "id": 1,
    "name": "Hinterm Haus",
    "crop": "Weizen",
    "area": "8,4 ha",
    "task": "Hacken",
    "note": "Bearbeitung läuft",
    "robots": [
      1,
      2
    ],
    "x": 160,
    "y": 185,
    "path": "M65 70Q145 35 245 65L255 245L165 280L60 250Z",
    "entry": [
      170,
      278
    ]
  },
  {
    "id": 2,
    "name": "Lerchenfeld",
    "crop": "Zuckerrüben",
    "area": "5,2 ha",
    "task": "Keine Behandlung",
    "note": "Aktuell kein Auftrag geplant",
    "robots": [],
    "x": 795,
    "y": 105,
    "path": "M580 55L970 55L985 118Q820 120 710 164L580 240Z",
    "entry": [
      710,
      164
    ]
  },
  {
    "id": 3,
    "name": "Ortberg",
    "crop": "Mais",
    "area": "6,8 ha",
    "task": "Keine Behandlung",
    "note": "Aktuell kein Auftrag geplant",
    "robots": [],
    "x": 790,
    "y": 395,
    "path": "M720 240Q840 195 980 205L975 585L670 540L535 410Q630 335 720 240Z",
    "entry": [
      680,
      268
    ]
  },
  {
    "id": 4,
    "name": "Bachwiese",
    "crop": "Weizen",
    "area": "4,6 ha",
    "task": "Hacken",
    "note": "Bearbeitung läuft",
    "robots": [
      3
    ],
    "x": 170,
    "y": 475,
    "path": "M55 365L185 390L342 477L265 615Q135 645 65 585Z",
    "entry": [
      342,
      477
    ]
  },
  {
    "id": 5,
    "name": "An den Pappeln",
    "crop": "Gerste",
    "area": "7,1 ha",
    "task": "Säen",
    "note": "Bearbeitung läuft",
    "robots": [
      4
    ],
    "x": 490,
    "y": 563,
    "path": "M448 485L605 548L636 615L373 575Z",
    "entry": [
      435,
      505
    ]
  },
  {
    "id": 6,
    "name": "Lange Wiese",
    "crop": "Grünland",
    "area": "3,9 ha",
    "task": "Keine Behandlung",
    "note": "Aktuell kein Auftrag geplant",
    "robots": [],
    "x": 805,
    "y": 790,
    "path": "M706 683L974 776L970 854L645 850Z",
    "entry": [
      755,
      700
    ]
  },
  {
    "id": 7,
    "name": "Mühlenkamp",
    "crop": "Raps",
    "area": "9,3 ha",
    "task": "Keine Behandlung",
    "note": "Aktuell kein Auftrag geplant",
    "robots": [],
    "x": 455,
    "y": 755,
    "path": "M345 651L610 683L580 852L310 844Z",
    "entry": [
      390,
      657
    ]
  },
  {
    "id": 8,
    "name": "Sonnenstück",
    "crop": "Kartoffeln",
    "area": "6,2 ha",
    "task": "Keine Behandlung",
    "note": "Aktuell kein Auftrag geplant",
    "robots": [],
    "x": 365,
    "y": 180,
    "path": "M280 60L510 65L535 245L405 354L285 300Z",
    "entry": [
      405,
      354
    ]
  }
];
const data=[ {
  id:1,p:65,b:78,time:'1 h 25 min',area:'Nordwiese',color:'#2d82b7',x:63,y:27
}, {
  id:2,p:32,b:54,time:'2 h 10 min',area:'Sportplatz',color:'#d77b6d',x:35,y:44
}, {
  id:3,p:48,b:62,time:'1 h 50 min',area:'Westpark',color:'#368b69',x:24,y:72
}, {
  id:4,p:81,b:89,time:'45 min',area:'Südwiese',color:'#c9a145',x:74,y:77
}, {
  id:5,p:24,b:71,time:'2 h 35 min',area:'Ostfeld',color:'#8c71b5',x:81,y:46
}, {
  id:6,p:57,b:66,time:'1 h 15 min',area:'Obstwiese',color:'#bc8748',x:46,y:64
}
];
data.forEach(r=> {
  const f=fields.find(f=>f.robots.includes(r.id));
  r.atFarm=!f;
  r.area=f?f.name:'Hof Grünpark';
  r.status=f?f.task:'Auf dem Hof';
  const offset=f&&f.robots.length>1?(f.robots.indexOf(r.id)===0?-40:40):0;
  r.x=f?(f.x+offset)/10.4:(r.id===5?120:180)/10.4;
  r.y=f?(f.y+25)/9:790/9;
  if(!f) {
    r.p=0;
    r.time='Kein Auftrag'
  }
}
);
// Beispielmeldungen: Saatgutwarnung und ein festgefahrener Roboter.
const robotAlerts={1:{severity:'error',message:'Festgefahren'},4:{severity:'warning',message:'Saatgut fast leer'}};
data.forEach(robot=>{
  robot.alert=robotAlerts[robot.id]||null;
  if(robot.alert?.severity==='error'){robot.status='Festgefahren';robot.time='Eingriff nötig';}
});
function landscape(n=0) {
  const interactive=n==='fields';
  return `<svg class="land" viewBox="0 0 1040 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hofkarte mit acht benannten Feldern, Straßen, Teich und Hof">
    <defs>
    <pattern id="rows-${n}" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
    <path d="M0 0V13" stroke="#6b9052" stroke-width="2" opacity=".16"/>
    </pattern>
    </defs>
    <rect width="1040" height="900" fill="#e4ebdc"/>
    <path d="M230 795Q285 755 320 660T435 455Q510 370 585 300T735 190Q865 140 1060 157M435 455Q320 375 200 330T-20 300M350 600Q510 635 635 650T1060 765" fill="none" stroke="#bfc7b3" stroke-width="23"/>
    <path d="M230 795Q285 755 320 660T435 455Q510 370 585 300T735 190Q865 140 1060 157M435 455Q320 375 200 330T-20 300M350 600Q510 635 635 650T1060 765" fill="none" stroke="#eee8d5" stroke-width="16"/>
    <path d="M230 795Q285 755 320 660T435 455Q510 370 585 300T735 190Q865 140 1060 157M435 455Q320 375 200 330T-20 300M350 600Q510 635 635 650T1060 765" fill="none" stroke="#d5cbb2" stroke-width="1.5"/>${fields.map((f,i)=>`<g>
    <path ${interactive?`class="field-shape ${f.id===1?'selected':''}" data-field="${f.id}" tabindex="0" role="button" aria-label="${f.name} auswählen"`:''} d="${f.path}" fill="${['#bed39e','#d6d0a0','#b0c997','#c8d9ad','#d2d9a5','#b2cda7','#d6ce99','#c2d29d'][i]}" stroke="#fffdf3" stroke-width="4"/>
    <path d="${f.path}" fill="url(#rows-${n})" pointer-events="none"/>
    <text x="${f.x}" y="${f.y-24}" fill="#365442" text-anchor="middle" font-family="sans-serif" font-size="21" font-weight="600" pointer-events="none">${f.name}</text>
    </g>`).join('')}${fields.map(f=>{const [x,y]=f.entry;const links={1:[175,322],2:[735,190],3:[680,225],4:[385,495],5:[420,480],6:[755,685],7:[390,615],8:[420,440]};const [sx,sy]=links[f.id];return `<path d="M${sx} ${sy}L${x} ${y}" stroke="#e9dec2" stroke-width="11" fill="none" stroke-linecap="round"/>
    <g pointer-events="none">
    <title>Feldeinfahrt ${f.name}</title>
    <circle cx="${x}" cy="${y}" r="11" fill="#fffaf0" stroke="#9a743c" stroke-width="2"/>
    <path d="M${x-5} ${y+4}v-8h10v8M${x-5} ${y}h10" stroke="#9a743c" stroke-width="2" fill="none"/>
    </g>`}).join('')}<path d="M65 665Q125 625 200 660Q265 695 215 765Q165 810 85 770Q35 735 65 665Z" fill="#aacdd0" stroke="#d4e1cd" stroke-width="12"/>
    <text x="140" y="720" fill="#577f85" font-family="sans-serif" font-size="18" text-anchor="middle">Dorfteich</text>
    <g fill="#759265">${Array.from({length:10},(_,i)=>`<ellipse cx="${470+i*17}" cy="${625+i*2}" rx="8" ry="15"/>`).join('')}</g>
    <path d="M70 795Q130 760 200 775L282 786L286 854L67 860Z" fill="#d3d2c2"/>
    <g stroke="#f6f4e9" stroke-width="3">
    <rect x="75" y="810" width="110" height="40" rx="3" fill="#8a9885"/>
    <rect x="220" y="690" width="50" height="85" rx="3" fill="#929e8a"/>
    <path d="M215 797h65v53h-65Z" fill="#faf8ed"/>
    <path d="M208 798l40-32 40 32Z" fill="#71887a"/>
    </g>
    <text x="175" y="880" text-anchor="middle" fill="#536c5a" font-family="sans-serif" font-size="21" font-weight="600">Hof Grünpark</text>${interactive?`<g>${data.map(r=>`<g role="button" tabindex="0" aria-label="${robotDisplayName(r.id)} anzeigen" onclick="openRobot(${r.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openRobot(${r.id})}" style="cursor:pointer">
    <circle cx="${r.x*10.4}" cy="${r.y*9}" r="27" fill="${r.color}" opacity=".18"/>
    <circle cx="${r.x*10.4}" cy="${r.y*9}" r="17" fill="${r.color}" stroke="white" stroke-width="3"/>
    <text x="${r.x*10.4}" y="${r.y*9+5}" fill="white" text-anchor="middle" font-size="14" font-family="sans-serif">${r.id}</text>
    </g>`).join('')}</g>`:''}</svg>`
}
// Feste Feldansicht für die Übersichtskarten, ohne Karteninteraktionen.
function robotOverviewMap(robot){
  const field=fields.find(f=>f.robots.includes(robot.id));
  let box=[15,665,300,235];
  if(field){
    const probe=document.createElementNS('http://www.w3.org/2000/svg','svg');
    const shape=document.createElementNS('http://www.w3.org/2000/svg','path');
    shape.setAttribute('d',field.path);probe.append(shape);
    probe.style.cssText='position:absolute;left:-10000px;top:0;width:1040px;height:900px;visibility:hidden';
    document.body.append(probe);
    const bounds=shape.getBBox(),pad=Math.max(bounds.width,bounds.height)*.12;
    box=[bounds.x-pad,bounds.y-pad,bounds.width+pad*2,bounds.height+pad*2];
    probe.remove();
  }
  return landscape('overview-robot-'+robot.id)
    .replace('viewBox="0 0 1040 900"',`viewBox="${box.join(' ')}"`)
    .replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid meet"')
    .replace('Hofkarte mit acht benannten Feldern, Straßen, Teich und Hof',field?'Aktuelles Feld: '+field.name:'Standort: Hof Grünpark')
    .replace('</svg>',`<circle cx="${robot.x*10.4}" cy="${robot.y*9}" r="15" fill="${robot.color}" stroke="white" stroke-width="3"/><text x="${robot.x*10.4}" y="${robot.y*9+5}" fill="white" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600">${robot.id}</text></svg>`);
}
const overview=document.getElementById('overview');
overview.insertAdjacentHTML('afterbegin',landscape(0));
[...data].sort((a,b)=>Number(b.alert?.severity==='error')-Number(a.alert?.severity==='error')||Number(b.alert?.severity==='warning')-Number(a.alert?.severity==='warning')||a.id-b.id).forEach(r=> {
  overview.insertAdjacentHTML('beforeend',`<button class="pin" data-map-robot="${r.id}" aria-label="${robotDisplayName(r.id)} anzeigen" style="left:${r.x}%;top:${r.y}%;--pin:${r.color}" onclick="openRobot(${r.id})">${r.id}</button>`);
  document.getElementById('robots').insertAdjacentHTML('beforeend',`<article class="robot ${r.alert?'robot-alert-'+r.alert.severity:''}" data-overview-robot="${r.id}" tabindex="0" aria-label="${robotDisplayName(r.id)} auf der Karte anzeigen">
    <div class="robothead">
    <div class="robotname">
    <span class="roboticon">▰</span>
    <div>
    <h3>${robotDisplayName(r.id)}</h3>
    <span class="robotid">MW–00${r.id}</span>
    </div>
    </div>
    <button class="robot-more-info" onclick="openRobot(${r.id})" aria-label="Mehr Infos zu ${robotDisplayName(r.id)}">Mehr Infos ↗</button>
    </div>
    <div class="statusline">
    <span class="battery">
    <i>
    <b style="--b:${r.b}%;${r.b<60?'background:#d4b462':''}">
    </b>
    </i>${r.b}%</span>
    <span class="badge">${r.alert?.severity==='error'?'⛔':r.alert?'⚠':'●'} &nbsp; ${r.alert?r.alert.message:r.status}</span>
    <span class="area">${r.area}</span>

    </div>
    <div class="robot-mounted-tool" data-robot-tool="${r.id}"></div>
    <div class="metrics">
    <div class="ring" style="--p:${r.p}" role="img" aria-label="${r.p} Prozent erledigt">
    <strong>${r.p}<small>%</small>
    </strong>
    </div>
    <div class="remaining">
    <span>${r.atFarm?'Status':'Verbleibende Zeit'}</span>
    <strong>${r.time}</strong>
    <small>${r.atFarm?'Bereit für den nächsten Einsatz':'Auftrag zu '+r.p+' % erledigt'}</small>
    </div>
    </div>
    <div class="map mini robot-static-map" aria-label="Standort ${robotDisplayName(r.id)} · ${r.area}">${robotOverviewMap(r)}</div>
    </article>`)
}
);
const alertCounts={error:data.filter(robot=>robot.alert?.severity==='error').length,warning:data.filter(robot=>robot.alert?.severity==='warning').length,ok:data.filter(robot=>!robot.alert).length};
document.getElementById('header-alerts').innerHTML=[['error','Fehler'],['warning','Warnungen'],['ok','OK']].map(([kind,label])=>`<span class="fleet-alert-${kind}" title="${alertCounts[kind]} ${label}" aria-label="${alertCounts[kind]} ${label}"><i aria-hidden="true"></i><b aria-hidden="true">${alertCounts[kind]}</b></span>`).join('');
document.getElementById('overview-alerts').innerHTML=`<button type="button" class="fleet-alert-error" data-robot-filter="error" aria-pressed="false" onclick="filterOverviewRobots('error')"><i aria-hidden="true"></i>${alertCounts.error} Fehler</button><button type="button" class="fleet-alert-warning" data-robot-filter="warning" aria-pressed="false" onclick="filterOverviewRobots('warning')"><i aria-hidden="true"></i>${alertCounts.warning} Warnung${alertCounts.warning===1?'':'en'}</button><button type="button" class="fleet-alert-ok" data-robot-filter="ok" aria-pressed="false" onclick="filterOverviewRobots('ok')"><i aria-hidden="true"></i>${alertCounts.ok} OK</button>`;
function filterOverviewRobots(severity){
  if(!['error','warning','ok'].includes(severity))return;
  const list=document.getElementById('robots');
  const active=list.dataset.filter===severity?'all':severity;
  list.dataset.filter=active;
  document.querySelectorAll('[data-overview-robot]').forEach(card=>{
    const robot=data.find(item=>item.id===Number(card.dataset.overviewRobot));
    card.hidden=active!=='all'&&(robot.alert?.severity||'ok')!==active;
  });
  document.querySelectorAll('[data-robot-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.robotFilter===active)));
  list.scrollTop=0;
}
function focusOverviewRobot(id){
  const robot=data.find(item=>item.id===id);
  if(!robot||typeof overview.focusMapPoint!=='function')return;
  overview.focusMapPoint(robot.x/100,robot.y/100,3);
  document.getElementById('overview-weather-title').textContent='Wetter bei '+robotDisplayName(id);
  document.getElementById('overview-weather-location').textContent=robot.area;
  document.querySelectorAll('[data-overview-robot]').forEach(card=>card.classList.toggle('is-selected',Number(card.dataset.overviewRobot)===id));
  overview.querySelectorAll('[data-map-robot]').forEach(pin=>pin.classList.toggle('is-selected',Number(pin.dataset.mapRobot)===id));
}
document.getElementById('robots').addEventListener('click',event=>{
  if(event.target.closest('button,a,input,select'))return;
  const card=event.target.closest('[data-overview-robot]');
  if(card)focusOverviewRobot(Number(card.dataset.overviewRobot));
});
document.getElementById('robots').addEventListener('keydown',event=>{
  if(event.target.matches('[data-overview-robot]')&&['Enter',' '].includes(event.key)){
    event.preventDefault();focusOverviewRobot(Number(event.target.dataset.overviewRobot));
  }
});
function openRobot(id) {
  location.hash='roboter-'+id;
}

document.getElementById('details').addEventListener('click',e=> {
  if(e.target===e.currentTarget)e.currentTarget.close()
}
);
// Beispielhistorie und Maßnahmen dienen ausschließlich der Oberflächendarstellung.
const fieldPlanning = {
  1: {last:'Säen (Weizen)', next:'Hacken · in Bearbeitung'},
  2: {last:'Zuckerrüben geerntet', next:'Grubbern (flach)'},
  3: {last:'Mais geerntet', next:'Grubbern (tief)'},
  4: {last:'Säen (Weizen)', next:'Hacken · in Bearbeitung'},
  5: {last:'Säen (Gerste)', next:'Striegeln · in Bearbeitung'},
  6: {last:'Mahd', next:'Keine Maßnahme vorgesehen'},
  7: {last:'Raps geerntet', next:'Grubbern (flach)'},
  8: {last:'Kartoffeln geerntet', next:'Säen (Weizen)'}
};
fields.find(f=>f.id===2).crop='Winterweizen';
fields.find(f=>f.id===3).crop='Winterweizen';
fields.find(f=>f.id===7).crop='Winterweizen';
fields.find(f=>f.id===8).crop='Winterweizen';
document.getElementById('field-list').innerHTML=fields.map(f=>`<details class="field-card field-accordion ${f.id===1?'selected':''}" id="field-card-${f.id}" ${f.id===1?'open':''}>
  <summary onclick="highlightField(${f.id})"><span>${f.name} <small>(${f.area})</small></span><span class="field-summary-actions"><button type="button" class="field-info-button" aria-label="Schlagkartei ${f.name} öffnen" onclick="event.preventDefault();event.stopPropagation();openFieldRecord(${f.id})">ⓘ Info</button><span class="field-chevron" aria-hidden="true">⌄</span></span></summary>
  <div class="field-expanded">
    <dl class="field-facts">
      <div><dt>Aktuelle Frucht</dt><dd>${f.crop}</dd></div>
      <div><dt>Letzter Arbeitsschritt</dt><dd>${fieldPlanning[f.id].last}</dd></div>
      <div><dt>Vorgeschlagene Maßnahme</dt><dd class="suggested-action"><span>${fieldPlanning[f.id].next}</span><button type="button" onclick="openFieldPlanner(${f.id})">Aufgabe planen ↗</button></dd></div>
    </dl>
    <div class="field-activity"><h4>Aktuell auf der Fläche</h4>${f.robots.length?f.robots.map(id=>`<div class="field-active-robot"><strong><i class="dot"></i>Roboter ${id}</strong><span>${f.task==='Hacken'?'Hacke':'Striegel'} · ${f.task}</span></div>`).join(''):'<p>Keine Roboter im Einsatz</p>'}</div>
  </div>
</details>`).join('');
function normalizeListSearch(value){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de').replace(/ß/g,'ss').replace(/[–—−]/g,'-').replace(/\s+/g,' ').trim();}
function matchesListSearch(text,query){const normalized=normalizeListSearch(text);return normalizeListSearch(query).split(' ').every(term=>normalized.includes(term));}
function filterFieldList(){
  const query=document.getElementById('field-search').value;
  let visible=0;
  fields.forEach(field=>{
    const card=document.getElementById('field-card-'+field.id);
    const matches=matchesListSearch(`${field.name} ${field.crop} ${field.area} ${fieldPlanning[field.id].next}`,query);
    card.hidden=!matches;if(matches)visible++;
  });
  document.getElementById('field-search-empty').hidden=visible>0;
  document.getElementById('field-customer-count').textContent=normalizeListSearch(query)?`${visible} von ${fields.length} Schlägen`:`${fields.length} Schläge`;
}
function sortFieldList(){
  const list=document.getElementById('field-list');
  const criterion=document.getElementById('field-sort').value;
  const compareText=(a,b)=>a.localeCompare(b,'de',{numeric:true,sensitivity:'base'});
  const sorted=[...fields].sort((a,b)=>{
    let comparison=0;
    if(criterion==='next')comparison=compareText(fieldPlanning[a.id].next,fieldPlanning[b.id].next);
    else if(criterion==='crop')comparison=compareText(a.crop,b.crop);
    else if(criterion==='area')comparison=parseFloat(b.area.replace(',','.'))-parseFloat(a.area.replace(',','.'));
    else comparison=compareText(a.name,b.name);
    return comparison||compareText(a.name,b.name)||a.id-b.id;
  });
  // Vorhandene Karten verschieben, damit Auswahl und aufgeklappte Einträge erhalten bleiben.
  sorted.forEach(field=>list.append(document.getElementById('field-card-'+field.id)));
}
sortFieldList();
document.getElementById('field-map-content').innerHTML=landscape('fields');
function highlightField(id) {
  document.querySelectorAll('.field-shape').forEach(el=> {
    const active=Number(el.dataset.field)===id;
    el.classList.toggle('selected',active);
    el.setAttribute('aria-pressed',String(active))
  }
  );
  document.querySelectorAll('.field-card').forEach(el=>el.classList.toggle('selected',el.id==='field-card-'+id));
 }
function selectField(id) {
  if(document.getElementById('field-card-'+id).hidden){document.getElementById('field-search').value='';filterFieldList();}
  highlightField(id);
  document.getElementById('field-card-'+id).open=true;
  document.getElementById('field-card-'+id).scrollIntoView( {
    block:'nearest',behavior:'smooth'
  }
  )
}
function showField(id) {
  selectField(id);
  const f=fields.find(f=>f.id===id);
  document.getElementById('detailTitle').textContent=f.name;
  document.getElementById('detailArea').textContent=f.crop+' · '+f.area;
  document.getElementById('detailRows').innerHTML=[['Auftrag',f.task],['Bearbeitung',f.note],['Roboter',f.robots.map(id=>'Roboter '+id).join(', ')||'Keine zugewiesen']].map(([k,v])=>`<div class="dialogrow">
    <span>${k}</span>
    <strong>${v}</strong>
    </div>`).join('');
  document.getElementById('details').showModal()
}
document.querySelectorAll('.field-shape').forEach(el=> {
  el.setAttribute('aria-pressed',String(el.dataset.field==='1'));
  el.addEventListener('click',()=>selectField(Number(el.dataset.field)));
  el.addEventListener('keydown',e=> {
    if(e.key==='Enter'||e.key===' ') {
      e.preventDefault();
      selectField(Number(el.dataset.field))
    }
  }
  )
}
);
function route()  {
  const requested = location.hash.slice(1) || userAccount.startPage;
  const accountMatch=requested.match(/^konto-(profil|einstellungen|benutzerverwaltung|logout)$/);
  const detailMatch=requested.match(/^aufgabe-(\d+)$/);
  const robotMatch=requested.match(/^roboter-(\d+)$/);
  const robotPlanMatch=requested.match(/^roboter-plan-(\d+)$/);
  const page = userDemoSignedOut||accountMatch?'benutzerkonto':robotPlanMatch?'robotereinsatz':robotMatch?'roboterdetail':detailMatch?'aufgabendetail':['home', 'wetter', 'fehler', 'ackerschlagskarte', 'roboterverwaltung', 'auftragsverwaltung', 'arbeitsspeicher'].includes(requested) ? requested : 'home';
  const area=page==='benutzerkonto'?'account':page==='wetter'?'home':['roboterdetail','robotereinsatz','fehler'].includes(page)?'roboterverwaltung':['arbeitsspeicher','aufgabendetail'].includes(page)?'auftragsverwaltung':page;
  document.body.dataset.area=area;
  const sections =  {
    benutzerkonto:'benutzerkonto', robotereinsatz:'robotereinsatz', home: 'home', wetter: 'wetter', fehler: 'fehler', ackerschlagskarte: 'fields', roboterverwaltung: 'roboterverwaltung', auftragsverwaltung: 'auftragsverwaltung', arbeitsspeicher: 'arbeitsspeicher', aufgabendetail: 'aufgabendetail', roboterdetail: 'roboterdetail'
  }
  ;
  if(robotPlanMatch&&window.robotProfileReady)renderRobotPlan(Number(robotPlanMatch[1]));
  if(robotMatch&&window.robotProfileReady)renderRobotProfile(Number(robotMatch[1]));
  if(page==='wetter')renderOverviewWeather();
  if(page==='fehler')renderFaultOverview();
  if(page==='benutzerkonto')renderUserAccountPage(accountMatch?.[1]||'logout');
  closeUserMenu();
  Object.entries(sections).forEach(([name, id]) =>  {
    document.getElementById(id).hidden = name !== page;
  }
  );
  if(window.robotProfileReady)syncCaseTouchscreen();
  document.querySelectorAll('nav a').forEach(link =>  {
    const active = link.dataset.page === area;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  );
}
window.addEventListener('hashchange',route);
window.addEventListener('hashchange',()=>{const match=location.hash.match(/^#aufgabe-(\d+)$/);if(match&&window.dispatchReady)renderTaskOverview(Number(match[1]));});
route();
function enableMap(container) {
  container.classList.add('map-viewport');
  container.querySelectorAll('.maptools').forEach(el=>el.remove());
  const scene=document.createElement('div');
  scene.className='map-scene';
  const source=container.querySelector('#field-map-content');
  if(source) {
    while(source.firstChild)scene.append(source.firstChild);
    source.remove()
  }
  else Array.from(container.children).filter(el=>el.matches('svg,.pin')).forEach(el=>scene.append(el));
  container.prepend(scene);
  const controls=document.createElement('div');
  controls.className='map-controls';
  controls.innerHTML=`<button type="button" aria-label="Karte vergrößern" title="Vergrößern">+</button>
    <button type="button" aria-label="Karte verkleinern" title="Verkleinern">−</button>
    <button type="button" aria-label="Kartenansicht zurücksetzen" title="Ansicht zurücksetzen">↺</button>`;
  container.append(controls);
  const expand=document.createElement('button');
  expand.type='button';expand.className='map-expand';expand.textContent='⤢';expand.title='Karte auf ganze Seite vergrößern';expand.setAttribute('aria-label',expand.title);expand.setAttribute('aria-pressed','false');
  expand.onclick=()=>{const active=container.classList.toggle('map-expanded');expand.textContent=active?'⤡':'⤢';expand.title=active?'Zur ursprünglichen Kartenansicht':'Karte auf ganze Seite vergrößern';expand.setAttribute('aria-label',expand.title);expand.setAttribute('aria-pressed',String(active));requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));};
  container.append(expand);
  const [plus,minus,reset]=controls.children;
  let scale=1,x=0,y=0,drag=null,suppressClick=false;
  const proportional = container.id === 'overview' || container.id === 'dispatch-map' || container.id === 'task-route-map' || container.id === 'record-map' || container.id === 'task-overview-map' || container.id === 'robot-profile-map' || container.id === 'robot-plan-map' || container.classList.contains('fleet-robot-map');
  let aspect=Number(container.dataset.aspect) || 1040/900;
  let mapWidth=0,mapHeight=0,offsetX=0,offsetY=0;
  function render() {
    const w=container.clientWidth,h=container.clientHeight;
    aspect=Number(container.dataset.aspect)||1040/900;
    if (proportional) {
      // Fit the map and its marker layer together, preserving the 1040:900 ratio.
      mapWidth = Math.min(w, h * aspect);
      mapHeight = mapWidth / aspect;
      offsetX = (w - mapWidth) / 2;
      offsetY = (h - mapHeight) / 2;
      scene.style.inset = 'auto';
      scene.style.width = `${mapWidth}px`;
      scene.style.height = `${mapHeight}px`;
      scene.style.left = `${offsetX}px`;
      scene.style.top = `${offsetY}px`;
      x = mapWidth * scale <= w ? (mapWidth - mapWidth * scale) / 2
        : Math.max(w - offsetX - mapWidth * scale, Math.min(-offsetX, x));
      y = mapHeight * scale <= h ? (mapHeight - mapHeight * scale) / 2
        : Math.max(h - offsetY - mapHeight * scale, Math.min(-offsetY, y));
    } else {
      x=Math.max(w*(1-scale),Math.min(0,x));
      y=Math.max(h*(1-scale),Math.min(0,y));
    }
    scene.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    plus.disabled=scale>=4;
    minus.disabled=scale<=1
  }
  function zoom(factor,cx=container.clientWidth/2,cy=container.clientHeight/2) {
    const next=Math.max(1,Math.min(4,scale*factor));
    const localX = cx - offsetX;
    const localY = cy - offsetY;
    x=localX-(localX-x)*next/scale;
    y=localY-(localY-y)*next/scale;
    scale=next;
    render()
  }
  container.focusMapPoint=(pointX,pointY,zoomLevel=3)=>{
    render();
    scale=Math.max(1,Math.min(4,zoomLevel));
    const width=proportional?mapWidth:container.clientWidth;
    const height=proportional?mapHeight:container.clientHeight;
    x=container.clientWidth/2-offsetX-pointX*width*scale;
    y=container.clientHeight/2-offsetY-pointY*height*scale;
    render();
  };
  plus.onclick=()=>zoom(1.35);
  minus.onclick=()=>zoom(1/1.35);
  reset.onclick=()=> {
    scale=1;
    x=y=0;
    render()
  }
  ;
  container.addEventListener('wheel',e=> {
    e.preventDefault();
    const r=container.getBoundingClientRect();
    zoom(Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top)
  }
  , {
    passive:false
  }
  );
  container.addEventListener('pointerdown',e=> {
    if(e.target.closest('.map-controls,.map-expand')||e.button!==0)return;
    drag= {
      id:e.pointerId,x:e.clientX,y:e.clientY,startX:x,startY:y,moved:false
    }
    ;
    suppressClick=false
  }
  );
  container.addEventListener('pointermove',e=> {
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)>5) {
      drag.moved=true;
      container.setPointerCapture(e.pointerId);
      container.classList.add('dragging')
    }
    if(drag.moved) {
      x=drag.startX+dx;
      y=drag.startY+dy;
      render()
    }
  }
  );
  function finish(e) {
    if(!drag||drag.id!==e.pointerId)return;
    suppressClick=drag.moved;
    drag=null;
    container.classList.remove('dragging');
    if(container.hasPointerCapture(e.pointerId))container.releasePointerCapture(e.pointerId)
  }
  container.addEventListener('pointerup',finish);
  container.addEventListener('pointercancel',finish);
  container.addEventListener('click',e=> {
    if(suppressClick) {
      e.preventDefault();
      e.stopImmediatePropagation();
      suppressClick=false
    }
  }
  ,true);
  new ResizeObserver(()=> {
    if(container.clientWidth&&container.clientHeight)render()
  }
  ).observe(container);
  render();
}
document.querySelectorAll('#overview,.field-map').forEach(enableMap);

// Flottenmanagement: gemeinsame Roboterdaten, ergänzte Demo-Betriebszustände.
const fleetOperatingStates={1:{kind:'error',label:'Fehler',detail:'Festgefahren · Eingriff nötig'},5:{kind:'maintenance',label:'Wartung',detail:'Inspektion auf dem Hof'},6:{kind:'setup',label:'Rüstzeit',detail:'Sämaschine anbauen'}};
const fleetImplements=[
  {id:'AG–001',name:'HORSCH Terrano 3 FX · 1',type:'Universalgrubber',width:'3,0 m',depth:'5–30 cm',work:'Flach grubbern · Tief grubbern'},
  {id:'AG–004',name:'HORSCH Terrano 3 FX · 2',type:'Universalgrubber',width:'3,0 m',depth:'5–30 cm',work:'Flach grubbern · Tief grubbern'},
  {id:'AG–005',name:'Einböck TAIFUN 500',type:'Federzinken-Leichtgrubber',width:'5,0 m',depth:'Bis 15 cm · abhängig von Scharen und Boden',work:'Flach grubbern · Saatbettbereitung'},
  {id:'AG–006',name:'LEMKEN Smaragd 9/300',type:'Grubber',width:'3,0 m',depth:'Mechanisch einstellbar · flacher Einsatz vorgesehen',work:'Flach grubbern'},
  {id:'AG–002',name:'LEMKEN Saphir 9/300',type:'Drillmaschine',width:'3,0 m',depthLabel:'Saatgut-Ablagetiefe',depth:'Über Schardruck und Tiefenführung einstellbar',work:'Säen / Drillen'},
  {id:'AG–007',name:'AMAZONE Cataya 3000 Super',type:'Drillmaschine',width:'3,0 m',depthLabel:'Saatgut-Ablagetiefe',depth:'0–6 cm · mit TwinTeC special',configuration:'TwinTeC special-Doppelscheibenschare',work:'Säen / Drillen'},
  {id:'AG–008',name:'AMAZONE Cirrus 6003-2',type:'Drillmaschine',width:'6,0 m',depthLabel:'Saatgut-Ablagetiefe',depth:'Zentral einstellbar · abhängig von der Scharausstattung',work:'Säen / Drillen'},
  {id:'AG–009',name:'TREFFLER TS 620 M3',type:'Striegel',width:'6,20 m',depth:'Einstellungs- und bodenabhängig',configuration:'Präzisions-Zinkenstriegel · Eingriff über Zinkendruck und Stützräder',work:'Striegeln'},
  {id:'AG–010',name:'Einböck CHOPSTAR-TWIN',type:'Hackgerät',width:null,depth:'Stufenlos über Tastrad und Kurbel einstellbar',work:'Hacken'},
  {id:'AG–003',name:'Einböck CHOPSTAR-ONE',type:'Hackgerät',width:null,depth:'Stufenlos über Tastrad und Kurbel einstellbar',work:'Hacken'}
];
// Aktuell angebaute Geräte; geplante Aufgaben ändern den Ist-Zustand nicht.
const fleetMountedImplements={1:'AG–003',4:'AG–002',5:null,6:null};

// Disposition: lokale, bearbeitbare Zeitplanung mit beispielhaften Dauern.
const dispatchTasks = [
  {id:1,field:2,operation:'Grubbern flach',speed:14,depth:5,robot:5,implementId:'AG–001'},
  {id:2,field:7,operation:'Grubbern tief',speed:12,depth:20,priority:'week',robot:null},
  {id:3,field:3,operation:'Säen',robot:6,implementId:'AG–007'},
  {id:4,field:8,operation:'Säen',priority:'month',robot:null},
  {id:5,field:1,operation:'Hacken',robot:2,implementId:'integrated'},
  {id:6,field:4,operation:'Hacken',robot:2,implementId:'integrated'}
];
const dispatchRobots=fleetVehicles;
let dispatchDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let planAccepted=false,selectedDispatchRobot=5,selectedDispatchTask=null,scheduleOffset=360,scheduleSpan=720;
const scheduleTotalMinutes=4320;
let scheduleScrollFrame=0;
let planProposalSnapshot=null,committedDispatchPlan=null,planDragState=null,planDragFrame=0,planClickBlockedUntil=0,planEditUndo=null;
const dispatchPlanStorageKey='roboplan-dispatch-plan-v1';
const dispatchEquipment=task=>task.operation.startsWith('Grubbern')?'Grubber':task.operation==='Säen'?'Drillmaschine':task.operation==='Striegeln'?'Striegel':'Hacke';
const dispatchType=task=>task.operation.startsWith('Grubbern')?'tillage':task.operation==='Säen'?'seed':'hoe';
const compatibleRobots=task=>dispatchRobots.filter(r=>!r.fixed||r.fixed===dispatchEquipment(task));
function dispatchTaskToolName(task){return task.implementId==='integrated'?'Integrierte Hackeinheit':fleetImplements.find(tool=>tool.id===task.implementId)?.name||dispatchEquipment(task);}
function dispatchTaskEquipmentKey(task){return task.implementId==='integrated'?'integrated-'+task.robot:task.implementId||dispatchEquipment(task);}
function compatibleTaskImplements(task){
  return fleetImplements.filter(tool=>task.operation.startsWith('Grubbern')?tool.type.toLowerCase().includes('grubber')&&(!task.operation.includes('tief')||/tief/i.test(tool.work)):task.operation==='Säen'?tool.type==='Drillmaschine':task.operation==='Striegeln'?tool.type==='Striegel':task.operation==='Hacken'&&tool.type==='Hackgerät');
}
function taskImplementConflict(task,robotId,implementId,tasks=dispatchTasks){
  if(implementId==='integrated')return '';
  const mounted=dispatchRobots.find(robot=>robot.id!==robotId&&fleetMountedImplements[robot.id]===implementId);
  if(mounted)return 'An '+robotShortName(mounted.id)+' angebaut';
  const reserved=tasks.find(job=>job.id!==task.id&&job.robot&&job.robot!==robotId&&job.implementId===implementId);
  return reserved?'Für '+robotShortName(reserved.robot)+' eingeplant':'';
}
function validTaskCombination(task,robotId,implementId,tasks=dispatchTasks){
  const robot=compatibleRobots(task).find(r=>r.id===robotId);if(!robot)return false;
  if(robot.fixed)return implementId==='integrated'&&task.operation==='Hacken';
  return compatibleTaskImplements(task).some(tool=>tool.id===implementId)&&!taskImplementConflict(task,robotId,implementId,tasks);
}
function preferredTaskImplement(task,robotId){
  const robot=compatibleRobots(task).find(r=>r.id===robotId);if(!robot)return null;
  if(robot.fixed)return 'integrated';
  return [task.implementId,fleetMountedImplements[robotId],...compatibleTaskImplements(task).map(tool=>tool.id)].find(id=>id&&validTaskCombination(task,robotId,id))||null;
}
function activeTaskCombinations(task){
  return compatibleRobots(task).filter(robot=>{const state=data.find(r=>r.id===robot.id);return !state.atFarm&&state.alert?.severity!=='error';}).map(robot=>({robot,implementId:robot.fixed?'integrated':fleetMountedImplements[robot.id]})).filter(unit=>unit.implementId&&validTaskCombination(task,unit.robot.id,unit.implementId));
}

const dispatchDuration=task=>{const type=dispatchType(task),referenceSpeed={tillage:12,seed:10,hoe:5}[type],speed=Number(task.speed)>0?Number(task.speed):referenceSpeed;return Math.max(45,Math.round(parseFloat(fields.find(f=>f.id===task.field).area.replace(',','.'))*({tillage:17,seed:22,hoe:24}[type])*referenceSpeed/speed/5)*5);};
const minuteClock=m=>String(Math.floor((m%1440)/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const durationLabel=m=>m>=60?`${Math.floor(m/60)} h${m%60?' '+m%60+' min':''}`:m+' min';
function dispatchDay(day){const d=new Date(dispatchDate+'T12:00:00');d.setDate(d.getDate()+day);return new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}).format(d);}
function datedTime(m){return dispatchDay(Math.floor(m/1440))+' · '+minuteClock(m);}
function markPlanDraft(message='Entwurf geändert · Bitte erneut übernehmen'){
  clearPlanEditUndo();
  planAccepted=false;document.getElementById('plan-status').textContent=message;
  syncDispatchPlanControls();
}
// Road network follows the roads and field entrances shown in the farm map.
const roadNodes={hof:[230,795],a:[285,720],b:[320,660],c:[350,600],d:[385,495],e:[435,455],f:[510,370],g:[585,300],h:[680,225],i:[735,190],j:[865,157],west:[200,330],westGate:[175,322],south:[510,635],south2:[635,650],south3:[755,685],gate4:[342,477],gate5:[435,505],gate7:[390,657],gate8:[405,354]};
const roadEdges=[['hof','a'],['a','b'],['b','c'],['c','d'],['d','e'],['e','f'],['f','g'],['g','h'],['h','i'],['i','j'],['e','west'],['west','westGate'],['c','south'],['south','south2'],['south2','south3'],['d','gate4'],['e','gate5'],['c','gate7'],['e','gate8']];
const fieldRoadNodes={1:'westGate',2:'i',3:'h',4:'gate4',5:'gate5',6:'south3',7:'gate7',8:'gate8'};
function roadRoute(fromField,toField){
  if(fromField&&fromField===toField)return {points:[fields.find(field=>field.id===toField).entry],km:0,minutes:0};
  const start=fromField?fieldRoadNodes[fromField]:'hof',target=fieldRoadNodes[toField],dist={},prev={},queue=new Set(Object.keys(roadNodes));
  Object.keys(roadNodes).forEach(k=>dist[k]=Infinity);dist[start]=0;
  while(queue.size){const node=[...queue].reduce((a,b)=>dist[a]<dist[b]?a:b);queue.delete(node);if(node===target)break;
    roadEdges.forEach(([a,b])=>{const other=a===node?b:b===node?a:null;if(!other||!queue.has(other))return;const p=roadNodes[node],q=roadNodes[other],next=dist[node]+Math.hypot(p[0]-q[0],p[1]-q[1]);if(next<dist[other]){dist[other]=next;prev[other]=node;}});
  }
  const ids=[target];while(ids[0]!==start&&prev[ids[0]])ids.unshift(prev[ids[0]]);
  const points=ids.map(k=>roadNodes[k]);
  if(fromField)points.unshift(fields.find(f=>f.id===fromField).entry);
  points.push(fields.find(f=>f.id===toField).entry);
  const km=points.reduce((sum,p,i)=>i?sum+Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])*.004:0,0);
  return {points,km,minutes:Math.max(5,Math.ceil(km/18*60/5)*5)};
}
function buildRobotSchedule(robot,tasks=dispatchTasks.filter(t=>t.robot===robot.id)){
  const segments=[],startingField=fields.find(field=>field.robots.includes(robot.id));let cursor=480+(robot.id===2?45:0),previousField=startingField?.id||null,previousDepth=null,equipment=robot.fixed?'integrated-'+robot.id:fleetMountedImplements[robot.id]||null;
  tasks.forEach(task=>{
    const tool=dispatchTaskEquipmentKey(task);
    if(equipment!==tool){
      if(previousField){const route=roadRoute(null,previousField);segments.push({kind:'drive',start:cursor,duration:route.minutes,task,label:'Zum Hof · Gerätewechsel',route:{...route,points:[...route.points].reverse()}});cursor+=route.minutes;previousField=null;}
      segments.push({kind:'setup',start:cursor,duration:30,task,label:dispatchTaskToolName(task)+' anbauen'});cursor+=30;equipment=tool;previousDepth=null;
    }else if(task.operation.startsWith('Grubbern')&&previousDepth!==null&&previousDepth!==task.depth){
      segments.push({kind:'setup',start:cursor,duration:10,task,label:'Arbeitstiefe einstellen'});cursor+=10;
    }
    const route=roadRoute(previousField,task.field);if(route.minutes)segments.push({kind:'drive',start:cursor,duration:route.minutes,task,label:'Straßenfahrt',route});cursor+=route.minutes;
    const duration=dispatchDuration(task);segments.push({kind:'work',start:cursor,duration,task,label:fields.find(f=>f.id===task.field).name});cursor+=duration;previousField=task.field;previousDepth=task.operation.startsWith('Grubbern')?task.depth??null:null;
  });
  return {robot,tasks,segments,end:cursor};
}
function taskDeadline(task){
  if(task.dueDate)return task.dueDate;
  const days={immediate:0,week:7,month:28}[task.priority];
  if(days===undefined)return null;
  const d=new Date((task.createdOn||dispatchDate)+'T12:00:00');d.setDate(d.getDate()+days);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
let storageTaskFilter='Alle';
const storageTaskKinds=['Alle','Grubbern','Säen','Hacken','Striegeln'];
function matchesStorageFilter(task,filter){return filter==='Alle'||(filter==='Grubbern'?task.operation.startsWith('Grubbern'):task.operation===filter);}
function setStorageFilter(filter){if(!storageTaskKinds.includes(filter))return;storageTaskFilter=filter;renderStoredTasks();}
function sortedStoredTasks(sort){
  return dispatchTasks.filter(t=>!t.robot).sort((a,b)=>{
    const fieldA=fields.find(f=>f.id===a.field).name,fieldB=fields.find(f=>f.id===b.field).name;
    if(sort==='deadline'){const dateA=taskDeadline(a)||'9999-12-31',dateB=taskDeadline(b)||'9999-12-31';return dateA.localeCompare(dateB)||fieldA.localeCompare(fieldB,'de');}
    if(sort==='operation')return a.operation.localeCompare(b.operation,'de')||fieldA.localeCompare(fieldB,'de');
    return fieldA.localeCompare(fieldB,'de')||a.operation.localeCompare(b.operation,'de');
  });
}
function renderStoredTasks(){
  const all=dispatchTasks.filter(t=>!t.robot);
  document.getElementById('storage-filters').innerHTML=storageTaskKinds.map(kind=>`<button type="button" class="storage-filter ${kind===storageTaskFilter?'active':''}" aria-pressed="${kind===storageTaskFilter}" onclick="setStorageFilter('${kind}')">${kind}<span>${all.filter(t=>matchesStorageFilter(t,kind)).length}</span></button>`).join('');
  const pending=sortedStoredTasks(document.getElementById('storage-sort').value||'field').filter(t=>matchesStorageFilter(t,storageTaskFilter));
  document.getElementById('dispatch-tasks').innerHTML=pending.length?pending.map(t=>{
    const f=fields.find(f=>f.id===t.field),due=taskDeadline(t);
    const dueLabel=due?new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(due+'T12:00:00')):'Ohne Ablaufdatum';
    return `<tr class="task-overview-row" onclick="if(!event.target.closest('select,button,a,input'))openTaskOverview(${t.id})"><td><button class="task-open-link" onclick="openTaskOverview(${t.id})">${f.name} ↗</button><small>${f.area}${t.crop?' · '+t.crop:''}</small></td><td><button class="storage-operation task-open-link" onclick="openTaskOverview(${t.id})"><i class="task-type-dot ${dispatchType(t)}"></i>${t.operation}</button><small>${t.depth?t.depth+' cm Tiefe':t.seedRate?t.seedRate.toLocaleString('de-DE')+' Körner/ha':''}</small></td><td class="storage-duration">${durationLabel(dispatchDuration(t))}</td><td>${due?`<time datetime="${due}">${dueLabel}</time>`:`<span class="no-deadline">${dueLabel}</span>`}${priorityBadge(t)}</td><td><button class="storage-assign-button" type="button" onclick="openTaskOverview(${t.id})">Details & zuweisen →</button></td></tr>`;
  }).join(''):(all.length?`<tr><td colspan="5"><div class="storage-empty"><strong>Keine offenen Aufgaben für ${storageTaskFilter}</strong><p>Wähle eine andere Arbeitsart oder zeige alle Aufgaben an.</p><button class="suggest-button" onclick="setStorageFilter('Alle')">Alle Aufgaben anzeigen</button></div></td></tr>`:'<tr><td colspan="5"><div class="storage-empty"><strong>Alles eingeplant ✓</strong><p>Keine offenen Aufgaben im Arbeitsspeicher.</p><a href="#auftragsverwaltung">Zurück zur Disposition →</a></div></td></tr>');
}
function renderDispatch(){
  const pending=dispatchTasks.filter(t=>!t.robot);
  document.getElementById('buffer-count').textContent=pending.length;
  document.getElementById('open-task-count').textContent=pending.length;
  document.getElementById('buffer-area').textContent=pending.reduce((sum,t)=>sum+parseFloat(fields.find(f=>f.id===t.field).area.replace(',','.')),0).toFixed(1).replace('.',',')+' ha noch zuzuweisen';
  renderStoredTasks();
  renderSchedule();renderDispatchRobot();
  syncDispatchPlanControls();
}
function renderSchedule(){
  scheduleOffset=Math.max(0,Math.min(scheduleTotalMinutes-scheduleSpan,scheduleOffset));
  document.getElementById('schedule-days').innerHTML=[0,1,2].map(d=>`<button data-schedule-day="${d}" onclick="seekSchedule(${d*1440+360})">${d===0?'Heute · ':''}${dispatchDay(d)}</button>`).join('');
  const tickStep=scheduleSpan>720?240:120,ticks=[];
  for(let t=0;t<scheduleTotalMinutes;t+=tickStep)ticks.push(`<span style="left:${t/scheduleTotalMinutes*100}%">${minuteClock(t)}${t%1440===0?'<small>'+dispatchDay(t/1440)+'</small>':''}</span>`);
  document.getElementById('schedule-ticks').innerHTML=ticks.join('');
  document.getElementById('robot-plans').innerHTML=[...dispatchRobots].sort((a,b)=>Number(dispatchTasks.some(t=>t.robot===b.id))-Number(dispatchTasks.some(t=>t.robot===a.id))||a.id-b.id).map(robot=>{
    const schedule=buildRobotSchedule(robot),jobs=schedule.tasks.length;
    const blocks=schedule.segments.filter(s=>s.start<scheduleTotalMinutes&&s.start+s.duration>0).map(s=>{const work=s.kind==='work',type=work?dispatchType(s.task):s.kind;return `<button class="time-block block-${type} ${selectedDispatchTask===s.task.id?'selected-task':''}" ${work?`draggable="true" aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown Alt+Backspace Delete" data-drag-task="${s.task.id}" data-drag-robot="${robot.id}"`:''} style="left:${s.start/scheduleTotalMinutes*100}%;width:${s.duration/scheduleTotalMinutes*100}%" title="${s.label} · ${minuteClock(s.start)}–${minuteClock(s.start+s.duration)} · ${durationLabel(s.duration)}" aria-label="${robotDisplayName(robot.id)}: ${s.label}, ${minuteClock(s.start)} bis ${minuteClock(s.start+s.duration)}, ${durationLabel(s.duration)}" onclick="openTaskOverview(${s.task.id})"><strong>${work?s.label:s.kind==='setup'?'Rüsten':'↗ Fahrt'}</strong>${work?'<span>'+s.task.operation+' · '+durationLabel(s.duration)+'</span><span class="task-drag-handle" title="Aufgabe ziehen · Alt + Pfeiltasten zum Verschieben" aria-hidden="true">⠿</span>':''}</button>`;}).join('');
    return `<div class="timeline-row ${selectedDispatchRobot===robot.id?'selected':''}" data-drop-robot="${robot.id}"><button class="timeline-robot-label" onclick="selectDispatchRobot(${robot.id})" aria-pressed="${selectedDispatchRobot===robot.id}"><strong><i style="background:${data.find(r=>r.id===robot.id).color}"></i>${robotShortName(robot.id)}</strong><small>${robot.type} · ${jobs} ${jobs===1?'Aufgabe':'Aufgaben'}</small></button><div class="timeline-lane">${blocks||'<span class="timeline-idle">'+(jobs?'Keine Einsätze im Planungszeitraum':'Bereit für Aufgaben')+'</span>'}</div></div>`;
  }).join('');
  document.getElementById('schedule-viewport').style.setProperty('--schedule-grid-step',tickStep/scheduleTotalMinutes*100+'%');
  resizeScheduleViewport();updateScheduleChrome();
}
function selectDispatchRobot(id,task=null){selectedDispatchRobot=id;selectedDispatchTask=task;renderSchedule();renderDispatchRobot();}
function selectDispatchField(id){const task=dispatchTasks.find(t=>t.field===id&&t.robot===selectedDispatchRobot)||dispatchTasks.find(t=>t.field===id&&t.robot);if(task)selectDispatchRobot(task.robot,task.id);}
function updateScheduleChrome(){
  const end=scheduleOffset+scheduleSpan;
  document.getElementById('schedule-slider').max=scheduleTotalMinutes-scheduleSpan;
  document.getElementById('schedule-slider').value=scheduleOffset;
  document.getElementById('schedule-window').textContent=minuteClock(scheduleOffset)+'–'+minuteClock(end);
  document.getElementById('schedule-date-caption').textContent=dispatchDay(Math.floor(scheduleOffset/1440))+(Math.floor((end-1)/1440)>Math.floor(scheduleOffset/1440)?' → '+dispatchDay(Math.floor((end-1)/1440)):'');
  document.querySelectorAll('#schedule-days [data-schedule-day]').forEach(button=>{
    const selected=Number(button.dataset.scheduleDay)===Math.floor(scheduleOffset/1440);
    button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
  });
}
function resizeScheduleViewport(){
  const viewport=document.getElementById('schedule-viewport');
  if(!viewport.clientWidth)return;
  const labelWidth=viewport.querySelector('.schedule-axis>span').getBoundingClientRect().width;
  const laneWidth=Math.max(1,viewport.clientWidth-labelWidth);
  viewport.style.setProperty('--schedule-content-width',(labelWidth+laneWidth*scheduleTotalMinutes/scheduleSpan)+'px');
  const maxScroll=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  viewport.scrollLeft=scheduleOffset/(scheduleTotalMinutes-scheduleSpan)*maxScroll;
}
function seekSchedule(offset,behavior='smooth'){
  if(!Number.isFinite(offset))return;
  const target=Math.max(0,Math.min(scheduleTotalMinutes-scheduleSpan,Math.round(offset)));
  const viewport=document.getElementById('schedule-viewport'),maxScroll=viewport.scrollWidth-viewport.clientWidth;
  const reduced=userAccount.reduceMotion||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(viewport.clientWidth&&maxScroll>0){
    const motion=reduced?'auto':behavior;
    viewport.scrollTo({left:target/(scheduleTotalMinutes-scheduleSpan)*maxScroll,behavior:motion});
    if(motion==='smooth')return;
  }
  scheduleOffset=target;updateScheduleChrome();
}
function assignDispatchTask(id,robot,implementId=null){
  if(userDemoSignedOut)return false;
  const task=dispatchTasks.find(t=>t.id===id);if(!task)return false;
  const equipment=robot?(implementId||preferredTaskImplement(task,robot)):null;
  if(robot&&!validTaskCombination(task,robot,equipment))return false;
  task.robot=robot||null;
  if(robot){
    task.implementId=equipment;
    const tool=fleetImplements.find(t=>t.id===equipment);if(tool?.width)task.workingWidth=parseFloat(tool.width.replace(',','.'));
    // Aufgabe erst entfernen und dann an das Ende hängen; andere Reihenfolgen bleiben erhalten.
    dispatchTasks.splice(dispatchTasks.indexOf(task),1);dispatchTasks.push(task);
    selectedDispatchRobot=robot;selectedDispatchTask=id;
  }else{delete task.implementId;selectedDispatchTask=null;}
  markPlanDraft(robot?'Aufgabe am Ende der Fahrzeugliste angehängt · Entwurf prüfen':'Aufgabe zurück im Arbeitsspeicher');renderDispatch();return true;
}
function moveDispatchTask(id,delta){
  const task=dispatchTasks.find(t=>t.id===id),jobs=dispatchTasks.filter(t=>t.robot===task.robot),other=jobs[jobs.indexOf(task)+delta];if(!other)return;
  const a=dispatchTasks.indexOf(task),b=dispatchTasks.indexOf(other);[dispatchTasks[a],dispatchTasks[b]]=[dispatchTasks[b],dispatchTasks[a]];markPlanDraft();renderDispatch();
}
function dispatchFieldTracks(task){
  const f=fields.find(f=>f.id===task.field),ns='http://www.w3.org/2000/svg',probe=document.createElementNS(ns,'svg'),shape=document.createElementNS(ns,'path');
  probe.style.cssText='position:absolute;left:-10000px;top:0;width:1040px;height:900px';shape.setAttribute('d',f.path);probe.append(shape);document.body.append(probe);
  const b=shape.getBBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
  const defaults={1:0,2:90,3:0,4:0,5:90,6:90,7:90,8:0};const angle=(task.bearingDegrees??defaults[f.id])*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),extent=Math.hypot(b.width,b.height),points=[];
  const world=(x,y)=>({x:cx+x*c-y*s,y:cy+x*s+y*c});let paths='';
  for(let i=0;i<11;i++){const x=(i/10-.5)*extent*.7,inside=[];
    for(let j=0;j<=180;j++){const p=world(x,(j/180-.5)*extent),test=probe.createSVGPoint();test.x=cx+(p.x-cx)/.78;test.y=cy+(p.y-cy)/.78;if(shape.isPointInFill(test))inside.push(p);}
    if(inside.length>2){const a=i%2?inside[inside.length-1]:inside[0],z=i%2?inside[0]:inside[inside.length-1];points.push([a,z]);paths+=`<path d="M${a.x} ${a.y}L${z.x} ${z.y}" stroke="${selectedDispatchTask===task.id?'#1d6652':'#39816a'}" stroke-width="4" fill="none"/>`;}
  }
  probe.remove();
  const headlands=task.headlandPasses??2;
  const perimeter=Array.from({length:headlands},(_,i)=>`<path d="${f.path}" transform="translate(${cx} ${cy}) scale(${.94-i*.07}) translate(${-cx} ${-cy})" fill="none" stroke="#39816a" stroke-width="3"/>`).join('');
  const first=points[0]?.[0],last=points[points.length-1]?.[1];
  return `<g pointer-events="none"><path d="${f.path}" fill="#29765e" fill-opacity=".12" stroke="#29765e" stroke-width="5"/>${perimeter}${paths}${first?`<circle cx="${first.x}" cy="${first.y}" r="8" fill="#258857" stroke="white" stroke-width="2"/>`:''}${last?`<circle cx="${last.x}" cy="${last.y}" r="8" fill="#c35449" stroke="white" stroke-width="2"/>`:''}<circle cx="${f.entry[0]}" cy="${f.entry[1]}" r="14" fill="#29765e" stroke="white" stroke-width="3"/><text x="${f.entry[0]}" y="${f.entry[1]+5}" text-anchor="middle" font-size="14" fill="white">${task.id}</text></g>`;
}
function renderDispatchRobot(){
  const robot=dispatchRobots.find(r=>r.id===selectedDispatchRobot),schedule=buildRobotSchedule(robot),drives=schedule.segments.filter(s=>s.kind==='drive');
  document.getElementById('route-robot-title').textContent=robot.name+' · '+robot.type;
  const km=drives.reduce((sum,s)=>sum+s.route.km,0),setup=schedule.segments.filter(s=>s.kind==='setup').reduce((sum,s)=>sum+s.duration,0);
  document.getElementById('route-robot-summary').textContent=schedule.tasks.length+' Aufgaben · '+km.toFixed(1).replace('.',',')+' km Straßenfahrt · '+durationLabel(setup)+' Rüsten';
  document.getElementById('route-jobs').innerHTML=schedule.tasks.map((task,index)=>{const f=fields.find(f=>f.id===task.field),work=schedule.segments.find(s=>s.kind==='work'&&s.task===task);return `<article class="route-job ${selectedDispatchTask===task.id?'active':''}"><button class="route-job-title" onclick="openTaskOverview(${task.id})"><span>${index+1}</span><div><strong>${f.name}</strong><small>${task.operation} · ${dispatchTaskToolName(task)} · ${f.area}</small></div></button><p>${datedTime(work.start)}–${minuteClock(work.start+work.duration)} · ${durationLabel(work.duration)}</p><div class="route-job-actions"><button onclick="moveDispatchTask(${task.id},-1)" ${index===0?'disabled':''} aria-label="${f.name} früher einplanen">←</button><button onclick="moveDispatchTask(${task.id},1)" ${index===schedule.tasks.length-1?'disabled':''} aria-label="${f.name} später einplanen">→</button><button type="button" onclick="openTaskOverview(${task.id},true)">Gespann ändern</button><button class="return-task" onclick="assignDispatchTask(${task.id},0)" title="In den Arbeitsspeicher zurücklegen">↶ Speicher</button></div></article>`;}).join('')||'<div class="storage-empty">Noch keine Aufgaben zugewiesen. Links eine Aufgabe auswählen und diesem Roboter zuweisen.</div>';
  const roadSvg=drives.map(s=>`<polyline pointer-events="none" points="${s.route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="white" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><polyline pointer-events="none" points="${s.route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#427fad" stroke-width="7" stroke-dasharray="13 9" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const tracks=schedule.tasks.map(dispatchFieldTracks).join('');
  const selected=dispatchTasks.find(t=>t.id===selectedDispatchTask);
  document.getElementById('map-selection-title').textContent=selected?fields.find(f=>f.id===selected.field).name:robot.name;
  document.getElementById('map-selection-caption').textContent=selected?selected.operation+' · '+robotShortName(robot.id):schedule.tasks.length+' zugewiesene Flächen · Straßenfahrten blau';
  const highlight=selected?`<path d="${fields.find(f=>f.id===selected.field).path}" fill="#e7b65b" fill-opacity=".2" stroke="#c48a30" stroke-width="9" pointer-events="none"/>`:'';
  const map=document.getElementById('dispatch-map'),target=map.querySelector('.map-scene')||map;
  let base=landscape('dispatch');
  fields.forEach(f=>{base=base.replace(`d="${f.path}" fill=`,`tabindex="0" role="button" aria-label="${f.name} auf dem Zeitplan anzeigen" onclick="selectDispatchField(${f.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectDispatchField(${f.id})}" style="cursor:pointer" d="${f.path}" fill=`);});
  target.innerHTML=base.replace('</svg>',roadSvg+tracks+highlight+'</svg>');
  if(!map.classList.contains('map-viewport'))enableMap(map);
}
document.getElementById('storage-sort').onchange=renderStoredTasks;
document.getElementById('schedule-slider').oninput=e=>seekSchedule(Number(e.target.value),'auto');
document.getElementById('schedule-scale').onchange=e=>{scheduleSpan=Number(e.target.value);renderSchedule();};
document.getElementById('schedule-back').onclick=()=>seekSchedule(scheduleOffset-120);
document.getElementById('schedule-forward').onclick=()=>seekSchedule(scheduleOffset+120);
document.getElementById('suggest-plan').onclick=()=>toggleDispatchSuggestion();
document.getElementById('accept-plan').onclick=acceptDispatchPlan;
document.getElementById('task-field').innerHTML=fields.map(f=>`<option value="${f.id}">${f.name} · ${f.area}</option>`).join('');
document.getElementById('task-form').onsubmit=e=>{
  e.preventDefault();const operation=document.getElementById('task-operation').value;
  dispatchTasks.push({id:Math.max(0,...dispatchTasks.map(t=>t.id))+1,field:Number(document.getElementById('task-field').value),operation,priority:document.getElementById('task-priority').value,createdOn:dispatchDate,speed:({'Grubbern tief':12,'Grubbern flach':14,'Säen':10,'Hacken':5,'Striegeln':5})[operation],depth:operation==='Grubbern tief'?20:operation==='Grubbern flach'?5:null,robot:null});
  markPlanDraft('Neue Aufgabe im Arbeitsspeicher · Noch keinem Roboter zugewiesen');renderDispatch();document.getElementById('new-task').close();
};
loadCommittedDispatchPlan();
renderDispatch();

function updateHeaderClock(){
  const now=new Date();
  document.getElementById('header-time').textContent=new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit'}).format(now);
  document.getElementById('header-time').dateTime=now.toISOString();
  document.getElementById('header-date').textContent=new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(now);
}
updateHeaderClock();setInterval(updateHeaderClock,10000);
let plannedFieldId=null;
function openFieldPlanner(id){
  plannedFieldId=id;
  document.getElementById('planner-priority').value='flexible';
  const f=fields.find(f=>f.id===id);
  document.querySelector('#fields > .field-layout').hidden=true;
  document.getElementById('field-planner').hidden=false;
  document.getElementById('planner-name').textContent=f.name;
  document.getElementById('planner-meta').textContent=f.area+' · '+f.crop;
  const cropSelect=document.getElementById('seed-crop');
  cropSelect.replaceChildren(...[...new Set([f.crop,'Winterweizen','Wintergerste','Winterroggen','Triticale','Sommergerste','Hafer','Mais','Raps'])].map(crop=>new Option(crop,crop)));
  cropSelect.value=f.crop;
  const op=fieldPlanning[id].next;
  document.getElementById('planner-operation').value=op.startsWith('Säen')?'Säen':op.startsWith('Hacken')?'Hacken':op.startsWith('Striegeln')?'Striegeln':op.includes('tief')?'Grubbern tief':'Grubbern flach';
  document.getElementById('planner-save-button').disabled=false;
  document.getElementById('planner-save-button').textContent='In Aufgabenspeicher übertragen';
  document.getElementById('planner-save-status').textContent='';
  const standardAngle=fieldDirections[id]==='horizontal'?90:0;
  document.getElementById('standard-direction').textContent=standardAngle+'° · '+(standardAngle===0?'vertikal':'horizontal');
  document.getElementById('planner-angle').value=standardAngle;
  document.getElementById('headland-count').value='2';
  updatePlannerOperation();
  drawFieldRoutes(f);
}
function closeFieldPlanner(){
  document.getElementById('field-planner').hidden=true;
  document.querySelector('#fields > .field-layout').hidden=false;
}
const fieldDirections={1:'vertical',2:'horizontal',3:'vertical',4:'vertical',5:'horizontal',6:'horizontal',7:'horizontal',8:'vertical'};
function updatePlannerOperation(){
  const op=document.getElementById('planner-operation').value;
  document.getElementById('planner-speed').value=({'Grubbern tief':12,'Grubbern flach':14,'Säen':10,'Hacken':5,'Striegeln':5})[op]||12;
  document.getElementById('planner-depth').value=op==='Grubbern tief'?20:5;
  document.getElementById('depth-label').hidden=!op.startsWith('Grubbern');
  document.getElementById('seed-settings').hidden=op!=='Säen';
}
document.getElementById('planner-operation').onchange=()=>{updatePlannerOperation();if(plannedFieldId)drawFieldRoutes(fields.find(f=>f.id===plannedFieldId));};
['seed-rate','seed-application-map','tramline-spacing','headland-count'].forEach(id=>document.getElementById(id).onchange=()=>{if(plannedFieldId)drawFieldRoutes(fields.find(f=>f.id===plannedFieldId));});
document.getElementById('planner-angle').oninput=()=>{if(plannedFieldId&&document.getElementById('planner-angle').validity.valid)drawFieldRoutes(fields.find(f=>f.id===plannedFieldId));};
function drawFieldRoutes(f){
  const ns='http://www.w3.org/2000/svg',isSeed=document.getElementById('planner-operation').value==='Säen';
  const angle=Number(document.getElementById('planner-angle').value),radians=angle*Math.PI/180;
  const useApplicationMap=isSeed&&document.getElementById('seed-application-map').checked;
  const headlands=Number(document.getElementById('headland-count').value);
  const workingScale=Math.min(.77,.93-headlands*.08);
  const seedRate=Number(document.getElementById('seed-rate').value),tramSpacing=Number(document.getElementById('tramline-spacing').value);
  const fmt=n=>Math.round(n).toLocaleString('de-DE');
  const probe=document.createElementNS(ns,'svg');
  probe.style.cssText='position:absolute;left:-10000px;top:0;width:1040px;height:900px';
  const shape=document.createElementNS(ns,'path');shape.setAttribute('d',f.path);probe.append(shape);document.body.append(probe);
  const b=shape.getBBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
  const pad=Math.max(b.width,b.height)*.12,view=[b.x-pad,b.y-pad,b.width+2*pad,b.height+2*pad];
  const cos=Math.cos(radians),sin=Math.sin(radians);
  const point=(x,y)=>({x:cx+(x-cx)*cos+(y-cy)*sin,y:cy-(x-cx)*sin+(y-cy)*cos});
  const corners=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>({x:cx+(x-cx)*cos-(y-cy)*sin,y:cy+(x-cx)*sin+(y-cy)*cos}));
  const xs=corners.map(p=>p.x),ys=corners.map(p=>p.y);
  const local={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
  const pair=p=>`${p.x} ${p.y}`;
  const lines=[],count=isSeed?14:10,sw=Math.max(b.width,b.height)*.009;
  const inside=(x,y)=>{const world=point(x,y),p=probe.createSVGPoint();p.x=cx+(world.x-cx)/workingScale;p.y=cy+(world.y-cy)/workingScale;return shape.isPointInFill(p);};
  for(let i=0;i<count;i++){
    const x=local.x+local.width*(.17+i*.66/(count-1)),ys=[];
    for(let j=0;j<=400;j++){const y=local.y+j*local.height/400;if(inside(x,y))ys.push(y);}
    if(ys.length>4){const top=ys[0]+sw,bottom=ys[ys.length-1]-sw;lines.push({x,start:i%2?bottom:top,end:i%2?top:bottom});}
  }
  const color=t=>`hsl(${140*(1-t)} 58% 42%)`;
  const arrow=(x,y,dx,dy)=>{const norm=Math.hypot(dx,dy)||1,ux=dx/norm,uy=dy/norm,r=sw*1.8;return `<path d="M${x-ux*r-uy*r} ${y-uy*r+ux*r}L${x+ux*r} ${y+uy*r}L${x-ux*r+uy*r} ${y-uy*r-ux*r}" fill="none" stroke="white" stroke-width="${sw*.6}" stroke-linejoin="round"/>`;};
  const tracks=lines.map((l,i)=>{
    const start=point(l.x,l.start),end=point(l.x,l.end),mid=point(l.x,(l.start+l.end)/2);let join='';
    if(i<lines.length-1){const next=lines[i+1],dir=l.end>l.start?1:-1,out=(l.end+next.start)/2+dir*local.height*.045;join=`<path d="M${pair(end)}C${pair(point(l.x,out))} ${pair(point(next.x,out))} ${pair(point(next.x,next.start))}" fill="none" stroke="${color(i/lines.length*.64)}" stroke-width="${sw}"/>`;}
    return `<path d="M${pair(start)}L${pair(end)}" fill="none" stroke="${color(i/lines.length*.64)}" stroke-width="${sw}" stroke-linecap="round"/>${join}${arrow(mid.x,mid.y,end.x-start.x,end.y-start.y)}`;
  }).join('');
  let previous=lines.length?point(lines[lines.length-1].x,lines[lines.length-1].end):{x:cx,y:cy};
  const first=lines.length?point(lines[0].x,lines[0].start):previous;
  const length=shape.getTotalLength();let circuits='';
  Array.from({length:headlands},(_,i)=>.94-(headlands-1-i)*.08).forEach((scale,lap)=>{
    const points=Array.from({length:160},(_,i)=>{const p=shape.getPointAtLength(i/160*length);return {x:cx+(p.x-cx)*scale,y:cy+(p.y-cy)*scale};});
    let nearest=0;points.forEach((p,i)=>{if(Math.hypot(p.x-previous.x,p.y-previous.y)<Math.hypot(points[nearest].x-previous.x,points[nearest].y-previous.y))nearest=i;});
    const start=points[nearest];
    circuits+=`<path d="M${pair(previous)}L${pair(start)}" fill="none" stroke="${color(.65+lap*.35/Math.max(1,headlands))}" stroke-width="${sw}"/>`;
    for(let i=0;i<160;i++){
      const a=points[(nearest+i)%160],z=points[(nearest+i+1)%160];
      circuits+=`<path d="M${pair(a)}L${pair(z)}" fill="none" stroke="${color(.65+(lap+i/159)*.35/Math.max(1,headlands))}" stroke-width="${sw}" stroke-linecap="round"/>`;
      if(i%40===20)circuits+=arrow(a.x,a.y,z.x-a.x,z.y-a.y);
    }
    previous=start;
  });
  probe.remove();
  function endpoint(p,isStart){
    const {x,y}=p,col=isStart?'#238454':'#bd4840',size=sw*3.2;
    return `<circle cx="${x}" cy="${y}" r="${sw*1.6}" fill="${col}" stroke="white" stroke-width="${sw*.6}"/><rect x="${x-size*2}" y="${y-size*3.3}" width="${size*4}" height="${size*1.65}" rx="${sw}" fill="white" stroke="${col}" stroke-width="${sw*.25}"/><text x="${x}" y="${y-size*2.13}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${size}">${isStart?'Start':'Stopp'}</text>`;
  }
  let seedZones='',tramlines='',seedKey='';
  if(isSeed){
    if(useApplicationMap)seedZones=`<defs><clipPath id="seed-field-clip"><path d="${f.path}"/></clipPath></defs><g clip-path="url(#seed-field-clip)"><rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="#d9d4a4"/><path d="M${b.x} ${b.y+b.height*.28}Q${cx} ${b.y+b.height*.12} ${b.x+b.width} ${b.y+b.height*.4}V${b.y+b.height}H${b.x}Z" fill="#a9cbbf"/><path d="M${b.x} ${b.y+b.height*.74}Q${cx} ${b.y+b.height*.43} ${b.x+b.width} ${b.y+b.height*.69}V${b.y+b.height}H${b.x}Z" fill="#91b3cb"/></g>`;
    lines.forEach((l,i)=>{if(!tramSpacing||i%Math.round(tramSpacing/3)!==2)return;[-sw*1.4,sw*1.4].forEach(offset=>{const a=point(l.x+offset,l.start),z=point(l.x+offset,l.end);tramlines+=`<path d="M${pair(a)}L${pair(z)}" stroke="white" stroke-width="${sw*1.2}"/><path d="M${pair(a)}L${pair(z)}" stroke="#283e51" stroke-width="${sw*.65}" stroke-dasharray="${sw*3} ${sw*1.5}"/>`;});});
    if(useApplicationMap)seedKey=`<div class="seed-map-key"><strong>Aussaat-Applikationskarte</strong><span class="seed-key-sub">Saatstärke · Körner/ha</span><div class="seed-zone-row"><i style="background:#d9d4a4"></i><span>${fmt(seedRate*.9)}</span><b style="width:82%"></b></div><div class="seed-zone-row"><i style="background:#a9cbbf"></i><span>${fmt(seedRate)}</span><b style="width:91%"></b></div><div class="seed-zone-row"><i style="background:#91b3cb"></i><span>${fmt(seedRate*1.1)}</span><b style="width:100%"></b></div>${tramSpacing?`<span class="seed-tram-key">┆┆ Fahrgassen · ${tramSpacing} m Abstand</span>`:""}</div>`;
  }
  document.getElementById('task-map-slot').innerHTML=`<div id="task-route-map" data-aspect="${view[2]/view[3]}"><svg viewBox="${view.join(' ')}" xmlns="${ns}" role="img" aria-label="Spurvorschlag für ${f.name}, ${angle} Grad${useApplicationMap?', mit Saatzonen':''}${isSeed&&tramSpacing?', mit Fahrgassen':''}"><path d="${f.path}" fill="#dce7ce" stroke="#7c9670" stroke-width="${sw*.7}"/>${seedZones}${tracks}${circuits}${tramlines}${endpoint(first,true)}${endpoint(previous,false)}</svg></div>${seedKey}<div class="route-legend"><span><i class="route-gradient"></i> Start → Stopp</span></div>`;
  document.getElementById('planner-track-count').textContent=lines.length+' Bahnen · '+angle+'°';
  enableMap(document.getElementById('task-route-map'));
}
function saveFieldTask(){
  const operation=document.getElementById('planner-operation').value;
  if(!document.getElementById('planner-angle').reportValidity()||!document.getElementById('planner-speed').reportValidity())return;
  if(operation.startsWith('Grubbern')&&!document.getElementById('planner-depth').reportValidity())return;
  if(operation==='Säen'&&!document.getElementById('seed-rate').reportValidity())return;
  dispatchTasks.push({id:Math.max(0,...dispatchTasks.map(t=>t.id))+1,field:plannedFieldId,operation,priority:document.getElementById('planner-priority').value,createdOn:dispatchDate,speed:Number(document.getElementById('planner-speed').value),crop:operation==='Säen'?document.getElementById('seed-crop').value:null,applicationMap:operation==='Säen'&&document.getElementById('seed-application-map').checked,seedRate:operation==='Säen'?Number(document.getElementById('seed-rate').value):null,tramlineSpacing:operation==='Säen'?Number(document.getElementById('tramline-spacing').value):null,direction:Number(document.getElementById('planner-angle').value),bearingDegrees:Number(document.getElementById('planner-angle').value),headlandPasses:Number(document.getElementById('headland-count').value),depth:operation.startsWith('Grubbern')?Number(document.getElementById('planner-depth').value):null,workingWidth:3,robot:null});
  markPlanDraft('Neue Aufgabe aus der Schlagplanung · Zuweisung im Einsatzplan prüfen');renderDispatch();
  document.getElementById('planner-save-status').textContent='Im Aufgabenspeicher.';
  document.getElementById('planner-save-button').disabled=true;
  document.getElementById('planner-save-button').textContent='Übertragen ✓';
}

// Schlagkartei: Beispieldaten für den interaktiven Entwurf.
let recordFieldId=1;
function closeFieldRecord(){document.getElementById('field-record').hidden=true;document.querySelector('#fields > .field-layout').hidden=false;}
function openFieldRecord(id){
 recordFieldId=id;const f=fields.find(f=>f.id===id);
 document.querySelector('#fields > .field-layout').hidden=true;document.getElementById('field-planner').hidden=true;
 const record=document.getElementById('field-record');record.hidden=false;
 record.innerHTML=`<div class="planner-heading"><button class="planner-back" onclick="closeFieldRecord()">← Zurück zu den Ackerschlägen</button><div class="planner-breadcrumb"><span>Schlagkartei</span><span>/</span><h1>${f.name}</h1><span class="sub">${f.area} · ${f.crop}</span></div></div>
 <div class="record-layout"><div class="record-left"><div class="panel record-map-panel"><div class="record-map-toolbar"><label>Erntejahr <select id="record-year" onchange="updateFieldRecord()"><option>2026</option><option>2025</option><option>2024</option><option>2023</option></select></label><label>Karten-Layer <select id="record-layer" onchange="updateFieldRecord()"><option value="soil">Bodentyp</option><option value="application">Applikationskarte</option><option value="yield">Letzte Ertragskarte</option></select></label></div><div id="record-map-slot"></div><div id="record-map-key"></div></div><div class="panel record-weather"><span class="tiny">WETTER AM FELD</span><h2>☀ 14 °C <small>Leicht bewölkt</small></h2><div class="weather-values"><span>Wind <b>8 km/h · W</b></span><span>Niederschlag <b>0,2 mm</b></span><span>Bodenfeuchte <b>24 %</b></span></div><p>Heute trocken · Morgen 2 mm Regen</p></div></div>
 <aside class="record-right"><div class="panel record-section"><h2>Schlaginformationen</h2><dl class="record-facts"><div><dt>Feldgröße</dt><dd>${f.area}</dd></div><div><dt>Aktuelle Frucht</dt><dd>${f.crop}</dd></div><div><dt>Erntejahr · Frucht</dt><dd id="record-crop"></dd></div><div><dt>Mittlerer Ertrag</dt><dd id="record-yield"></dd></div></dl></div><div class="panel record-section"><h2>Letzte Arbeiten <span class="tiny" id="record-history-year"></span></h2><div id="record-history"></div></div><div class="panel record-section record-suggestions"><span class="tiny">NÄCHSTE ARBEITEN</span><h2>Nächste Arbeiten</h2><p id="record-next"></p><button class="primary" onclick="document.getElementById('field-record').hidden=true;openFieldPlanner(${f.id})">Aufgabe planen ↗</button></div></aside></div>`;
 updateFieldRecord();
}
function updateFieldRecord(){
 const f=fields.find(f=>f.id===recordFieldId),year=Number(document.getElementById('record-year').value),layer=document.getElementById('record-layer').value;
 const crops=[f.crop,'Winterweizen','Raps','Wintergerste'],crop=crops[2026-year],yieldValue=[68,82,39,75][2026-year];
 document.getElementById('record-crop').textContent=year+' · '+crop;
 document.getElementById('record-yield').textContent=yieldValue+' dt/ha · Demo';
 document.getElementById('record-history-year').textContent=year;
 document.getElementById('record-history').innerHTML=[['18.10.','Grubbern flach','5 cm · 14 km/h'],['24.09.',fieldPlanning[f.id].last,'Abgeschlossen'],['12.08.','Ernte · '+crop,yieldValue+' dt/ha']].map(([date,work,detail])=>`<div class="record-work"><time>${date}${year}</time><div><strong>${work}</strong><span>${detail}</span></div><b>✓</b></div>`).join('');
 document.getElementById('record-next').textContent=fieldPlanning[f.id].next+' · Vorschlag für die aktuelle Saison 2026. Vergleichbare Arbeitsfolge in den Beispieljahren 2024 und 2025.';
 const palettes={soil:['#d9c08e','#b9a174','#8c7352'],application:['#d9d4a4','#a9cbbf','#91b3cb'],yield:['#e2be75','#b6cb7c','#6a9c70']},colors=palettes[layer];
 const labels=layer==='soil'?['Sandiger Lehm','Lehm','Toniger Lehm']:layer==='application'?['90 % · Basis','100 % · Basis','110 % · Basis']:[(yieldValue-12)+' dt/ha',yieldValue+' dt/ha',(yieldValue+12)+' dt/ha'];
 document.getElementById('record-map-slot').innerHTML=`<div id="record-map"><svg viewBox="0 0 1040 900" role="img" aria-label="${document.getElementById('record-layer').selectedOptions[0].text} ${year} für ${f.name}"><defs><clipPath id="record-clip"><path d="${f.path}"/></clipPath></defs><rect width="1040" height="900" fill="#edf1e6"/><g clip-path="url(#record-clip)"><rect width="1040" height="900" fill="${colors[0]}"/><path d="M0 ${80+(2026-year)*25} Q520 100 1040 500 V900 H0Z" fill="${colors[1]}"/><path d="M0 400 Q520 300 1040 750 V900 H0Z" fill="${colors[2]}"/></g><path d="${f.path}" fill="none" stroke="#526e51" stroke-width="5"/></svg></div>`;
 const svg=document.querySelector('#record-map svg'),path=svg.querySelector('clipPath path'),b=path.getBBox(),pad=30;svg.setAttribute('viewBox',`${b.x-pad} ${b.y-pad} ${b.width+2*pad} ${b.height+2*pad}`);
 document.getElementById('record-map').dataset.aspect=(b.width+2*pad)/(b.height+2*pad);
 document.getElementById('record-map-key').innerHTML=labels.map((label,i)=>`<span><i style="background:${colors[i]}"></i>${label}</span>`).join('');
 enableMap(document.getElementById('record-map'));
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.map-expanded .map-expand').forEach(button=>button.click());});

// Gemeinsame Detailansicht für gespeicherte und bereits disponierte Aufgaben.
let taskOverviewId=null,taskOverviewMode='field',taskOverviewReturn={hash:'#auftragsverwaltung',inspector:false};
let taskAssignment={taskId:null,mode:'existing',robotId:null,implementId:null,expanded:false};
function openTaskOverview(id,chooseUnit=false){
  if(!dispatchTasks.some(t=>t.id===id))return;
  if(!/^#aufgabe-/.test(location.hash))taskOverviewReturn={hash:location.hash||'#auftragsverwaltung',inspector:document.getElementById('dispatch-inspector').open};
  const dialog=document.getElementById('dispatch-inspector');if(dialog.open)dialog.close();
  const task=dispatchTasks.find(t=>t.id===id);if(task.robot){selectedDispatchRobot=task.robot;selectedDispatchTask=id;renderSchedule();renderDispatchRobot();}
  taskOverviewMode='field';location.hash='aufgabe-'+id;
  renderTaskOverview(id);
  if(chooseUnit)openTaskAssignment();
}
function closeTaskOverview(){
  location.hash=taskOverviewReturn.hash;
  if(taskOverviewReturn.inspector)requestAnimationFrame(()=>{const dialog=document.getElementById('dispatch-inspector');if(!dialog.open)dialog.showModal();});
}
function taskInfoGroup(title,rows){return `<section class="panel task-info-group"><h2>${title}</h2><dl>${rows.filter(r=>r[1]!==null&&r[1]!==undefined).map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></section>`;}
function renderTaskOverview(id){
  document.getElementById('task-assignment-status').textContent='';
  const task=dispatchTasks.find(t=>t.id===id);
  if(!task){document.getElementById('task-overview-title').textContent='Aufgabe nicht verfügbar';document.getElementById('task-overview-subtitle').textContent='Diese Demo-Aufgabe ist in dieser Sitzung nicht vorhanden.';document.getElementById('task-overview-information').innerHTML='';document.getElementById('task-overview-work-data').innerHTML='';document.getElementById('task-overview-map').hidden=true;document.getElementById('task-overview-id').textContent='';document.getElementById('task-overview-status').textContent='';document.getElementById('task-overview-assign').hidden=true;document.getElementById('task-overview-map-caption').textContent='';taskOverviewId=null;return;}
  taskOverviewId=id;
  if(taskAssignment.taskId!==id)taskAssignment={taskId:id,mode:activeTaskCombinations(task).length?'existing':'new',robotId:null,implementId:null,expanded:!task.robot};
  document.getElementById('task-overview-map').hidden=false;
  const f=fields.find(f=>f.id===task.field),robot=dispatchRobots.find(r=>r.id===task.robot),schedule=robot?buildRobotSchedule(robot):null;
  const work=schedule?.segments.find(s=>s.kind==='work'&&s.task.id===id),drives=schedule?schedule.segments.filter(s=>s.kind==='drive'&&s.task.id===id):[],setups=schedule?schedule.segments.filter(s=>s.kind==='setup'&&s.task.id===id):[];
  const priority=taskPriorities[task.priority]||taskPriorities.flexible,due=taskDeadline(task),dateLabel=date=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(date+'T12:00:00'));
  const defaultAngles={1:0,2:90,3:0,4:0,5:90,6:90,7:90,8:0};
  document.getElementById('task-overview-id').textContent='AUFGABE '+String(id).padStart(3,'0');
  document.getElementById('task-overview-title').textContent=f.name+' · '+task.operation;
  document.getElementById('task-overview-subtitle').textContent=f.area+' · '+(task.crop||f.crop);
  document.getElementById('task-overview-status').textContent=robot?'Eingeplant · '+robotShortName(robot.id):'Offen · Im Arbeitsspeicher';
  document.getElementById('task-overview-assign').hidden=false;
  document.getElementById('task-overview-assign').textContent=robot?'Gespann ändern':'Gespann wählen';
  let workDetails=taskInfoGroup('Aufgabe & Fläche', [['Fläche',f.name],['Flächengröße',f.area],['Arbeit',task.operation],['Frucht',task.crop||f.crop],['Angelegt am',dateLabel(task.createdOn||dispatchDate)],['Priorität',priority.label],['Zeitrahmen',priority.time],['Ablaufdatum',due?dateLabel(due):'Ohne Ablaufdatum']]);
  let details=`<section id="task-assignment-panel" class="panel task-assignment-panel"${taskAssignment.expanded?'':' hidden'}>${taskAssignmentContents(task)}</section>`;
  workDetails+=taskInfoGroup('Arbeitsdaten', [['Arbeitstiefe',task.depth?task.depth+' cm':null],['Geschwindigkeit',task.speed?task.speed+' km/h':'Nicht festgelegt'],['Arbeitsbreite',task.workingWidth?task.workingWidth.toLocaleString('de-DE')+' m':'Noch nicht festgelegt'],['Bearbeitungsrichtung',(task.bearingDegrees??defaultAngles[f.id])+'°'],['Vorgewendebahnen',task.headlandPasses??2],['Saatkultur',task.operation==='Säen'?(task.crop||f.crop):null],['Saatstärke',task.operation==='Säen'?(task.seedRate?task.seedRate.toLocaleString('de-DE')+' Körner/ha':'Nicht festgelegt'):null],['Applikationskarte',task.operation==='Säen'?(task.applicationMap?'Teilflächenspezifisch':'Keine hinterlegt'):null],['Fahrgassenabstand',task.operation==='Säen'?(task.tramlineSpacing?task.tramlineSpacing+' m':'Keine Fahrgassen'):null]]);
  details+=taskInfoGroup('Einsatz & Anfahrt', [['Roboter',robot?robot.name+' · '+robot.type:'Noch nicht zugewiesen'],['Anbaugerät',robot?dispatchTaskToolName(task):'Gespann für diese Aufgabe wählen'],['Geschätzte Arbeitsdauer',durationLabel(dispatchDuration(task))],['Geplanter Beginn',work?datedTime(work.start):'Noch nicht eingeplant'],['Geplantes Ende',work?datedTime(work.start+work.duration):'Noch nicht eingeplant'],['Rüstzeit',schedule?durationLabel(setups.reduce((sum,s)=>sum+s.duration,0)):null],['Straßenfahrt',schedule?durationLabel(drives.reduce((sum,s)=>sum+s.duration,0)):null],['Fahrtstrecke',schedule?drives.reduce((sum,s)=>sum+s.route.km,0).toFixed(1).replace('.',',')+' km':null],['Anfahrt',robot?'Autonom über das Straßennetz':'Noch nicht disponiert']]);
  document.getElementById('task-overview-work-data').innerHTML=workDetails;
  document.getElementById('task-overview-information').innerHTML=details;
  updateTaskAssignmentSummary();
  setTaskOverviewMap(taskOverviewMode);
}
function setTaskOverviewMap(mode){
  const task=dispatchTasks.find(t=>t.id===taskOverviewId);if(!task)return;
  taskOverviewMode=mode;
  ['field','road'].forEach(key=>{const button=document.getElementById('task-map-'+key);button.classList.toggle('active',key===mode);button.setAttribute('aria-pressed',String(key===mode));});
  const f=fields.find(f=>f.id===task.field),map=document.getElementById('task-overview-map');let svg;
  if(mode==='field'){
    const probe=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');probe.style.cssText='position:absolute;left:-10000px;width:1040px;height:900px';path.setAttribute('d',f.path);probe.append(path);document.body.append(probe);const b=path.getBBox();probe.remove();
    const pad=Math.max(b.width,b.height)*.12,view=[b.x-pad,b.y-pad,b.width+pad*2,b.height+pad*2];map.dataset.aspect=view[2]/view[3];
    let zones='';
    if(task.operation==='Säen'&&task.applicationMap)zones=`<defs><clipPath id="overview-seed-clip"><path d="${f.path}"/></clipPath></defs><g clip-path="url(#overview-seed-clip)"><rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="#d9d4a4"/><rect x="${b.x}" y="${b.y+b.height*.33}" width="${b.width}" height="${b.height*.67}" fill="#a9cbbf"/><rect x="${b.x}" y="${b.y+b.height*.7}" width="${b.width}" height="${b.height*.3}" fill="#91b3cb"/></g>`;
    svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.join(' ')}" role="img" aria-label="${f.name}: Feldgrenze und geplante Spurlinien"><path d="${f.path}" fill="#dce7ce" stroke="#78956e" stroke-width="3"/>${zones}${dispatchFieldTracks(task)}</svg>`;
    document.getElementById('task-overview-map-caption').textContent='Feldgrenze · Spurlinien · Vorgewende · Schematische Vorschau';
  }else{
    map.dataset.aspect=1040/900;
    const robot=dispatchRobots.find(r=>r.id===task.robot),schedule=robot?buildRobotSchedule(robot):null;
    const drives=schedule?schedule.segments.filter(s=>s.kind==='drive'&&s.task.id===task.id):[{route:roadRoute(null,task.field)}];
    const road=drives.map(s=>`<polyline points="${s.route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="white" stroke-width="14" stroke-linejoin="round"/><polyline points="${s.route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#427fad" stroke-width="7" stroke-dasharray="14 9" stroke-linejoin="round"/>`).join('');
    svg=landscape('task-overview').replace('</svg>',road+dispatchFieldTracks(task)+'</svg>');
    document.getElementById('task-overview-map-caption').textContent=robot?'Geplante autonome Anfahrt · Schematisches Straßennetz':'Beispielanfahrt vom Hof · Roboter noch nicht zugewiesen';
  }
  const target=map.querySelector('.map-scene')||map;target.innerHTML=svg;
  if(!map.classList.contains('map-viewport'))enableMap(map);else map.querySelector('.map-controls').children[2].click();
}
window.dispatchReady=true;
const initialTaskMatch=location.hash.match(/^#aufgabe-(\d+)$/);if(initialTaskMatch)renderTaskOverview(Number(initialTaskMatch[1]));

document.querySelectorAll('[data-robot-tool]').forEach(element=>{
  const id=Number(element.dataset.robotTool),vehicle=fleetVehicles.find(robot=>robot.id===id);
  const tool=fleetImplements.find(item=>item.id===fleetMountedImplements[id]);
  const name=vehicle.fixed?'Integrierte Hackeinheit':tool?tool.name:'Kein Anbaugerät';
  element.textContent=name;element.title='Anbaugerät: '+name;
});
function fleetMachineStatus(robot){
  return fleetOperatingStates[robot.id]||(robot.atFarm?{kind:'ready',label:'Bereit',detail:'Auf dem Hof'}:{kind:'working',label:'Aufgabe wird ausgeführt',detail:robot.status+' · '+robot.area});
}
function fleetMountedToolName(vehicle){
  return vehicle.fixed?'Integrierte Hackeinheit':fleetImplements.find(tool=>tool.id===fleetMountedImplements[vehicle.id])?.name||'Kein Anbaugerät';
}
function fleetToolCarrier(id){return fleetVehicles.find(vehicle=>fleetMountedImplements[vehicle.id]===id);}
function fleetMachineDetails(kind,machine){
  let facts=[],footer='';
  if(kind==='robot'){
    const robot=data.find(r=>r.id===machine.id),state=fleetMachineStatus(robot),field=fields.find(f=>f.robots.includes(machine.id));
    facts=[['Maschinentyp',machine.type],['Status',state.label],['Standort',field?.name||'Hof Grünpark'],['Aktuelle Arbeit',field?.task||'Kein laufender Feldauftrag'],['Arbeitsgerät',fleetMountedToolName(machine)],[machine.fixed?'Batterie':'Tankfüllstand',robot.b+' %'],['Betriebszustand',state.detail]];
    if(robot.alert)footer=`<p class="fleet-selection-alert fleet-alert-${robot.alert.severity}">${robot.alert.severity==='error'?'⛔':'⚠'} ${robot.alert.message}</p>`;
    footer+=`<a class="fleet-machine-open" href="#roboter-${machine.id}">Roboter öffnen ↗</a>`;
  }else{
    const carrier=fleetToolCarrier(machine.id);
    facts=[['Gerätetyp',machine.type],['Arbeitsbreite',machine.width||'Noch nicht festgelegt'],[machine.depthLabel||'Arbeitstiefe',machine.depth||'Noch nicht festgelegt'],['Mögliche Arbeiten',machine.work],['Angebaut an',carrier?.name||'Nicht angebaut'],['Standort',carrier?(fields.find(f=>f.robots.includes(carrier.id))?.name||'Hof Grünpark'):'Kein Standort hinterlegt']];
    if(machine.configuration)facts.push(['Ausstattung',machine.configuration]);
    if(carrier)footer=`<a class="fleet-machine-open" href="#roboter-${carrier.id}">Trägerroboter öffnen ↗</a>`;
  }
  const information=`<div class="fleet-machine-information"><dl class="fleet-machine-facts">${facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>${footer?`<div class="fleet-machine-footer">${footer}</div>`:''}</div>`;
  if(kind!=='robot')return `<div class="fleet-machine-details">${information}</div>`;
  const field=fields.find(f=>f.robots.includes(machine.id));
  return `<div class="fleet-machine-details fleet-robot-details"><figure class="fleet-inline-map-panel"><div class="fleet-inline-map-heading"><strong>${field?.name||'Hof Grünpark'}</strong><span>Standort</span></div><div id="fleet-robot-map-${machine.id}" class="map fleet-robot-map" data-robot-id="${machine.id}" aria-label="Standortkarte ${machine.name}"></div><figcaption>${field?'Auf aktuelles Feld gezoomt':'Auf den Hof gezoomt'} · Schematische Karte</figcaption></figure>${information}</div>`;
}
document.getElementById('fleet-robots').innerHTML=data.map(robot=>{
  const vehicle=fleetVehicles.find(v=>v.id===robot.id),state=fleetMachineStatus(robot);
  return `<details class="fleet-machine-item" data-machine-kind="robot" data-machine-id="${robot.id}" ontoggle="prepareFleetRobotMap(this)"><summary><span class="fleet-machine-icon" aria-hidden="true">▰</span><span class="fleet-machine-identity"><strong>${vehicle.name}</strong><small>MW–00${robot.id} · ${vehicle.type}</small></span><span class="fleet-machine-context">${robot.area}</span><span class="fleet-state fleet-state-${state.kind}"><i aria-hidden="true"></i>${state.label}</span><span class="fleet-machine-chevron" aria-hidden="true">⌄</span></summary>${fleetMachineDetails('robot',vehicle)}</details>`;
}).join('');
const renderFleetImplement=tool=>{
  const carrier=fleetToolCarrier(tool.id);
  return `<details class="fleet-machine-item" data-machine-kind="implement" data-machine-id="${tool.id}"><summary><span class="fleet-machine-icon" aria-hidden="true">⚒</span><span class="fleet-machine-identity"><strong>${tool.name}</strong><small>${tool.id} · ${tool.type}${tool.width?' · '+tool.width:''}</small></span><span class="fleet-machine-context">${carrier?robotShortName(carrier.id):'Nicht angebaut'}</span><span class="fleet-machine-chevron" aria-hidden="true">⌄</span></summary>${fleetMachineDetails('implement',tool)}</details>`;
};
const fleetEquipmentGroups=[
  {label:'Grubber',matches:tool=>tool.type.toLowerCase().includes('grubber')},
  {label:'Drillmaschinen',matches:tool=>tool.type==='Drillmaschine'},
  {label:'Hacke & Striegel',matches:tool=>tool.type==='Striegel'||tool.type==='Hackgerät'}
];
document.getElementById('fleet-implements').innerHTML=fleetEquipmentGroups.map(group=>{
  const tools=fleetImplements.filter(group.matches);
  return `<details class="fleet-section fleet-device-group" data-group-label="${group.label}"><summary class="fleet-group-heading"><h3>${group.label}</h3><span>${tools.length} ${tools.length===1?'Gerät':'Geräte'}</span><span class="fleet-group-chevron" aria-hidden="true">⌄</span></summary><div class="fleet-machine-items">${tools.map(renderFleetImplement).join('')}</div></details>`;
}).join('');
document.getElementById('fleet-machine-count').textContent=`${fleetVehicles.length} Roboter · ${fleetImplements.length} Geräte`;
function prepareFleetRobotMap(details){
  if(!details.open)return;
  const map=details.querySelector('.fleet-robot-map');
  if(!map||map.classList.contains('map-viewport'))return;
  const robot=data.find(r=>r.id===Number(map.dataset.robotId));
  if(!robot)return;
  map.innerHTML=robotOverviewMap(robot);
  const view=map.querySelector('svg').getAttribute('viewBox').split(/\s+/).map(Number);
  map.dataset.aspect=view[2]/view[3];
  enableMap(map);
}


// Roboterspezifische Leitstandsansicht. Sämtliche Bedienelemente simulieren nur den UI-Zustand.
const robotProfileStates=new Map();let robotProfileId=null;
function robotProfileState(id){if(!robotProfileStates.has(id))robotProfileStates.set(id,{action:'running',mode:'auto',speed:5,camera:'front'});return robotProfileStates.get(id);}
function robotCameraPreview(vehicle,atFarm,direction='front'){
  const labels={front:'Vorne',left:'Links',rear:'Hinten',right:'Rechts'};
  return `<div class="robot-camera-photo camera-${direction}" role="img" aria-label="${labels[direction]} · Kamerabild ${vehicle.name}"></div><span class="robot-camera-badge">${labels[direction]}</span>`;
}
function renderRobotProfile(id){
  const vehicle=fleetVehicles.find(r=>r.id===id),r=data.find(r=>r.id===id);robotProfileId=vehicle?id:null;
  if(!vehicle){document.getElementById('robot-profile-name').textContent='Roboter nicht gefunden';return;}
  const state=robotProfileState(id),field=fields.find(f=>f.robots.includes(id)),operating=fleetOperatingStates[id];
  document.getElementById('robot-profile-name').textContent=vehicle.name;
  document.getElementById('robot-profile-id').textContent='MW–00'+id+' · '+vehicle.type;
  document.getElementById('robot-profile-location').textContent=field?'Aufgabe: '+field.task+' · '+field.name:'Standort: Hof Grünpark';
  document.getElementById('robot-energy-label').textContent=vehicle.fixed?'Batterie':'Tankfüllstand';
  document.getElementById('robot-energy-fill').style.setProperty('--b',r.b+'%');
  document.getElementById('robot-energy-value').textContent=r.b+' %';
  const progress=field?r.p:0;
  document.getElementById('robot-profile-ring').style.setProperty('--p',progress);
  document.getElementById('robot-profile-ring').setAttribute('aria-label',progress+' Prozent erledigt');
  document.getElementById('robot-profile-progress').innerHTML=progress+'<small>%</small>';
  document.getElementById('robot-profile-time').textContent=field?r.time:operating?.kind==='setup'?'20 min':'—';
  const tool=fleetImplements.find(t=>t.id===fleetMountedImplements[id]);
  document.getElementById('robot-profile-tool').textContent=vehicle.fixed?'Integrierte Hackeinheit':tool?.name||'Kein Arbeitsgerät angebaut';
  setRobotCamera(state.camera||'front');
  document.getElementById('robot-camera-360').innerHTML=robotSurroundPreview(vehicle,!field);
  closeRobotTile();
  document.getElementById('robot-map-location').textContent=field?field.name:'Hof Grünpark';
  const map=document.getElementById('robot-profile-map');let svg=landscape('robot-profile'),aspect=1040/900;
  if(field){
    const path=document.createElementNS('http://www.w3.org/2000/svg','path'),probe=document.createElementNS('http://www.w3.org/2000/svg','svg');path.setAttribute('d',field.path);probe.style.cssText='position:absolute;left:-10000px;width:1040px;height:900px';probe.append(path);document.body.append(probe);const b=path.getBBox();probe.remove();const pad=45,box=[b.x-pad,b.y-pad,b.width+2*pad,b.height+2*pad];aspect=box[2]/box[3];
    const task=dispatchTasks.find(t=>t.field===field.id&&t.operation===field.task)||{id,field:field.id,operation:field.task};
    svg=svg.replace('viewBox="0 0 1040 900"',`viewBox="${box.join(' ')}"`).replace('</svg>',dispatchFieldTracks(task)+`<g><circle cx="${field.x}" cy="${field.y+25}" r="19" fill="${r.color}" stroke="white" stroke-width="4"/><path d="M${field.x-5} ${field.y+29}L${field.x} ${field.y+17}L${field.x+5} ${field.y+29}Z" fill="white"/></g></svg>`);
  }else{svg=svg.replace('viewBox="0 0 1040 900"','viewBox="15 610 360 290"').replace('</svg>',`<circle cx="${id===5?120:180}" cy="790" r="15" fill="${r.color}" stroke="white" stroke-width="4"/></svg>`);aspect=360/290;}
  map.dataset.aspect=aspect;(map.querySelector('.map-scene')||map).innerHTML=svg;
  if(!map.classList.contains('map-viewport'))enableMap(map);else map.querySelector('.map-controls').children[2].click();
  const electric=!!vehicle.fixed;
  const metrics=electric?[['Batterietemperatur','32 °C',42],['Motorlast','38 %',38],['Fahrantrieb','165 U/min',35],['Solarleistung','320 W',62],['Werkzeugsensoren','Bereit',100]]:[['Motortemperatur',id===5?'42 °C':'78 °C',id===5?35:69],['Schlupf',field?'6 %':'0 %',field?18:0],['Motordrehzahl',field?'1.850 U/min':'0 U/min',field?61:0],['Hydraulikdruck',field?'185 bar':'0 bar',field?68:0],['Zapfwellendrehzahl',field?'540 U/min':'0 U/min',field?54:0]];
  renderRobotMachineData(vehicle,tool,metrics,!!field);
  updateRobotProfileControls();
}
function robotImplementMetrics(tool,working){
  if(tool.type==='Drillmaschine')return [
    ['Saatgutfüllstand',tool.id==='AG–002'?'8 %':'68 %',tool.id==='AG–002'?8:68],['Saatgutvorrat',tool.id==='AG–002'?'48 kg':'410 kg',tool.id==='AG–002'?8:68],
    ['Aussaatmenge',working?'180 kg/ha':'0 kg/ha',working?60:0],
    ['Ablagetiefe','3,0 cm',50],['Säüberwachung',working?'Alle Reihen aktiv':'Bereit',100],
    ['Dosierantrieb',working?'42 U/min':'0 U/min',working?42:0]
  ];
  if(tool.type==='Hackgerät')return [
    ['Arbeitstiefe','3,5 cm',35],['Reihenführung',working?'Aktiv':'Bereit',100],
    ['Kamera-Pflanzenerkennung',working?'98 %':'Bereit',98],
    ['Verschieberahmen',working?'+ 2 cm':'0 cm',working?55:50],['Werkzeugstatus','Alle Einheiten bereit',100]
  ];
  if(tool.type==='Striegel')return [
    ['Zinkendruck','1,8 kg',45],['Eingriffstiefe','2,0 cm',40],
    ['Rahmenposition',working?'Arbeitsstellung':'Angehoben',working?25:90],['Werkzeugstatus','Alle Zinken bereit',100]
  ];
  return [['Arbeitstiefe','18 cm',60],['Zugkraft',working?'24 kN':'0 kN',working?48:0],
    ['Rahmenposition',working?'Arbeitsstellung':'Angehoben',working?25:90],['Werkzeugstatus','Bereit',100]];
}
function renderRobotMachineData(vehicle,tool,metrics,working){
  const metricRows=items=>items.map(([label,value,amount])=>`<div class="robot-machine-metric"><div><span>${label}</span><strong>${value}</strong></div><div class="robot-metric-track"><span style="width:${amount}%"></span></div></div>`).join('');
  const mounted=vehicle.fixed?{name:'Integrierte Hackeinheit',type:'Hackgerät'}:tool;
  const group=(title,name,items)=>`<section class="machine-data-group"><div class="machine-data-group-heading"><h3>${title}</h3><span>${name}</span></div>${metricRows(items)}</section>`;
  document.getElementById('robot-machine-data').innerHTML=
    group('Roboter',vehicle.name,metrics)+
    (mounted?group('Anbaugerät',mounted.name,robotImplementMetrics(mounted,working)):
      '<section class="machine-data-group"><div class="machine-data-group-heading"><h3>Anbaugerät</h3><span>Kein Arbeitsgerät angebaut</span></div></section>');
  document.getElementById('robot-machine-data').scrollTop=0;
}
function syncCaseTouchscreen(){
  if(window.parent===window)return;
  const manual=!document.getElementById('roboterdetail').hidden&&robotManualEnabled();
  window.parent.postMessage({type:'roboplan-case-state',manual},location.origin==='null'?'*':location.origin);
}
function updateRobotProfileControls(){
  if(!robotProfileId)return;const state=robotProfileState(robotProfileId),r=data.find(r=>r.id===robotProfileId),operating=fleetOperatingStates[robotProfileId];
  const status=document.getElementById('robot-profile-status');
  status.textContent=state.action==='stopped'?'Nothalt':state.action==='paused'?'Pause · Manuell':operating?operating.label:'Automatik aktiv';
  status.className=state.action==='stopped'?'robot-status-emergency':state.action==='paused'?'robot-status-paused':operating?'robot-status-'+operating.kind:'robot-status-active';
  document.getElementById('robot-action-pause').disabled=r.atFarm||state.action!=='running';
  document.getElementById('robot-action-resume').disabled=r.atFarm||state.action==='running';
  document.getElementById('robot-action-stop').disabled=state.action==='stopped';
  document.getElementById('robot-control-mode-label').textContent=state.action==='paused'?'Manuell · Joystick':state.action==='stopped'?'Nothalt aktiv':'Automatik';
  updateRobotImplementControls();
  renderRobotFaultMemory();
  syncCaseTouchscreen();
}
function robotManualEnabled(){
  return !!robotProfileId&&robotProfileState(robotProfileId).action==='paused'&&!data.find(r=>r.id===robotProfileId).atFarm;
}
function setRobotDemoAction(action){
  if(userDemoSignedOut||!robotProfileId||!['pause','resume','stop'].includes(action))return;
  if(action!=='stop'&&data.find(r=>r.id===robotProfileId).atFarm)return;
  const state=robotProfileState(robotProfileId),values=robotImplementState();
  cancelAnimationFrame(values.liftFrame||0);values.liftFrame=null;
  state.joystick='neutral';
  ['hyd1','hyd2','hyd3','hyd4'].forEach(control=>{values[control]=0;values[control+'Float']=false;});
  if(action==='stop')values.pto='off';
  state.action={pause:'paused',resume:'running',stop:'stopped'}[action];
  state.mode=action==='pause'?'manual':'auto';
  updateRobotProfileControls();
}
function robotImplementState(){
  const state=robotProfileState(robotProfileId);
  if(!state.implements)state.implements={height:65,pto:'off',ptoSpeed:540,hyd1:0,hyd2:0,hyd3:0,hyd4:0,hyd1Float:false,hyd2Float:false,hyd3Float:false,hyd4Float:false};
  return state.implements;
}
function setRobotImplement(control,value){
  if(!robotManualEnabled())return;
  const values=robotImplementState();
  if(control==='pto'&&!['on','off'].includes(value))return;
  if(control==='ptoSpeed'&&![540,1000].includes(value))return;
  if(['hyd1','hyd2','hyd3','hyd4'].includes(control)){
    value=Math.max(-100,Math.min(100,Number(value)||0));
    values[control+'Float']=false;
  }
  values[control]=value;
  updateRobotImplementControls();
}
function moveRobotLift(target){
  if(!robotManualEnabled()||![5,90].includes(target))return;
  const id=robotProfileId,values=robotImplementState();
  cancelAnimationFrame(values.liftFrame||0);
  const from=values.height,started=performance.now(),duration=Math.max(300,Math.abs(target-from)*30);
  function step(now){
    const progress=Math.min(1,(now-started)/duration);
    values.height=Math.round(from+(target-from)*progress);
    if(robotProfileId===id)updateRobotImplementControls();
    if(progress<1)values.liftFrame=requestAnimationFrame(step);
    else values.liftFrame=null;
  }
  values.liftFrame=requestAnimationFrame(step);
}
function toggleRobotPto(){
  if(!robotManualEnabled())return;
  setRobotImplement('pto',robotImplementState().pto==='on'?'off':'on');
}
function releaseRobotHydraulic(control){
  if(!robotProfileId)return;
  const values=robotImplementState();
  if(values[control]===0)return;
  values[control]=0;
  updateRobotImplementControls();
}
function releaseRobotHydraulics(){
  if(!robotProfileId)return;
  ['hyd1','hyd2','hyd3','hyd4'].forEach(releaseRobotHydraulic);
}
window.addEventListener('pointerup',releaseRobotHydraulics);
window.addEventListener('pointercancel',releaseRobotHydraulics);
window.addEventListener('blur',releaseRobotHydraulics);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseRobotHydraulics();});
function toggleRobotFloat(control){
  if(!robotManualEnabled()||!['hyd1','hyd2','hyd3','hyd4'].includes(control))return;
  const values=robotImplementState();
  values[control+'Float']=!values[control+'Float'];values[control]=0;
  updateRobotImplementControls();
}
function updateRobotImplementControls(){
  if(!robotProfileId)return;
  const values=robotImplementState();
  document.getElementById('robot-lift-height').textContent=values.height+' %';
  document.getElementById('robot-lift-fill').style.width=values.height+'%';
  document.querySelector('.lift-height-track').setAttribute('aria-valuenow',values.height);
  const manual=robotManualEnabled();
  document.querySelectorAll('.robot-implement-controls button,.robot-implement-controls input,.robot-implement-controls select').forEach(input=>input.disabled=!manual);
  document.querySelector('[aria-label="Hubwerk heben"]').disabled=!manual||values.height>=90;
  document.querySelector('[aria-label="Hubwerk senken"]').disabled=!manual||values.height<=5;
  document.getElementById('robot-pto-speed').value=values.ptoSpeed;
  document.getElementById('robot-pto-actual').textContent=(values.pto==='on'?values.ptoSpeed.toLocaleString('de-DE'):0)+' U/min';
  const ptoButton=document.getElementById('robot-pto-toggle');
  ptoButton.textContent=values.pto==='on'?'An':'Aus';
  ptoButton.setAttribute('aria-pressed',String(values.pto==='on'));
  ptoButton.title=values.pto==='on'?'Zapfwelle ausschalten':'Zapfwelle einschalten';
  ['hyd1','hyd2','hyd3','hyd4'].forEach(control=>{
    const value=values[control],floating=values[control+'Float'];
    const slider=document.getElementById('robot-'+control+'-slider');
    slider.value=value;slider.setAttribute('aria-valuetext',floating?'Schwimmstellung':value===0?'Neutral':(value<0?'Links ':'Rechts ')+Math.abs(value)+' Prozent');
    document.getElementById('robot-'+control+'-value').textContent=floating?'Schwimmstellung':value===0?'Neutral':(value<0?'← ':'→ ')+Math.abs(value)+' %';
    document.querySelector('[data-float="'+control+'"]').setAttribute('aria-pressed',String(floating));
  });
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='roboplan-joystick'||!robotProfileId)return;
  const state=robotProfileState(robotProfileId);
  if(document.getElementById('roboterdetail').hidden||!robotManualEnabled()){state.joystick='neutral';return;}
  if(!['neutral','Vorwärts','Rückwärts','Links','Rechts'].includes(event.data.direction))return;
  state.joystick=event.data.direction;
  document.getElementById('robot-control-mode-label').textContent=event.data.direction==='neutral'?'Manuell · Joystick':'Manuell · '+event.data.direction;
});
window.robotProfileReady=true;
const initialRobotMatch=location.hash.match(/^#roboter-(\d+)$/);if(initialRobotMatch)renderRobotProfile(Number(initialRobotMatch[1]));

function updateRobotProfileBack(){
  const expanded=!!document.querySelector('.robot-tile.is-expanded');
  const button=document.querySelector('.robot-back');
  button.textContent=expanded?'← Zurück zur Roboterübersicht · '+document.getElementById('robot-profile-name').textContent:'← Flottenmanagement';
}
function robotProfileBack(){
  if(document.querySelector('.robot-tile.is-expanded')){
    const toggle=document.querySelector('.robot-tile.is-expanded .robot-tile-toggle');
    closeRobotTile();toggle.focus();
  }else location.hash='roboterverwaltung';
}
// Die vorhandenen Kacheln werden vergrößert; Karten und Bedienelemente bleiben erhalten.
function closeRobotTile(){
  document.querySelectorAll('.robot-tile').forEach(tile=>{
    tile.classList.remove('is-expanded');
    const button=tile.querySelector('.robot-tile-toggle');
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-label',tile.querySelector('h2').textContent+' vergrößern');
    button.textContent='⛶';
  });
  document.querySelector('.robot-dashboard-grid').classList.remove('has-expanded-tile','manual-control-view');
  updateRobotProfileBack();
  window.dispatchEvent(new Event('resize'));
}
function toggleRobotTile(key){
  const tile=document.querySelector('[data-tile="'+key+'"]'),expanded=tile.classList.contains('is-expanded');
  closeRobotTile();
  if(!expanded){
    tile.classList.add('is-expanded');
    document.querySelector('.robot-dashboard-grid').classList.add('has-expanded-tile');
    if(key==='control')document.querySelector('.robot-dashboard-grid').classList.add('manual-control-view');
    updateRobotProfileBack();
    const button=tile.querySelector('.robot-tile-toggle');
    button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Verkleinern');button.textContent='↙';button.focus();
    window.dispatchEvent(new Event('resize'));
  }
}
document.querySelectorAll('.robot-tile').forEach(tile=>tile.addEventListener('click',event=>{
  if(event.target.closest('button,input,select,a,.map-viewport'))return;
  if(!tile.classList.contains('is-expanded'))toggleRobotTile(tile.dataset.tile);
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    const active=document.querySelector('.robot-tile.is-expanded .robot-tile-toggle');
    if(active){closeRobotTile();active.focus();}
  }
});
function robotSurroundPreview(vehicle,atFarm){
  const spokes=Array.from({length:20},(_,i)=>`<path d="M180 180L${180+Math.cos(i*Math.PI/10)*240} ${180+Math.sin(i*Math.PI/10)*240}" stroke="#94a37a" stroke-width="9"/>`).join('');
  return `<svg viewBox="0 0 360 360" role="img" aria-label="Illustrative 360 Grad Rundumsicht von ${vehicle.name}"><rect width="360" height="360" fill="${atFarm?'#c3c9ba':'#b9c49e'}"/>${atFarm?'<path d="M0 110H360V250H0Z" fill="#d4d8cb"/><rect x="20" y="20" width="100" height="65" rx="4" fill="#869981"/><rect x="240" y="285" width="100" height="65" rx="4" fill="#869981"/>':spokes}<circle cx="180" cy="180" r="128" fill="none" stroke="#fff" stroke-dasharray="4 7" opacity=".65"/><path d="M180 180L120 55Q180 25 240 55Z" fill="#f7faf1" opacity=".4"/><rect x="156" y="142" width="48" height="76" rx="13" fill="#627d68" stroke="white" stroke-width="3"/><path d="M169 160L180 150L191 160" fill="none" stroke="white" stroke-width="3"/><g fill="#345442" font-size="13" font-family="sans-serif" text-anchor="middle"><text x="180" y="30">VORNE</text><text x="180" y="341">HINTEN</text><text x="35" y="184">L</text><text x="325" y="184">R</text></g></svg><span class="robot-camera-badge">360°</span>`;
}

function setRobotCamera(direction){
  if(!robotProfileId||!['front','left','rear','right'].includes(direction))return;
  const vehicle=fleetVehicles.find(r=>r.id===robotProfileId);
  robotProfileState(robotProfileId).camera=direction;
  const atFarm=!fields.some(field=>field.robots.includes(robotProfileId));
  document.getElementById('robot-camera-view').innerHTML=robotCameraPreview(vehicle,atFarm,direction);
  document.querySelectorAll('[data-camera]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.camera===direction)));
}

window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='roboplan-case-action')return;
  if(event.data.action==='stop'&&(document.getElementById('roboterdetail').hidden||!robotManualEnabled()))return;
  if(['resume','pause','stop'].includes(event.data.action))setRobotDemoAction(event.data.action);
});

function openOverviewWeather(){location.hash='wetter';}
function renderOverviewWeather(){
  document.getElementById('weather-page-title').textContent=document.getElementById('overview-weather-title').textContent.trim();
  document.getElementById('weather-page-location').textContent=document.getElementById('overview-weather-location').textContent.trim();
  renderWeatherRadar();
  const days=[['Heute','☀','18°','10°','15 %'],['Morgen','⛅','17°','9°','25 %'],['Fr','☁','15°','8°','40 %'],['Sa','☂','14°','8°','70 %'],['So','⛅','16°','7°','30 %'],['Mo','☀','18°','8°','10 %'],['Di','☀','19°','9°','10 %']];
  document.getElementById('weather-view-days').innerHTML=days.map(([day,icon,high,low,rain])=>`<div><strong>${day}</strong><span>${icon}</span><b>${high}</b><span>${low}</span><small>${rain} Regenrisiko</small></div>`).join('');
}
function setWeatherView(view){
  if(!['hours','days','radar'].includes(view))return;
  ['hours','days','radar'].forEach(key=>document.getElementById('weather-view-'+key).hidden=key!==view);
  document.querySelectorAll('[data-weather-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.weatherView===view)));
}

function renderWeatherRadar(){
  const selected=document.querySelector('[data-overview-robot].is-selected');
  const robot=selected?data.find(item=>item.id===Number(selected.dataset.overviewRobot)):null;
  const x=robot?robot.x*10.4:175,y=robot?robot.y*9:810;
  const label=robot?robotShortName(robot.id):'Hof Grünpark';
  const rain=`<g aria-hidden="true" pointer-events="none"><path d="M620 55Q800-30 1035 100L1080 470Q925 590 790 430T620 55Z" fill="#77b5de" opacity=".4"/><path d="M770 65Q960 15 1035 150L1040 370Q915 470 815 325T770 65Z" fill="#438ed1" opacity=".45"/><ellipse cx="950" cy="215" rx="66" ry="110" fill="#5266b9" opacity=".45"/><path d="M45 490Q175 420 290 530T350 780Q220 860 90 735T45 490Z" fill="#8ccbdc" opacity=".32"/></g>`;
  const marker=`<g><circle cx="${x}" cy="${y}" r="28" fill="#fff" opacity=".65"/><circle cx="${x}" cy="${y}" r="17" fill="${robot?robot.color:'#27785b'}" stroke="white" stroke-width="4"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" font-weight="700">${robot?robot.id:'H'}</text><text x="${x}" y="${y+46}" text-anchor="middle" fill="#244a38" stroke="white" stroke-width="4" paint-order="stroke" font-family="sans-serif" font-size="19" font-weight="600">${label}</text></g>`;
  document.getElementById('weather-radar-map').innerHTML=landscape('weather-radar')
    .replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid meet"')
    .replace('Hofkarte mit acht benannten Feldern, Straßen, Teich und Hof','Regenradar über unserer Hof- und Feldkarte')
    .replace('</svg>',rain+marker+'</svg>');
}

function renderRobotFaultMemory(){
  const robot=data.find(item=>item.id===robotProfileId),button=document.getElementById('robot-fault-memory');
  if(!robot)return;
  const alert=robot.alert;
  button.className='robot-fault-memory '+(alert?'fault-memory-'+alert.severity:'fault-memory-ok');
  button.innerHTML=`<span class="fault-memory-title">Fehlerspeicher <span>${alert?'1 aktive Meldung':'Keine aktiven Meldungen'}</span></span><strong>${alert?(alert.severity==='error'?'⛔ ':'⚠ ')+alert.message:'✓ Roboter ohne Meldung'}</strong><span class="fault-memory-link">Fehler dieses Roboters ↗</span>`;
}
function openFaultOverview(){
  document.getElementById('fehler').dataset.originRobot=robotProfileId||'';
  location.hash='fehler';
}
function closeFaultOverview(){
  const id=Number(document.getElementById('fehler').dataset.originRobot);
  location.hash=id?'roboter-'+id:'roboterverwaltung';
}
function renderFaultOverview(){
  const id=Number(document.getElementById('fehler').dataset.originRobot),origin=data.find(robot=>robot.id===id);
  document.getElementById('fault-back').textContent=origin?'← Zurück zur Roboterübersicht · '+robotDisplayName(id):'← Flottenmanagement';
  document.getElementById('fault-page-subtitle').textContent=origin?robotDisplayName(id):'Kein Roboter ausgewählt';
  const robots=data.filter(robot=>robot.id===id&&robot.alert);
  const errors=robots.filter(robot=>robot.alert.severity==='error').length,warnings=robots.length-errors;
  document.getElementById('fault-page-counts').innerHTML=`<span class="fleet-alert-error"><i aria-hidden="true"></i>${errors} Fehler</span><span class="fleet-alert-warning"><i aria-hidden="true"></i>${warnings} Warnung${warnings===1?'':'en'}</span>`;
  document.getElementById('fault-list').innerHTML=robots.length?robots.map(robot=>{
    const error=robot.alert.severity==='error';
    return `<article class="panel fault-entry fault-entry-${robot.alert.severity}"><div class="fault-entry-top"><span>${error?'⛔ Fehler':'⚠ Warnung'} · Aktiv</span><span>MW–00${robot.id}</span></div><h2>${robot.alert.message}</h2><p>${robotDisplayName(robot.id)} · ${robot.area}</p><dl><div><dt>Bereich</dt><dd>${error?'Fahrantrieb':'Sämaschine · Saatgutbehälter'}</dd></div><div><dt>Details</dt><dd>${error?'Kein Vortrieb. Roboter benötigt Unterstützung.':'Saatgutfüllstand 8 % · 48 kg verbleibend.'}</dd></div></dl><a href="#roboter-${robot.id}">Roboter öffnen ↗</a></article>`;
  }).join(''):(origin?'<div class="panel fault-empty">✓ Keine aktiven Meldungen für diesen Roboter.</div>':'<div class="panel fault-empty">Bitte einen Roboter öffnen, um seinen Fehlerspeicher anzuzeigen.</div>');
}

// Die Betriebsauswahl ändert ausschließlich den angezeigten Namen.
const customerNames=['Agrarhof Albers','Auenhof','Bauernhof Becker','Birkenhof','Gut Sonnenhof','Hof Grünpark','Hof Lindenberg','Landwirtschaft Meyer','Sonnenacker','Südhof'].sort((a,b)=>a.localeCompare(b,'de'));
function openCustomerPicker(){
  setInlineSearch('customer-search',false);
  document.getElementById('customer-picker').showModal();
  document.getElementById('customer-search-toggle').focus();
}
function renderCustomerPicker(){
  const query=document.getElementById('customer-search').value.trim().toLocaleLowerCase('de');
  const names=customerNames.filter(name=>name.toLocaleLowerCase('de').includes(query));
  const selected=document.getElementById('field-customer-name').textContent;
  const groups=new Map();
  names.forEach(name=>{const initial=name[0].toLocaleUpperCase('de');if(!groups.has(initial))groups.set(initial,[]);groups.get(initial).push(name);});
  document.getElementById('customer-picker-list').innerHTML=[...groups].map(([letter,items])=>`<section class="customer-letter-group"><h3>${letter}</h3><div>${items.map(name=>`<button type="button" data-customer-name="${name}" aria-pressed="${name===selected}">${name}</button>`).join('')}</div></section>`).join('');
  document.getElementById('customer-picker-empty').hidden=names.length>0;
}
document.getElementById('customer-picker-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-customer-name]');if(!button)return;
  document.getElementById('field-customer-name').textContent=button.dataset.customerName;
  document.getElementById('customer-picker').close();
});
document.getElementById('customer-picker').addEventListener('click',event=>{
  if(event.target!==event.currentTarget)return;
  const box=event.currentTarget.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)event.currentTarget.close();
});

function openRobotPlan(){if(robotProfileId)location.hash='roboter-plan-'+robotProfileId;}
function renderRobotPlan(id,selectedField=null){
  const robot=fleetVehicles.find(item=>item.id===id),state=data.find(item=>item.id===id);
  if(!robot){document.getElementById('robot-plan-name').textContent='Roboter nicht gefunden';return;}
  const current=fields.find(field=>field.robots.includes(id));
  const assigned=dispatchTasks.filter(task=>task.robot===id);
  const activeTask=current?assigned.find(task=>task.field===current.id&&task.operation===current.task):null;
  const upcoming=assigned.filter(task=>task.id!==activeTask?.id);
  const parts=[],tasks=[];
  const now=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':');
  let cursor=Number(now[0])*60+Number(now[1]),previous=current?.id||null,previousDepth=null,equipment=robot.fixed?'integrated-'+robot.id:fleetMountedImplements[robot.id]||null;
  const add=(kind,duration,label,task,route=null)=>{parts.push({kind,duration,label,task,route,start:cursor});cursor+=duration;};
  if(current){
    const task=activeTask||{id:1000+id,field:current.id,operation:current.task,robot:id};
    tasks.push(task);add('work',Math.max(10,Math.round(dispatchDuration(task)*(100-state.p)/100)),current.task+' · '+current.name,task);
  }
  upcoming.forEach(task=>{
    const tool=dispatchTaskEquipmentKey(task);
    if(equipment!==tool){
      if(previous){const road=roadRoute(null,previous);add('drive',road.minutes,'Zum Hof · Gerätewechsel',task,{...road,points:[...road.points].reverse()});previous=null;}
      add('setup',30,dispatchTaskToolName(task)+' anbauen',task);equipment=tool;previousDepth=null;
    }else if(task.operation.startsWith('Grubbern')&&previousDepth!==null&&previousDepth!==task.depth){add('setup',10,'Arbeitstiefe einstellen',task);}
    const road=roadRoute(previous,task.field);if(road.minutes)add('drive',road.minutes,'Fahrt · '+fields.find(field=>field.id===task.field).name,task,road);
    add('work',dispatchDuration(task),task.operation+' · '+fields.find(field=>field.id===task.field).name,task);
    tasks.push(task);previous=task.field;previousDepth=task.operation.startsWith('Grubbern')?task.depth??null:null;
  });
  document.getElementById('robot-plan-name').textContent=robot.name;
  document.getElementById('robot-plan-back').onclick=()=>location.hash='roboter-'+id;
  document.getElementById('robot-plan-caption').textContent=(current?'Aktueller Auftrag und nächste Schritte':'Nächste zugewiesene Aufträge')+' · '+upcoming.length+' weitere Aufträge';
  document.getElementById('robot-plan-caption').textContent+=planAccepted?' · Plan gespeichert · Übertragung simuliert':' · Planentwurf';
  const alert=document.getElementById('robot-plan-alert');alert.hidden=!state.alert;
  if(state.alert){alert.className='robot-plan-notice robot-plan-notice-'+state.alert.severity;alert.textContent=(state.alert.severity==='error'?'⛔ ':'⚠ ')+state.alert.message+(state.alert.severity==='error'?' · Zeitplan wartet auf Störungsbehebung':'');}
  const paused=state.alert?.severity==='error'||robotProfileState(id).action!=='running';
  document.getElementById('robot-plan-timeline').innerHTML=parts.length?parts.map((part,index)=>{
    const active=part.task.field===selectedField;
    return `<button class="robot-plan-step step-${part.kind} ${active?'selected':''}" style="--step-size:${Math.max(150,Math.min(310,part.duration*1.4))}px" onclick="renderRobotPlan(${id},${part.task.field})" aria-pressed="${active}"><span>${index===0&&current?(paused?'Pausiert':'Aktuell'):minuteClock(part.start)+'–'+minuteClock(part.start+part.duration)}</span><strong>${part.kind==='drive'?'↗ ':part.kind==='setup'?'⚒ ':'▰ '}${part.label}</strong><small>${durationLabel(part.duration)}${index===0&&current?' Restzeit':''}</small></button>`;
  }).join('')+(upcoming.length===0?'<span class="robot-plan-end">Keine weiteren Aufträge zugewiesen</span>':''):'<div class="robot-plan-empty">Keine Aufträge zugewiesen. In der Disposition können Aufgaben zugeordnet werden.</div>';
  const roads=parts.filter(part=>part.route).map(part=>`<polyline points="${part.route.points.map(point=>point.join(',')).join(' ')}" fill="none" stroke="white" stroke-width="13"/><polyline points="${part.route.points.map(point=>point.join(',')).join(' ')}" fill="none" stroke="#427fad" stroke-width="7" stroke-dasharray="13 9"/>`).join('');
  const tracks=tasks.map(dispatchFieldTracks).join('');
  const selected=fields.find(field=>field.id===selectedField);
  const highlight=selected?`<path d="${selected.path}" fill="#e7b65b" fill-opacity=".2" stroke="#c48a30" stroke-width="7"/>`:'';
  const marker=`<circle cx="${state.x*10.4}" cy="${state.y*9}" r="18" fill="${state.color}" stroke="white" stroke-width="4"/><text x="${state.x*10.4}" y="${state.y*9+5}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14">${id}</text>`;
  const map=document.getElementById('robot-plan-map');
  (map.querySelector('.map-scene')||map).innerHTML=landscape('robot-plan').replace('</svg>',roads+tracks+highlight+marker+'</svg>');
  document.getElementById('robot-plan-map-title').textContent=selected?selected.name:'Aufträge und Fahrwege';
  if(!map.classList.contains('map-viewport'))enableMap(map);
}
const initialRobotPlan=location.hash.match(/^#roboter-plan-(\d+)$/);if(initialRobotPlan)renderRobotPlan(Number(initialRobotPlan[1]));

// Flottensuche erhält die Klappzustände von Geräten und Gerätegruppen.
const fleetDeviceSearchStates=new Map();
function filterFleetList(){
  const query=document.getElementById('fleet-search').value,active=Boolean(normalizeListSearch(query));
  const groups=document.querySelectorAll('#roboterverwaltung .fleet-section');
  if(active&&!fleetDeviceSearchStates.size)groups.forEach(group=>{if(group.matches('details'))fleetDeviceSearchStates.set(group,group.open);});
  let robots=0,implements=0;
  groups.forEach(group=>{
    const isRobots=Boolean(group.querySelector('#fleet-robots'));
    const entries=group.querySelectorAll('.fleet-machine-item');
    const heading=group.dataset.groupLabel;
    let visible=0;
    entries.forEach(entry=>{
      const text=entry.querySelector('summary').textContent+' '+entry.querySelector('.fleet-machine-information').textContent;
      const matches=matchesListSearch(heading+' '+text,query);
      entry.hidden=!matches;if(matches)visible++;
    });
    group.hidden=visible===0;
    if(group.matches('details')){
      if(active)group.open=visible>0;
      else if(fleetDeviceSearchStates.has(group))group.open=fleetDeviceSearchStates.get(group);
    }
    if(isRobots)robots+=visible;else implements+=visible;
  });
  if(!active)fleetDeviceSearchStates.clear();
  const status=document.getElementById('fleet-search-results');
  status.textContent=`${robots} Roboter · ${implements} ${implements===1?'Gerät':'Geräte'} gefunden`;status.hidden=!active;
  document.getElementById('fleet-search-empty').hidden=robots+implements>0;
}

window.addEventListener('message',event=>{
  if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='roboplan-case-state-request')return;
  syncCaseTouchscreen();
});
syncCaseTouchscreen();

// Sichtbarer Sprachmodus für den Prototyp, ohne Mikrofon- oder KI-Anbindung.
function setVoiceAssistantRecording(recording){
  const button=document.getElementById('voice-assistant');
  button.classList.toggle('is-listening',recording);
  button.setAttribute('aria-pressed',String(recording));
  const label=recording?'Demo-Aufnahme läuft: Aufnahme beenden':'KI-Assistent: Demo-Aufnahme starten';
  button.setAttribute('aria-label',label);button.title=recording?'Demo-Aufnahme beenden':'Demo-Aufnahme starten';
  document.getElementById('voice-label').textContent=recording?'Aufnehmen':'KI-Assistent';
  document.getElementById('voice-listening').hidden=!recording;
  document.getElementById('voice-status').textContent=recording?'Demo-Aufnahme gestartet. Erneut antippen oder Escape drücken zum Beenden.':'Demo-Aufnahme beendet.';
}
function toggleVoiceAssistant(){setVoiceAssistantRecording(document.getElementById('voice-assistant').getAttribute('aria-pressed')!=='true');}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('voice-assistant').getAttribute('aria-pressed')==='true')setVoiceAssistantRecording(false);});
window.addEventListener('pagehide',()=>setVoiceAssistantRecording(false));

// Suche wird platzsparend in der jeweiligen Überschriftenzeile geöffnet.
function setInlineSearch(id,expanded,restoreFocus=false){
  const input=document.getElementById(id),button=document.getElementById(id+'-toggle');
  const heading=button.closest('.search-heading');
  input.hidden=!expanded;
  button.setAttribute('aria-expanded',String(expanded));
  button.setAttribute('aria-label',expanded?'Suche schließen':input.getAttribute('aria-label'));
  button.title=expanded?'Suche schließen':input.getAttribute('aria-label');
  heading.classList.toggle('search-is-open',expanded);
  if(expanded)input.focus();
  else{
    input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
    if(restoreFocus)button.focus();
  }
}
function toggleInlineSearch(id){setInlineSearch(id,document.getElementById(id+'-toggle').getAttribute('aria-expanded')!=='true',true);}

// Benutzermenü und gemeinsame Kontoseite.
function closeUserMenu(restoreFocus=false){
  document.getElementById('user-dropdown').hidden=true;
  document.getElementById('user-menu-trigger').setAttribute('aria-expanded','false');
  if(restoreFocus)document.getElementById('user-menu-trigger').focus();
}
function toggleUserMenu(){
  if(userDemoSignedOut)return;
  const menu=document.getElementById('user-dropdown'),open=menu.hidden;
  menu.hidden=!open;document.getElementById('user-menu-trigger').setAttribute('aria-expanded',String(open));
  if(open)menu.querySelector('[role="menuitem"]').focus();
}
function updateUserAccountIdentity(){
  const words=userAccount.name.trim().split(/\s+/);
  const initials=(words.length>1?words[0][0]+words[words.length-1][0]:words[0].slice(0,2)).toLocaleUpperCase('de');
  document.querySelectorAll('[data-user-name]').forEach(node=>node.textContent=userAccount.name);
  document.querySelectorAll('[data-user-email]').forEach(node=>node.textContent=userAccount.email||'Nicht hinterlegt');
  document.querySelectorAll('[data-user-initials]').forEach(node=>node.textContent=initials);
  document.getElementById('user-menu-trigger').title=userAccount.name+' · Benutzerkonto';
  document.querySelectorAll('[data-user-role]').forEach(node=>node.textContent=managedUserRoles.admin.label);
}
function applyUserPreferences(){document.body.classList.toggle('user-reduce-motion',userAccount.reduceMotion);}
function renderUserAccountPage(tab){
  const active=userDemoSignedOut?'abgemeldet':tab;
  if(active==='benutzerverwaltung')renderManagedUsers();
  ['profil','einstellungen','benutzerverwaltung','logout','abgemeldet'].forEach(key=>document.getElementById('account-pane-'+key).hidden=key!==active);
  document.getElementById('account-sidebar').hidden=userDemoSignedOut;
  document.getElementById('account-layout').classList.toggle('is-logged-out',userDemoSignedOut);
  document.querySelectorAll('[data-account-tab]').forEach(link=>{
    const selected=link.dataset.accountTab===active;
    link.classList.toggle('active',selected);
    if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  document.getElementById('account-name').value=userAccount.name;
  document.getElementById('account-business').value=userAccount.business;
  document.getElementById('account-email').value=userAccount.email;
  document.getElementById('account-start-page').value=userAccount.startPage;
  document.getElementById('account-reduce-motion').checked=userAccount.reduceMotion;
  document.getElementById('account-profile-status').textContent='';
  document.getElementById('account-preferences-status').textContent='';
}
function storeUserAccount(){
  try{localStorage.setItem(userAccountStorageKey,JSON.stringify(userAccount));return true;}catch{return false;}
}
function saveUserProfile(event){
  event.preventDefault();if(userDemoSignedOut)return;
  const form=document.getElementById('account-profile-form'),name=document.getElementById('account-name');
  name.value=name.value.trim();if(!form.reportValidity())return;
  userAccount={...userAccount,name:name.value,business:document.getElementById('account-business').value.trim(),email:document.getElementById('account-email').value.trim()};
  managedUsers=managedUsers.map(user=>user.id===currentManagedUserId?{...user,name:userAccount.name,email:userAccount.email}:user);
  const profileSaved=storeUserAccount(),saved=storeManagedUsers()&&profileSaved;updateUserAccountIdentity();
  document.getElementById('account-profile-status').textContent=saved?'Profil gespeichert.':'Für diese Sitzung übernommen. Der Browser erlaubt kein lokales Speichern.';
}
function saveUserPreferences(event){
  event.preventDefault();if(userDemoSignedOut)return;
  userAccount={...userAccount,startPage:document.getElementById('account-start-page').value,reduceMotion:document.getElementById('account-reduce-motion').checked};
  const saved=storeUserAccount();applyUserPreferences();
  document.getElementById('account-preferences-status').textContent=saved?'Einstellungen gespeichert.':'Für diese Sitzung übernommen. Der Browser erlaubt kein lokales Speichern.';
}
function logoutUserDemo(){
  userDemoSignedOut=true;closeUserMenu();setVoiceAssistantRecording(false);
  document.body.classList.add('is-demo-logged-out');document.getElementById('user-menu-trigger').disabled=true;
  location.hash='konto-logout';route();
}
function resumeUserDemo(){
  userDemoSignedOut=false;document.body.classList.remove('is-demo-logged-out');document.getElementById('user-menu-trigger').disabled=false;
  location.hash=userAccount.startPage;route();
}
document.addEventListener('pointerdown',event=>{if(!document.getElementById('user-account-menu').contains(event.target))closeUserMenu();});
document.getElementById('user-account-menu').addEventListener('focusout',event=>{if(!event.currentTarget.contains(event.relatedTarget))closeUserMenu();});
document.getElementById('user-account-menu').addEventListener('keydown',event=>{
  const menu=document.getElementById('user-dropdown'),trigger=document.getElementById('user-menu-trigger');
  if(event.key==='Escape'&&!menu.hidden){event.preventDefault();event.stopPropagation();closeUserMenu(true);return;}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  if(menu.hidden&&event.target!==trigger)return;
  event.preventDefault();event.stopPropagation();
  const wasHidden=menu.hidden;if(wasHidden)toggleUserMenu();
  const items=[...menu.querySelectorAll('[role="menuitem"]')],index=items.indexOf(document.activeElement);
  const next=event.key==='Home'?0:event.key==='End'?items.length-1:wasHidden?(event.key==='ArrowUp'?items.length-1:0):(index+(event.key==='ArrowUp'?-1:1)+items.length)%items.length;
  items[next].focus();
});
updateUserAccountIdentity();applyUserPreferences();

function escapeManagedUserText(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function storeManagedUsers(){try{localStorage.setItem(managedUsersStorageKey,JSON.stringify(managedUsers));return true;}catch{return false;}}
function canManageDemoUsers(){return !userDemoSignedOut&&managedUsers.find(user=>user.id===currentManagedUserId)?.role==='admin';}
function managedRoleOptions(selected){return Object.entries(managedUserRoles).map(([key,role])=>`<option value="${key}"${key===selected?' selected':''}>${role.label}</option>`).join('');}
function renderManagedUsers(){
  const body=document.getElementById('account-managed-users');
  body.innerHTML=managedUsers.map(user=>{
    const current=user.id===currentManagedUserId,role=managedUserRoles[user.role];
    const roleControl=current?'<span class="account-user-badge">Admin</span>':`<select aria-label="Rolle für ${escapeManagedUserText(user.name)}" onchange="setManagedUserRole('${user.id}',this.value)"${canManageDemoUsers()?'':' disabled'}>${managedRoleOptions(user.role)}</select>`;
    return `<tr><td><strong>${escapeManagedUserText(user.name)}</strong><small>${current?'Angemeldet · aktuelles Konto':user.email?escapeManagedUserText(user.email):'Benutzerprofil'}</small></td><td>${roleControl}</td><td class="account-user-access">${role.access}</td></tr>`;
  }).join('');
  document.getElementById('account-users-count').textContent=managedUsers.length+' Benutzer';
  document.getElementById('account-new-user-button').disabled=!canManageDemoUsers();
}
function setManagedUserRole(id,role){
  if(!canManageDemoUsers()||id===currentManagedUserId||!Object.hasOwn(managedUserRoles,role))return;
  const user=managedUsers.find(user=>user.id===id);if(!user)return;
  user.role=role;const saved=storeManagedUsers();renderManagedUsers();
  document.getElementById('account-users-status').textContent=saved?`Rolle für ${user.name} gespeichert.`:'Rolle für diese Sitzung übernommen. Der Browser erlaubt kein lokales Speichern.';
}
function showNewManagedUserForm(){
  if(!canManageDemoUsers())return;
  document.getElementById('account-new-user-form').hidden=false;
  document.getElementById('account-new-user-name').focus();
}
function closeNewManagedUserForm(){
  const form=document.getElementById('account-new-user-form');form.hidden=true;form.reset();
  document.getElementById('account-new-user-button').focus();
}
function createManagedUser(event){
  event.preventDefault();if(!canManageDemoUsers())return;
  const form=document.getElementById('account-new-user-form'),name=document.getElementById('account-new-user-name');
  name.value=name.value.trim();if(!form.reportValidity())return;
  const role=document.getElementById('account-new-user-role').value;if(!Object.hasOwn(managedUserRoles,role))return;
  let id='user-'+Date.now().toString(36);while(managedUsers.some(user=>user.id===id))id+='-1';
  managedUsers.push({id,name:name.value.slice(0,80),email:document.getElementById('account-new-user-email').value.trim().slice(0,160),role});
  const saved=storeManagedUsers();renderManagedUsers();closeNewManagedUserForm();
  document.getElementById('account-users-status').textContent=saved?'Benutzerprofil angelegt.':'Benutzerprofil für diese Sitzung angelegt. Der Browser erlaubt kein lokales Speichern.';
}

// Native horizontale Touch-Bewegung mit iPad-Nachlauf; Zeitleiste und Aufgaben scrollen gemeinsam.
function enableScheduleSwipe(){
  const viewport=document.getElementById('schedule-viewport');
  viewport.addEventListener('scroll',()=>{
    if(scheduleScrollFrame)return;
    scheduleScrollFrame=requestAnimationFrame(()=>{
      scheduleScrollFrame=0;
      const maxScroll=viewport.scrollWidth-viewport.clientWidth;
      if(maxScroll<=0)return;
      scheduleOffset=Math.max(0,Math.min(scheduleTotalMinutes-scheduleSpan,Math.round(viewport.scrollLeft/maxScroll*(scheduleTotalMinutes-scheduleSpan))));
      updateScheduleChrome();
    });
  },{passive:true});
  viewport.addEventListener('keydown',event=>{
    if(event.target!==viewport||event.altKey||event.ctrlKey||event.metaKey)return;
    const targets={ArrowLeft:scheduleOffset-120,ArrowRight:scheduleOffset+120,PageUp:scheduleOffset-scheduleSpan,PageDown:scheduleOffset+scheduleSpan,Home:0,End:scheduleTotalMinutes-scheduleSpan};
    if(!Object.hasOwn(targets,event.key))return;
    event.preventDefault();seekSchedule(targets[event.key]);
  });
  new ResizeObserver(resizeScheduleViewport).observe(viewport);
}
enableScheduleSwipe();

// Zuweisung aus der Aufgabendetailansicht: bestehendes Gespann oder Fahrzeug + Gerät.
function taskAssignmentContents(task){
  const state=taskAssignment,units=activeTaskCombinations(task),newMode=state.mode==='new';
  const existing=units.length?units.map(unit=>{
    const selected=state.robotId===unit.robot.id&&state.implementId===unit.implementId;
    const toolName=unit.implementId==='integrated'?'Integrierte Hackeinheit':fleetImplements.find(tool=>tool.id===unit.implementId).name;
    const queue=dispatchTasks.filter(job=>job.robot===unit.robot.id&&job.id!==task.id).length;
    return `<label class="task-unit-card"><input type="radio" name="task-assignment-existing" value="${unit.robot.id}"${selected?' checked':''} onchange="selectExistingTaskUnit(${unit.robot.id})"><span><strong>${unit.robot.name}</strong><span>${toolName}</span><small>Im Einsatz · ${data.find(r=>r.id===unit.robot.id).area} · ${queue} Aufgaben eingeplant</small></span></label>`;
  }).join(''):'<p class="task-assignment-note">Kein passendes aktives Gespann vorhanden.</p><button type="button" class="task-assignment-secondary" onclick="setTaskAssignmentMode(\'new\')">Zugfahrzeug und Gerät auswählen</button>';
  const vehicle=compatibleRobots(task).find(robot=>robot.id===state.robotId);
  const tools=compatibleTaskImplements(task);
  const toolOptions=vehicle?.fixed?'<option value="integrated" selected>Integrierte Hackeinheit</option>':'<option value="">Anbaugerät wählen …</option>'+tools.map(tool=>{
    const conflict=vehicle?taskImplementConflict(task,vehicle.id,tool.id):'';
    return `<option value="${tool.id}"${state.implementId===tool.id?' selected':''}${conflict?' disabled':''}>${tool.name}${tool.width?' · '+tool.width:''}${conflict?' · '+conflict:''}</option>`;
  }).join('');
  return `<h2>Gespann zuweisen</h2><p class="task-assignment-note">Die Aufgabe wird hinter den bereits geplanten Aufgaben des Fahrzeugs angehängt.</p><div class="task-assignment-modes" role="group" aria-label="Gespannauswahl"><button id="task-unit-mode-existing" type="button" aria-pressed="${!newMode}" onclick="setTaskAssignmentMode('existing')">Aktuelles Gespann</button><button id="task-unit-mode-new" type="button" aria-pressed="${newMode}" onclick="setTaskAssignmentMode('new')">Gespann zusammenstellen</button></div><div class="task-assignment-mode-pane"${newMode?' hidden':''}>${existing}</div><div class="task-assignment-mode-pane"${newMode?'':' hidden'}><label class="task-assignment-label">Zugfahrzeug<select id="task-unit-vehicle" onchange="selectTaskAssignmentVehicle(this.value)"><option value="">Fahrzeug wählen …</option>${compatibleRobots(task).map(robot=>`<option value="${robot.id}"${state.robotId===robot.id?' selected':''}>${robot.name} · ${robot.type}</option>`).join('')}</select></label><label class="task-assignment-label">Anbaugerät<select id="task-unit-implement" onchange="selectTaskAssignmentImplement(this.value)"${!vehicle||vehicle.fixed?' disabled':''}>${toolOptions}</select></label><p class="task-assignment-note">Es werden passende Geräte angeboten. Bereits an anderen Fahrzeugen angebaute oder dafür eingeplante Geräte sind nicht auswählbar.</p></div><p id="task-assignment-summary" class="task-assignment-summary"></p><p id="task-assignment-validation" class="task-assignment-validation" role="status"></p><button id="task-assignment-save" type="button" class="primary" onclick="confirmTaskAssignment()" disabled>An Auftragsliste anhängen</button>`;
}
function refreshTaskAssignment(focusId=null){
  const task=dispatchTasks.find(job=>job.id===taskOverviewId),panel=document.getElementById('task-assignment-panel');
  if(!task||!panel)return;
  panel.innerHTML=taskAssignmentContents(task);panel.hidden=!taskAssignment.expanded;
  updateTaskAssignmentSummary();
  if(focusId)document.getElementById(focusId)?.focus();
}
function openTaskAssignment(){
  if(userDemoSignedOut||!dispatchTasks.some(task=>task.id===taskOverviewId))return;
  taskAssignment.expanded=true;refreshTaskAssignment();
  document.getElementById('task-assignment-panel').scrollIntoView({block:'start',behavior:userAccount.reduceMotion?'auto':'smooth'});
  document.getElementById('task-unit-mode-'+taskAssignment.mode).focus({preventScroll:true});
}
function setTaskAssignmentMode(mode){
  if(!['new','existing'].includes(mode))return;
  taskAssignment.mode=mode;taskAssignment.robotId=null;taskAssignment.implementId=null;
  refreshTaskAssignment('task-unit-mode-'+mode);
}
function selectExistingTaskUnit(robotId){
  const task=dispatchTasks.find(job=>job.id===taskOverviewId);if(!task)return;
  const unit=activeTaskCombinations(task).find(item=>item.robot.id===robotId);if(!unit)return;
  taskAssignment.robotId=unit.robot.id;taskAssignment.implementId=unit.implementId;updateTaskAssignmentSummary();
}
function selectTaskAssignmentVehicle(value){
  const task=dispatchTasks.find(job=>job.id===taskOverviewId);if(!task)return;
  const vehicle=compatibleRobots(task).find(robot=>robot.id===Number(value));
  taskAssignment.robotId=vehicle?.id||null;taskAssignment.implementId=vehicle?.fixed?'integrated':null;
  refreshTaskAssignment('task-unit-vehicle');
}
function selectTaskAssignmentImplement(id){taskAssignment.implementId=id||null;updateTaskAssignmentSummary();}
function updateTaskAssignmentSummary(){
  const task=dispatchTasks.find(job=>job.id===taskOverviewId);if(!task)return;
  const valid=validTaskCombination(task,taskAssignment.robotId,taskAssignment.implementId);
  const button=document.getElementById('task-assignment-save');if(!button)return;
  button.disabled=!valid;
  const summary=document.getElementById('task-assignment-summary');
  if(!valid){summary.textContent='Wähle ein passendes Gespann für diese Aufgabe.';return;}
  const robot=dispatchRobots.find(r=>r.id===taskAssignment.robotId),queue=dispatchTasks.filter(job=>job.robot===robot.id&&job.id!==task.id);
  const tool=taskAssignment.implementId==='integrated'?'Integrierte Hackeinheit':fleetImplements.find(tool=>tool.id===taskAssignment.implementId).name;
  summary.textContent=`${robot.name} + ${tool} · Position ${queue.length+1} am Listenende${queue.length?' · nach '+queue.length+' geplanten Aufgaben':''}.`;
}
function confirmTaskAssignment(){
  const task=dispatchTasks.find(job=>job.id===taskOverviewId);if(!task||userDemoSignedOut)return;
  const robotId=taskAssignment.robotId,implementId=taskAssignment.implementId;
  if(!validTaskCombination(task,robotId,implementId)||!assignDispatchTask(task.id,robotId,implementId)){
    document.getElementById('task-assignment-validation').textContent='Das Gespann passt nicht mehr zur Aufgabe oder das Gerät ist anderweitig eingeplant. Bitte erneut auswählen.';return;
  }
  taskAssignment.expanded=false;renderTaskOverview(task.id);
  const position=dispatchTasks.filter(job=>job.robot===robotId).findIndex(job=>job.id===task.id)+1;
  document.getElementById('task-assignment-status').textContent=`Aufgabe an Position ${position} bei ${robotDisplayName(robotId)} angehängt.`;
}

// Lokaler Planvorschlag: Prioritäten, Geräte bündeln und kurze Fahrten. Keine globale Optimalitätsgarantie.
function copyDispatchTasks(tasks){return tasks.map(task=>({...task}));}
function robotAvailableForSuggestion(robot){return data.find(r=>r.id===robot.id)?.alert?.severity!=='error'&&fleetOperatingStates[robot.id]?.kind!=='maintenance';}
function dispatchPlanMetrics(tasks){
  let setup=0,drive=0,km=0,work=0,end=480,urgency=0,invalid=0;
  const baseDate=new Date(dispatchDate+'T12:00:00').getTime();
  dispatchRobots.forEach(robot=>{
    const jobs=tasks.filter(task=>task.robot===robot.id);if(!jobs.length)return;
    if(!robotAvailableForSuggestion(robot))invalid+=jobs.length*100000;
    jobs.forEach(task=>{if(!validTaskCombination(task,robot.id,task.implementId,tasks))invalid+=1000000;});
    const schedule=buildRobotSchedule(robot,jobs);end=Math.max(end,schedule.end);
    schedule.segments.forEach(segment=>{
      if(segment.kind==='setup')setup+=segment.duration;
      if(segment.kind==='drive'){drive+=segment.duration;km+=segment.route.km;}
      if(segment.kind==='work'){
        work+=segment.duration;
        urgency+=Math.max(0,segment.start-480)*({immediate:20,week:3,month:1,flexible:.15}[segment.task.priority]??.15);
        const due=taskDeadline(segment.task);
        if(due){const limit=(new Date(due+'T12:00:00').getTime()-baseDate)/86400000*1440+1020;urgency+=Math.max(0,segment.start+segment.duration-limit)*25;}
      }
    });
  });
  const unassigned=tasks.filter(task=>!task.robot).length;
  return {setup,drive,km,work,end,unassigned,assigned:tasks.length-unassigned,score:unassigned*1000000+invalid+setup*3+drive+Math.max(0,end-480)*.2+urgency};
}
function candidatePlanTools(task,robot,tasks){
  const ids=robot.fixed?['integrated']:[task.implementId,fleetMountedImplements[robot.id],...tasks.filter(job=>job.robot===robot.id).map(job=>job.implementId),...compatibleTaskImplements(task).map(tool=>tool.id)];
  return [...new Set(ids.filter(Boolean))].filter(id=>validTaskCombination(task,robot.id,id,tasks));
}
function insertDispatchPlanTask(tasks,task,robotId,implementId,index){
  const next={...task,robot:robotId,implementId};
  const tool=fleetImplements.find(item=>item.id===implementId);if(tool?.width)next.workingWidth=parseFloat(tool.width.replace(',','.'));
  const queue=tasks.filter(job=>job.robot===robotId),before=queue[index];
  const result=[...tasks],position=before?result.findIndex(job=>job.id===before.id):result.length;
  result.splice(position,0,next);return result;
}
function suggestDispatchTasks(source,budget=2200){
  const priorities={immediate:0,week:1,month:2,flexible:3};
  const ordered=copyDispatchTasks(source).sort((a,b)=>(priorities[a.priority]??3)-(priorities[b.priority]??3)||(taskDeadline(a)||'9999').localeCompare(taskDeadline(b)||'9999')||dispatchEquipment(a).localeCompare(dispatchEquipment(b),'de')||a.id-b.id);
  let evaluations=0,greedy=[];
  const robots=dispatchRobots.filter(robotAvailableForSuggestion);
  // Zunächst jede Aufgabe an der günstigsten Stelle eines passenden Gespanns einfügen.
  for(const task of ordered){
    let best=null,bestScore=Infinity;
    for(const robot of robots){
      const count=greedy.filter(job=>job.robot===robot.id).length;
      for(const gear of candidatePlanTools(task,robot,greedy))for(let position=0;position<=count;position++){
        if(evaluations++>=budget)break;
        const candidate=insertDispatchPlanTask(greedy,task,robot.id,gear,position),score=dispatchPlanMetrics(candidate).score;
        if(score<bestScore-.0001){best=candidate;bestScore=score;}
      }
    }
    if(!best&&evaluations>=budget){
      const fallback=[...robots].sort((a,b)=>greedy.filter(job=>job.robot===a.id).length-greedy.filter(job=>job.robot===b.id).length).map(robot=>({robot,gear:candidatePlanTools(task,robot,greedy)[0]})).find(unit=>unit.gear);
      if(fallback)best=insertDispatchPlanTask(greedy,task,fallback.robot.id,fallback.gear,greedy.filter(job=>job.robot===fallback.robot.id).length);
    }
    if(best)greedy=best;else{const pending={...task,robot:null};delete pending.implementId;greedy.push(pending);}
  }
  let best=copyDispatchTasks(source),bestScore=dispatchPlanMetrics(best).score;
  if(dispatchPlanMetrics(greedy).score<bestScore-.0001){best=greedy;bestScore=dispatchPlanMetrics(best).score;}
  // Begrenzte lokale Verbesserung: Reihenfolge, Fahrzeug und konkretes Gerät gemeinsam bewerten.
  for(let pass=0;pass<3&&evaluations<budget;pass++){
    let improved=false;
    for(const id of ordered.map(task=>task.id)){
      const task=best.find(job=>job.id===id),remaining=best.filter(job=>job.id!==id);
      let improvedPlan=null,improvedScore=bestScore;
      for(const robot of robots){
        const count=remaining.filter(job=>job.robot===robot.id).length;
        for(const gear of candidatePlanTools(task,robot,remaining))for(let position=0;position<=count;position++){
          if(evaluations++>=budget)break;
          const candidate=insertDispatchPlanTask(remaining,task,robot.id,gear,position),score=dispatchPlanMetrics(candidate).score;
          if(score<improvedScore-.0001){improvedPlan=candidate;improvedScore=score;}
        }
      }
      if(improvedPlan){best=improvedPlan;bestScore=improvedScore;improved=true;}
      if(evaluations>=budget)break;
    }
    if(!improved)break;
  }
  return best;
}
function syncDispatchPlanControls(){
  document.querySelectorAll('[data-plan-suggestion]').forEach(button=>{
    button.textContent=planProposalSnapshot?'Vorschlag zurücksetzen':'✧ KI-Vorschlag';
    button.setAttribute('aria-pressed',String(Boolean(planProposalSnapshot)));
    button.title=planProposalSnapshot?'Ursprünglichen Plan wiederherstellen':'Demo-Vorschlag nach Priorität, Geräten und Fahrwegen erstellen';
  });
  const accept=document.getElementById('accept-plan');
  accept.textContent=planAccepted?'Plan gespeichert ✓':'Einsatzplan übernehmen';
  accept.disabled=planAccepted||(!dispatchTasks.some(task=>task.robot)&&!committedDispatchPlan?.tasks.some(task=>task.robot));

}
function toggleDispatchSuggestion(fromOverview=false){
  if(userDemoSignedOut)return;
  clearPlanEditUndo();
  cancelPlanDrag();
  if(planProposalSnapshot){
    const snapshot=planProposalSnapshot,known=new Set(snapshot.tasks.map(task=>task.id));
    const added=dispatchTasks.filter(task=>!known.has(task.id)).map(task=>{const copy={...task,robot:null};delete copy.implementId;return copy;});
    dispatchTasks.splice(0,dispatchTasks.length,...copyDispatchTasks(snapshot.tasks),...added);
    selectedDispatchRobot=snapshot.selectedRobot;selectedDispatchTask=snapshot.selectedTask;
    scheduleOffset=snapshot.offset;scheduleSpan=snapshot.span;document.getElementById('schedule-scale').value=scheduleSpan;
    planAccepted=snapshot.accepted&&!added.length;planProposalSnapshot=null;
    document.getElementById('plan-status').textContent=added.length?'Ursprünglicher Plan wiederhergestellt · Neue Aufgaben bleiben offen':snapshot.status;
    renderDispatch();
  }else{
    if(!dispatchTasks.length)return;
    planProposalSnapshot={tasks:copyDispatchTasks(dispatchTasks),accepted:planAccepted,selectedRobot:selectedDispatchRobot,selectedTask:selectedDispatchTask,offset:scheduleOffset,span:scheduleSpan,status:document.getElementById('plan-status').textContent};
    const proposed=suggestDispatchTasks(dispatchTasks);
    dispatchTasks.splice(0,dispatchTasks.length,...proposed);
    selectedDispatchRobot=dispatchTasks.find(task=>task.robot)?.robot||selectedDispatchRobot;selectedDispatchTask=null;
    markPlanDraft('KI-Vorschlag · Demo · Prioritäten, Gerätewechsel und Fahrwege berücksichtigt');renderDispatch();
  }
  if(fromOverview)location.hash='auftragsverwaltung';
}
function validDispatchDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(new Date(value+'T12:00:00').getTime())&&new Date(value+'T12:00:00').toISOString().slice(0,10)===value;}
function sanitizeStoredDispatchTask(task){
  if(!task||!Number.isInteger(task.id)||task.id<1||!fields.some(field=>field.id===task.field)||!['Grubbern','Grubbern tief','Grubbern flach','Säen','Hacken','Striegeln'].includes(task.operation))return null;
  const robot=task.robot==null?null:dispatchRobots.find(robot=>robot.id===task.robot)?.id;
  if(task.robot!=null&&!robot)return null;
  const copy={id:task.id,field:task.field,operation:task.operation,robot};
  if(robot){if(task.implementId!=='integrated'&&!fleetImplements.some(tool=>tool.id===task.implementId))return null;copy.implementId=task.implementId;}
  const limits={speed:50,depth:100,workingWidth:50,seedRate:100000000,direction:359,bearingDegrees:359,headlandPasses:8,tramlineSpacing:100};
  for(const [key,limit] of Object.entries(limits))if(Number.isFinite(task[key])&&task[key]>=0&&task[key]<=limit)copy[key]=task[key];
  if(typeof task.crop==='string')copy.crop=task.crop.slice(0,100).replace(/[<>&"']/g,'');
  if(Object.hasOwn(taskPriorities,task.priority))copy.priority=task.priority;
  for(const key of ['createdOn','dueDate'])if(validDispatchDate(task[key]))copy[key]=task[key];
  if(typeof task.applicationMap==='boolean')copy.applicationMap=task.applicationMap;
  return copy;
}
function loadCommittedDispatchPlan(){
  try{
    const saved=JSON.parse(localStorage.getItem(dispatchPlanStorageKey)||'null');
    if(!saved||saved.version!==1||!validDispatchDate(saved.date)||!Array.isArray(saved.tasks)||!saved.tasks.length||saved.tasks.length>200)return false;
    const tasks=saved.tasks.map(sanitizeStoredDispatchTask);
    if(tasks.some(task=>!task)||new Set(tasks.map(task=>task.id)).size!==tasks.length||tasks.some(task=>task.robot&&!validTaskCombination(task,task.robot,task.implementId,tasks)))return false;
    if(!tasks.some(task=>task.robot)&&!(saved.transferMode==='simulation'&&Array.isArray(saved.transmissions)&&saved.transmissions.length))return false;
    dispatchTasks.splice(0,dispatchTasks.length,...tasks);dispatchDate=saved.date;
    planAccepted=true;committedDispatchPlan=saved;planProposalSnapshot=null;
    selectedDispatchRobot=tasks.find(task=>task.robot)?.robot||dispatchRobots[0].id;
    document.getElementById('plan-status').textContent='Gespeicherter Plan geladen · Übertragung an Roboter simuliert';
    return true;
  }catch{return false;}
}
function acceptDispatchPlan(){
  if(userDemoSignedOut||planAccepted)return false;
  const tasks=copyDispatchTasks(dispatchTasks),assigned=tasks.filter(task=>task.robot);
  if(!assigned.length&&!committedDispatchPlan?.tasks.some(task=>task.robot))return false;
  if(assigned.some(task=>!validTaskCombination(task,task.robot,task.implementId,tasks))){document.getElementById('plan-status').textContent='Plan nicht übernommen · Gespannzuweisungen prüfen';return false;}
  const acceptedAt=new Date().toISOString();
  const transmissions=dispatchRobots.filter(robot=>tasks.some(task=>task.robot===robot.id)||committedDispatchPlan?.tasks.some(task=>task.robot===robot.id)).map(robot=>({robotId:robot.id,status:'simulated',tasks:tasks.filter(task=>task.robot===robot.id).map(task=>task.id),segments:buildRobotSchedule(robot,tasks.filter(task=>task.robot===robot.id)).segments.map(segment=>({kind:segment.kind,start:segment.start,duration:segment.duration,taskId:segment.task.id,equipment:dispatchTaskToolName(segment.task),...(segment.route?{route:segment.route}:{} )}))}));
  const saved={version:1,date:dispatchDate,acceptedAt,tasks,transferMode:'simulation',transmissions};
  try{localStorage.setItem(dispatchPlanStorageKey,JSON.stringify(saved));}catch{document.getElementById('plan-status').textContent='Plan konnte lokal nicht gespeichert werden · Nicht übernommen';return false;}
  committedDispatchPlan=saved;planAccepted=true;planProposalSnapshot=null;clearPlanEditUndo();
  document.getElementById('plan-status').textContent=`Plan gespeichert · Übertragung an ${transmissions.length} Roboter simuliert · Keine Live-Verbindung`;
  syncDispatchPlanControls();return true;
}
function planDropEquipment(task,robotId,tasks=dispatchTasks){
  const robot=dispatchRobots.find(robot=>robot.id===robotId);if(!robot)return null;
  const preferred=[...tasks.filter(job=>job.robot===robotId&&job.id!==task.id)].reverse().map(job=>job.implementId);
  const ids=robot.fixed?['integrated']:[...preferred,fleetMountedImplements[robotId],task.implementId,...compatibleTaskImplements(task).map(tool=>tool.id)];
  return [...new Set(ids.filter(Boolean))].find(id=>validTaskCombination(task,robotId,id,tasks))||null;
}
function moveTaskInPlan(taskId,robotId,beforeTaskId=null){
  if(userDemoSignedOut)return false;
  const task=dispatchTasks.find(task=>task.id===taskId);if(!task)return false;
  if(beforeTaskId===taskId)return true;
  const remaining=dispatchTasks.filter(job=>job.id!==taskId),gear=planDropEquipment(task,robotId,remaining);
  if(!gear){document.getElementById('plan-edit-message').textContent='Verschieben nicht möglich: kein passendes freies Gespann für dieses Fahrzeug.';return false;}
  const queue=remaining.filter(job=>job.robot===robotId);
  const index=beforeTaskId===null?queue.length:queue.findIndex(job=>job.id===beforeTaskId);if(index<0)return false;
  const next=insertDispatchPlanTask(remaining,task,robotId,gear,index);
  dispatchTasks.splice(0,dispatchTasks.length,...next);selectedDispatchRobot=robotId;selectedDispatchTask=taskId;
  markPlanDraft('Aufgabe verschoben · Rüstzeiten und Straßenfahrten neu berechnet');renderDispatch();
  document.getElementById('plan-edit-message').textContent=`${fields.find(field=>field.id===task.field).name} → ${robotShortName(robotId)} · Position ${index+1}`;
  return true;
}

// Prototyp-Ansicht: Karte ausblenden und Aufgaben per Halten aufnehmen.
function toggleDispatchMap(){
  const hidden=document.getElementById('auftragsverwaltung').classList.toggle('dispatch-map-hidden');
  document.getElementById('dispatch-map-toggle').setAttribute('aria-expanded',String(!hidden));
  document.getElementById('dispatch-map-toggle-label').textContent=hidden?'Karte einblenden':'Karte ausblenden';
  requestAnimationFrame(resizeScheduleViewport);
}
function clearPlanEditUndo(){planEditUndo=null;const feedback=document.getElementById('plan-action-feedback');if(feedback)feedback.hidden=true;}
function applyPlanTaskAction(taskId,action){
  if(userDemoSignedOut||!['storage','delete'].includes(action))return false;
  const index=dispatchTasks.findIndex(task=>task.id===taskId);if(index<0)return false;
  const task=dispatchTasks[index],record={task:{...task},index,accepted:planAccepted,status:document.getElementById('plan-status').textContent,action};
  if(action==='delete')dispatchTasks.splice(index,1);else{task.robot=null;delete task.implementId;}
  selectedDispatchTask=null;
  markPlanDraft(action==='delete'?'Aufgabe gelöscht · Planentwurf geändert':'Aufgabe zurück im Aufgabenspeicher');renderDispatch();
  planEditUndo=record;
  const label=fields.find(field=>field.id===record.task.field).name+' · '+record.task.operation;
  document.getElementById('plan-action-feedback-text').textContent=label+(action==='delete'?' gelöscht.':' im Aufgabenspeicher.');
  document.getElementById('plan-action-feedback').hidden=false;
  document.getElementById('plan-edit-message').textContent=action==='delete'?'Aufgabe gelöscht – Rückgängig möglich.':'Aufgabe in den Aufgabenspeicher zurückgelegt.';
  return true;
}
function undoPlanTaskAction(){
  if(!planEditUndo||userDemoSignedOut)return;
  const undo=planEditUndo,current=dispatchTasks.findIndex(task=>task.id===undo.task.id);
  if(current>=0)dispatchTasks.splice(current,1);
  dispatchTasks.splice(Math.min(undo.index,dispatchTasks.length),0,{...undo.task});
  clearPlanEditUndo();planAccepted=undo.accepted;
  document.getElementById('plan-status').textContent=undo.status;renderDispatch();
  document.getElementById('plan-edit-message').textContent='Letzte Aktion rückgängig gemacht.';
}
function clearPlanDropHighlight(){document.querySelectorAll('.plan-drop-target,.plan-drop-invalid,.plan-drop-before').forEach(node=>node.classList.remove('plan-drop-target','plan-drop-invalid','plan-drop-before'));}
function planTargetAt(x,y,taskId){
  const hit=document.elementFromPoint(x,y),action=hit?.closest('[data-plan-drop-action]');
  if(action&&!document.getElementById('plan-drop-dock').hidden&&dispatchTasks.some(task=>task.id===taskId))return {action:action.dataset.planDropAction,element:action,valid:true};
  const row=hit?.closest('[data-drop-robot]');
  if(!row||!document.getElementById('schedule-viewport').contains(row))return null;
  const robotId=Number(row.dataset.dropRobot),task=dispatchTasks.find(task=>task.id===taskId),robot=dispatchRobots.find(robot=>robot.id===robotId);if(!task||!robot)return null;
  const remaining=dispatchTasks.filter(job=>job.id!==taskId),gear=planDropEquipment(task,robotId,remaining);
  const lane=row.querySelector('.timeline-lane'),rect=lane.getBoundingClientRect();
  const minute=(x-rect.left)/Math.max(1,rect.width)*scheduleTotalMinutes;
  const work=buildRobotSchedule(robot).segments.filter(segment=>segment.kind==='work'&&segment.task.id!==taskId);
  const before=hit.closest('.timeline-robot-label')?null:work.find(segment=>minute<segment.start+segment.duration/2)?.task.id??null;
  return {row,robotId,beforeTaskId:before,valid:Boolean(gear)};
}
function updatePlanDragTarget(x,y){
  if(!planDragState)return;
  planDragState.x=x;planDragState.y=y;planDragState.target=planTargetAt(x,y,planDragState.taskId);
  clearPlanDropHighlight();
  const target=planDragState.target;
  if(target){
    (target.element||target.row).classList.add(target.valid?'plan-drop-target':'plan-drop-invalid');
    if(target.valid&&!target.action&&target.beforeTaskId!==null)target.row.querySelector(`[data-drag-task="${target.beforeTaskId}"]`)?.classList.add('plan-drop-before');
  }
  if(planDragState.ghost){
    planDragState.ghost.style.left=Math.min(x+14,Math.max(8,window.innerWidth-240))+'px';
    planDragState.ghost.style.top=Math.max(8,Math.min(y-70,window.innerHeight-90))+'px';
    const caption=target?.action==='storage'?'Zurück in den Aufgabenspeicher':target?.action==='delete'?'Zum Löschen loslassen':target?(target.valid?robotShortName(target.robotId)+' · '+(target.beforeTaskId===null?'ans Listenende':'vor Aufgabe '+target.beforeTaskId):'Kein passendes Gespann'):'Fahrzeug oder Ablagefläche wählen';
    planDragState.ghost.querySelector('small').textContent=caption;
    planDragState.ghost.classList.toggle('is-invalid',Boolean(target&&!target.valid));
    planDragState.ghost.classList.toggle('is-delete',target?.action==='delete');
  }
}
function beginPlanDrag(){
  const drag=planDragState;if(!drag||drag.active)return;
  if(drag.holdTimer)clearTimeout(drag.holdTimer);
  drag.active=true;drag.block?.classList.remove('plan-hold-pending');drag.block?.classList.add('plan-drag-source');
  document.body.classList.add('plan-is-dragging');document.getElementById('plan-drop-dock').hidden=false;
  document.getElementById('plan-edit-message').textContent='Aufgabe aufgenommen · Verschieben, zurücklegen oder löschen';
  if(!drag.native){
    const task=dispatchTasks.find(task=>task.id===drag.taskId),ghost=document.createElement('div');ghost.className='plan-drag-ghost';
    const title=document.createElement('strong'),caption=document.createElement('small');title.textContent=fields.find(field=>field.id===task.field).name+' · '+task.operation;
    ghost.append(title,caption);document.body.append(ghost);drag.ghost=ghost;
  }
  updatePlanDragTarget(drag.x,drag.y);planDragFrame=requestAnimationFrame(planDragAutoScroll);
}
function planDragAutoScroll(){
  planDragFrame=0;if(!planDragState?.active)return;
  const viewport=document.getElementById('schedule-viewport'),box=viewport.getBoundingClientRect(),{x,y}=planDragState;
  if(x>=box.left&&x<=box.right&&y>=box.top&&y<=box.bottom){
    if(x>box.right-32)viewport.scrollLeft+=12;else if(x<box.left+32)viewport.scrollLeft-=12;
    if(y>box.bottom-32)viewport.scrollTop+=9;else if(y<box.top+32)viewport.scrollTop-=9;
    updatePlanDragTarget(x,y);
  }
  planDragFrame=requestAnimationFrame(planDragAutoScroll);
}
function cancelPlanDrag(blockClick=false){
  const drag=planDragState;planDragState=null;
  if(drag?.holdTimer)clearTimeout(drag.holdTimer);
  if(planDragFrame){cancelAnimationFrame(planDragFrame);planDragFrame=0;}
  if(blockClick)planClickBlockedUntil=performance.now()+450;
  drag?.ghost?.remove();clearPlanDropHighlight();document.body.classList.remove('plan-is-dragging');
  document.getElementById('plan-drop-dock').hidden=true;
  document.querySelectorAll('.plan-drag-source,.plan-hold-pending').forEach(node=>node.classList.remove('plan-drag-source','plan-hold-pending'));
  if(drag?.active)document.getElementById('plan-edit-message').textContent='↔ Wischen · Aufgabe kurz halten zum Verschieben';
  const viewport=document.getElementById('schedule-viewport');
  if(drag?.pointerId!==undefined&&viewport.hasPointerCapture(drag.pointerId))viewport.releasePointerCapture(drag.pointerId);
}
function finishPlanDrop(){
  const drag=planDragState,target=drag?.target;cancelPlanDrag(Boolean(drag?.active));
  if(!drag?.active)return;
  if(!target||!target.valid){document.getElementById('plan-edit-message').textContent=target?'Dieses Fahrzeug hat kein passendes Gespann.':'Verschieben abgebrochen.';return;}
  if(target.action){applyPlanTaskAction(drag.taskId,target.action);return;}
  moveTaskInPlan(drag.taskId,target.robotId,target.beforeTaskId);
}
function setupDispatchDragging(){
  const viewport=document.getElementById('schedule-viewport'),dock=document.getElementById('plan-drop-dock');
  viewport.addEventListener('click',event=>{if(performance.now()<planClickBlockedUntil&&event.target.closest('.time-block')){event.preventDefault();event.stopImmediatePropagation();}},true);
  viewport.addEventListener('contextmenu',event=>{if(event.target.closest('[data-drag-task]'))event.preventDefault();});
  viewport.addEventListener('dragstart',event=>{
    const block=event.target.closest('[data-drag-task]');if(!block||userDemoSignedOut||planDragState&&!planDragState.native){event.preventDefault();return;}
    cancelPlanDrag();planDragState={taskId:Number(block.dataset.dragTask),native:true,active:false,x:event.clientX,y:event.clientY,target:null,block};
    event.dataTransfer.setData('text/plain',String(planDragState.taskId));event.dataTransfer.effectAllowed='move';beginPlanDrag();
  });
  const dragover=event=>{
    if(!planDragState?.active||!planDragState.native)return;
    event.preventDefault();updatePlanDragTarget(event.clientX,event.clientY);event.dataTransfer.dropEffect=planDragState.target?.valid?'move':'none';
  };
  const drop=event=>{if(!planDragState?.active||!planDragState.native)return;event.preventDefault();updatePlanDragTarget(event.clientX,event.clientY);finishPlanDrop();};
  [viewport,dock].forEach(node=>{node.addEventListener('dragover',dragover);node.addEventListener('drop',drop);});
  viewport.addEventListener('dragend',()=>cancelPlanDrag(Boolean(planDragState?.active)));
  // Der Griff bleibt als alternative Maus-/Stiftbedienung verfügbar.
  viewport.addEventListener('pointerdown',event=>{
    const handle=event.target.closest('.task-drag-handle'),block=handle?.closest('[data-drag-task]');
    if(!block||userDemoSignedOut||event.button!==0||!event.isPrimary)return;
    event.preventDefault();cancelPlanDrag();planDragState={taskId:Number(block.dataset.dragTask),pointerId:event.pointerId,active:false,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,target:null,block};viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',event=>{
    const drag=planDragState;if(!drag||drag.pointerId!==event.pointerId)return;
    if(!drag.active&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<6)return;
    event.preventDefault();beginPlanDrag();updatePlanDragTarget(event.clientX,event.clientY);
  },{passive:false});
  viewport.addEventListener('pointerup',event=>{if(planDragState?.pointerId===event.pointerId)finishPlanDrop();});
  viewport.addEventListener('pointercancel',event=>{if(planDragState?.pointerId===event.pointerId)cancelPlanDrag(Boolean(planDragState?.active));});
  viewport.addEventListener('lostpointercapture',event=>{if(planDragState?.pointerId===event.pointerId)cancelPlanDrag(Boolean(planDragState?.active));});
  // Ein kurzer Tipp öffnet Details; eine Wischbewegung bleibt Scrollen. Erst Halten nimmt die Aufgabe auf.
  viewport.addEventListener('touchstart',event=>{
    if(userDemoSignedOut)return;
    if(event.touches.length!==1){cancelPlanDrag(Boolean(planDragState?.active));return;}
    const block=event.target.closest('[data-drag-task]');if(!block||event.target.closest('.task-drag-handle'))return;
    cancelPlanDrag();const touch=event.touches[0];
    const drag={taskId:Number(block.dataset.dragTask),touchId:touch.identifier,active:false,startX:touch.clientX,startY:touch.clientY,x:touch.clientX,y:touch.clientY,target:null,block};
    planDragState=drag;block.classList.add('plan-hold-pending');
    drag.holdTimer=setTimeout(()=>{if(planDragState===drag)beginPlanDrag();},400);
  },{passive:true});
  viewport.addEventListener('touchmove',event=>{
    const drag=planDragState;if(!drag||drag.touchId===undefined)return;
    if(event.touches.length!==1){cancelPlanDrag(Boolean(drag.active));return;}
    const touch=[...event.touches].find(touch=>touch.identifier===drag.touchId);if(!touch)return;
    if(!drag.active){if(Math.hypot(touch.clientX-drag.startX,touch.clientY-drag.startY)>6)cancelPlanDrag();return;}
    if(event.cancelable)event.preventDefault();updatePlanDragTarget(touch.clientX,touch.clientY);
  },{passive:false});
  viewport.addEventListener('touchend',event=>{
    const drag=planDragState;if(!drag||drag.touchId===undefined)return;
    const touch=[...event.changedTouches].find(touch=>touch.identifier===drag.touchId);if(!touch)return;
    if(drag.active){if(event.cancelable)event.preventDefault();updatePlanDragTarget(touch.clientX,touch.clientY);finishPlanDrop();}else cancelPlanDrag();
  },{passive:false});
  viewport.addEventListener('touchcancel',()=>{if(planDragState?.touchId!==undefined)cancelPlanDrag(Boolean(planDragState?.active));},{passive:true});
  viewport.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&planDragState){event.preventDefault();event.stopPropagation();cancelPlanDrag(true);return;}
    if(userDemoSignedOut)return;
    const block=event.target.closest('[data-drag-task]');if(!block)return;
    const id=Number(block.dataset.dragTask),task=dispatchTasks.find(task=>task.id===id);if(!task)return;
    if(event.key==='Delete'||event.altKey&&event.key==='Backspace'){
      event.preventDefault();event.stopPropagation();applyPlanTaskAction(id,event.key==='Delete'?'delete':'storage');viewport.focus({preventScroll:true});return;
    }
    if(!event.altKey)return;
    if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();event.stopPropagation();moveDispatchTask(id,event.key==='ArrowLeft'?-1:1);}
    else if(['ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();event.stopPropagation();const options=dispatchRobots.filter(robot=>planDropEquipment(task,robot.id,dispatchTasks.filter(job=>job.id!==id))),index=options.findIndex(robot=>robot.id===task.robot);const robot=options[index+(event.key==='ArrowUp'?-1:1)];if(robot)moveTaskInPlan(id,robot.id);
    }else return;
    viewport.querySelector(`[data-drag-task="${id}"]`)?.focus({preventScroll:true});
  });
  window.addEventListener('blur',()=>cancelPlanDrag());window.addEventListener('pagehide',()=>cancelPlanDrag());window.addEventListener('hashchange',()=>cancelPlanDrag());
}
setupDispatchDragging();
