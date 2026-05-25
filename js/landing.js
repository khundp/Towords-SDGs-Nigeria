const goalNames={1:'No Poverty',2:'Zero Hunger',3:'Good Health and Well-being',4:'Quality Education',5:'Gender Equality',6:'Clean Water and Sanitation',7:'Affordable and Clean Energy',8:'Decent Work and Economic Growth',9:'Industry, Innovation and Infrastructure',10:'Reduced Inequalities',11:'Sustainable Cities and Communities',12:'Responsible Consumption and Production',13:'Climate Action',14:'Life Below Water',15:'Life on Land',16:'Peace, Justice and Strong Institutions',17:'Partnerships for the Goals'};
const goalDescriptions={1:'End poverty in all its forms everywhere.',2:'End hunger, achieve food security and improved nutrition and promote sustainable agriculture.',3:'Ensure healthy lives and promote well-being for all at all ages.',4:'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.',5:'Achieve gender equality and empower all women and girls.',6:'Ensure availability and sustainable management of water and sanitation for all.',7:'Ensure access to affordable, reliable, sustainable and modern energy for all.',8:'Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.',9:'Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.',10:'Reduce inequality within and among countries.',11:'Make cities and human settlements inclusive, safe, resilient and sustainable.',12:'Ensure sustainable consumption and production patterns.',13:'Take urgent action to combat climate change and its impacts.',14:'Conserve and sustainably use oceans, seas and marine resources.',15:'Protect, restore and promote sustainable use of terrestrial ecosystems.',16:'Promote peaceful and inclusive societies and provide access to justice for all.',17:'Strengthen the means of implementation and revitalize the global partnership for sustainable development.'};
const goalColors={1:'#E5243B',2:'#DDA63A',3:'#4C9F38',4:'#C5192D',5:'#FF3A21',6:'#26BDE2',7:'#FCC30B',8:'#A21942',9:'#FD6925',10:'#DD1367',11:'#FD9D24',12:'#BF8B2E',13:'#3F7E44',14:'#0A97D9',15:'#56C02B',16:'#00689D',17:'#19486A'};
const goalIndicators={
1:[['1.1.1','Proportion of population below the international poverty line'],['1.2.1','Proportion of population living below the national poverty line'],['1.4.1','Population living in households with access to basic services']],
2:[['2.1.1','Prevalence of undernourishment'],['2.2.1','Prevalence of stunting among children under 5'],['2.3.1','Volume of production per labour unit']],
3:[['3.1.1','Maternal mortality ratio'],['3.2.1','Under-5 mortality rate'],['3.2.2','Neonatal mortality rate']],
4:[['4.1.1','Children and young people achieving minimum proficiency'],['4.2.2','Participation rate in organized learning'],['4.6.1','Youth and adults with literacy and numeracy skills']],
5:[['5.4.1','Proportion of time spent on unpaid domestic and care work'],['5.5.2','Proportion of women in managerial positions'],['5.b.1','Proportion of individuals who own a mobile telephone, by sex']],
6:[['6.1.1','Population using safely managed drinking water services'],['6.2.1','Population using safely managed sanitation services'],['6.3.1','Proportion of wastewater safely treated']],
7:[['7.1.1','Proportion of population with access to electricity'],['7.1.2','Proportion of population with primary reliance on clean fuels'],['7.2.1','Renewable energy share in total final energy consumption']],
8:[['8.10.2','Proportion of adults with an account at a financial institution or mobile-money-service provider'],['8.5.2','Unemployment rate, by sex, age and persons with disabilities'],['8.6.1','Proportion of youth not in education, employment or training']],
9:[['9.1.2','Passenger and freight volumes'],['9.2.1','Manufacturing value added as a proportion of GDP'],['9.c.1','Population covered by a mobile network']],
10:[['10.1.1','Growth rates of household expenditure or income per capita'],['10.2.1','People living below 50 per cent of median income'],['10.4.1','Labour share of GDP']],
11:[['11.1.1','Urban population living in slums or inadequate housing'],['11.2.1','Population with convenient access to public transport'],['11.6.2','Annual mean levels of fine particulate matter']],
12:[['12.2.2','Domestic material consumption'],['12.5.1','National recycling rate'],['12.8.1','Extent of education for sustainable development']],
13:[['13.1.1','Deaths and missing persons attributed to disasters'],['13.2.2','Total greenhouse gas emissions per year'],['13.3.1','Climate change education and awareness']],
14:[['14.1.1','Index of coastal eutrophication and floating plastic debris density'],['14.5.1','Coverage of protected areas in relation to marine areas'],['14.6.1','Implementation of international instruments to combat illegal fishing']],
15:[['15.1.1','Forest area as a proportion of total land area'],['15.1.2','Protected terrestrial and freshwater biodiversity sites'],['15.5.1','Red List Index']],
16:[['16.1.1','Victims of intentional homicide'],['16.3.2','Unsentenced detainees as a proportion of overall prison population'],['16.9.1','Children under 5 whose births have been registered']],
17:[['17.1.1','Total government revenue as a proportion of GDP'],['17.3.2','Volume of remittances as a proportion of GDP'],['17.8.1','Proportion of individuals using the Internet']]
};
const goals=Object.keys(goalNames).map(Number);
const $=s=>document.querySelector(s);
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const openGoal = g => `dashboard.html#/goal/${g}`;
const openIndicator=(g,code,label)=>`dashboard.html#/goal/${g}/${slug(`${code} ${label}`)}`;
function showGoal(g){
  g=Number(g)||3;
  const color=goalColors[g];
  document.documentElement.style.setProperty('--selected-goal-color',color);
  $('#homeGoalPanelIcon').src=`images/icons/sd-${g}.png`;
  $('#homeGoalPanelIcon').alt=`Goal ${g}`;
  $('#homeGoalPanelTitle').textContent=goalNames[g];
  $('#homeGoalPanelText').textContent=goalDescriptions[g];
  $('#homeGoalIndicators').innerHTML=(goalIndicators[g]||[]).slice(0,3).map(([code,label])=>
    `<a class="home-indicator-link" href="${openIndicator(g,code,label)}"><span class="arrow">→</span><span class="indicator-text"><b>${code}</b> ${label}</span></a>`
  ).join('');
  document.querySelectorAll('[data-wheel-goal]').forEach((el,i)=>{
    const isActive=Number(el.dataset.wheelGoal)===g;
    el.classList.toggle('active',isActive);
    const path=el.querySelector('.sdg-segment-path');
    if(path){
      const cx=300, cy=300, rInner=180, gap=1.15, step=360/goals.length;
      const start=i*step-gap/2, end=(i+1)*step-gap/2;
      path.setAttribute('d', segmentPath(cx,cy,isActive?292:270,rInner,start,end));
      path.setAttribute('filter', isActive?'url(#selectedShadow)':'');
    }
  });
}
function polar(cx,cy,r,deg){
  const rad=(deg-90)*Math.PI/180;
  return {x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};
}
function segmentPath(cx,cy,rOuter,rInner,start,end){
  const p1=polar(cx,cy,rOuter,start), p2=polar(cx,cy,rOuter,end);
  const p3=polar(cx,cy,rInner,end), p4=polar(cx,cy,rInner,start);
  const large=end-start>180?1:0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`;
}
function renderWheel(){
 const wheel=$('#goalWheel');
 const cx=300, cy=300, rInner=180, rOuter=270, gap=1.15, step=360/goals.length;
 const groups=goals.map((g,i)=>{
   const start=i*step-gap/2, end=(i+1)*step-gap/2;
   const mid=(start+end)/2;
   const icon=polar(cx,cy,225,mid);
   return `<g class="sdg-segment" data-wheel-goal="${g}" tabindex="0" role="button" aria-label="Select Goal ${g}: ${goalNames[g]}">
      <path class="sdg-segment-path" fill="${goalColors[g]}" d="${segmentPath(cx,cy,rOuter,rInner,start,end)}"></path>
      <image class="sdg-segment-icon" href="images/icons/sd-${g}.png" x="${(icon.x-25).toFixed(2)}" y="${(icon.y-33).toFixed(2)}" width="50" height="50" preserveAspectRatio="xMidYMid meet"></image>
      <text class="sdg-segment-label" x="${icon.x.toFixed(2)}" y="${(icon.y+32).toFixed(2)}" text-anchor="middle">SDG ${g}</text>
    </g>`;
 }).join('');
 wheel.innerHTML=`<svg class="clean-sdg-wheel" viewBox="0 0 600 600" aria-hidden="false">
   <defs>
     <filter id="selectedShadow" x="-30%" y="-30%" width="160%" height="160%">
       <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".22"/>
     </filter>
   </defs>
   <circle class="sdg-inner-track" cx="300" cy="300" r="174" fill="#fff" stroke="#ededed" stroke-width="8"></circle>
   <circle class="sdg-inner-loader" cx="300" cy="300" r="174" fill="none" stroke="#b8bcc4" stroke-width="7" stroke-linecap="round"></circle>
   ${groups}
   <circle cx="300" cy="300" r="155" fill="#fff"></circle>
   <text x="300" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#139bd7">SUSTAINABLE</text>
   <text x="300" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#139bd7">DEVELOPMENT</text>
   <text x="300" y="365" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="900" fill="#139bd7">GOALS</text>
 </svg>`;
 wheel.addEventListener('click',e=>{const item=e.target.closest('[data-wheel-goal]'); if(!item)return; e.preventDefault(); showGoal(item.dataset.wheelGoal);});
 wheel.addEventListener('keydown',e=>{const item=e.target.closest('[data-wheel-goal]'); if(!item)return; if(e.key==='Enter'||e.key===' '){e.preventDefault(); showGoal(item.dataset.wheelGoal);}});
}
function renderCards(){
 $('#homeGoals').innerHTML=goals.map(g=>`<a class="goal-card" style="--item-color:${goalColors[g]}" href="${openGoal(g)}"><img src="images/icons/sd-${g}.png"><div><b>Goal ${g}</b><span>${goalNames[g]}</span></div></a>`).join('');
}
renderWheel(); renderCards(); showGoal(1);
