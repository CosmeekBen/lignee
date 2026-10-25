const assert=require('node:assert/strict');
for(const n of ['engine','world','facts','depth','time','checks','occupations','society','standing','lineage','names','currency','education','fate','mortality','passions','life-choices','milestones','threads','outcomes','variants','achievements','path'])require('./dist/'+n+'.js');const L=globalThis.Life;
const play=(s,until=999,pick)=>{let g=0;while(s.person.alive&&s.person.age<until&&g++<500){if(s.pending){const e=s.pending;const ok=e.choices.findIndex(c=>!L.canChoose(s,c));L.choose(s,pick?pick(e,ok):(ok<0?0:ok))}else L.year(s)}return s};
// ── Noms cohérents avec la culture
const sur=code=>new Set(Array.from({length:40},(_,i)=>L.create('N'+code+i,code).person.surname));
for(const [code,must] of [['CD','Mukendi Kasongo Ilunga Mbuyi Kalala Mutombo Ngoy Kabamba Mwamba Banza Tshibangu Nsimba Lukusa Kitenge Mpoyi Kalonji Kanyinda'],['JP','Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura Kobayashi Kato Yoshida Yamada'],['FR','Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel Garcia Fournier Girard Roux Fontaine']]){const names=sur(code);const ok=[...names].filter(x=>must.split(' ').includes(x)).length;assert(ok>=names.size*.7,code+' : noms de famille cohérents ('+[...names].join(', ')+')')}
const robin=new Set();for(let i=0;i<80;i++){const s=L.create('R'+i,'CD');for(const q of s.person.parents)robin.add(q.name)}assert(!robin.has('Robin')&&!robin.has('Sasha'),'pas de parents génériques au Congo');
for(let i=0;i<30;i++){const s=L.create('P'+i,'RU'),p=s.person,mother=p.parents.find(x=>x.role==='mère'),father=p.parents.find(x=>x.role==='père');assert(mother&&father&&father.surname&&p.surname,'parents nommés');assert(p.sex==='F'?/a$/.test(p.surname)||!/(ov|ev|in|sky)$/.test(p.surname):true,'forme féminine des noms slaves');}
const et=L.create('ET1','ET'),f=et.person.parents.find(x=>x.role==='père');assert.equal(et.person.surname,f.name,'patronyme éthiopien');
// ── Scolarité : statistiques par pays et par sexe
const stats=(c,sx)=>{const s=L.create('S'+c+sx,c);s.person.sex=sx;return L.schoolStats(s)};
const sd=stats('SD','F'),fr=stats('FR','F'),af=stats('AF','F'),afM=stats('AF','M');assert(sd[2].country<40&&sd[2].country>15&&fr[2].country>75,'lycée minoritaire au Soudan, courant en France');assert(af[2].sex<afM[2].sex*.5,'accès très inégal en Afghanistan dans le modèle');assert(sd[0].country>sd[1].country&&sd[1].country>sd[2].country&&sd[2].country>sd[3].country,'cascade décroissante');
// Atteindre le lycée est rare dans les pays pauvres, courant dans les riches.
const reach=(code,n)=>{let c=0;for(let i=0;i<n;i++){const s=L.create('RC'+code+i,code);play(s,19,(e,ok)=>/^edu-(lower|upper|tertiary)$/.test(e.id)?1:(ok<0?0:ok));if(L.schoolLevel(s.person)>=3)c++}return c/n};
const rSD=reach('SD',150),rFR=reach('FR',60);assert(rSD>.12&&rSD<.5,'Soudan : '+rSD);assert(rFR>.8,'France : '+rFR);
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

// ── Monnaies et équivalents en euros
{for(const c of L.countries)assert(L.currency.map[c.code],'monnaie manquante : '+c.code);const a=L.create('CUR1','FR'),b=L.create('CUR2','SD'),u=L.create('CUR3','US');
 assert(L.currency.upaToEUR(a,10000)>L.currency.upaToEUR(b,10000)*2,'un même montant en UPA vaut moins d’euros au Soudan qu’en France');
 assert.equal(L.currency.localText(a,10000),'','pas de monnaie locale à afficher en zone euro');assert(/SDG/.test(L.currency.localText(b,10000)));assert(/USD/.test(L.currency.localText(u,10000)));
 assert(/€/.test(L.currency.describe(b,5000)));for(const x of [a,b,u])assert(!/NaN|undefined/.test(L.currency.describe(x,1234567)))}

// ── Les montants suivent le pays où l'on vit
{const m=L.create('LZ1','ML');const txt='Il manque 2 000 UPA, soit 12 500 UPA/an et 3 <small>UPA</small>.';const a=L.currency.localize(m,txt);assert(/XOF/.test(a)&&/€/.test(a)&&!/UPA/.test(a),'Mali : franc CFA avec équivalent en euros : '+a);
 m.person.country='FR';const b=L.currency.localize(m,'1 500 UPA');assert(/€$/.test(b)&&!/XOF/.test(b),'après déménagement en France : euros seulement : '+b);
 m.person.country='US';assert(/\$ \(≈ .* €\)$/.test(L.currency.localize(m,'1 500 UPA')),'États-Unis : dollars avec équivalent');
 L.log(m,'Vous recevez 3 000 UPA',true);assert(!/UPA/.test(m.journal.at(-1).text)&&/\$/.test(m.journal.at(-1).text),'journal écrit dans la monnaie du moment');
 assert.equal(L.currency.localize(m,'rien à convertir'),'rien à convertir')}

// ── Suites des choix : animaux, premier amour, amitiés, causes de décès, variété des débuts
{let pets=0,named=0,follow=0,lines=0;for(let i=0;i<80;i++){const s=L.create('TH'+i,['FR','SD','IN'][i%3]);play(s);const j=s.journal.map(x=>x.text);if(j.some(t=>/adoptez|refusent d’adopter/.test(t)))pets++;if(s.person.pets?.length)named++;if(j.some(t=>/Le tournoi|remporte le tournoi|s’incline en finale|réconciliez|rétablit|ne se remet pas|meurt à \d+ ans, votre|s’éteint/.test(t)))follow++;if(!j.some(t=>/^Ce qui s’est passé —/.test(t)))lines++}
 assert(pets>=8,'des animaux croisent la route : '+pets);assert(follow>=40,'les choix ont des suites : '+follow);assert.equal(lines,80,'pas de ligne de journal redondante')}
{const causes=new Set();let noCause=0,dead=0;for(let i=0;i<120;i++){const s=L.create('DC'+i,['SD','FR','UA','NG'][i%4]);play(s);if(!s.person.alive){dead++;if(!s.person.cause)noCause++;else causes.add(s.person.cause)}}assert(dead>=100&&noCause===0,'chaque décès a une cause : '+noCause+'/'+dead);assert(causes.size>=8,'causes variées : '+causes.size);
 const kid=L.create('KID8','SD');kid.person.age=8;assert(typeof L.causeOfDeath(kid,kid.person)==='string');const j=L.create('KID9','FR');j.person.age=92;assert.notEqual(L.causeOfDeath(j,j.person),L.causeOfDeath(kid,kid.person)+'x')}
{const sch=new Set(),bir=new Set(),tal=new Set();for(let i=0;i<120;i++){const s=L.create('VAR'+i,['FR','SD','IN','US','BR'][i%5]);bir.add(s.pending.text.slice(0,40));let g=0;while(s.person.alive&&s.person.age<19&&g++<200){if(s.pending){const e=s.pending;if(e.id==='school')sch.add(e.title);if(e.id==='talent')tal.add(e.title);const ok=e.choices.findIndex(c=>!L.canChoose(s,c));L.choose(s,ok<0?0:ok)}else L.year(s)}}assert(bir.size>=8&&sch.size>=5&&tal.size>=4,'débuts variés : naissances '+bir.size+', écoles '+sch.size+', passions '+tal.size)}

// ── La mort en chiffres
{const mk=(code,age,cause)=>{const t=L.create('MS'+code+age,code);t.person.age=age;t.person.cause=cause;t.person.alive=false;return t};
 const sd=L.mortality.stats(mk('SD',8,'une pneumonie'),mk('SD',8,'une pneumonie').person),fr=L.mortality.stats(mk('FR',8,'une pneumonie'),mk('FR',8,'une pneumonie').person);
 assert(sd.cumCountry>fr.cumCountry*5,'bien plus d’enfants meurent avant 8 ans au Soudan qu’en France');assert(sd.riskCountry>fr.riskCountry*3);assert(sd.causeCountry.per100k>sd.causeFR.per100k*2,'la pneumonie tue davantage à soins moindres');assert(sd.ratio>2);
 for(const [code,age,cause] of [['SD',2,'le paludisme'],['FR',58,'infarctus'],['IN',30,'un accident de la route'],['US',90,'les suites du grand âge'],['BR',1,'une infection néonatale'],['JP',70,'un cancer']]){const t=mk(code,age,cause);const lines=L.mortality.lines(t,t.person);assert(lines.length>=3);for(const l of lines)assert(!/NaN|undefined|Infinity/.test(l.label+l.note),code+' '+l.label)}
 assert(/au Soudan/.test(L.mortality.lines(mk('SD',8,'une pneumonie'))[0].label)&&/aux États-Unis/.test(L.mortality.lines(mk('US',40,'un cancer'))[0].label),'accord du pays');
 // mortalité des enfants : plus élevée dans les pays pauvres, comparable à la réalité en ordre de grandeur
 assert(L.mortality.cum(L.create('x','NE'),'NE',5)*1000>60&&L.mortality.cum(L.create('x','FR'),'FR',5)*1000<20,'mortalité avant 5 ans plausible')}

// ── Calibrage : le jeu reproduit l'espérance de vie et la mortalité des enfants de chaque pays
{const t=L.create('CAL','FR');for(const c of L.countries){assert(Number.isFinite(c.life)&&c.life>=45&&c.life<=90,'espérance de vie '+c.code);assert(c.income>=500&&c.nominal>=100&&c.u5>=1&&c.u5<=130,'données '+c.code);const le=L.modelLifeExpectancy(c);assert(Math.abs(le-(c.life+Math.min(6,Math.max(0,.16*(c.life-50)))))<.6,'espérance de vie du modèle '+c.code+' : '+le+' vs '+c.life)
  let S=1;for(let a=0;a<5;a++)S*=1-L.deathRate(t,{country:c.code,age:a,health:85});assert(Math.abs((1-S)*1000-c.u5)<c.u5*.08+.4,'mortalité avant 5 ans '+c.code+' : '+((1-S)*1000).toFixed(1)+' vs '+c.u5)}
 const ages={};for(const code of ['FR','SD','IN']){let sum=0,n=140;for(let i=0;i<n;i++){const s=L.create('LE'+code+i,code);play(s);sum+=s.person.age}ages[code]=sum/n;const life=L.countries.find(x=>x.code===code).life;assert(Math.abs(sum/n-life)<4,code+' : âge moyen simulé '+(sum/n).toFixed(1)+' vs espérance de vie '+life)}
 assert(L.countries.find(x=>x.code==='NG').life<60&&L.countries.find(x=>x.code==='JP').life>82,'ordres de grandeur réels');
 assert(L.odds.both(.5)==='50 % (1 chance sur 2)'&&L.odds.both(.25)==='25 % (1 chance sur 4)'&&/^10 % \(1 chance sur 10\)$/.test(L.odds.both(.1))&&/3 chances sur 4/.test(L.odds.both(.75))&&/1 chance sur 2,7 millions/.test(L.odds.both(3.7e-7)),'pourcentages et chances')}
console.log(JSON.stringify({world:'passed',reachLycee:{SD:rSD,FR:rFR},fatePerLife:+mean.toFixed(1),struggles,passionCareers:L.passionCareers.length,occupations:L.occupations.length}));
{const L=globalThis.Life;let ok=0,none=0;for(let n=0;n<40;n++){const s=L.create({seed:'out'+n,country:'IN'});for(let y=0;y<13;y++)if(s.person.alive){L.year(s);if(s.pending)L.choose(s,0)}
if(!s.person.alive)continue;s.pending={id:'teen-needhands',title:'La famille a besoin de bras',text:'x',choices:[{label:'Aider',fx:{}},{label:'Plaider pour rester à l’école',fx:{}},{label:'Chercher une aide',fx:{}}]};L.choose(s,1);
if(s.pending?.id==='out-teen-needhands'&&/parents|aide|école/.test(s.pending.text)&&s.journal.at(-1).text.length>10){ok++;L.choose(s,0)}else none++}
if(!ok||none)throw new Error('outcomes: ok '+ok+' none '+none);console.log('outcomes ok',ok);}
{const L=globalThis.Life;
// parcours : situation lisible et règles de compatibilité
const s=L.create({seed:'path1',country:'FR'});for(let y=0;y<12&&s.person.alive;y++){L.year(s);while(s.pending)L.choose(s,s.pending.choices.length>1&&/^edu-|struggle/.test(s.pending.id)?1:0)}
const sit=L.situation(s);assert(sit.kind&&sit.label,'situation');assert(Array.isArray(L.diplomas(s)),'diplômes');
const t=L.create({seed:'path2',country:'FR'});t.person.age=19;t.person.school={level:3,history:[]};t.person.education=1;t.person.study={program:'bts',year:0,years:2,effort:2,started:t.year,failedYears:0,intent:2};
assert(L.situation(t).kind==='study','en formation');const j=L.occupations.find(x=>x.rank===0);assert(L.jobReasons(t,j).some(r=>/en formation/.test(r)),'pas de poste plein temps pendant les études');
t.person.study.intent=1;assert(!L.jobReasons(t,j).some(r=>/en formation/.test(r)),'rythme léger : emploi possible');
const u=L.create({seed:'path3',country:'FR'});u.person.age=13;u.person.school={level:2,history:[],stopped:true,stoppedAge:12};assert(L.situation(u).kind==='outschool','hors de l’école');assert(!L.pathFits(u,u.person,{id:'edu-upper'})&&!L.pathFits(u,u.person,{id:'teen-exam'}),'pas d’événements scolaires hors de l’école');
console.log('path ok');}
