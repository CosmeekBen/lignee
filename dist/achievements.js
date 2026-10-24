/* Succès et niveaux : des petites victoires pour chaque vie, et pour la lignée.
   Les succès appartiennent à la partie entière (toutes les générations).
   Ils ne changent jamais le déroulement de la vie : pure reconnaissance. */
(function(root){const L=root.Life,base={year:L.year,choose:L.choose,action:L.action,inherit:L.inherit,resolveCheck:L.resolveCheck};
const bal=(s,p)=>L.balance(p),ref=(s,p)=>Math.max(1,L.reference(s,p));
const peak=p=>L.lineage?L.lineage.peakRank(p):0;
const has=(p,id)=>p.events.includes(id);
const ratio=(v,t)=>Math.max(0,Math.min(1,v/t));
const list=[
/* Enfance et école */
{id:'first-steps',icon:'👣',cat:'Enfance',name:'Premiers pas dehors',desc:'Franchir la porte pour la première fois.',pts:10,test:(s,p)=>has(p,'ms-nursery')},
{id:'school-day',icon:'🎒',cat:'Enfance',name:'La rentrée',desc:'Entrer à l’école.',pts:10,test:(s,p)=>has(p,'school')},
{id:'secondary',icon:'📚',cat:'Enfance',name:'Grand·e collégien·ne',desc:'Entrer au collège.',pts:10,test:(s,p)=>has(p,'ms-secondary')},
{id:'passion',icon:'🎨',cat:'Enfance',name:'Une passion',desc:'Découvrir ce qu’on aime faire sans qu’on nous le demande.',pts:10,test:(s,p)=>has(p,'talent')},
{id:'bookworm',icon:'🧠',cat:'Études',name:'Tête bien pleine',desc:'Atteindre 40 en Savoirs.',pts:20,test:(s,p)=>p.skills.academic>=40,prog:(s,p)=>ratio(p.skills.academic,40)},
{id:'degree',icon:'🎓',cat:'Études',name:'Diplômé·e',desc:'Obtenir un diplôme supérieur.',pts:20,test:(s,p)=>p.education>=1},
{id:'doctor',icon:'🔬',cat:'Études',name:'Docteur·e',desc:'Aller jusqu’au doctorat.',pts:80,test:(s,p)=>p.education>=3},
{id:'adult',icon:'🗝️',cat:'Vie',name:'Majeur·e',desc:'Fêter ses 18 ans.',pts:10,test:(s,p)=>p.age>=18,prog:(s,p)=>ratio(p.age,18)},
/* Travail */
{id:'first-job',icon:'💼',cat:'Travail',name:'Premier emploi',desc:'Décrocher un premier poste.',pts:20,test:(s,p)=>!!p.career||(p.careerHistory||[]).length>0},
{id:'promo',icon:'📈',cat:'Travail',name:'Un cran au-dessus',desc:'Obtenir une promotion.',pts:20,test:(s,p)=>peak(p)>=2||(p.career?.level||0)>=1},
{id:'boss',icon:'🏢',cat:'Travail',name:'Aux commandes',desc:'Atteindre un poste de direction.',pts:40,test:(s,p)=>peak(p)>=4},
{id:'ceo',icon:'🚀',cat:'Travail',name:'Tout en haut',desc:'Atteindre le sommet d’un métier.',pts:80,test:(s,p)=>peak(p)>=5},
{id:'founder',icon:'🏗️',cat:'Travail',name:'Entreprendre',desc:'Créer sa propre entreprise.',pts:30,test:(s,p)=>!!p.business},
/* Argent */
{id:'saver',icon:'🐷',cat:'Argent',name:'Matelas de sécurité',desc:'Mettre de côté l’équivalent d’un revenu annuel de référence.',pts:20,test:(s,p)=>p.age>=18&&bal(s,p)>=ref(s,p),prog:(s,p)=>p.age<18?0:ratio(bal(s,p),ref(s,p))},
{id:'investor',icon:'📊',cat:'Argent',name:'Investir',desc:'Placer de l’argent sur les marchés.',pts:20,test:(s,p)=>p.funds>0||p.speculation>0},
{id:'home',icon:'🏠',cat:'Argent',name:'Chez soi',desc:'Devenir propriétaire.',pts:30,test:(s,p)=>p.home>0},
{id:'rich',icon:'💎',cat:'Argent',name:'Aisance durable',desc:'Réunir dix fois le revenu de référence.',pts:40,test:(s,p)=>bal(s,p)>=10*ref(s,p),prog:(s,p)=>p.age<18?0:ratio(bal(s,p),10*ref(s,p))},
{id:'against-odds',icon:'🌱',cat:'Argent',name:'Contre toute attente',desc:'Partir d’un foyer très modeste et atteindre cinq fois le revenu de référence.',pts:60,test:(s,p)=>(p.wealthTier??1)<.3&&p.age>=25&&bal(s,p)>=5*ref(s,p)},
/* Relations */
{id:'friends',icon:'🤝',cat:'Relations',name:'Cercle d’amis',desc:'Avoir cinq amis.',pts:10,test:(s,p)=>p.friends.length>=5,prog:(s,p)=>ratio(p.friends.length,5)},
{id:'love',icon:'💞',cat:'Relations',name:'À deux',desc:'Partager sa vie avec quelqu’un.',pts:20,test:(s,p)=>!!p.partner},
{id:'parent',icon:'🍼',cat:'Relations',name:'Parent',desc:'Accueillir un enfant.',pts:30,test:(s,p)=>p.children.length>=1},
{id:'family3',icon:'🏡',cat:'Relations',name:'Maison pleine',desc:'Avoir trois enfants.',pts:40,test:(s,p)=>p.children.length>=3,prog:(s,p)=>ratio(p.children.length,3)},
/* Monde */
{id:'abroad',icon:'🧳',cat:'Monde',name:'Ailleurs',desc:'Vivre dans un autre pays que celui de sa naissance.',pts:30,test:(s,p)=>!!p.bornCountry&&p.country!==p.bornCountry},
{id:'two-passports',icon:'🛂',cat:'Monde',name:'Deux passeports',desc:'Posséder deux nationalités.',pts:40,test:(s,p)=>(p.nationalities||[]).length>=2},
{id:'elected',icon:'🗳️',cat:'Monde',name:'Élu·e',desc:'Remporter un mandat.',pts:60,test:(s,p)=>(p.politics?.wins||[]).length>=1},
{id:'head',icon:'🏛️',cat:'Monde',name:'À la tête du pays',desc:'Diriger un pays.',pts:100,test:(s,p)=>(p.politics?.wins||[]).some(w=>w.key==='head')},
/* Marges */
{id:'shadow',icon:'🌒',cat:'Marges',name:'Dans l’ombre',desc:'Entrer dans un réseau en marge de la loi.',pts:10,test:(s,p)=>(p.outlaw?.level||0)>0||(p.outlaw?.record||0)>0},
{id:'rebuild',icon:'🌅',cat:'Marges',name:'Reconstruction',desc:'Quitter un réseau et rebâtir.',pts:50,test:(s,p)=>!!p.outlaw?.former},
/* Santé et sens */
{id:'bloom',icon:'☀️',cat:'Vie',name:'Épanoui·e',desc:'Atteindre 85 d’épanouissement.',pts:20,test:(s,p)=>p.age>=15&&p.happiness>=85,prog:(s,p)=>p.age<15?0:ratio(p.happiness,85)},
{id:'fit',icon:'💪',cat:'Vie',name:'Solide',desc:'Avoir plus de 90 de santé après 50 ans.',pts:30,test:(s,p)=>p.age>=50&&p.health>=90},
{id:'eighty',icon:'🎂',cat:'Vie',name:'Grand âge',desc:'Fêter ses 80 ans.',pts:40,test:(s,p)=>p.age>=80,prog:(s,p)=>ratio(p.age,80)},
{id:'century',icon:'🏅',cat:'Vie',name:'Centenaire',desc:'Fêter ses 100 ans.',pts:100,test:(s,p)=>p.age>=100,prog:(s,p)=>ratio(p.age,100)},
{id:'dice',icon:'🎲',cat:'Vie',name:'Coup de dé',desc:'Tenter un pari et voir la roue tourner.',pts:10,test:(s,p)=>(p.riskLog||[]).length>=1},
{id:'crit',icon:'✨',cat:'Vie',name:'Critique !',desc:'Faire un 20 naturel au D20.',pts:30,test:s=>!!s.stats?.crit20},
/* Lignée */
{id:'gen2',icon:'🌿',cat:'Lignée',name:'La relève',desc:'Incarner la deuxième génération.',pts:30,test:s=>s.generation>=2},
{id:'gen3',icon:'🌳',cat:'Lignée',name:'Une dynastie',desc:'Incarner la troisième génération.',pts:60,test:s=>s.generation>=3},
{id:'heritage',icon:'🪪',cat:'Lignée',name:'Capital familial',desc:'Hériter d’un capital de lignée d’au moins 30.',pts:40,test:(s,p)=>(p.lineage?.capital||0)>=30,prog:(s,p)=>ratio(p.lineage?.capital||0,30)}
];
const levels=[['Graine',0],['Pousse',30],['Tige',80],['Rameau',150],['Branche',260],['Arbre',420],['Chêne',650],['Forêt',950]];
const byId=Object.fromEntries(list.map(x=>[x.id,x]));

function score(s){return Object.keys(s.trophies||{}).reduce((n,id)=>n+(byId[id]?.pts||0),0)}
function level(s){const pts=score(s);let i=0;while(i+1<levels.length&&pts>=levels[i+1][1])i++;const next=levels[i+1];return{index:i+1,name:levels[i][0],points:pts,from:levels[i][1],to:next?next[1]:null,progress:next?(pts-levels[i][1])/(next[1]-levels[i][1]):1}}
/* Évalue tous les succès ; renvoie les nouveaux. */
function evaluate(s){if(!s?.person)return[];s.trophies??={};s.newTrophies??=[];const p=s.person,fresh=[];
  for(const t of list){if(s.trophies[t.id])continue;let ok=false;try{ok=!!t.test(s,p)}catch(e){ok=false}if(ok){s.trophies[t.id]={year:s.year,age:p.age,name:p.name+' '+p.surname,generation:s.generation};s.newTrophies.push(t.id);fresh.push(t.id)}}
  return fresh}
/* Succès les plus proches, pour donner envie de continuer. */
function nextUp(s,n=2){const p=s.person;return list.filter(t=>!s.trophies?.[t.id]&&t.prog).map(t=>({t,v:t.prog(s,p)})).filter(x=>x.v>0&&x.v<1).sort((a,b)=>b.v-a.v).slice(0,n).map(x=>({...x.t,progress:x.v}))}

L.year=function(s,w=true){const r=base.year(s,w);if(r)evaluate(s);return r};
L.choose=function(s,i){const r=base.choose(s,i);if(r)evaluate(s);return r};
L.action=function(s,...a){const r=base.action(s,...a);if(r?.ok!==false)evaluate(s);return r};
L.inherit=function(s,id){const r=base.inherit(s,id);if(r)evaluate(s);return r};
L.resolveCheck=function(s,...a){const r=base.resolveCheck(s,...a);if(r?.die===20){s.stats??={};s.stats.crit20=true}evaluate(s);return r};
L.achievements={list,levels,evaluate,score,level,nextUp,byId};
})(typeof window!=='undefined'?window:globalThis);
