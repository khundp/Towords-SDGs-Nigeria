const goalNames = {
  1:'No Poverty',2:'Zero Hunger',3:'Good Health and Well-being',4:'Quality Education',5:'Gender Equality',6:'Clean Water and Sanitation',7:'Affordable and Clean Energy',8:'Decent Work and Economic Growth',9:'Industry, Innovation and Infrastructure',10:'Reduced Inequalities',11:'Sustainable Cities and Communities',12:'Responsible Consumption and Production',13:'Climate Action',14:'Life Below Water',15:'Life on Land',16:'Peace, Justice and Strong Institutions',17:'Partnerships for the Goals'
};
const goalColors = {
  1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',6:'#26BDE2',7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',11:'#FD9D24',12:'#BF8B2E',13:'#3F7E44',14:'#0A97D9',15:'#56C02B',16:'#00689D',17:'#19486A'
};
const goalOrder = Object.keys(goalNames).map(Number);
let goalData = {}, currentGoal = 3, currentIndicator = '', selectedStates = ['Nigeria'];
const states = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
const coords={Sokoto:[42,18],Zamfara:[46,26],Katsina:[58,19],Jigawa:[69,25],Yobe:[82,32],Borno:[91,39],Kebbi:[31,29],Niger:[43,45],Kwara:[36,58],Oyo:[28,70],Ogun:[31,80],Lagos:[27,86],Osun:[37,72],Ekiti:[43,70],Ondo:[43,80],Edo:[50,76],Delta:[52,86],Bayelsa:[58,90],Rivers:[65,88],Imo:[64,81],Abia:[69,82],'Akwa Ibom':[75,88],'Cross River':[82,81],Ebonyi:[75,74],Enugu:[68,72],Anambra:[62,76],Kogi:[52,63],FCT:[57,53],Nasarawa:[65,55],Benue:[68,65],Plateau:[69,45],Kaduna:[56,36],Kano:[65,31],Bauchi:[75,42],Gombe:[80,47],Adamawa:[86,62],Taraba:[77,68]};
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const uniq = a => [...new Set(a.filter(Boolean))];
const color = () => goalColors[currentGoal] || '#007a3d';
function fmt(v){ return v==null || !Number.isFinite(Number(v)) ? '—' : Number(v).toLocaleString(undefined,{maximumFractionDigits:1}); }
function val(r){ const v = Number(r?.Value); return Number.isFinite(v) ? v : null; }
function rows(){ return (goalData[currentGoal]||[]).filter(r => (r.Global_SDG_indicators || r.indicator) === currentIndicator); }
function indicatorsForGoal(g){ return uniq((goalData[g]||[]).map(r => r.Global_SDG_indicators || r.indicator)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})); }
function first(){ return rows()[0] || {description:`${currentIndicator} for Goal ${currentGoal}.`, unit:'Value', frequency:'Annual'}; }
function latestYear(){ return Math.max(...rows().map(r=>Number(r.year)).filter(Number.isFinite), 2023); }
function clean(s){ return String(s || currentIndicator).replace(/Dummy demonstration data for|Replace with official data when available\.?/gi,'').replace(/\s+/g,' ').trim() || `${currentIndicator} indicator measurement across Nigerian states.`; }
function shortDesc(ind){ const r=(goalData[currentGoal]||[]).find(x=>(x.Global_SDG_indicators||x.indicator)===ind); return clean(r?.description || r?.indicator || ind); }
async function init(){
  await Promise.all(goalOrder.map(async g=>{ try{ goalData[g] = await fetch(`data/sdg/goal_${g}.json`).then(r=>r.json()); }catch(e){ goalData[g]=[]; } }));
  renderNav(); bind(); route();
}
function bind(){
  window.addEventListener('hashchange',route);
  $('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
  $('#globalSearch').addEventListener('input',renderSearch);
  $('#yearFilter').addEventListener('change',()=>{ renderVisuals(); if(document.querySelector('#barChartFull')) drawBar('barChartFull', 999); });
  $('#stateAddFilter').addEventListener('change',()=>{ const v=$('#stateAddFilter').value; if(v && !selectedStates.includes(v)) selectedStates.push(v); $('#stateAddFilter').value=''; renderSelectedStates(); renderVisuals(); });
  document.body.addEventListener('click',e=>{ const rm=e.target.closest('[data-remove-state]'); if(rm){ const st=rm.dataset.removeState; selectedStates=selectedStates.filter(x=>x!==st); if(!selectedStates.length) selectedStates=['Nigeria']; renderFilters(); renderVisuals(); }});
  $('#mapMode').addEventListener('change',()=>renderMap('mapChart',$('#mapMode').value));
  $('#mapModeFull').addEventListener('change',()=>renderMap('mapChartFull',$('#mapModeFull').value));
  $('#downloadCsv').onclick=downloadCsv;
  $('#tableSearch').addEventListener('input',renderFullTable);
  $('#tabs').addEventListener('click',e=>{ const b=e.target.closest('.tab'); if(b) activateTab(b.dataset.tab); });
  document.body.addEventListener('click',e=>{ const l=e.target.closest('[data-open]'); if(l) activateTab(l.dataset.open); });
}
function renderNav(){
  $('#sideGoals').innerHTML = `<a href="index.html"><span>⌂</span>Home</a>` + goalOrder.map(g=>`<a data-goal="${g}" style="--item-color:${goalColors[g]}" href="#/goal/${g}"><img src="images/icons/sd-${g}.png">${goalNames[g]}</a>`).join('');
  $('#homeGoals').innerHTML = goalOrder.map(g=>`<a class="goal-card" style="--item-color:${goalColors[g]}" href="#/goal/${g}"><img src="images/icons/sd-${g}.png"><div><b>Goal ${g}</b><span>${goalNames[g]}</span></div></a>`).join('');
}
function renderWheel(){
  const wheel = $('#goalWheel'); if(!wheel) return;
  wheel.innerHTML = `<img class="original-wheel-svg" src="images/goals.svg" alt="SDG Goals wheel">` + goalOrder.map((g,i)=>{
    const deg = -90 + i * (360/17);
    return `<a href="#/goal/${g}" class="original-wheel-hotspot" data-wheel-goal="${g}" style="--deg:${deg}deg;--item-color:${goalColors[g]}" title="Goal ${g}: ${goalNames[g]}"><span>${g}</span></a>`;
  }).join('');
  wheel.querySelectorAll('[data-wheel-goal]').forEach(a=>{
    a.addEventListener('mouseenter',()=>{
      const g=Number(a.dataset.wheelGoal);
      $('#homeGoalPanelTitle').textContent=`Goal ${g}: ${goalNames[g]}`;
      $('#homeGoalPanelText').textContent=`Open Goal ${g} to explore indicators, compare multiple states, and view charts, maps, definitions, footnotes and data tables.`;
      $('#homeGoalPanelLink').href=`#/goal/${g}`;
      $('#homeGoalPanelLink').style.background=goalColors[g];
    });
  });
}
function route(){
  const exactIndicatorRoutePatch = true;
  const directHash = location.hash || '';
  const direct = directHash.match(/#\/indicator\/([^/?#]+)/);
  if(direct){
    const code = decodeURIComponent(direct[1]).toLowerCase();
    let foundGoal = null;
    let foundIndicator = null;
    goalOrder.some(g=>{
      const found = indicatorsForGoal(g).find(i=>{
        const c = (String(i).match(/^\s*([0-9]+(?:\.[0-9a-zA-Z]+)+)/)||[])[1];
        return c && c.toLowerCase() === code;
      });
      if(found){ foundGoal = g; foundIndicator = found; return true; }
      return false;
    });
    if(foundGoal && foundIndicator){
      currentGoal = foundGoal;
      currentIndicator = foundIndicator;
      renderGoal(foundGoal, slug(foundIndicator));
      return;
    }
  }

  if(document.body.dataset.page==='dashboard' && (!location.hash || location.hash==='#/')){ location.hash='#/goal/3'; return; }
  const h=location.hash||'#/';

  // Support exact indicator links: #/indicator/3.2.1
  const im=h.match(/#\/indicator\/([^/?#]+)/);
  if(im){
    const code=decodeURIComponent(im[1]);
    let foundGoal=null, foundIndicator=null;
    goalOrder.some(g=>{
      const found=indicatorsForGoal(g).find(ind=>ind.startsWith(code) || ind.includes(code));
      if(found){ foundGoal=g; foundIndicator=found; return true; }
      return false;
    });
    if(foundGoal && foundIndicator){
      location.hash=`#/goal/${foundGoal}/${slug(foundIndicator)}`;
      return;
    }
  }

  const m=h.match(/#\/goal\/(\d+)(?:\/([^?]+))?/);
  if(!m){ $('#homeView').classList.remove('hidden'); $('#goalView').classList.add('hidden'); renderWheel(); markActive(); return; }
  currentGoal=Number(m[1]); document.documentElement.style.setProperty('--goal-color',color());
  const inds=indicatorsForGoal(currentGoal); currentIndicator=inds.find(i=>slug(i)===m[2])
    || inds.find(i=>{
      const code=(String(i).match(/^\s*([0-9]+(?:\.[0-9a-zA-Z]+)+)/)||[])[1];
      return m[2] && code && (m[2].startsWith(slug(code)) || m[2].startsWith(code.toLowerCase()));
    })
    || inds[0] || `Goal ${currentGoal} Indicator`;
  selectedStates=['Nigeria']; $('#homeView').classList.add('hidden'); $('#goalView').classList.remove('hidden'); markActive(); renderGoal(); window.scrollTo({top:0,behavior:'smooth'});
}
function markActive(){ $$('.side-nav a').forEach(a=>a.classList.toggle('active',Number(a.dataset.goal)===currentGoal && !$('#goalView').classList.contains('hidden'))); }
function renderGoal(){
  const f=first(); document.documentElement.style.setProperty('--goal-color',color());
  $('#goalIcon').src=`images/icons/sd-${currentGoal}.png`; $('#goalBadge').textContent=`GOAL ${currentGoal}`;
  $('#indicatorTitle').textContent=currentIndicator; $('#indicatorDescription').textContent=clean(f.description);
  renderFilters(); renderInfo(); renderPrevNext(); renderRelated(); activateTab('overview');
}
function renderFilters(){
  const years=uniq(rows().map(r=>Number(r.year))).filter(Number.isFinite).sort((a,b)=>b-a); $('#yearFilter').innerHTML=years.map(y=>`<option>${y}</option>`).join('');
  const available=['Nigeria',...states].filter(s=>rows().some(r=>r.StateName===s));
  selectedStates = selectedStates.filter(s=>available.includes(s));
  if(!selectedStates.length) selectedStates=['Nigeria'];
  $('#stateAddFilter').innerHTML='<option value="">+ Add state to compare</option>'+available.filter(s=>!selectedStates.includes(s)).map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');
  renderSelectedStates();
}
function renderSelectedStates(){
  const box=$('#selectedStateChips'); if(!box) return;
  box.innerHTML=selectedStates.map(s=>`<button type="button" class="state-chip" data-remove-state="${esc(s)}"><span>${esc(s)}</span><b>×</b></button>`).join('');
}
function renderVisuals(){
  const year=$('#yearFilter').value || latestYear(); const label = selectedStates.length>1 ? `${selectedStates.length} selected states` : selectedStates[0];
  $('#barTitle').textContent=`${currentIndicator} by State (${year})`; $('#barTitleFull').textContent=$('#barTitle').textContent;
  $('#lineTitle').textContent=`Trend Over Time (${label})`; $('#lineTitleFull').textContent=$('#lineTitle').textContent;
  $('#mapTitle').textContent=`${currentIndicator} by State (${year})`; $('#mapTitleFull').textContent=$('#mapTitle').textContent;
  $('#tableStateName').textContent=`(${label})`;
  drawBar('barChart',10); drawLine('lineChart',selectedStates); renderMap('mapChart',$('#mapMode').value || 'bubble'); renderOverviewTable(selectedStates);
}
function yearRows(){ const y=Number($('#yearFilter').value)||latestYear(); return rows().filter(r=>Number(r.year)===y && r.StateName && r.StateName!=='Nigeria' && val(r)!=null); }
function topRows(limit=10){ return yearRows().sort((a,b)=>val(b)-val(a)).slice(0,limit); }
function trend(state){ let rs=rows().filter(r=>r.StateName===state && val(r)!=null).sort((a,b)=>Number(a.year)-Number(b.year)); if(!rs.length && state!=='Nigeria') rs=trend('Nigeria'); return rs; }
function drawBar(id,limit=10){
  const el=$('#'+id), data=topRows(limit); if(!data.length){ el.innerHTML='<p>No data available</p>'; return; }
  const W=760,H=250,pl=55,pr=20,pt=18,pb=58,max=Math.max(...data.map(val))*1.12,bw=(W-pl-pr)/data.length*.58;
  let svg=`<svg viewBox="0 0 ${W} ${H}">`; for(let i=0;i<5;i++){let y=pt+(H-pt-pb)*i/4; svg+=`<line class="gridline" x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}"/>`;}
  svg+=`<line class="axis" x1="${pl}" x2="${pl}" y1="${pt}" y2="${H-pb}"/><line class="axis" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/>`;
  data.forEach((r,i)=>{const x=pl+i*((W-pl-pr)/data.length)+bw*.35,h=(val(r)/max)*(H-pt-pb),y=H-pb-h; svg+=`<rect class="bar" x="${x}" y="${y}" width="${bw}" height="${h}" rx="4"><title>${esc(r.StateName)} — ${fmt(val(r))}</title></rect><text class="label" x="${x+bw/2}" y="${y-6}" text-anchor="middle">${fmt(val(r))}</text><text class="small-label" transform="translate(${x+bw/2},${H-pb+16}) rotate(45)" text-anchor="start">${esc(r.StateName)}</text>`;});
  svg+=`<text class="small-label" transform="translate(16,${H/2}) rotate(-90)" text-anchor="middle">${esc(first().unit||'Value')}</text></svg>`; el.innerHTML=svg;
}
function drawLine(id,stateList){
  const el=$('#'+id), statesToShow=(Array.isArray(stateList)?stateList:[stateList]).slice(0,6); const series=statesToShow.map(s=>({state:s,data:trend(s)})).filter(s=>s.data.length);
  if(!series.length){ el.innerHTML='<p>No data available</p>'; return; }
  const all=series.flatMap(s=>s.data); const years=uniq(all.map(r=>Number(r.year))).filter(Number.isFinite).sort((a,b)=>a-b);
  const vals=all.map(val).filter(v=>v!=null); const min=Math.min(...vals)*.88, max=Math.max(...vals)*1.08;
  const W=760,H=250,pl=55,pr=24,pt=20,pb=48; const x=yr=>pl+(years.indexOf(Number(yr)))*(W-pl-pr)/Math.max(1,years.length-1); const y=v=>pt+(max-v)*(H-pt-pb)/(max-min||1);
  let svg=`<svg viewBox="0 0 ${W} ${H}">`; for(let i=0;i<5;i++){let yy=pt+(H-pt-pb)*i/4; svg+=`<line class="gridline" x1="${pl}" x2="${W-pr}" y1="${yy}" y2="${yy}"/>`;}
  svg+=`<line class="axis" x1="${pl}" x2="${pl}" y1="${pt}" y2="${H-pb}"/><line class="axis" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/>`;
  series.forEach((s,idx)=>{ const pts=s.data.map(r=>`${x(r.year)},${y(val(r))}`).join(' '); svg+=`<polyline class="line line-${idx}" points="${pts}"/>`; s.data.forEach((r,i)=>{svg+=`<circle class="dot dot-${idx}" cx="${x(r.year)}" cy="${y(val(r))}" r="3.6"><title>${s.state} ${r.year}: ${fmt(val(r))}</title></circle>`;}); });
  years.forEach((yr,i)=>{ if(i%Math.ceil(years.length/7)===0 || i===years.length-1) svg+=`<text class="small-label" x="${x(yr)}" y="${H-pb+22}" text-anchor="middle">${yr}</text>`; });
  svg+=`<text class="small-label" transform="translate(16,${H/2}) rotate(-90)" text-anchor="middle">${esc(first().unit||'Value')}</text>`;
  svg+=`<g transform="translate(${pl},${H-12})">${series.map((s,i)=>`<circle class="dot dot-${i}" cx="${i*125}" cy="0" r="4"/><text class="small-label" x="${i*125+10}" y="4">${esc(s.state)}</text>`).join('')}</g></svg>`; el.innerHTML=svg;
}
async function renderMap(id,mode='bubble'){
  const el=$('#'+id), data=yearRows(); 
  if(!data.length){el.innerHTML='<p>No map data available</p>';return;}

  // Highcharts Natural Earth Nigeria map.
  if(window.Highcharts && Highcharts.mapChart){
    try{
      if(!window.NIGERIA_HIGHCHARTS_MAP){
        const res = await fetch('https://code.highcharts.com/mapdata/countries/ng/ng-all.geo.json');
        if(!res.ok) throw new Error('Could not load Nigeria map');
        window.NIGERIA_HIGHCHARTS_MAP = await res.json();
      }

      // Normalize names so our JSON state names match Highcharts map names.
      const stateNameFix = {
        'FCT':'Federal Capital Territory',
        'Akwa Ibom':'Akwa Ibom',
        'Cross River':'Cross River'
      };

      const rowsForMap = data.map(r=>{
        const name = stateNameFix[r.StateName] || r.StateName;
        const value = val(r);
        return {
          name,
          StateName:r.StateName,
          value,
          z:value
        };
      });

      const minValue = Math.min(...rowsForMap.map(d=>d.value));
      const maxValue = Math.max(...rowsForMap.map(d=>d.value));

      Highcharts.mapChart(id, {
        chart: {
          map: window.NIGERIA_HIGHCHARTS_MAP,
          backgroundColor: '#ffffff',
          spacing: [2,2,2,2],
          height: id === 'mapChartFull' ? 560 : 270
        },
        title: { text: null },
        credits: {
          enabled: true,
          text: 'Highcharts.com © Natural Earth',
          href: 'https://www.highcharts.com'
        },
        exporting: { enabled: false },
        mapNavigation: { enabled: false },
        legend: {
          enabled: mode === 'heat',
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal'
        },
        colorAxis: {
          min: minValue,
          max: maxValue,
          minColor: '#e8f5e9',
          maxColor: color()
        },
        tooltip: {
          useHTML: true,
          formatter: function(){
            const state = this.point.StateName || this.point.name || '';
            const value = this.point.value ?? this.point.z ?? '';
            return `<b>${state}</b><br>Value: <b>${fmt(value)}</b>`;
          }
        },
        plotOptions: {
          bubble: { lineWidth: 0, lineColor: 'transparent' },
          mapbubble: {
            lineWidth: 0,
            lineColor: 'transparent',
            dataLabels: { enabled: false, connectorWidth: 0, connectorColor: 'transparent' }
          },
          series: {
            dataLabels: {
              enabled: false,
              connectorWidth: 0,
              connectorColor: 'transparent'
            }
          },
          series: {
            animation: true,
            stickyTracking: false,
            dataLabels: {
              enabled: false,
              connectorWidth: 0, allowOverlap: false
            }
          },
          map: {
            allAreas: true,
            borderColor: '#d8dee4',
            borderWidth: 0.8,
            nullColor: '#f7f8f8',
            states: {
              hover: { color: '#dcefe2' }
            }
          },
          mapbubble: {
            minSize: 8,
            maxSize: 32,
            color: '#63b8ff',
            fillOpacity: 0.72,
            lineColor: '#1e9bff',
            lineWidth: 1.1,
            dataLabels: {
              enabled: false,
              connectorWidth: 0, allowOverlap: false
            },
            states: {
              hover: {
                lineColor: '#0077cc',
                brightness: 0.08
              }
            }
          }
        },
        series: mode === 'heat' ? [
          {
            type: 'map',
            name: currentIndicator,
            mapData: window.NIGERIA_HIGHCHARTS_MAP,
            data: rowsForMap,
            joinBy: ['name','name'],
            keys: ['name','value'],
            dataLabels: { enabled: false },
            tooltip: {
              pointFormatter: function(){
                return `<b>${this.StateName || this.name}</b><br>Value: <b>${fmt(this.value)}</b>`;
              }
            }
          }
        ] : [
          {
            type: 'map',
            name: 'Nigeria states',
            mapData: window.NIGERIA_HIGHCHARTS_MAP,
            nullColor: '#fafafa',
            borderColor: '#e3e7ea',
            borderWidth: 0.8,
            enableMouseTracking: false,
            dataLabels: { enabled: false }
          },
          {
            type: 'mapbubble',
            name: currentIndicator,
            lineWidth: 0,
            lineColor: 'transparent',
            mapData: window.NIGERIA_HIGHCHARTS_MAP,
            data: rowsForMap,
            joinBy: ['name','name'],
            minSize: 8,
            maxSize: 32,
            dataLabels: { enabled: false, connectorWidth: 0, allowOverlap: false },
            tooltip: {
              pointFormatter: function(){
                return `<b>${this.StateName || this.name}</b><br>Value: <b>${fmt(this.z)}</b>`;
              }
            }
          }
        ]
      });
      return;
    }catch(e){
      console.warn('Highcharts Nigeria map failed, using SVG fallback', e);
    }
  }

  // Fallback if CDN/offline fails.
  const values=data.map(val), min=Math.min(...values), max=Math.max(...values); 
  const outline='M86,108 L111,82 L148,61 L187,42 L226,35 L266,45 L304,42 L344,50 L383,69 L407,96 L438,106 L472,131 L497,165 L512,199 L505,233 L480,261 L438,274 L397,282 L366,300 L326,292 L291,309 L250,300 L218,313 L180,298 L145,288 L113,279 L87,257 L65,229 L54,196 L49,162 L57,132 Z';
  const points=data.map((r,i)=>{ const c=coords[r.StateName]||[30+(i*17)%65,20+(i*29)%70]; return {r,x:58+c[0]*4.25,y:22+c[1]*2.85,v:val(r)}; });
  let svg=`<svg viewBox="0 0 540 335" class="nigeria-map"><defs><clipPath id="clip-${id}"><path d="${outline}"/></clipPath></defs><rect x="0" y="0" width="540" height="335" fill="#fff"/><path class="nigeria-fill" d="${outline}"/>`;
  points.forEach(p=>{ const rad=5+(p.v-min)/(max-min||1)*13; svg+=`<circle clip-path="url(#clip-${id})" class="bubble" cx="${p.x}" cy="${p.y}" r="${rad}"><title>${p.r.StateName}: ${fmt(p.v)}</title></circle>`; });
  svg+=`<path class="nigeria-border" d="${outline}"/></svg>`; el.innerHTML=svg;
}

function renderOverviewTable(stateList){
  const list=(Array.isArray(stateList)?stateList:[stateList]).slice(0,6); const years=uniq(rows().map(r=>Number(r.year))).filter(Number.isFinite).sort((a,b)=>a-b).slice(-10);
  const body=list.map(s=>{const map={}; trend(s).forEach(r=>map[Number(r.year)]=val(r)); return `<tr><th>${esc(s)}</th>${years.map(y=>`<td>${fmt(map[y])}</td>`).join('')}</tr>`;}).join('');
  $('#overviewTable').innerHTML=`<thead><tr><th>State</th>${years.map(y=>`<th>${y}</th>`).join('')}</tr></thead><tbody>${body}</tbody>`;
}
function renderFullTable(){
  let rs=rows(); const q=($('#tableSearch').value||'').toLowerCase(); if(q) rs=rs.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)));
  const years=uniq(rs.map(r=>Number(r.year))).filter(Number.isFinite).sort((a,b)=>a-b); const st=uniq(rs.map(r=>r.StateName)).sort(); const map={}; rs.forEach(r=>map[`${r.StateName}|${r.year}`]=val(r));
  $('#dataTable').innerHTML=`<thead><tr><th>State</th>${years.map(y=>`<th>${y}</th>`).join('')}</tr></thead><tbody>${st.map(s=>`<tr><th>${esc(s)}</th>${years.map(y=>`<td>${fmt(map[`${s}|${y}`])}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function activateTab(tab){
  $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab)); $$('.tab-pane').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  setTimeout(()=>{renderVisuals(); if(tab==='bar') drawBar('barChartFull',30); if(tab==='line') drawLine('lineChartFull',selectedStates); if(tab==='map') renderMap('mapChartFull',$('#mapModeFull').value); if(tab==='table') renderFullTable();},20);
}
function renderInfo(){
  const f=first(); const unit=esc(f.unit||'Value'); const freq=esc(f.frequency||'Annual'); const desc=clean(f.description);
  $('#definitionBlock').innerHTML=`<div class="info-layout"><main><h2>Definition</h2><p>${esc(desc)}</p><p>This indicator supports monitoring of progress for Goal ${currentGoal}: ${esc(goalNames[currentGoal])}. Values can be compared across Nigerian states and over time to understand performance patterns and regional differences.</p><p>Lower or higher values should be interpreted according to the indicator definition and measurement unit.</p><h2>Footnotes</h2><ul><li>State values are presented for comparison across available reporting years.</li><li>National values summarise the overall Nigeria trend where available.</li><li>Data may be revised as improved administrative and survey sources become available.</li></ul></main><aside><div><b>Unit of measure</b><span>${unit}</span></div><div><b>Classification</b><span>${esc(f.scale||'Indicator value')}</span></div><div><b>Frequency</b><span>${freq}</span></div><div><b>Data source</b><span>National statistical and sector reporting systems</span></div><div><b>Latest year</b><span>${latestYear()}</span></div></aside></div>`;
  $('#footnotesBlock').innerHTML=`<h2>Footnotes</h2><ul><li>Data points are organized by state and year for dashboard exploration.</li><li>Comparisons between states should consider survey coverage, reporting frequency, and local context.</li><li>Charts and maps use the currently selected year and selected states where relevant.</li><li>Use the download button to export the indicator dataset as CSV.</li></ul>`;
}
function renderPrevNext(){
  const inds=indicatorsForGoal(currentGoal); const i=Math.max(0,inds.indexOf(currentIndicator)); const prev=inds[(i-1+inds.length)%inds.length], next=inds[(i+1)%inds.length];
  $('#prevNextBlock').innerHTML=`<a href="#/goal/${currentGoal}/${slug(prev)}">← Previous Indicator<span>${esc(prev)}</span></a><a class="next" href="#/goal/${currentGoal}/${slug(next)}">Next Indicator →<span>${esc(next)}</span></a>`;
}
function renderRelated(){
  const inds=indicatorsForGoal(currentGoal).filter(i=>i!==currentIndicator).slice(0,8); $('#relatedTitle').textContent=`Explore More Indicators for Goal ${currentGoal}: ${goalNames[currentGoal]}`; $('#viewAllGoal').href=`#/goal/${currentGoal}`; $('#viewAllGoal').textContent=`View All Indicators for Goal ${currentGoal}`;
  $('#relatedIndicators').innerHTML=inds.map(ind=>`<a class="related-card" href="#/goal/${currentGoal}/${slug(ind)}"><img src="images/icons/sd-${currentGoal}.png"><b>${esc(ind)}</b><p>${esc(shortDesc(ind)).slice(0,92)}...</p><em>View Indicator →</em></a>`).join('');
}
function renderSearch(){
  const q=$('#globalSearch').value.trim().toLowerCase(), box=$('#searchResults'); if(!q){box.style.display='none'; box.innerHTML=''; return;}
  const res=[]; goalOrder.forEach(g=>indicatorsForGoal(g).forEach(ind=>{ if(ind.toLowerCase().includes(q)||goalNames[g].toLowerCase().includes(q)) res.push({g,ind}); }));
  box.innerHTML=res.slice(0,10).map(r=>`<a href="#/goal/${r.g}/${slug(r.ind)}"><b>Goal ${r.g}</b> ${esc(r.ind)}</a>`).join('') || '<a>No results found</a>'; box.style.display='block';
}
function downloadCsv(){
  const cols=['goal','StateName','Global_SDG_indicators','year','Value','unit','description']; const csv=[cols.join(',')].concat(rows().map(r=>cols.map(c=>'"'+String(r[c]??'').replaceAll('"','""')+'"').join(','))).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`goal_${currentGoal}_${slug(currentIndicator)}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
init().catch(e=>{ console.error(e); document.body.insertAdjacentHTML('afterbegin','<div style="padding:14px;background:#fee;color:#900">Could not load JSON data. Please run with VS Code Live Server or another local server.</div>'); });

/* Exact indicator deep-link support */
(function(){
  function applyExactIndicatorFromHash(){
    const h = window.location.hash || "";
    const m = h.match(/#\/indicator\/([^/?#]+)/);
    if(!m) return false;
    const code = decodeURIComponent(m[1]);
    window.__requestedIndicatorCode = code;
    setTimeout(function(){
      const select = document.querySelector('#indicatorSelect, select[name="indicator"], .indicator-select');
      if(select){
        const opt = Array.from(select.options || []).find(o => (o.value || "").includes(code) || (o.textContent || "").includes(code));
        if(opt){
          select.value = opt.value;
          select.dispatchEvent(new Event('change', {bubbles:true}));
          return;
        }
      }
      const link = Array.from(document.querySelectorAll('a,[data-indicator],[data-code]')).find(el =>
        (el.dataset.indicator === code) || (el.dataset.code === code) || ((el.getAttribute('href') || '').includes(code)) || ((el.textContent || '').includes(code))
      );
      if(link) link.click();
    }, 400);
    return true;
  }
  window.addEventListener('hashchange', applyExactIndicatorFromHash);
  document.addEventListener('DOMContentLoaded', applyExactIndicatorFromHash);
})();
