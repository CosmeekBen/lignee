const assert=require('node:assert/strict');
for(const n of ['engine','world','depth','time','checks','occupations','society','standing','lineage','names','education','fate','passions','life-choices','milestones','achievements'])require('./dist/'+n+'.js');const L=globalThis.Life;
const play=(s,until=999,pick)=>{let g=0;while(s.person.alive&&s.person.age<until&&g++<500){if(s.pending){const e=s.pending;const ok=e.choices.findIndex(c=>!L.canChoose(s,c));L.choose(s,pick?pick(e,ok):(ok<0?0:ok))}else L.year(s)}return s};
// ── Noms cohérents avec la culture
const sur=code=>new Set(Array.from({length:40},(_,i)=>L.create('N'+code+i,code).person.surname));
for(const [code,must] of [['CD','Mukendi Kasongo Ilunga Mbuyi Kalala Mutombo Ngoy Kabamba Mwamba Banza Tshibangu Nsimba Lukusa Kitenge Mpoyi Kalonji Kanyinda'],['JP','Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura Kobayashi Kato Yoshida Yamada'],['FR','Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel Garcia Fournier Girard Roux Fontaine']]){const names=sur(code);const ok=[...names].filter(x=>must.split(' ').includes(x)).length;assert(ok>=names.size*.7,code+' : noms de famille cohérents ('+[...names].join(', ')+')')}
const robin=new Set();for(let i=0;i<80;i++){const s=L.create('R'+i,'CD');for(const q of s.person.parents)robin.add(q.name)}assert(!robin.has('Robin')&&!robin.has('Sasha'),'pas de parents génériques au Congo');
for(let i=0;i<30;i++){const s=L.create('P'+i,'RU'),p=s.person,mother=p.parents.find(x=>x.role==='mère'),father=p.parents.find(x=>x.role==='père');assert(mother&&father&&father.surname&&p.surname,'parents nommés');assert(p.sex==='F'?/a$/.test(p.surname)||!/(ov|ev|in|sky)$/.test(p.surname):true,'forme féminine des noms slaves');}
const et=L.create('ET1','ET'),f=et.person.parents.find(x=>x.role==='père');assert.equal(et.person.surname,f.name,'patronyme éthiopien');
// ── Scolarité : statistiques par pays et par sexe
const stats=(c,sx)=>{const s=L.create('S'+c+sx,c);s.person.sex=sx;return L.schoolStats(s)};
const sd=stats('SD','F'),fr=stats('FR','F'),af=stats('AF','F'),afM=stats('AF','M');assert(sd[2].country<25&&fr[2].country>75,'lycée rare au Soudan, courant en France');assert(af[2].sex<afM[2].sex*.5,'accès très inégal en Afghanistan dans le modèle');assert(sd[0].country>sd[1].country&&sd[1].country>sd[2].country&&sd[2].country>sd[3].country,'cascade décroissante');
// Atteindre le lycée est rare dans les pays pauvres, courant dans les riches.
const reach=(code,n)=>{let c=0;for(let i=0;i<n;i++){const s=L.create('RC'+code+i,code);play(s,19,(e,ok)=>/^edu-(lower|upper|tertiary)$/.test(e.id)?1:(ok<0?0:ok));if(L.schoolLevel(s.person)>=3)c++}return c/n};
const rSD=reach('SD',150),rFR=reach('FR',60);assert(rSD>.08&&rSD<.45,'Soudan : '+rSD);assert(rFR>.8,'France : '+rFR);
// Le choix de ne pas continuer est réel.
const stop=L.create('STOP','FR');play(stop,12,(e,ok)=>e.id==='edu-lower'?2:(ok<0?0:ok));assert(L.schoolLevel(stop.person)<2||stop.person.school.history.some(h=>h.stage==='lower'&&!h.ok),'arrêter est possible');
// ── Cohérence des métiers
const mk=(fn)=>{const s=L.create('JOB','FR');s.pending=null;Object.assign(s.person,{age:24,education:0,cash:5000});s.person.school={level:3,history:[]};fn&&fn(s.person);return s};
const title=t=>L.occupations.find(j=>j.title===t);const reasons=(s,t)=>L.jobReasons(s,title(t));
let s0=mk();assert(reasons(s0,'Graphiste').length>0,'graphiste sans formation ni passion');assert(reasons(s0,'Ingénieur·e IA').length>0);assert(reasons(s0,'Agent·e de centre d’appels').length===0,'téléconseiller accessible avec le secondaire');
let s1=mk(p=>{p.career={sector:'service',level:1,years:8};p.experience={service:8};p.job='Agent·e de centre d’appels'});assert(reasons(s1,'Ingénieur·e IA').length>0,'téléconseiller → ingénieur IA impossible sans études');
let s2=mk(p=>{p.passions={drawing:{level:30,intensity:2,years:6}};p.skills.creative=30});assert.equal(reasons(s2,'Graphiste').length,0,'passion du dessin → graphiste');
let s3=mk(p=>{p.fieldsLow=['arts'];p.skills.creative=30});assert.equal(reasons(s3,'Graphiste').length,0,'voie artistique du lycée → graphiste');
let s4=mk(p=>{p.education=2;p.fields=['tech','stem'];p.skills.technical=50});assert.equal(reasons(s4,'Ingénieur·e IA').filter(r=>/Formation requise/.test(r)).length,0,'diplôme informatique ouvre l’IA');
let s5=mk();assert(reasons(s5,'Boxeur·se semi-professionnel·le').length>0,'pas de boxeur sans passion');
let s6=mk(p=>{p.passions={boxing:{level:60,intensity:3,years:8}}});assert.equal(reasons(s6,'Boxeur·se semi-professionnel·le').length,0,'boxe pratiquée → boxeur semi-pro');assert(reasons(s6,'Boxeur·se international·e').length>0,'international : trop tôt');
let s7=mk(p=>{p.passions={boxing:{level:60,intensity:3,years:8}};p.age=48});assert(reasons(s7,'Boxeur·se semi-professionnel·le').some(r=>/âge/.test(r)),'limite d’âge du sport de haut niveau');
let s8=mk(p=>{p.school={level:1,history:[]}});assert(reasons(s8,'Agent·e de centre d’appels').some(r=>/Scolarité/.test(r)),'scolarité minimale exigée');
// Une formation donne le droit au métier.
const stu=L.create('STUDY','FR');stu.pending=null;Object.assign(stu.person,{age:18,cash:5e4,wealthTier:.8});stu.person.school={level:3,history:[]};stu.person.skills.academic=70;stu.person.skills.technical=40;
let admitted=null;for(let t=0;t<5&&!admitted;t++){const r=L.enrol(stu,'bootcamp',3);assert(r.ok);if(r.admitted)admitted=r;else stu.year++}assert(admitted,'admission');let guard=0;while(stu.person.study&&guard++<10){if(stu.pending)L.choose(stu,0);else L.year(stu)}assert(stu.person.qualifications?.some(q=>q.program==='bootcamp'),'diplôme obtenu');assert(L.hasField(stu.person,['tech']),'domaine acquis');
// ── Imprévus
assert.equal(L.fate.hazards.find(h=>h.id==='lottery').rate({s:L.create('LT','ML'),p:{...L.create('LT','ML').person,age:30},c:L.country(L.create('LT','ML'))}),0,'pas de loto au Mali');
const sa=L.create('LT','SA');assert.equal(L.fate.hazards.find(h=>h.id==='lottery').rate({s:sa,p:{...sa.person,age:30},c:L.country(sa)}),0,'jeux interdits');
let wins=0;for(let i=0;i<400;i++){const t=L.create('LT'+i,'FR');t.person.age=30;const r=L.fate.hazards.find(h=>h.id==='lottery').rate({s:t,p:t.person,c:L.country(t)});if(r>0)wins++}assert(wins>60&&wins<400,'une partie des Français joue');
{const t=L.create('CAR','FR');t.person.age=35;t.person.vehicle='none';assert.equal(L.fate.hazards.find(h=>h.id==='car-crash').rate({s:t,p:t.person,c:L.country(t)}),0,'pas d’accident sans véhicule')}
{const rich=L.create('HQ1','CH'),poor=L.create('HQ2','NE');assert(L.fate.care(rich,rich.person,L.country(rich))>L.fate.care(poor,poor.person,L.country(poor))+.3,'soins plus accessibles en Suisse qu’au Niger')}
let counts=[],causes=0;for(let i=0;i<60;i++){const s=L.create('FT'+i,['FR','SD','IN'][i%3]);play(s);const n=(s.person.fate?.log||[]).length;counts.push(n);assert(n<=9,'plafond d’imprévus par vie');if(s.person.cause)causes++;const times=s.person.fate?.log||[];for(let k=1;k<times.length;k++)assert(times[k].year-times[k-1].year>=3,'jamais deux imprévus de suite')}
const mean=counts.reduce((a,b)=>a+b,0)/counts.length;assert(mean>=3&&mean<=9,'imprévus par vie : '+mean);
// ── Anti-répétition
let maxGang=0,maxEv=0;for(let i=0;i<60;i++){const s=L.create('REP'+i);const seen={};let g=0;while(s.person.alive&&g++<500){if(s.pending){const e=s.pending;const key=e.id.replace(/-\d{4}$/,'');seen[key]=(seen[key]||0)+1;const ok=e.choices.findIndex(c=>!L.canChoose(s,c));L.choose(s,ok<0?0:ok)}else L.year(s)}maxGang=Math.max(maxGang,Object.keys(seen).filter(k=>k.startsWith('society-recruit')).reduce((n,k)=>n+seen[k],0));for(const[k,v]of Object.entries(seen))if(!/^(project|edu-|passion-contest|struggle|edu|budget)/.test(k)&&k!=='birth')maxEv=Math.max(maxEv,v)}
assert(maxGang<=3,'recrutement par un gang : '+maxGang+' fois au maximum');assert(maxEv<=4,'une même décision revient au plus 4 fois : '+maxEv);
// ── Identité, relations, luttes
{const s=L.create('ID1','FR');s.pending=null;s.person.identity={orientation:'gay',romance:'open',out:{}};s.person.sex='M';const sexes=new Set();for(let i=0;i<30;i++){s.serial=i*7;sexes.add(L.partnerSex(s,s.person))}assert.deepEqual([...sexes],['M'],'partenaire du même sexe');s.person.identity.orientation='hetero';assert.equal(L.partnerSex(s,s.person),'F');s.person.identity.romance='none';const r=L.action(s,'date');assert.equal(r.ok,false,'pas de rendez-vous sans envie de relation')}
let struggles=0,fam=[];for(let i=0;i<80;i++){const s=L.create('STR'+i,['SD','IN','FR'][i%3]);play(s,60,(e,ok)=>e.id.startsWith('struggle-')&&!e.id.includes('out')?(struggles++,Math.floor(L.hash(s.seed+'|k'+s.year)*e.choices.length)):(ok<0?0:ok));fam.push(L.familyAcceptance(s,s.person))}assert(struggles>=30,'des luttes se présentent : '+struggles);for(const f of fam)assert(f>=0&&f<=1);
const sw=L.struggles.find(x=>x.id==='forced-marriage');assert(['accept','refuse','stall','negotiate','flee'].every(k=>sw.stances[k]),'mariage imposé : cinq attitudes possibles');const ctxLow={bond:.2,tier:.2,poor:.8,urban:false},ctxHigh={bond:.9,tier:.7,poor:.2,urban:true};assert(sw.stances.refuse.pOk(ctxHigh)>sw.stances.refuse.pOk(ctxLow),'un lien familial fort aide à faire accepter son refus');
// ── Passions
{const s=L.create('PS','FR');s.pending=null;s.person.age=12;assert(L.startPassion(s,'boxing',2).ok);for(let i=0;i<8;i++){L.year(s);while(s.pending)L.choose(s,0)}const lvl=s.person.passions.boxing.level;assert(lvl>25,'la boxe progresse : '+lvl);assert(L.available(s.person)<L.capacity(s.person),'la pratique occupe du temps')}
{const s=L.create('PS2','FR');s.pending=null;s.person.age=12;assert.equal(L.startPassion(s,'golf',1).ok,false,'le golf n’est pas accessible à tous')}
console.log(JSON.stringify({world:'passed',reachLycee:{SD:rSD,FR:rFR},fatePerLife:+mean.toFixed(1),struggles,passionCareers:L.passionCareers.length,occupations:L.occupations.length}));
