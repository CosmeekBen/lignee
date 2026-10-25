/* Passions : sport, musique, arts, cuisine, technique… On les découvre, on les pratique
   (temps et argent), elles montent en niveau, et elles peuvent devenir un métier, de
   « boxeur semi-professionnel » à « légende de la boxe » : une carrière sportive ou artistique
   exige une vraie pratique, pas seulement une candidature. */
(function(root){const L=root.Life,clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const base={year:L.year,choose:L.choose,ensure:L.ensure};
const hash=(...a)=>L.hash(a.join('|'));
const lg=(x,a,b)=>clamp(Math.log(Math.max(1,x)/a)/Math.log(b/a),0,1);
const INTENSITY=['En pause','Occasionnelle','Régulière','Intensive'],SLOTS=[0,0,1,2],GAIN=[0,2,5.5,9];
/* id, nom, groupe, icône, coût annuel (part du revenu de référence), accès, métier */
const D=(id,name,group,icon,cost,access,career)=>({id,name,group,icon,cost,access:access||(()=>true),career});
const rich=(inc,tier)=>(c,p)=>c.income>=inc&&(p.wealthTier??.5)>=tier;
const sport=(noun,legend,m)=>({sector:'sport',noun,legend,m});
const passions=[
D('boxing','Boxe','sport','🥊',.006,null,sport('Boxeur·se','Légende de la boxe',1.7)),D('football','Football','sport','⚽',.004,null,sport('Footballeur·se','Légende du football',2.4)),
D('basketball','Basket-ball','sport','🏀',.005,null,sport('Basketteur·se','Légende du basket',2.2)),D('tennis','Tennis','sport','🎾',.02,(c,p)=>c.income>=3500,sport('Joueur·se de tennis','Légende du tennis',1.8)),
D('athletics','Athlétisme','sport','🏃',.003,null,sport('Athlète','Légende de l’athlétisme',1.1)),D('swimming','Natation','sport','🏊',.01,(c,p)=>c.income>=2500,sport('Nageur·se','Légende de la natation',.9)),
D('judo','Judo','sport','🥋',.007,null,sport('Judoka','Légende du judo',.8)),D('gymnastics','Gymnastique','sport','🤸',.012,(c,p)=>c.income>=3000,sport('Gymnaste','Légende de la gymnastique',.9)),
D('cycling','Cyclisme','sport','🚴',.015,(c,p)=>c.income>=2500,sport('Cycliste','Légende du cyclisme',1.2)),D('rugby','Rugby','sport','🏉',.008,null,sport('Joueur·se de rugby','Légende du rugby',1.2)),
D('fencing','Escrime','sport','🤺',.02,rich(5000,.35),sport('Escrimeur·se','Légende de l’escrime',.7)),D('esport','Sport électronique','sport','🎮',.006,(c,p)=>c.income>=3000,sport('Joueur·se d’esport','Légende de l’esport',1.5)),
D('golf','Golf','sport','⛳',.03,rich(8000,.5),sport('Golfeur·se','Légende du golf',1.6)),D('climbing','Escalade','sport','🧗',.01,(c,p)=>c.income>=3000,sport('Grimpeur·se','Légende de l’escalade',.8)),
D('volleyball','Volley-ball','sport','🏐',.004,null,sport('Volleyeur·se','Légende du volley',1)),D('wrestling','Lutte','sport','🤼',.004,null,sport('Lutteur·se','Légende de la lutte',.9)),D('cricket','Cricket','sport','🏏',.005,(c)=>['IN','PK','BD','AU','GB','ZA','LK','NZ','WS','JM','TT','AF','ZW','KE','UG'].includes(c.code),sport('Joueur·se de cricket','Légende du cricket',1.8)),
D('guitar','Guitare','music','🎸',.006,null,{sector:'music',noun:'Guitariste',legend:'Icône de la guitare',m:1.3}),D('piano','Piano','music','🎹',.01,(c,p)=>c.income>=2500,{sector:'music',noun:'Pianiste',legend:'Virtuose internationale',m:1}),
D('singing','Chant','music','🎤',.004,null,{sector:'music',noun:'Chanteur·se',legend:'Voix de légende',m:2}),D('dj','DJ et production','music','🎧',.008,(c,p)=>c.income>=2500,{sector:'music',noun:'DJ et producteur·rice',legend:'DJ de renommée mondiale',m:1.8}),
D('drums','Batterie','music','🥁',.006,null,{sector:'music',noun:'Batteur·se',legend:'Batteur·se de légende',m:1.1}),D('rap','Rap et écriture','music','🎙️',.003,null,{sector:'music',noun:'Rappeur·se',legend:'Figure du rap mondial',m:1.9}),
D('dance','Danse','music','💃',.005,null,{sector:'music',noun:'Danseur·se',legend:'Étoile de la danse',m:1.1}),
D('drawing','Dessin','arts','✏️',.003,null,{sector:'creative',noun:'Illustrateur·rice',legend:'Maître·sse de l’illustration',m:1}),D('painting','Peinture','arts','🎨',.006,null,{sector:'creative',noun:'Peintre',legend:'Peintre de renommée mondiale',m:1.2}),
D('photography','Photographie','arts','📷',.008,(c,p)=>c.income>=2500,{sector:'creative',noun:'Photographe',legend:'Photographe de légende',m:1}),D('video','Vidéo et montage','arts','🎬',.007,(c,p)=>c.income>=2500,{sector:'cinema',noun:'Vidéaste',legend:'Réalisateur·rice acclamé·e',m:1.3}),
D('theater','Théâtre','arts','🎭',.004,null,{sector:'cinema',noun:'Comédien·ne',legend:'Acteur·rice de légende',m:1.3}),D('writing','Écriture','writing','✍️',.002,null,{sector:'media',noun:'Auteur·rice',legend:'Écrivain·e de renommée mondiale',m:1.1}),
D('fashion','Couture et mode','craft','🧵',.006,null,{sector:'fashion',noun:'Créateur·rice de mode',legend:'Maison de mode célèbre',m:1.4}),
D('cooking','Cuisine','cuisine','🍳',.004,null,{sector:'hospitality',noun:'Cuisinier·ère',legend:'Chef·fe aux trois étoiles',m:1.2}),D('baking','Pâtisserie','cuisine','🥐',.005,null,{sector:'hospitality',noun:'Pâtissier·ère',legend:'Maître·sse pâtissier·ère',m:1}),
D('carpentry','Menuiserie','craft','🪚',.006,null),D('mechanics','Mécanique','craft','🔧',.005,null),D('electronics','Électronique','tech','🔌',.006,null),
D('coding','Programmation','tech','💻',.004,(c,p)=>c.income>=2000),D('robotics','Robotique','tech','🤖',.01,(c,p)=>c.income>=4000),D('gamedev','Création de jeux','tech','🕹️',.005,(c,p)=>c.income>=2500),
D('gardening','Jardinage','nature','🌱',.002,null),D('animals','Soin des animaux','nature','🐕',.004,null),D('astronomy','Astronomie','nature','🔭',.005,(c,p)=>c.income>=3000),D('travel','Voyages','travel','🧭',.02,(c,p)=>c.income>=4000)
];
const byId=Object.fromEntries(passions.map(x=>[x.id,x]));
const SKILL={sport:'technical',music:'creative',arts:'creative',writing:'creative',craft:'technical',cuisine:'technical',tech:'technical',nature:'academic',travel:'social'};
const GROUP_NAMES={sport:'Sport',music:'Musique et danse',arts:'Arts visuels et scène',writing:'Écriture',craft:'Artisanat',cuisine:'Cuisine',tech:'Technique et numérique',nature:'Nature et sciences',travel:'Voyages'};
L.passions=passions;L.passionById=byId;L.passionGroup=id=>byId[id]?.group;L.passionName=id=>byId[id]?.name||id;L.passionIntensity=INTENSITY;L.passionGroups=GROUP_NAMES;

/* Carrières issues d'une passion : ajoutées au catalogue des métiers. */
function buildCareers(){const out=[],tiers=[{k:'semi',rank:1,level:1,min:45,inc:.55,maxAge:40,vis:0,rare:null,exp:0},{k:'pro',rank:2,level:2,min:65,inc:1.25,maxAge:42,vis:15,rare:null,exp:1},{k:'elite',rank:4,level:3,min:82,inc:3,maxAge:42,vis:50,rare:'fame',exp:3},{k:'star',rank:5,level:3,min:92,inc:6,maxAge:40,vis:75,rare:'fame',exp:6}];
  for(const d of passions){if(!d.career)continue;const c=d.career,isSport=d.group==='sport';
    for(const t of tiers){if(!isSport&&t.k==='star'&&c.legend==null)continue;
      const title=t.k==='semi'?(isSport?`${c.noun} semi-professionnel·le`:`${c.noun} en début de carrière`):t.k==='pro'?`${c.noun} professionnel·le`:t.k==='elite'?(isSport?`${c.noun} international·e`:`${c.noun} reconnu·e à l’international`):c.legend;
      out.push({id:'p-'+d.id+'-'+t.k,sector:c.sector,title,rank:t.rank,level:t.level,degree:0,license:null,from:isSport&&d.id==='esport'?2005:1960,rarity:t.rare,income:t.inc*c.m*(t.k==='star'?1.2:1),contract:t.k==='semi'?'temporary':'stable',load:t.k==='semi'?2:3,minExperience:t.exp,minSkill:0,visibility:t.vis,legal:true,passion:{id:d.id,min:t.min},maxAge:isSport?t.maxAge:t.maxAge+25})}}
  return out}
const careers=buildCareers();for(const j of careers)if(!L.occupations.some(x=>x.id===j.id))L.occupations.push(j);

/* ── Pratique : niveau, temps, argent ── */
const practiceKey=p=>p.passions;
function ensurePassions(p){p.passions??={}}
function aptitude(p,d){const k=SKILL[d.group]||'academic';return (p.skills[k]||0)+(d.group==='sport'?p.health*.3:0)}
function startPassion(s,p,id,intensity=1){const d=byId[id];if(!d)return{ok:false,error:'Passion inconnue.'};ensurePassions(p);const c=L.country(s,p);if(!d.access(c,p))return{ok:false,error:'Cette pratique n’est pas accessible dans votre situation (équipements, coût ou pays).'};
  if(p.age<5)return{ok:false,error:'À partir de 5 ans.'};if(Object.keys(p.passions).length>=5&&!p.passions[id])return{ok:false,error:'Cinq passions au maximum : mettez-en une en pause ou arrêtez-la.'};
  p.passions[id]??={level:4,since:s.year,years:0,intensity:0,bestLevel:4};setIntensity(s,p,id,intensity);return{ok:true}}
function setIntensity(s,p,id,n){const x=p.passions?.[id];if(!x)return false;n=clamp(Math.round(n),0,3);const free=L.available(p)+SLOTS[x.intensity];if(SLOTS[n]>free)return false;x.intensity=n;L.ensure?.(s);return true}
function dropPassion(s,p,id){if(p.passions?.[id]){delete p.passions[id];return true}return false}
L.startPassion=(s,id,n)=>startPassion(s,s.person,id,n);L.setPassionIntensity=(s,id,n)=>{const p=s.person,x=p.passions?.[id];if(!x)return{ok:false,error:'Passion inconnue.'};n=clamp(Math.round(n),0,3);if(SLOTS[n]>L.available(p)+SLOTS[x.intensity])return{ok:false,error:'Pas assez de créneaux libres.'};x.intensity=n;return{ok:true}};L.dropPassion=(s,id)=>dropPassion(s,s.person,id);
function passionYear(s,p){if(!p.passions)return;const ref=L.reference(s,p),c=L.country(s,p);
  for(const[id,x]of Object.entries(p.passions)){const d=byId[id];if(!d)continue;x.years++;
    const cost=ref*d.cost*x.intensity*(p.age<18?0:1);if(cost>0){if(p.cash>=cost)p.cash-=cost;else{x.intensity=Math.max(0,x.intensity-1)}}
    const ageF=p.age<25?1.15:p.age<40?1:.8,apt=aptitude(p,d);let gain=GAIN[x.intensity]*clamp(.6+apt/120,.5,1.5)*ageF/(1+x.level/70);
    if(x.intensity===0){x.idle=(x.idle||0)+1;if(x.idle>=2)gain=-1.5}else x.idle=0;
    if(d.group==='sport'&&p.age>35)gain-=(p.age-35)*.12;
    x.level=clamp(x.level+gain,0,100);x.bestLevel=Math.max(x.bestLevel||0,x.level);
    const sk=SKILL[d.group];if(x.intensity>0&&sk){p.skills[sk]=clamp(p.skills[sk]+x.intensity*.7)}
    if(x.intensity>0){p.happiness=clamp(p.happiness+x.intensity*.8);p.energy=clamp(p.energy-x.intensity*1.1);if(d.group==='sport')p.health=clamp(p.health+x.intensity*.6)}
    if(x.intensity>=2&&x.level>=55){const v=d.group==='sport'?'sport':d.group==='nature'||d.group==='tech'?'science':'creative';p.visibility??={creative:0,science:0,sport:0};p.visibility[v]=clamp(p.visibility[v]+(x.level>=75?2.2:1))}}}

/* ── Événements : découverte, compétition, blessure ── */
const ch=(label,note,fx={})=>({label,note,fx});
function offers(s,p){const c=L.country(s,p),urban=p.urban,tier=p.wealthTier??.5;const list=passions.filter(d=>d.access(c,p)&&!p.passions?.[d.id]);
  const scored=list.map(d=>[d,hash(s.seed,p.id,'pd',d.id,p.age)+(d.group==='sport'&&c.income<6000?.12:0)+(d.id==='football'?.1:0)+(tier<.4&&['golf','tennis','fencing','piano'].includes(d.id)?-.2:0)]);
  scored.sort((a,b)=>b[1]-a[1]);return scored.slice(0,4).map(x=>x[0])}
function discoverEvent(s,p){const opts=offers(s,p);if(opts.length<2)return null;return{id:'passion-discover',title:'Quelque chose vous attire',text:'Un club, un voisin, une vidéo, une salle de quartier : une activité vous donne envie d’essayer. Pas besoin de vouloir en faire un métier. Mais certaines passions, bien nourries, le deviennent.',category:'Enfance',required:true,
  choices:[...opts.map(d=>ch(`${d.icon} ${d.name}`,`Une pratique ${d.group==='sport'?'physique':d.group==='music'?'artistique':'qui vous ressemble'} · ${d.access(L.country(s,p),p)?'accessible':'limitée'}`,{passion:{start:d.id}})),ch('Pas pour le moment','Rien ne vous oblige',{})]}}
function contestEvent(s,p){const entries=Object.entries(p.passions||{}).filter(([id,x])=>x.level>=30&&x.intensity>=2).map(([id,x])=>[byId[id],x]);if(!entries.length)return null;const[d,x]=entries[Math.floor(hash(s.seed,p.id,'contest',s.year)*entries.length)];
  const kinds={sport:['Un tournoi','Une compétition régionale s’ouvre. Vos résultats dépendent de votre préparation, de votre âge et d’un peu de chance.'],music:['Une audition','Une scène, un jury, quelques minutes. Beaucoup de monde, peu de places.'],arts:['Un concours','Un jury sélectionne des œuvres. Les places sont rares, les critères parfois obscurs.'],writing:['Un prix littéraire','Un manuscrit, un jury, des centaines de candidatures.'],cuisine:['Un concours de cuisine','Un jury, des ingrédients imposés, du temps compté.'],tech:['Un hackathon','Quarante-huit heures, une équipe, une idée.']};const k=kinds[d.group]||['Une occasion de vous mesurer','Un événement vous permet de vous comparer à d’autres.'];
  const win=clamp(.08+x.level/180+(p.energy-50)/400,.03,.6);return{id:'passion-contest-'+d.id,title:`${k[0]} · ${d.name}`,text:k[1]+` Votre niveau actuel : ${Math.round(x.level)}/100.`,category:'Passion',required:true,stats:[{label:'Chances de monter sur le podium ou d’être retenu·e',pct:Math.round(win*100),strong:true}],statsKicker:'Ce que disent les chiffres du modèle',
  choices:[ch('Me préparer à fond',`Énergie −8 · chance ≈ ${Math.round(Math.min(.8,win+.1)*100)} %`,{energy:-8,passion:{contest:d.id,bonus:.1}}),ch('Y aller pour l’expérience',`Chance ≈ ${Math.round(win*100)} %`,{passion:{contest:d.id,bonus:0}}),ch('Passer mon tour','Aucune pression',{})]}}
function injuryEvent(s,p){const entries=Object.entries(p.passions||{}).filter(([id,x])=>byId[id].group==='sport'&&x.intensity>=2);if(!entries.length)return null;const[id,x]=entries[0],d=byId[id];
  return{id:'passion-injury',title:'Une blessure',text:`Une mauvaise réception, un geste de trop pendant ${d.name.toLowerCase()}. Ça fait mal, et ça ne passe pas en un jour.`,category:'Passion',required:true,choices:[ch('Me soigner et reprendre doucement','Santé −5 · pratique en pause une saison',{health:-5,passion:{pause:id}}),ch('Serrer les dents','Risque de séquelles · santé −8',{health:-8,stress:4,passion:{risk:id}}),ch('Arrêter pour de bon','Épanouissement −6',{happy:-6,passion:{drop:id}})]}}
function plan(s){const p=s.person;if(!p.alive||s.pending||p.age<5||L.coreDue?.(p))return;s.queue??=[];if(s.queue.some(e=>(e.id||'').startsWith('passion')))return;const age=p.age+1;ensurePassions(p);
  const n=Object.keys(p.passions).length,seen=p.events.filter(x=>x==='passion-discover').length;
  if(age>=7&&age<=16&&(n===0?seen<2:seen<1)&&!p.events.slice(-6).includes('passion-discover')&&hash(s.seed,p.id,'pdisc',age)<.35){const e=discoverEvent(s,p);if(e)s.queue.push(e);return}
  if(age>=18&&age<=50&&n<1&&seen<3&&hash(s.seed,p.id,'pdisc',age)<.05){const e=discoverEvent(s,p);if(e)s.queue.push(e);return}
  if(hash(s.seed,p.id,'pcontest',age)<.12&&!p.events.slice(-5).some(x=>x.startsWith('passion-contest'))){const e=contestEvent(s,p);if(e)s.queue.push(e);return}
  if(hash(s.seed,p.id,'pinj',age)<.045&&!p.events.slice(-6).includes('passion-injury')){const e=injuryEvent(s,p);if(e)s.queue.push(e)}}
function processFx(s,x){const p=s.person,f=x?.fx?.passion;if(!f)return;ensurePassions(p);
  if(f.start){const r=startPassion(s,p,f.start,1);if(r.ok)L.log(s,`Vous commencez ${byId[f.start].name.toLowerCase()}.`,true,'passion')}
  if(f.contest){const d=byId[f.contest],px=p.passions[f.contest];if(px){const win=clamp(.08+px.level/180+(p.energy-50)/400+(f.bonus||0),.03,.8),ok=hash(s.seed,p.id,'contest-result',s.year,f.contest)<win;
    if(ok){p.reputation=clamp(p.reputation+6);p.happiness=clamp(p.happiness+8);px.level=clamp(px.level+5);p.visibility??={creative:0,science:0,sport:0};const v=d.group==='sport'?'sport':'creative';p.visibility[v]=clamp(p.visibility[v]+6);L.log(s,`${d.name} : vous remportez une belle place. Votre nom commence à circuler.`,true,'passion')}
    else{p.stress=clamp(p.stress+3);px.level=clamp(px.level+2);L.log(s,`${d.name} : pas cette fois. Vous apprenez beaucoup de la compétition.`,true,'passion')}}}
  if(f.pause&&p.passions[f.pause])p.passions[f.pause].intensity=0;
  if(f.drop)delete p.passions[f.drop];
  if(f.risk&&hash(s.seed,p.id,'risk',s.year)<.35){L.fate?.addCondition(p,'chronic_pain',s.year);L.log(s,'La blessure laisse des douleurs durables.',true,'passion')}}
L.year=function(s,withEvent=true){if(withEvent&&s.person?.alive&&!s.pending)plan(s);const r=base.year(s,withEvent);if(r)for(const q of Object.values(s.people||{}))if(q.alive&&q.passions)passionYear(s,q);if(r)autoPassions(s);return r};
/* Les personnes non jouées (enfants, amis) développent parfois une passion. */
function autoPassions(s){for(const q of Object.values(s.people||{})){if(q.id===s.person.id||!q.alive||q.age<7||q.age>16||q.passions&&Object.keys(q.passions).length)continue;if(hash(s.seed,q.id,'autop',q.age)<.12){const o=offers(s,q)[0];if(o){q.passions={[o.id]:{level:6,since:s.year,years:0,intensity:1,bestLevel:6}}}}}}
L.choose=function(s,i){const x=s.pending?.choices?.[i];const r=base.choose(s,i);if(r){processFx(s,x);if(!s.pending&&s.queue?.length&&s.person.alive)s.pending=s.queue.shift()}return r};
L.passionCareers=careers;L.passionOffers=offers;
L.passionCareersFor=id=>careers.filter(j=>j.passion.id===id);
})(typeof window!=='undefined'?window:globalThis);
