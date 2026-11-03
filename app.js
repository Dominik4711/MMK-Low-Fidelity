// Gemeinsame Kartendaten, Darstellung und Interaktionen.
const taskPriorities={immediate:{label:'Sofort',time:'So bald wie möglich'},week:{label:'Zeitnah',time:'Innerhalb einer Woche'},month:{label:'Geplant',time:'Innerhalb von vier Wochen'},flexible:{label:'Flexibel',time:'Ohne Zeitvorgabe'}};
function priorityBadge(task){const key=Object.hasOwn(taskPriorities,task.priority)?task.priority:'flexible';const p=taskPriorities[key];return `<span class="priority-badge priority-${key}" title="${p.time}"><i aria-hidden="true"></i>${p.label} · ${p.time}</span>`;}

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
    "task": "Striegeln",
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
    <text x="175" y="880" text-anchor="middle" fill="#536c5a" font-family="sans-serif" font-size="21" font-weight="600">Hof Grünpark</text>${interactive?`<g>${data.map(r=>`<g role="button" tabindex="0" aria-label="Roboter ${r.id} anzeigen" onclick="openRobot(${r.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openRobot(${r.id})}" style="cursor:pointer">
    <circle cx="${r.x*10.4}" cy="${r.y*9}" r="27" fill="${r.color}" opacity=".18"/>
    <circle cx="${r.x*10.4}" cy="${r.y*9}" r="17" fill="${r.color}" stroke="white" stroke-width="3"/>
    <text x="${r.x*10.4}" y="${r.y*9+5}" fill="white" text-anchor="middle" font-size="14" font-family="sans-serif">${r.id}</text>
    </g>`).join('')}</g>`:''}</svg>`
}
const overview=document.getElementById('overview');
overview.insertAdjacentHTML('afterbegin',landscape(0));
data.forEach(r=> {
  overview.insertAdjacentHTML('beforeend',`<button class="pin" aria-label="Roboter ${r.id} anzeigen" style="left:${r.x}%;top:${r.y}%;--pin:${r.color}" onclick="openRobot(${r.id})">${r.id}</button>`);
  document.getElementById('robots').insertAdjacentHTML('beforeend',`<article class="robot">
    <div class="robothead">
    <div class="robotname">
    <span class="roboticon">▰</span>
    <div>
    <h3>Roboter ${r.id}</h3>
    <span class="robotid">MW–00${r.id}</span>
    </div>
    </div>
    <span class="battery">
    <i>
    <b style="--b:${r.b}%;${r.b<60?'background:#d4b462':''}">
    </b>
    </i>${r.b}%</span>
    </div>
    <div class="statusline">
    <span class="badge">● &nbsp; ${r.status}</span>
    <span class="area">${r.area}</span>
    </div>
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
    <div class="map mini" aria-label="Karte für Roboter ${r.id}">${landscape(r.id)}<span class="pin" style="--pin:${r.color};left:${r.x}%;top:${r.y}%">${r.id}</span>
    <span class="maplabel">${r.area}</span>
    </div>
    <div class="robotfoot">
    <span>
    <i class="dot" style="width:5px;height:5px">
    </i>Signal stabil</span>
    <button class="detail" onclick="openRobot(${r.id})">Details ansehen &nbsp; ↗</button>
    </div>
    </article>`)
}
);
function openRobot(id) {
  const r=data.find(x=>x.id===id);
  document.getElementById('detailTitle').textContent='Roboter '+id;
  document.getElementById('detailArea').textContent=r.area+' · MW–00'+id;
  document.getElementById('detailRows').innerHTML=[['Status',r.status],['Fortschritt',r.p+' %'],['Akku',r.b+' %'],['Verbleibende Zeit',r.time]].map(([k,v])=>`<div class="dialogrow">
    <span>${k}</span>
    <strong>${v}</strong>
    </div>`).join('');
  document.getElementById('details').showModal()
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
  const requested = location.hash.slice(1) || 'home';
  const detailMatch=requested.match(/^aufgabe-(\d+)$/);
  const page = detailMatch?'aufgabendetail':['home', 'ackerschlagskarte', 'roboterverwaltung', 'auftragsverwaltung', 'arbeitsspeicher'].includes(requested) ? requested : 'home';
  const sections =  {
    home: 'home', ackerschlagskarte: 'fields', roboterverwaltung: 'roboterverwaltung', auftragsverwaltung: 'auftragsverwaltung', arbeitsspeicher: 'arbeitsspeicher', aufgabendetail: 'aufgabendetail'
  }
  ;
  Object.entries(sections).forEach(([name, id]) =>  {
    document.getElementById(id).hidden = name !== page;
  }
  );
  document.querySelectorAll('nav a').forEach(link =>  {
    const active = link.dataset.page === (['arbeitsspeicher','aufgabendetail'].includes(page)?'auftragsverwaltung':page);
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
  const proportional = container.id === 'overview' || container.id === 'dispatch-map' || container.id === 'task-route-map' || container.id === 'record-map' || container.id === 'task-overview-map';
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
document.querySelectorAll('#overview,.map.mini,.field-map').forEach(enableMap);

// Disposition: lokale, bearbeitbare Zeitplanung mit beispielhaften Dauern.
const dispatchTasks = [
  {id:1,field:2,operation:'Grubbern flach',speed:14,depth:5,robot:5},
  {id:2,field:7,operation:'Grubbern tief',speed:12,depth:20,priority:'week',robot:null},
  {id:3,field:3,operation:'Säen',robot:6},
  {id:4,field:8,operation:'Säen',priority:'month',robot:null},
  {id:5,field:1,operation:'Hacken',robot:2},
  {id:6,field:4,operation:'Hacken',robot:2}
];
const dispatchRobots=[{id:1,type:'Geräteträger'},{id:2,type:'Hackroboter',fixed:'Hacke'},{id:3,type:'Hackroboter',fixed:'Hacke'},{id:4,type:'Striegelroboter',fixed:'Striegel'},{id:5,type:'Geräteträger'},{id:6,type:'Geräteträger'}];
const dispatchDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let planAccepted=false,selectedDispatchRobot=5,selectedDispatchTask=null,scheduleOffset=360,scheduleSpan=720;
const dispatchEquipment=task=>task.operation.startsWith('Grubbern')?'Grubber':task.operation==='Säen'?'Drillmaschine':task.operation==='Striegeln'?'Striegel':'Hacke';
const dispatchType=task=>task.operation.startsWith('Grubbern')?'tillage':task.operation==='Säen'?'seed':'hoe';
const compatibleRobots=task=>dispatchRobots.filter(r=>!r.fixed||r.fixed===dispatchEquipment(task));
const dispatchDuration=task=>{const type=dispatchType(task),referenceSpeed={tillage:12,seed:10,hoe:5}[type],speed=Number(task.speed)>0?Number(task.speed):referenceSpeed;return Math.max(45,Math.round(parseFloat(fields.find(f=>f.id===task.field).area.replace(',','.'))*({tillage:17,seed:22,hoe:24}[type])*referenceSpeed/speed/5)*5);};
const minuteClock=m=>String(Math.floor((m%1440)/60)).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const durationLabel=m=>m>=60?`${Math.floor(m/60)} h${m%60?' '+m%60+' min':''}`:m+' min';
function dispatchDay(day){const d=new Date(dispatchDate+'T12:00:00');d.setDate(d.getDate()+day);return new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}).format(d);}
function datedTime(m){return dispatchDay(Math.floor(m/1440))+' · '+minuteClock(m);}
function markPlanDraft(message='Entwurf geändert · Bitte erneut übernehmen'){
  planAccepted=false;document.getElementById('plan-status').textContent=message;
  const button=document.getElementById('accept-plan');button.textContent='Einsatzplan übernehmen';button.disabled=false;
}
// Road network follows the roads and field entrances shown in the farm map.
const roadNodes={hof:[230,795],a:[285,720],b:[320,660],c:[350,600],d:[385,495],e:[435,455],f:[510,370],g:[585,300],h:[680,225],i:[735,190],j:[865,157],west:[200,330],westGate:[175,322],south:[510,635],south2:[635,650],south3:[755,685],gate4:[342,477],gate5:[435,505],gate7:[390,657],gate8:[405,354]};
const roadEdges=[['hof','a'],['a','b'],['b','c'],['c','d'],['d','e'],['e','f'],['f','g'],['g','h'],['h','i'],['i','j'],['e','west'],['west','westGate'],['c','south'],['south','south2'],['south2','south3'],['d','gate4'],['e','gate5'],['c','gate7'],['e','gate8']];
const fieldRoadNodes={1:'westGate',2:'i',3:'h',4:'gate4',5:'gate5',6:'south3',7:'gate7',8:'gate8'};
function roadRoute(fromField,toField){
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
function buildRobotSchedule(robot){
  const tasks=dispatchTasks.filter(t=>t.robot===robot.id),segments=[];let cursor=480+(robot.id===2?45:0),previousField=null,equipment=robot.fixed||null;
  tasks.forEach(task=>{
    const tool=dispatchEquipment(task);
    if(equipment!==tool){
      if(previousField){const route=roadRoute(null,previousField);segments.push({kind:'drive',start:cursor,duration:route.minutes,task,label:'Zum Hof · Gerätewechsel',route:{...route,points:[...route.points].reverse()}});cursor+=route.minutes;previousField=null;}
      segments.push({kind:'setup',start:cursor,duration:30,task,label:tool+' anbauen'});cursor+=30;equipment=tool;
    }else if(task.operation.startsWith('Grubbern')&&segments.some(s=>s.kind==='work'&&s.task.depth!==task.depth)){
      segments.push({kind:'setup',start:cursor,duration:10,task,label:'Arbeitstiefe einstellen'});cursor+=10;
    }
    const route=roadRoute(previousField,task.field);segments.push({kind:'drive',start:cursor,duration:route.minutes,task,label:'Straßenfahrt',route});cursor+=route.minutes;
    const duration=dispatchDuration(task);segments.push({kind:'work',start:cursor,duration,task,label:fields.find(f=>f.id===task.field).name});cursor+=duration;previousField=task.field;
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
    return `<tr class="task-overview-row" onclick="if(!event.target.closest('select,button,a,input'))openTaskOverview(${t.id})"><td><button class="task-open-link" onclick="openTaskOverview(${t.id})">${f.name} ↗</button><small>${f.area}${t.crop?' · '+t.crop:''}</small></td><td><button class="storage-operation task-open-link" onclick="openTaskOverview(${t.id})"><i class="task-type-dot ${dispatchType(t)}"></i>${t.operation}</button><small>${t.depth?t.depth+' cm Tiefe':t.seedRate?t.seedRate.toLocaleString('de-DE')+' Körner/ha':''}</small></td><td class="storage-duration">${durationLabel(dispatchDuration(t))}</td><td>${due?`<time datetime="${due}">${dueLabel}</time>`:`<span class="no-deadline">${dueLabel}</span>`}${priorityBadge(t)}</td><td><select aria-label="Roboter für ${f.name}" onchange="assignDispatchTask(${t.id},Number(this.value))"><option value="">Roboter wählen …</option>${compatibleRobots(t).map(r=>`<option value="${r.id}">Roboter ${r.id} · ${r.type}</option>`).join('')}</select></td></tr>`;
  }).join(''):(all.length?`<tr><td colspan="5"><div class="storage-empty"><strong>Keine offenen Aufgaben für ${storageTaskFilter}</strong><p>Wähle eine andere Arbeitsart oder zeige alle Aufgaben an.</p><button class="suggest-button" onclick="setStorageFilter('Alle')">Alle Aufgaben anzeigen</button></div></td></tr>`:'<tr><td colspan="5"><div class="storage-empty"><strong>Alles eingeplant ✓</strong><p>Keine offenen Aufgaben im Arbeitsspeicher.</p><a href="#auftragsverwaltung">Zurück zur Disposition →</a></div></td></tr>');
}
function renderDispatch(){
  const pending=dispatchTasks.filter(t=>!t.robot);
  document.getElementById('buffer-count').textContent=pending.length;
  document.getElementById('open-task-count').textContent=pending.length;
  document.getElementById('buffer-area').textContent=pending.reduce((sum,t)=>sum+parseFloat(fields.find(f=>f.id===t.field).area.replace(',','.')),0).toFixed(1).replace('.',',')+' ha noch zuzuweisen';
  renderStoredTasks();
  renderSchedule();renderDispatchRobot();
  document.getElementById('accept-plan').disabled=planAccepted||!dispatchTasks.some(t=>t.robot);
}
function renderSchedule(){
  const end=scheduleOffset+scheduleSpan;
  document.getElementById('schedule-slider').max=4320-scheduleSpan;
  document.getElementById('schedule-slider').value=scheduleOffset;
  document.getElementById('schedule-window').textContent=minuteClock(scheduleOffset)+'–'+minuteClock(end);
  document.getElementById('schedule-date-caption').textContent=dispatchDay(Math.floor(scheduleOffset/1440))+(Math.floor((end-1)/1440)>Math.floor(scheduleOffset/1440)?' → '+dispatchDay(Math.floor((end-1)/1440)):'');
  document.getElementById('schedule-days').innerHTML=[0,1,2].map(d=>`<button class="${Math.floor(scheduleOffset/1440)===d?'selected':''}" onclick="seekSchedule(${d*1440+360})">${d===0?'Heute · ':''}${dispatchDay(d)}</button>`).join('');
  const tickStep=scheduleSpan>720?240:120,ticks=[];
  for(let t=Math.ceil(scheduleOffset/tickStep)*tickStep;t<end;t+=tickStep)ticks.push(`<span style="left:${(t-scheduleOffset)/scheduleSpan*100}%">${minuteClock(t)}${t%1440===0?'<small>'+dispatchDay(t/1440)+'</small>':''}</span>`);
  document.getElementById('schedule-ticks').innerHTML=ticks.join('');
  document.getElementById('robot-plans').innerHTML=[...dispatchRobots].sort((a,b)=>Number(dispatchTasks.some(t=>t.robot===b.id))-Number(dispatchTasks.some(t=>t.robot===a.id))||a.id-b.id).map(robot=>{
    const schedule=buildRobotSchedule(robot),jobs=schedule.tasks.length;
    const blocks=schedule.segments.filter(s=>s.start<end&&s.start+s.duration>scheduleOffset).map(s=>{const work=s.kind==='work',type=work?dispatchType(s.task):s.kind;return `<button class="time-block block-${type} ${selectedDispatchTask===s.task.id?'selected-task':''}" style="left:${(s.start-scheduleOffset)/scheduleSpan*100}%;width:${s.duration/scheduleSpan*100}%" title="${s.label} · ${minuteClock(s.start)}–${minuteClock(s.start+s.duration)} · ${durationLabel(s.duration)}" aria-label="Roboter ${robot.id}: ${s.label}, ${minuteClock(s.start)} bis ${minuteClock(s.start+s.duration)}, ${durationLabel(s.duration)}" onclick="openTaskOverview(${s.task.id})"><strong>${work?s.label:s.kind==='setup'?'Rüsten':'↗ Fahrt'}</strong>${work?'<span>'+s.task.operation+' · '+durationLabel(s.duration)+'</span>':''}</button>`;}).join('');
    return `<div class="timeline-row ${selectedDispatchRobot===robot.id?'selected':''}"><button class="timeline-robot-label" onclick="selectDispatchRobot(${robot.id})" aria-pressed="${selectedDispatchRobot===robot.id}"><strong><i style="background:${data.find(r=>r.id===robot.id).color}"></i>Roboter ${robot.id}</strong><small>${robot.type} · ${jobs} ${jobs===1?'Aufgabe':'Aufgaben'}</small></button><div class="timeline-lane">${blocks||'<span class="timeline-idle">'+(jobs?'Keine Einsätze in diesem Zeitfenster':'Bereit für Aufgaben')+'</span>'}</div></div>`;
  }).join('');
}
function selectDispatchRobot(id,task=null){selectedDispatchRobot=id;selectedDispatchTask=task;renderSchedule();renderDispatchRobot();}
function selectDispatchField(id){const task=dispatchTasks.find(t=>t.field===id&&t.robot===selectedDispatchRobot)||dispatchTasks.find(t=>t.field===id&&t.robot);if(task)selectDispatchRobot(task.robot,task.id);}
function seekSchedule(offset){scheduleOffset=Math.max(0,Math.min(4320-scheduleSpan,offset));renderSchedule();}
function assignDispatchTask(id,robot){
  const task=dispatchTasks.find(t=>t.id===id);if(!task)return;
  if(robot&&!compatibleRobots(task).some(r=>r.id===robot))return;
  task.robot=robot||null;selectedDispatchRobot=robot||selectedDispatchRobot;selectedDispatchTask=robot?id:null;
  markPlanDraft('Entwurf geändert · Zeiten wurden neu berechnet');renderDispatch();
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
  document.getElementById('route-robot-title').textContent='Roboter '+robot.id+' · '+robot.type;
  const km=drives.reduce((sum,s)=>sum+s.route.km,0),setup=schedule.segments.filter(s=>s.kind==='setup').reduce((sum,s)=>sum+s.duration,0);
  document.getElementById('route-robot-summary').textContent=schedule.tasks.length+' Aufgaben · '+km.toFixed(1).replace('.',',')+' km Straßenfahrt · '+durationLabel(setup)+' Rüsten';
  document.getElementById('route-jobs').innerHTML=schedule.tasks.map((task,index)=>{const f=fields.find(f=>f.id===task.field),work=schedule.segments.find(s=>s.kind==='work'&&s.task===task);return `<article class="route-job ${selectedDispatchTask===task.id?'active':''}"><button class="route-job-title" onclick="openTaskOverview(${task.id})"><span>${index+1}</span><div><strong>${f.name}</strong><small>${task.operation} · ${dispatchEquipment(task)} · ${f.area}</small></div></button><p>${datedTime(work.start)}–${minuteClock(work.start+work.duration)} · ${durationLabel(work.duration)}</p><div class="route-job-actions"><button onclick="moveDispatchTask(${task.id},-1)" ${index===0?'disabled':''} aria-label="${f.name} früher einplanen">←</button><button onclick="moveDispatchTask(${task.id},1)" ${index===schedule.tasks.length-1?'disabled':''} aria-label="${f.name} später einplanen">→</button><select aria-label="${f.name} einem anderen Roboter zuweisen" onchange="assignDispatchTask(${task.id},Number(this.value))">${compatibleRobots(task).map(r=>`<option value="${r.id}" ${r.id===robot.id?'selected':''}>Roboter ${r.id}</option>`).join('')}</select><button class="return-task" onclick="assignDispatchTask(${task.id},0)" title="In den Arbeitsspeicher zurücklegen">↶ Speicher</button></div></article>`;}).join('')||'<div class="storage-empty">Noch keine Aufgaben zugewiesen. Links eine Aufgabe auswählen und diesem Roboter zuweisen.</div>';
  const roadSvg=drives.map(s=>`<polyline pointer-events="none" points="${s.route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="white" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><polyline pointer-events="none" points="${s.route.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#427fad" stroke-width="7" stroke-dasharray="13 9" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const tracks=schedule.tasks.map(dispatchFieldTracks).join('');
  const selected=dispatchTasks.find(t=>t.id===selectedDispatchTask);
  document.getElementById('map-selection-title').textContent=selected?fields.find(f=>f.id===selected.field).name:'Roboter '+robot.id;
  document.getElementById('map-selection-caption').textContent=selected?selected.operation+' · Roboter '+robot.id:schedule.tasks.length+' zugewiesene Flächen · Straßenfahrten blau';
  const highlight=selected?`<path d="${fields.find(f=>f.id===selected.field).path}" fill="#e7b65b" fill-opacity=".2" stroke="#c48a30" stroke-width="9" pointer-events="none"/>`:'';
  const map=document.getElementById('dispatch-map'),target=map.querySelector('.map-scene')||map;
  let base=landscape('dispatch');
  fields.forEach(f=>{base=base.replace(`d="${f.path}" fill=`,`tabindex="0" role="button" aria-label="${f.name} auf dem Zeitplan anzeigen" onclick="selectDispatchField(${f.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectDispatchField(${f.id})}" style="cursor:pointer" d="${f.path}" fill=`);});
  target.innerHTML=base.replace('</svg>',roadSvg+tracks+highlight+'</svg>');
  if(!map.classList.contains('map-viewport'))enableMap(map);
}
document.getElementById('storage-sort').onchange=renderStoredTasks;
document.getElementById('schedule-slider').oninput=e=>seekSchedule(Number(e.target.value));
document.getElementById('schedule-scale').onchange=e=>{scheduleSpan=Number(e.target.value);seekSchedule(scheduleOffset);};
document.getElementById('schedule-back').onclick=()=>seekSchedule(scheduleOffset-120);
document.getElementById('schedule-forward').onclick=()=>seekSchedule(scheduleOffset+120);
document.getElementById('suggest-plan').onclick=()=>{
  dispatchTasks.filter(t=>!t.robot).forEach(t=>t.robot=t.operation.startsWith('Grubbern')?5:t.operation==='Säen'?6:t.operation==='Striegeln'?4:2);
  markPlanDraft('Beispielvorschlag ergänzt · Zuweisung und Reihenfolge sind anpassbar');renderDispatch();
};
document.getElementById('accept-plan').onclick=()=>{planAccepted=true;document.getElementById('plan-status').textContent='Einsatzplan übernommen · Demo, keine Roboter gestartet';const button=document.getElementById('accept-plan');button.textContent='Plan übernommen ✓';button.disabled=true;};
document.getElementById('task-field').innerHTML=fields.map(f=>`<option value="${f.id}">${f.name} · ${f.area}</option>`).join('');
document.getElementById('task-form').onsubmit=e=>{
  e.preventDefault();const operation=document.getElementById('task-operation').value;
  dispatchTasks.push({id:Math.max(0,...dispatchTasks.map(t=>t.id))+1,field:Number(document.getElementById('task-field').value),operation,priority:document.getElementById('task-priority').value,createdOn:dispatchDate,speed:({'Grubbern tief':12,'Grubbern flach':14,'Säen':10,'Hacken':5,'Striegeln':5})[operation],depth:operation==='Grubbern tief'?20:operation==='Grubbern flach'?5:null,robot:null});
  markPlanDraft('Neue Aufgabe im Arbeitsspeicher · Noch keinem Roboter zugewiesen');renderDispatch();document.getElementById('new-task').close();
};
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
 <div class="record-layout"><div class="record-left"><div class="panel record-map-panel"><div class="record-map-toolbar"><label>Erntejahr <select id="record-year" onchange="updateFieldRecord()"><option>2026</option><option>2025</option><option>2024</option><option>2023</option></select></label><label>Karten-Layer <select id="record-layer" onchange="updateFieldRecord()"><option value="soil">Bodentyp</option><option value="application">Applikationskarte</option><option value="yield">Letzte Ertragskarte</option></select></label></div><div id="record-map-slot"></div><div id="record-map-key"></div></div><div class="panel record-weather"><span class="tiny">WETTER AM FELD · DEMO</span><h2>☀ 14 °C <small>Leicht bewölkt</small></h2><div class="weather-values"><span>Wind <b>8 km/h · W</b></span><span>Niederschlag <b>0,2 mm</b></span><span>Bodenfeuchte <b>24 %</b></span></div><p>Heute trocken · Morgen 2 mm Regen</p></div></div>
 <aside class="record-right"><div class="panel record-section"><h2>Schlaginformationen</h2><dl class="record-facts"><div><dt>Feldgröße</dt><dd>${f.area}</dd></div><div><dt>Aktuelle Frucht</dt><dd>${f.crop}</dd></div><div><dt>Erntejahr · Frucht</dt><dd id="record-crop"></dd></div><div><dt>Mittlerer Ertrag</dt><dd id="record-yield"></dd></div></dl></div><div class="panel record-section"><h2>Letzte Arbeiten <span class="tiny" id="record-history-year"></span></h2><div id="record-history"></div></div><div class="panel record-section record-suggestions"><span class="tiny">✦ KI-VORSCHLÄGE · DEMO</span><h2>Nächste Arbeiten</h2><p id="record-next"></p><p class="record-explanation">Beispielhafte Ableitung aus Fruchtfolge und bisherigen Arbeitsfolgen. Noch keine KI-Auswertung echter Schlagdaten.</p><button class="primary" onclick="document.getElementById('field-record').hidden=true;openFieldPlanner(${f.id})">Aufgabe planen ↗</button></div><p class="record-demo">Schlaghistorie, Wetter und Karten sind illustrative Demodaten.</p></aside></div>`;
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
function openTaskOverview(id){
  if(!dispatchTasks.some(t=>t.id===id))return;
  if(!/^#aufgabe-/.test(location.hash))taskOverviewReturn={hash:location.hash||'#auftragsverwaltung',inspector:document.getElementById('dispatch-inspector').open};
  const dialog=document.getElementById('dispatch-inspector');if(dialog.open)dialog.close();
  const task=dispatchTasks.find(t=>t.id===id);if(task.robot){selectedDispatchRobot=task.robot;selectedDispatchTask=id;renderSchedule();renderDispatchRobot();}
  taskOverviewMode='field';location.hash='aufgabe-'+id;
  renderTaskOverview(id);
}
function closeTaskOverview(){
  location.hash=taskOverviewReturn.hash;
  if(taskOverviewReturn.inspector)requestAnimationFrame(()=>{const dialog=document.getElementById('dispatch-inspector');if(!dialog.open)dialog.showModal();});
}
function taskInfoGroup(title,rows){return `<section class="panel task-info-group"><h2>${title}</h2><dl>${rows.filter(r=>r[1]!==null&&r[1]!==undefined).map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></section>`;}
function renderTaskOverview(id){
  const task=dispatchTasks.find(t=>t.id===id);
  if(!task){document.getElementById('task-overview-title').textContent='Aufgabe nicht verfügbar';document.getElementById('task-overview-subtitle').textContent='Diese Demo-Aufgabe ist in dieser Sitzung nicht vorhanden.';document.getElementById('task-overview-information').innerHTML='';document.getElementById('task-overview-map').hidden=true;document.getElementById('task-overview-id').textContent='';document.getElementById('task-overview-status').textContent='';document.getElementById('task-overview-assign').hidden=true;document.getElementById('task-overview-map-caption').textContent='';taskOverviewId=null;return;}
  taskOverviewId=id;
  document.getElementById('task-overview-map').hidden=false;
  const f=fields.find(f=>f.id===task.field),robot=dispatchRobots.find(r=>r.id===task.robot),schedule=robot?buildRobotSchedule(robot):null;
  const work=schedule?.segments.find(s=>s.kind==='work'&&s.task.id===id),drives=schedule?schedule.segments.filter(s=>s.kind==='drive'&&s.task.id===id):[],setups=schedule?schedule.segments.filter(s=>s.kind==='setup'&&s.task.id===id):[];
  const priority=taskPriorities[task.priority]||taskPriorities.flexible,due=taskDeadline(task),dateLabel=date=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(date+'T12:00:00'));
  const defaultAngles={1:0,2:90,3:0,4:0,5:90,6:90,7:90,8:0};
  document.getElementById('task-overview-id').textContent='AUFGABE '+String(id).padStart(3,'0');
  document.getElementById('task-overview-title').textContent=f.name+' · '+task.operation;
  document.getElementById('task-overview-subtitle').textContent=f.area+' · '+(task.crop||f.crop);
  document.getElementById('task-overview-status').textContent=robot?'Eingeplant · Roboter '+robot.id:'Offen · Im Arbeitsspeicher';
  document.getElementById('task-overview-assign').hidden=!!robot;
  let details=taskInfoGroup('Aufgabe & Fläche', [['Fläche',f.name],['Flächengröße',f.area],['Arbeit',task.operation],['Frucht',task.crop||f.crop],['Angelegt am',dateLabel(task.createdOn||dispatchDate)],['Priorität',priority.label],['Zeitrahmen',priority.time],['Ablaufdatum',due?dateLabel(due):'Ohne Ablaufdatum']]);
  details+=taskInfoGroup('Arbeitsparameter', [['Arbeitstiefe',task.depth?task.depth+' cm':null],['Geschwindigkeit',task.speed?task.speed+' km/h':'Nicht festgelegt'],['Arbeitsbreite',task.workingWidth?task.workingWidth.toLocaleString('de-DE')+' m':'Noch nicht festgelegt'],['Bearbeitungsrichtung',(task.bearingDegrees??defaultAngles[f.id])+'°'],['Vorgewendebahnen',task.headlandPasses??2],['Saatkultur',task.operation==='Säen'?(task.crop||f.crop):null],['Saatstärke',task.operation==='Säen'?(task.seedRate?task.seedRate.toLocaleString('de-DE')+' Körner/ha':'Nicht festgelegt'):null],['Applikationskarte',task.operation==='Säen'?(task.applicationMap?'Teilflächenspezifisch':'Keine hinterlegt'):null],['Fahrgassenabstand',task.operation==='Säen'?(task.tramlineSpacing?task.tramlineSpacing+' m':'Keine Fahrgassen'):null]]);
  details+=taskInfoGroup('Einsatz & Anfahrt', [['Roboter',robot?'Roboter '+robot.id+' · '+robot.type:'Noch nicht zugewiesen'],['Anbaugerät',robot?dispatchEquipment(task):'Auswahl in der Disposition'],['Geschätzte Arbeitsdauer',durationLabel(dispatchDuration(task))],['Geplanter Beginn',work?datedTime(work.start):'Noch nicht eingeplant'],['Geplantes Ende',work?datedTime(work.start+work.duration):'Noch nicht eingeplant'],['Rüstzeit',schedule?durationLabel(setups.reduce((sum,s)=>sum+s.duration,0)):null],['Straßenfahrt',schedule?durationLabel(drives.reduce((sum,s)=>sum+s.duration,0)):null],['Fahrtstrecke',schedule?drives.reduce((sum,s)=>sum+s.route.km,0).toFixed(1).replace('.',',')+' km':null],['Anfahrt',robot?'Autonom über das Straßennetz':'Noch nicht disponiert']]);
  document.getElementById('task-overview-information').innerHTML=details;
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
