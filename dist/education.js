/* Scolarité, études et cohérence des métiers.
   - Accès à l'école, au collège, au lycée et au supérieur selon le pays, le foyer et le sexe.
   - Vrais choix : vouloir ou non continuer, quelle filière, quelle école, comment financer.
   - Les métiers exigent désormais une scolarité, un domaine d'études (ou l'expérience, ou une
     passion développée) : on ne passe pas de téléconseiller à ingénieur en IA sans formation.
   Les taux par pays sont des ordres de grandeur de simulation, pas des statistiques officielles. */
(function(root){const L=root.Life,clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const base={year:L.year,choose:L.choose,ensure:L.ensure};
const hash=(...a)=>L.hash(a.join('|'));
const LEVELS=['Aucune scolarité','École primaire','Collège','Lycée','Études supérieures'];

/* ── Tags de domaines d'études et exigences par secteur ── */
const FIELD_NAMES={stem:'sciences et ingénierie',tech:'informatique',health:'santé',law:'droit',business:'gestion et commerce',arts:'arts et design',media:'médias et communication',humanities:'lettres et sciences humaines',social:'travail social et psychologie',education:'enseignement',agri:'agriculture',industry:'industrie',trades:'métiers techniques',transport:'transport et navigation',hospitality:'hôtellerie et cuisine',security:'sécurité',defense:'défense',public:'administration publique',science:'recherche scientifique'};
const S=(fields,open,passions=[],entry=2)=>({fields:fields.split(' '),open,passions,entrySchool:entry});
const SEC={tech:S('tech stem',0,['tech']),ai:S('tech stem',0,['tech']),robotics:S('stem industry tech',0,['tech','craft']),creative:S('arts media',0,['arts']),games:S('tech arts media',0,['tech','arts']),cinema:S('arts media',0,['arts']),music:S('arts',0,['music']),media:S('media humanities',0,['arts','writing']),creator:S('media arts tech',2,['arts','tech','writing']),fashion:S('arts trades',0,['arts','craft']),craft:S('trades arts',2,['craft'],1),building:S('trades industry stem',1,['craft'],1),architecture:S('stem arts',0,['arts']),factory:S('industry trades',1,[],1),industry:S('industry stem trades',1,[],1),energy:S('stem industry trades',0),environment:S('stem agri science',1,['nature']),agriculture:S('agri trades',2,['nature'],1),maritime:S('transport trades',1,[],1),transport:S('transport trades',1,[],1),aviation:S('transport stem',0),logistics:S('business transport',1,[],1),commerce:S('business',2,[],1),hospitality:S('hospitality business',2,['cuisine'],1),tourism:S('hospitality business humanities',1,['travel'],1),service:S('business social',2,[],1),care:S('health social',0),healthtech:S('health stem tech',0),education:S('education humanities social',0),science:S('stem science health',0),law:S('law',0),management:S('business',0),entrepreneurship:S('business tech arts trades',3,['tech','arts','craft']),hr:S('business social law',0),public:S('public law humanities social business',1),diplomacy:S('humanities law social public',0),politics:S('public law humanities social',0),security:S('security law public defense',1,[],1),military:S('defense security',1,[],1),sport:S('',1,['sport']),social:S('social humanities health',0)};
const EXP_FOR=[0,1,4,8,12,15],PASS_THR=[0,20,40,60,75,88];
const fieldNames=list=>list.map(f=>FIELD_NAMES[f]||f).slice(0,3).join(', ');
const levelOf=p=>p.school?.level??(p.age>=15?(p.education>=1?4:3):p.age>=11?2:p.age>=6?1:0);
function hasField(p,wanted,low=false){const have=new Set([...(p.fields||[]),...(low?p.fieldsLow||[]:[])]);if(p.degreeSector&&SEC[p.degreeSector])SEC[p.degreeSector].fields.forEach(f=>have.add(f));return wanted.some(f=>have.has(f))}
function passionRoute(p,sec,rank){const t=PASS_THR[rank]??90;return Object.entries(p.passions||{}).some(([id,v])=>sec.passions.includes(L.passionGroup?.(id))&&v.level>=t)}

/* Raisons ajoutées au contrôle d'accès des métiers (appelé par society.js). */
function extraJobReasons(s,j,p){const out=[];if(p.age<18)return out;const sec=SEC[j.sector];if(!sec)return out;
  const need=j.rank===0?sec.entrySchool:3,lvl=levelOf(p);if(lvl<need)out.push('Scolarité requise : '+LEVELS[need].toLowerCase()+' achevé'+(need===1?'e':need===3?'':'')+'.');
  if(j.passion){const lv=p.passions?.[j.passion.id]?.level||0;if(lv<j.passion.min)out.push('Passion « '+(L.passionName?.(j.passion.id)||j.passion.id)+' » : niveau '+j.passion.min+'/100 requis (vous : '+Math.round(lv)+').');if(j.maxAge&&p.age>j.maxAge)out.push('Carrière de haut niveau limitée par l’âge (maximum '+j.maxAge+' ans).');if(p.health<55)out.push('Une condition physique solide est nécessaire.')}
  else if(j.rank>sec.open){const exp=p.experience?.[j.sector]||0,need2=EXP_FOR[j.rank];
    const field=hasField(p,sec.fields,j.rank<=2),expOk=exp>=need2&&L.skill(p,L.sectors[j.sector].skill)>=Math.max(20,j.minSkill*.8),pass=passionRoute(p,sec,j.rank);
    if(!(field||expOk||pass))out.push('Formation requise ('+(fieldNames(sec.fields)||'domaine spécialisé')+')'+(sec.passions.length?', une passion très développée':'')+' ou '+need2+' an'+(need2>1?'s':'')+' d’expérience dans ce secteur.')}
  return out}
L.extraJobReasons=extraJobReasons;L.hasField=hasField;L.fieldNames=FIELD_NAMES;L.sectorRequirements=SEC;L.schoolLevel=levelOf;L.schoolLevels=LEVELS;

/* ── Accès à la scolarité par pays, foyer et sexe ── */
const poorness=c=>clamp(1-Math.log(c.income/1500)/Math.log(45000/1500),0,1);
const cum={primary:c=>.55+.43*Math.pow(1-poorness(c),.8),lower:c=>.25+.72*Math.pow(1-poorness(c),.9),upper:c=>.10+.85*Math.pow(1-poorness(c),1.15),tertiary:c=>clamp(.04+.5*(Math.log(c.income/1500)/Math.log(45000/1500)),.04,.6)};
const STAGES=[{id:'primary',age:6,level:1,label:'l’école primaire',short:'primaire'},{id:'lower',age:11,level:2,label:'le collège',short:'collège'},{id:'upper',age:15,level:3,label:'le lycée',short:'lycée'},{id:'tertiary',age:18,level:4,label:'les études supérieures',short:'supérieur'}];
/* Rapport filles/garçons (indicatif) : par région, quelques pays où l'accès est très restreint. */
const parityRegion={Afrique:.92,Asie:.97,Amériques:1.06,Europe:1.03,Océanie:1};const parityCountry={AF:.2};
const parity=(c,stage)=>stage==='primary'?Math.min(1,parityCountry[c.code]?.valueOf()?(.55+.45*parityCountry[c.code]):(parityRegion[c.region]??1)):(parityCountry[c.code]??parityRegion[c.region]??1);
function sexRate(c,stage,sex,rate){const g=parity(c,stage),m=(1+g)/2;return clamp(sex==='F'?rate*g/m:rate/m,.01,.99)}
const prev={primary:null,lower:'primary',upper:'lower',tertiary:'upper'};
function stageOdds(s,p,id){const c=L.country(s,p),all=cum[id](c),sx=sexRate(c,id,p.sex,all);
  const before=prev[id]?sexRate(c,prev[id],p.sex,cum[prev[id]](c)):1,tier=p.wealthTier??.5;
  let you=clamp(sx/Math.max(.02,before),.03,.99);you=clamp(1-(1-you)*(1.65-tier*1.1)+(p.skills.academic-15)/500+(p.urban?.02:-.02),.03,.98);
  return{country:all,sex:sx,you,conditional:clamp(all/Math.max(.02,prev[id]?cum[prev[id]](c):1),.03,.99),conditionalSex:clamp(sx/Math.max(.02,before),.03,.99)}}
function schoolStats(s,p=s.person){const c=L.country(s,p);return STAGES.map(st=>{const o=stageOdds(s,p,st.id);return{id:st.id,label:st.label,short:st.short,age:st.age,country:Math.round(o.country*100),sex:Math.round(o.sex*100),other:Math.round(sexRate(c,st.id,p.sex==='F'?'M':'F',o.country)*100),you:Math.round(o.you*100),reached:levelOf(p)>=st.level}})}
L.schoolStats=schoolStats;L.stageOdds=stageOdds;

/* ── Programmes de formation ── */
const P=(id,name,kind,level,years,cost,fields,o={})=>({id,name,kind,level,years,cost,fields:fields.split(' '),minSchool:o.minSchool??3,minAge:o.minAge??17,minAcademic:o.minAcademic??0,selectivity:o.selectivity??.2,minIncome:o.minIncome??0,skill:o.skill??'academic',loan:o.loan??true,free:o.free,desc:o.desc,sector:o.sector});
const programs=[
P('second-chance','École de la deuxième chance','secondary',0,2,.01,'',{minSchool:0,minAge:16,selectivity:.1,skill:'academic',desc:'Rattraper le collège et le lycée à l’âge adulte, avec des cours du soir ou associatifs.',free:true,loan:false}),
P('cap','Formation courte aux métiers (CAP, certificat)','vocational',1,2,.02,'trades craft hospitality industry',{minSchool:2,minAge:15,selectivity:.1,skill:'technical',desc:'Deux ans pour apprendre un métier concret : atelier, cuisine, coiffure, mécanique, électricité…',loan:false,sector:'craft'}),
P('apprentice','Apprentissage en alternance','vocational',1,3,0,'trades industry hospitality business tech',{minSchool:2,minAge:16,selectivity:.2,skill:'technical',desc:'Vous êtes formé·e en entreprise, avec un petit salaire. Moins de théorie, beaucoup de pratique.',loan:false,free:true,sector:'industry'}),
P('bts','Diplôme technique court (bac+2)','vocational',1,2,.035,'trades industry tech business transport',{selectivity:.25,skill:'technical',desc:'Un diplôme court et ciblé, avec stages. Bon accès aux postes techniques.',sector:'industry'}),
P('bootcamp','Bootcamp de développement','vocational',1,1,.03,'tech',{minSchool:3,selectivity:.25,minAcademic:15,skill:'technical',desc:'Un an intensif pour devenir développeur·se. Le métier de la technologie s’apprend aussi hors des universités.',sector:'tech',loan:false}),
P('nursing','École d’infirmier·ère et d’aide-soignant·e','vocational',1,3,.04,'health social',{selectivity:.35,minAcademic:20,minIncome:1800,skill:'academic',desc:'Trois ans, beaucoup de stages à l’hôpital. Des postes dans presque tous les pays.',sector:'care'}),
P('hotel','École hôtelière et de cuisine','vocational',1,2,.04,'hospitality business',{minSchool:2,selectivity:.2,skill:'technical',desc:'Cuisine, service, gestion d’établissement. Un tremplin vers l’hôtellerie, la restauration, le tourisme.',sector:'hospitality'}),
P('agri-school','Lycée et école d’agriculture','vocational',1,3,.025,'agri trades',{minSchool:2,selectivity:.15,skill:'technical',desc:'Cultures, élevage, gestion d’exploitation et transformation.',sector:'agriculture'}),
P('academy','Académie militaire ou de police','vocational',1,3,0,'defense security public',{selectivity:.45,minAcademic:20,skill:'technical',free:true,loan:false,desc:'Formation rémunérée, discipline stricte, engagement de service.',sector:'military'}),
P('uni-sciences','Université · sciences','tertiary',2,5,.08,'stem science',{selectivity:.4,minAcademic:25,minIncome:1500,desc:'Mathématiques, physique, biologie, chimie. Mène à la recherche et à l’ingénierie.',sector:'science'}),
P('uni-lettres','Université · lettres et sciences humaines','tertiary',2,5,.07,'humanities social education public',{selectivity:.3,minAcademic:20,minIncome:1500,desc:'Langues, histoire, philosophie, sociologie, psychologie.',sector:'education'}),
P('uni-law','Faculté de droit','tertiary',2,5,.08,'law public',{selectivity:.45,minAcademic:28,minIncome:1500,desc:'Droit public et privé. Avocat·e, juriste, magistrat·e, administration.',sector:'law'}),
P('uni-eco','Université · économie et gestion','tertiary',2,5,.08,'business public',{selectivity:.4,minAcademic:25,minIncome:1500,desc:'Économie, finance, comptabilité, marketing.',sector:'management'}),
P('med','Faculté de médecine','tertiary',3,9,.1,'health science',{selectivity:.8,minAcademic:50,minIncome:1800,minAge:18,desc:'Très sélectif, très long. Médecin, chirurgien·ne, chercheur·se en santé.',sector:'healthtech'}),
P('engineering','École d’ingénieurs','tertiary',2,5,.1,'stem industry tech',{selectivity:.6,minAcademic:40,minIncome:2500,desc:'Mathématiques et sciences appliquées. Ingénierie, énergie, industrie, informatique.',sector:'industry'}),
P('cs-school','École d’informatique et d’intelligence artificielle','tertiary',2,5,.1,'tech stem',{selectivity:.55,minAcademic:38,minIncome:2500,desc:'Programmation, données, systèmes, apprentissage automatique.',sector:'tech'}),
P('business-school','École de commerce','tertiary',2,5,.14,'business',{selectivity:.5,minAcademic:30,minIncome:3500,desc:'Gestion, finance, entrepreneuriat, réseau d’anciens.',sector:'management'}),
P('art-school','École d’art, de design et de cinéma','tertiary',2,4,.1,'arts media',{selectivity:.4,minAcademic:10,minIncome:2000,skill:'creative',desc:'Dessin, design, photographie, image animée, mode. On entre souvent sur portfolio.',sector:'creative'}),
P('conservatory','Conservatoire et école de musique','tertiary',2,4,.07,'arts',{selectivity:.5,minAcademic:10,minIncome:3500,skill:'creative',desc:'Instrument, chant, composition, danse, théâtre.',sector:'music'}),
P('teacher','École normale d’enseignement','tertiary',2,4,.05,'education humanities',{selectivity:.35,minAcademic:25,minIncome:1500,desc:'Devenir enseignant·e. Postes publics dans presque tous les pays.',sector:'education'}),
P('pilot','École de pilotage et d’aéronautique','tertiary',2,3,.22,'transport stem',{selectivity:.6,minAcademic:30,minIncome:7000,skill:'technical',desc:'Pilote de ligne, contrôle aérien, maintenance aéronautique.',sector:'aviation'}),
P('public-admin','École d’administration publique','tertiary',2,4,.06,'public law humanities',{selectivity:.65,minAcademic:38,minIncome:2500,desc:'Hauts postes de l’administration, concours très disputé.',sector:'public'}),
P('journalism','École de journalisme et de communication','tertiary',2,4,.08,'media humanities',{selectivity:.45,minAcademic:25,minIncome:2500,desc:'Presse, audiovisuel, communication, réseaux.',sector:'media'}),
P('phd','Doctorat de recherche','doctoral',3,4,.03,'science stem humanities',{minSchool:4,selectivity:.55,minAcademic:55,minIncome:3000,desc:'Quatre ans de recherche. Une thèse, des publications, un poste de chercheur·se.',sector:'science',loan:false,free:true})
];
const byId=Object.fromEntries(programs.map(x=>[x.id,x]));
const EFFORTS={3:{label:'Intensif · à temps plein',factor:1,slots:3},2:{label:'Standard',factor:1.3,slots:2},1:{label:'Léger · en travaillant à côté',factor:1.9,slots:1}};

function programCost(s,p,prog,effort){const r=L.reference(s,p);let n=r*prog.cost;const support=p.age<=23?clamp((p.wealthTier??.5)*.8,0,.9):0;n*=1-support;if(p.scholarship)n*=.55;if(effort===1)n*=.9;return n}
function admission(s,p,prog){const tier=p.wealthTier??.5,a=p.skills[prog.skill]??p.skills.academic;
  const probability=clamp(.92-prog.selectivity+(Math.max(p.skills.academic,a)-prog.minAcademic-10)/140+(tier-.5)*.18+(p.reputation>=40?.03:0)+(p.attempts?.[prog.id]||0)*.08,.03,.97);return probability}
function programReasons(s,p,prog){const out=[],c=L.country(s,p),lvl=levelOf(p);
  if(p.age<prog.minAge)out.push('À partir de '+prog.minAge+' ans.');if(lvl<prog.minSchool)out.push('Scolarité requise : '+LEVELS[prog.minSchool].toLowerCase()+'.');
  if(p.skills.academic<prog.minAcademic&&prog.skill==='academic'&&prog.minAcademic>0)out.push('Savoirs : '+prog.minAcademic+'/100 conseillé (vous : '+Math.round(p.skills.academic)+').');
  if(c.income<prog.minIncome)out.push('Aucun établissement de ce type n’est accessible dans votre pays. Une bourse ou une migration pourrait ouvrir cette porte.');
  if(p.study)out.push('Vous suivez déjà une formation.');if(p.outlaw?.sentence>0)out.push('Une peine de détention est en cours.');
  if((p.qualifications||[]).some(q=>q.program===prog.id))out.push('Déjà obtenu.');
  if(prog.level<=1&&p.education>=2&&prog.kind==='vocational'&&prog.id!=='second-chance')out.push('Votre niveau est déjà supérieur à celui de cette formation.');
  if(prog.id==='second-chance'&&lvl>=3)out.push('Vous avez déjà terminé le lycée.');
  if(prog.kind==='doctoral'&&p.education<2)out.push('Un master est requis.');
  return out}
function unlocks(prog){const list=[];for(const j of L.occupations||[]){const sec=SEC[j.sector];if(!sec||j.passion||j.rank<1||j.rank>3)continue;if(sec.fields.some(f=>prog.fields.includes(f))&&j.degree<=prog.level)list.push(j)}
  list.sort((a,b)=>a.rank-b.rank);const seen=new Set(),pick=[];for(const j of list){if(seen.has(j.sector))continue;seen.add(j.sector);pick.push(j.title);if(pick.length>=5)break}return pick}
function programList(s,p=s.person){return programs.map(prog=>{const reasons=programReasons(s,p,prog);return{...prog,reasons,eligible:!reasons.length,admission:admission(s,p,prog),cost:programCost(s,p,prog,2),unlocks:unlocks(prog),fieldNames:fieldNames(prog.fields)}})}
L.programs=programs;L.programList=programList;L.programReasons=programReasons;L.programById=byId;L.efforts=EFFORTS;

/* ── Inscription, déroulé et diplômes ── */
function enrol(s,id,effort=2){const p=s.person,prog=byId[id];if(!prog)return{ok:false,error:'Formation inconnue.'};if(!p.alive)return{ok:false,error:'Cette vie est terminée.'};
  const reasons=programReasons(s,p,prog);if(reasons.length)return{ok:false,error:reasons[0]};effort=EFFORTS[effort]?effort:2;
  if(L.available(p)<EFFORTS[effort].slots)return{ok:false,error:'Il faut '+EFFORTS[effort].slots+' créneaux libres pour ce rythme.'};
  const pr=admission(s,p,prog),u=hash(s.seed,p.id,'admit',id,(p.attempts?.[id]||0),s.year);p.attempts??={};
  if(u>=pr){p.attempts[id]=(p.attempts[id]||0)+1;L.log(s,`Dossier refusé : ${prog.name}. Les places sont limitées et les critères exigeants. Vous pouvez retenter, renforcer vos savoirs ou viser une autre voie.`,true,'education');return{ok:true,admitted:false,probability:pr,message:'Dossier refusé cette fois-ci. Vos chances augmentent si vous vous renforcez ou retentez.'}}
  const years=Math.max(1,Math.ceil(prog.years*EFFORTS[effort].factor));
  p.study={program:id,year:0,years,effort:EFFORTS[effort].slots,started:s.year,failedYears:0,intent:effort};p.timeSpent+=0;
  L.log(s,`Admission : ${prog.name}. Durée estimée : ${years} an${years>1?'s':''}. Vous y consacrez ${EFFORTS[effort].slots} créneau${EFFORTS[effort].slots>1?'x':''} par an.`,true,'education');
  return{ok:true,admitted:true,probability:pr,years,message:'Admis·e ! La formation commence cette année.'}}
function leaveStudy(s){const p=s.person;if(!p.study)return false;const prog=byId[p.study.program];L.log(s,`Vous abandonnez : ${prog.name}. Ce que vous avez appris reste, mais le diplôme n’est pas obtenu.`,true,'education');p.skills[prog.skill]=clamp((p.skills[prog.skill]||0)+p.study.year*1.5);p.study=null;return true}
function graduate(s,p){const prog=byId[p.study.program];p.study=null;p.qualifications??=[];p.qualifications.push({program:prog.id,year:s.year,age:p.age});
  p.education=Math.max(p.education,prog.level);p.school??={level:levelOf(p),history:[]};p.school.level=Math.max(p.school.level,prog.kind==='tertiary'||prog.kind==='doctoral'||(prog.kind==='vocational'&&prog.minSchool>=3)?4:3);
  p.fields??=[];for(const f of prog.fields)if(!p.fields.includes(f))p.fields.push(f);if(prog.sector)p.degreeSector=prog.sector;
  L.log(s,`Diplôme obtenu : ${prog.name}.`,true,'education');
  if(p.id===s.person.id){s.queue??=[];s.queue.unshift({id:'edu-graduation-'+prog.id,title:'Remise de diplôme',text:`Vous terminez « ${prog.name} ». ${prog.kind==='vocational'?'Des postes concrets vous attendent.':'Un nouveau chapitre professionnel s’ouvre.'} Ce que vous avez appris compte maintenant pour les métiers : ${fieldNames(prog.fields)||'les bases du secondaire'}.`,category:'Grand moment',required:true,announce:true,big:'Diplôme obtenu',sub:prog.name,choices:[{label:'Chercher mon premier poste dans ce domaine',note:'Réseau +4 · réputation +2',fx:{network:4,reputation:2}},{label:'Continuer à me former',note:'Savoirs +5',fx:{skills:{academic:5}}},{label:'Prendre un moment avant de décider',note:'Énergie +8 · stress −6',fx:{energy:8,stress:-6}}]})}}
function studyYear(s,p){const st=p.study;if(!st||!p.alive)return;const prog=byId[st.program],ref=L.reference(s,p);
  const cost=programCost(s,p,prog,st.intent);if(cost>0){if(p.cash>=cost)p.cash-=cost;else{const loanOk=(prog.loan&&L.country(s,p).income>=8000)||(p.age<=24&&(p.wealthTier??.5)>.2)||cost<ref*.03;if(loanOk){p.debt+=cost-p.cash;p.cash=0}else{L.log(s,`Les frais de ${prog.name} ne peuvent plus être payés. La formation est suspendue.`,true,'education');p.study=null;return}}}
  const effortBonus=(st.effort-2)*.05,pass=clamp(.62+(p.skills[prog.skill]-prog.minAcademic)/160+effortBonus-(p.stress>80?.08:0)+(p.energy<20?-.08:0),.25,.97);
  const u=hash(s.seed,p.id,'study',s.year,prog.id);p.skills[prog.skill]=clamp(p.skills[prog.skill]+(prog.kind==='vocational'?2.2:1.8));p.energy=clamp(p.energy-st.effort*1.5);
  if(u<pass)st.year++;else{st.failedYears++;if(p.id===s.person.id)L.log(s,`Année difficile en ${prog.name} : vous redoublez.`,true,'education')}
  if(st.year>=st.years)graduate(s,p)}
function queueDoubt(s){const p=s.person,st=p.study;if(!st||st.year!==Math.floor(st.years/2)||st.doubted||st.years<3)return;st.doubted=true;const prog=byId[st.program];s.queue??=[];
  s.queue.push({id:'edu-doubt',title:'À mi-parcours, un doute',text:`Vous êtes à la moitié de « ${prog.name} ». Le travail est exigeant, les autres avancent différemment, et l’avenir paraît parfois flou.`,category:'Études',required:true,choices:[{label:'Rester le cap',note:'Savoirs +3 · stress +4',fx:{skills:{academic:3},stress:4}},{label:'Demander du soutien',note:'Réseau +3 · stress −4',fx:{network:3,stress:-4}},{label:'Réduire mon rythme',note:'Énergie +6 · la formation prendra plus de temps',fx:{energy:6,eduSlow:true}},{label:'Abandonner ces études',note:'Vous gardez ce que vous avez appris',fx:{eduQuit:true}}]})}
L.enrol=enrol;L.leaveStudy=leaveStudy;

/* ── Passages scolaires : événements avec statistiques ── */
const pct=n=>Math.round(n*100)+' %';
function stageEvent(s,p,st){const o=stageOdds(s,p,st.id),c=L.country(s,p),sexLabel=p.sex==='F'?'filles':'garçons',otherLabel=p.sex==='F'?'garçons':'filles',other=sexRate(c,st.id,p.sex==='F'?'M':'F',o.country);
  const stats=[{label:`Jeunes de ${c.name} qui atteignent ${st.label}`,pct:Math.round(o.country*100)},{label:`dont ${sexLabel}`,pct:Math.round(o.sex*100),note:`${otherLabel} : ${Math.round(other*100)} %`},...(st.id!=='primary'?[{label:`Parmi celles et ceux qui sont arrivé·es jusque-là (${sexLabel})`,pct:Math.round(o.conditionalSex*100)}]:[]),{label:'Vos chances, selon votre foyer et vos résultats',pct:Math.round(o.you*100),strong:true}];
  const poor=(p.wealthTier??.5)<.35||c.income<4500,id='edu-'+st.id;
  const text={lower:poor?`Dans votre région, peu d’enfants vont au collège : il est loin, parfois payant, et chacun est attendu à la maison. Vous avez le droit de vouloir autre chose, ou de ne pas le vouloir.`:`Une nouvelle étape scolaire s’ouvre : plus de matières, plus d’autonomie. Mais personne ne vous oblige à vouloir y aller aussi loin que possible.`,
    upper:poor?`Le lycée est une exception dans votre entourage. Il demande de la persévérance, souvent de l’argent, parfois de partir loin. Beaucoup d’adultes autour de vous n’y sont jamais allés.`:`Le lycée prépare à l’orientation. Il demande des efforts et du temps, mais ouvre la plupart des études supérieures.`,
    tertiary:`Vous terminez le lycée ou approchez de la majorité. Les études supérieures changent la suite, mais elles coûtent du temps et de l’argent, et d’autres voies existent.`,
    primary:poor?`Il y a une école à plusieurs kilomètres. Votre famille hésite : les bras sont utiles aux champs, à l’atelier ou à la maison.`:`Il est temps d’entrer à l’école.`}[st.id];
  const go=poor?`Plaider pour y aller (chance ≈ ${Math.round(Math.min(.98,o.you+.07)*100)} %)`:`Oui, j’y vais à fond (chance ≈ ${Math.round(Math.min(.98,o.you+.07)*100)} %)`;
  return{id,title:{primary:'Aller à l’école, ou pas ?',lower:'Entrer au collège ?',upper:'Aller jusqu’au lycée ?',tertiary:'Et après le lycée ?'}[st.id],text,stats,category:'Études',required:true,announce:st.id!=='primary',big:{primary:'L’école',lower:'Le collège',upper:'Le lycée',tertiary:'La suite'}[st.id],sub:{primary:'Y aller, ou pas.',lower:'Une nouvelle étape, si vous le voulez.',upper:'Une porte rare, si vous la voulez.',tertiary:'Ce que vous ferez de vos premières années d’adulte.'}[st.id],statsKicker:'Ce que disent les chiffres du modèle',
    choices:[{label:go,note:'Savoirs +3 · stress +3 · la décision vous appartient',fx:{edu:{stage:st.id,intent:'push'}}},{label:'Je suis partagé·e, je verrai',note:'Chances normales',fx:{edu:{stage:st.id,intent:'neutral'}}},{label:st.id==='tertiary'?'Je préfère travailler ou me lancer':'Je préfère travailler, apprendre autrement ou rester auprès des miens',note:'Vous arrêtez ici la scolarité',fx:{edu:{stage:st.id,intent:'stop'}}}]}}
function resultEvent(s,p,stage,ok){const st=STAGES.find(x=>x.id===stage);
  if(ok){if(stage==='upper'||stage==='lower')return null;return null}
  return{id:'edu-closed-'+stage,title:'La porte reste fermée',text:`Malgré vos efforts, ${p.sex==='F'?'vous n’êtes pas admise':'vous n’êtes pas admis'} pour ${st.label} : pas de place, pas les moyens, ou trop loin. Ce n’est pas un jugement sur ce que vous valez. D’autres chemins existent.`,category:'Études',required:true,
  choices:[{label:'Tenter une école associative ou de seconde chance',note:'Savoirs +4 · une porte rouvre plus tard',fx:{edu:{second:true},skills:{academic:4}}},{label:'Travailler et étudier le soir',note:'Gestion +4 · énergie −6 · revenus',fx:{skills:{management:4},energy:-6,cash:150}},{label:'Aider ma famille et attendre une occasion',note:'Liens familiaux +6',fx:{parents:6}}]}}
const trackEvent=(s,p)=>({id:'edu-track',title:'Quelle voie au lycée ?',text:'Vous entrez au lycée. Plusieurs voies existent. Elles ne ferment aucune porte à vie, mais elles orientent vos premières années.',category:'Études',required:true,choices:[{label:'Voie générale',note:'Savoirs +8 · ouvre presque toutes les études supérieures',fx:{skills:{academic:8},edu:{track:'general'}}},{label:'Voie technique et professionnelle',note:'Technique +8 · accès direct à des métiers techniques',fx:{skills:{technical:8},edu:{track:'technical',low:['trades','industry','tech','transport']}}},{label:'Voie artistique',note:'Créativité +8 · portfolio',fx:{skills:{creative:8},edu:{track:'arts',low:['arts','media']}}},{label:'Voie commerce et gestion',note:'Gestion +6 · relations +3',fx:{skills:{management:6,social:3},edu:{track:'business',low:['business','hospitality']}}},{label:'Voie santé et social',note:'Relations +6 · savoirs +3',fx:{skills:{social:6,academic:3},edu:{track:'care',low:['health','social']}}}]});
const afterEvent=(s,p)=>{const list=programList(s,p).filter(x=>x.eligible&&x.id!=='second-chance').sort((a,b)=>b.admission-a.admission);const pick=(list.length>6?[...list.filter(x=>x.kind==='vocational').slice(0,2),...list.filter(x=>x.kind!=='vocational').slice(0,3)]:list).slice(0,5);
  return{id:'edu-after',announce:true,big:'La majorité',sub:'Quelle suite voulez-vous ?',title:'Quelle formation choisir ?',text:`Vous avez ${p.age} ans. Votre niveau (${LEVELS[levelOf(p)].toLowerCase()}), vos résultats et les moyens de votre famille ouvrent certaines portes et en ferment d’autres. Voici les formations les plus accessibles pour vous. Toutes les autres sont dans l’onglet Études.`,category:'Études',required:true,
  choices:[...pick.map(x=>({label:x.name,note:`${x.fieldNames||'Bases'} · ${x.years} an${x.years>1?'s':''} · admission ≈ ${Math.round(x.admission*100)} % · ${x.free?'gratuit ou rémunéré':'≈ '+Math.round(x.cost).toLocaleString('fr-FR')+' UPA/an'}`,fx:{edu:{enrol:x.id,effort:2}}})),{label:'Chercher un premier emploi',note:'Aucune formation pour le moment',fx:{edu:{work:true}}},{label:'Prendre une année pour réfléchir',note:'Énergie +8 · vous pourrez vous inscrire plus tard',fx:{energy:8}}]}};

/* Planifie les événements d'étude de l'année suivante, avant que le moteur ne choisisse. */
function planEducation(s){const p=s.person;if(!p.alive||s.pending)return;s.queue??=[];p.school??={level:levelOf(p),history:[],intent:{}};const age=p.age+1,has=id=>p.events.includes(id)||s.queue.some(e=>e.id===id);
  for(const st of STAGES){if(st.id==='primary'||st.id==='tertiary')continue;if(age===st.age&&!p.school.history.some(h=>h.stage===st.id)&&!has('edu-'+st.id)&&levelOf(p)>=st.level-1)s.queue.unshift(stageEvent(s,p,st))}
  if(age===6&&!p.school.history.some(h=>h.stage==='primary')){const o=stageOdds(s,p,'primary');if(hash(s.seed,p.id,'stage','primary')>=o.you)s.queue.unshift(stageEvent(s,p,STAGES[0]));else{p.school.level=Math.max(p.school.level,1);p.school.history.push({stage:'primary',year:s.year,ok:true})}}
  if(age>=18&&age<=24&&!p.study&&levelOf(p)>=3&&!p.events.includes('edu-after')&&!s.queue.some(e=>e.id==='edu-after')&&!p.events.some(e=>e==='edu-work'))s.queue.push(afterEvent(s,p));
  if(age>=17&&age<=25&&levelOf(p)<3&&!p.school.history.some(h=>h.stage==='tertiary'&&!h.ok)&&p.school.history.some(h=>!h.ok)&&hash(s.seed,p.id,'secondchance',age)<.35&&!p.events.includes('edu-second-offer'))s.queue.push({id:'edu-second-offer',title:'Une école du soir',text:'Une association ouvre des cours du soir pour les adultes qui n’ont pas pu finir l’école. Les places sont gratuites mais le temps est compté.',category:'Études',required:true,choices:[{label:'M’inscrire',note:'Deux ans pour rattraper le lycée · 2 créneaux',fx:{edu:{enrol:'second-chance',effort:2}}},{label:'Pas maintenant',note:'Vous pourrez y revenir',fx:{}}]});
  queueDoubt(s)}

function processFx(s,x,e){const p=s.person,fx=x?.fx;if(!fx)return;if(e?.id==='edu-after'&&!p.events.includes('adult'))p.events.push('adult');
  if(fx.eduSlow&&p.study){p.study.years=Math.ceil(p.study.years*1.25);p.study.effort=Math.max(1,p.study.effort-1)}
  if(fx.eduQuit)leaveStudy(s);
  if(fx.edu?.low){p.fieldsLow??=[];for(const f of fx.edu.low)if(!p.fieldsLow.includes(f))p.fieldsLow.push(f)}
  if(fx.edu?.track){p.school??={level:levelOf(p),history:[]};p.school.track=fx.edu.track;if(!p.school.history.some(h=>h.stage==='upper'))p.school.history.push({stage:'upper',year:s.year,ok:true})}
  if(fx.edu?.enrol){const r=enrol(s,fx.edu.enrol,fx.edu.effort||2);s.lastEnrol=r;if(r.ok&&!r.admitted){s.queue??=[];s.queue.unshift({id:'edu-refused-'+fx.edu.enrol,title:'Dossier refusé',text:`« ${byId[fx.edu.enrol].name} » n’a pas retenu votre dossier. Les chances d’admission étaient d’environ ${Math.round(r.probability*100)} %. Vous pouvez retenter l’an prochain, ou choisir une autre voie.`,category:'Études',required:true,choices:[{label:'Retenter avec une meilleure préparation',note:'Savoirs +5 · stress +3',fx:{skills:{academic:5},stress:3}},{label:'Choisir une autre formation',note:'Réflexion · stress −2',fx:{stress:-2}},{label:'Commencer à travailler',note:'Revenus · réseau +2',fx:{network:2,edu:{work:true}}}]})}}
  if(fx.edu?.stage){p.school??={level:levelOf(p),history:[]};const st=STAGES.find(x=>x.id===fx.edu.stage),o=stageOdds(s,p,st.id),intent=fx.edu.intent;
    if(intent==='stop'){p.school.history.push({stage:st.id,year:s.year,ok:false,chosen:true});L.log(s,`Vous choisissez de ne pas continuer jusqu’à ${st.label}.`,true,'education');if(st.id==='lower'||st.id==='upper')p.skills.academic=clamp(p.skills.academic-0)}
    else{const you=clamp(o.you+(intent==='push'?.07:0),.03,.99),u=hash(s.seed,p.id,'stage',st.id),ok=u<you;p.school.history.push({stage:st.id,year:s.year,ok,chance:you});
      if(ok){p.school.level=Math.max(p.school.level,st.level);L.log(s,`Vous entrez dans ${st.label} (chance estimée : ${Math.round(you*100)} %).`,true,'education');if(st.id==='upper'){s.queue??=[];s.queue.unshift(trackEvent(s,p))}}
      else{L.log(s,`Vous n’accédez pas à ${st.label} (chance estimée : ${Math.round(you*100)} %).`,true,'education');const r=resultEvent(s,p,st.id,false);if(r){s.queue??=[];s.queue.unshift(r)}}}}
  if(fx.edu?.second){p.school??={level:levelOf(p),history:[]};p.school.second=true}}

L.year=function(s,withEvent=true){if(withEvent&&s.person?.alive&&!s.pending)planEducation(s);const people=Object.values(s.people||{});const r=base.year(s,withEvent);if(r){for(const q of Object.values(s.people||{})){if(q.study)studyYear(s,q)}autoSchool(s);if(!s.pending&&s.queue?.[0]?.id?.startsWith('edu-graduation')&&s.person.alive)s.pending=s.queue.shift()}return r};
/* Autres personnes (enfants jouables plus tard, amis) : scolarité automatique. */
function autoSchool(s){for(const q of Object.values(s.people||{})){if(q.id===s.person.id||!q.alive)continue;q.school??={level:levelOf(q),history:[]};for(const st of STAGES){if(st.id==='tertiary')continue;if(q.age>=st.age&&q.school.level<st.level&&!q.school.history.some(h=>h.stage===st.id)){const ok=hash(s.seed,q.id,'stage',st.id)<stageOdds(s,q,st.id).you;q.school.history.push({stage:st.id,year:s.year,ok});if(ok)q.school.level=st.level}}}}
L.choose=function(s,i){const e=s.pending,x=e?.choices?.[i];const r=base.choose(s,i);if(r){processFx(s,x,e);if(!s.pending&&s.queue?.length&&s.person.alive){s.pending=s.queue.shift()}}return r};
L.educationLabel=p=>LEVELS[levelOf(p)];
L.fieldList=p=>[...new Set([...(p.fields||[]),...(p.fieldsLow||[])])];
})(typeof window!=='undefined'?window:globalThis);
