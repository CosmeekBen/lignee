/* Parcours : une seule situation à la fois, des diplômes lisibles, des règles de compatibilité.
   - L.situation : ce que fait le personnage en ce moment (école, formation, emploi, sans emploi, hors de l'école…).
   - L.diplomas : étapes de scolarité (faites, en cours, non terminées) et diplômes obtenus.
   - L.nearJobs : métiers proches, avec ce qu'il manque pour y accéder.
   - Règles : en formation on ne postule pas à plein temps ; hors de l'école, pas d'événements scolaires ;
     sans emploi, pas d'événements de bureau ; un seul parcours scolaire à la fois. */
(function(root){const L=root.Life;
const base={year:L.year,choose:L.choose,enrol:L.enrol,extra:L.extraJobReasons};
const STAGES=[{id:'primary',lvl:1,from:6,to:10,label:'l’école primaire',short:'Primaire',at:'À l’école primaire'},{id:'lower',lvl:2,from:11,to:14,label:'le collège',short:'Collège',at:'Au collège'},{id:'upper',lvl:3,from:15,to:17,label:'le lycée',short:'Lycée',at:'Au lycée'}];
const stageAt=a=>STAGES.find(x=>a>=x.from&&a<=x.to)||null;
const TRACKS={general:'voie générale',technical:'voie technique',arts:'voie artistique',business:'voie commerce',health:'voie santé'};
const level=p=>L.schoolLevel(p);
/* Âge auquel la scolarité s'est arrêtée (si elle l'a fait). */
function leftSchool(p){const sc=p.school;if(!sc)return null;if(sc.stopped)return{age:sc.stoppedAge??p.age,stage:stageAt(sc.stoppedAge??p.age)};
  if(p.age<6||p.age>17)return null;const st=stageAt(p.age);if(st&&level(p)<st.lvl&&sc.history?.some(h=>!h.ok))return{age:sc.history.find(h=>!h.ok)?.age??st.from,stage:st,never:true};return null}
function situation(s,p=s.person){const age=p.age,job=p.job&&!/^(Enfance|À la découverte)/.test(p.job)?p.job:null;
  if(age<6)return{kind:'baby',icon:'🧸',label:'Petite enfance',detail:'Les premières années'};
  if(p.outlaw?.sentence>0)return{kind:'detained',icon:'⛓',label:'En détention',detail:p.outlaw.sentence+' an(s) restant(s)'};
  if(p.study){const pr=L.programById[p.study.program],st=p.study,yr=Math.min(st.years,st.year+1);return{kind:'study',icon:'🎓',label:pr.name,detail:`année ${yr} sur ${st.years}${st.failedYears?` · ${st.failedYears} redoublement${st.failedYears>1?'s':''}`:''} · ${L.efforts[st.intent||2]?.label?.split(' · ')[0].toLowerCase()||'rythme standard'}`,progress:{done:st.year,total:st.years}}}
  if(age<18){const out=leftSchool(p),st=stageAt(age);
    if(!out&&st){const tr=p.school?.track&&st.id==='upper'?TRACKS[p.school.track]:null;return{kind:'school',icon:'🎒',label:st.at,detail:`année ${age-st.from+1} sur ${st.to-st.from+1}${tr?' · '+tr:''}`,progress:{done:age-st.from,total:st.to-st.from+1}}}
    return{kind:'outschool',icon:'🧭',label:'Hors de l’école',detail:`arrêtée à ${out?.age??age} ans · ${p.career?'au travail':'travaille ou aide la famille'}`}}
  if(p.retired)return{kind:'retired',icon:'🌅',label:'Retraite',detail:'depuis '+(p.retiredAge?p.retiredAge+' ans':'quelques années')};
  if(p.career&&job)return{kind:'work',icon:'💼',label:job,detail:`${p.career.years||0} an${(p.career.years||0)>1?'s':''} d’expérience`};
  return{kind:'jobless',icon:'🔍',label:'Sans emploi',detail:p.business?'à votre compte':'à la recherche d’un poste'}}
/* Étapes de scolarité + diplômes. state : done | now | lost (non terminé). */
function diplomas(s,p=s.person){const out=[],sit=situation(s,p),left=leftSchool(p),lvl=level(p);
  for(const st of STAGES){if(p.age<st.from)continue;
    let state;if(sit.kind==='school'&&stageAt(p.age)?.id===st.id)state='now';
    else if(left&&(left.age<=st.to&&(left.stage?.lvl??0)<=st.lvl))state='lost';
    else if(lvl>=st.lvl&&(p.age>st.to||lvl>st.lvl))state='done';
    else if(lvl>=st.lvl)state='done';else state='lost';
    out.push({id:st.id,label:st.short,state,note:state==='lost'&&left?'arrêté à '+left.age+' ans':''})}
  for(const q of p.qualifications||[]){const pr=L.programById[q.program];if(pr&&pr.id!=='second-chance')out.push({id:q.program,label:pr.name.replace(/ \(.*\)/,''),state:'done',note:q.age+' ans'});else if(pr)out.push({id:q.program,label:'Lycée rattrapé',state:'done',note:q.age+' ans'})}
  if(sit.kind==='study')out.push({id:p.study.program,label:L.programById[p.study.program].name.replace(/ \(.*\)/,''),state:'now',note:`${p.study.year}/${p.study.years}`});
  return out}
/* Métiers proches : ceux auxquels il manque le moins. */
function nearJobs(s,p=s.person,n=3){if(p.age<16||!L.occupations)return{open:0,total:0,near:[]};let open=0;const cand=[];const total=L.occupations.filter(j=>j.rank<=2&&!j.passion&&j.path!=='politics'&&s.year>=j.from).length;
  for(const j of L.occupations){if(j.rank>2||j.passion||j.path==='politics'||s.year<j.from)continue;const r=L.jobReasons(s,j,p).filter(x=>!/^Vie professionnelle à partir/.test(x));if(!r.length)open++;else cand.push({job:j,reasons:r})}
  const seen=new Set();cand.sort((a,b)=>a.reasons.length-b.reasons.length||a.job.rank-b.job.rank);const near=[];
  for(const c of cand){if(seen.has(c.job.sector)||c.reasons.length>2)continue;seen.add(c.job.sector);near.push(c);if(near.length>=n)break}
  return{open,total,near}}
L.situation=situation;L.diplomas=diplomas;L.nearJobs=nearJobs;L.leftSchool=leftSchool;

/* ── Règles de compatibilité ── */
L.extraJobReasons=function(s,j,p){const out=base.extra?base.extra(s,j,p):[];if(p.age<18)return out;
  if(p.study){const pr=L.programById[p.study.program];if(p.study.intent!==1&&j.rank>=0)out.push(`Vous êtes en formation (${pr.name}, année ${Math.min(p.study.years,p.study.year+1)}/${p.study.years}) : terminez-la, quittez-la ou passez à un rythme léger.`);else if(j.rank>1)out.push('Un poste de ce niveau ne se tient pas en même temps que vos études.')}
  return out};
L.enrol=function(s,id,effort=2){const p=s.person;if(p.career&&p.age>=18&&effort!==1&&id!=='second-chance')return{ok:false,error:'Vous travaillez : choisissez le rythme « léger, en travaillant à côté », ou quittez d’abord votre poste.'};
  const r=base.enrol(s,id,effort);if(r.ok&&r.admitted&&p.school&&id==='second-chance')p.school.stopped=false;return r};
/* Événements qui n'ont pas de sens dans la situation actuelle. */
const SCHOOLISH=/^(school-project|kid-lesson|kid-longroad|teen-exam|teen-privatetutor|teen-fail|teen-cause|teen-sleep|edu-track|chain-teacher|chain-exchange|chain-summer|edu-lower|edu-upper)/;
const OFFICE=/^(ad-coworker|responsibility|ethics|biz-contract|ad-sidegig)$/;
const LATE=/^(ad-learnlate)$/;
function fits(s,p,e){const id=e?.id||'';if(!id||!p.alive)return true;const sit=situation(s,p);
  if(sit.kind==='outschool'||(p.age<18&&leftSchool(p))){if(SCHOOLISH.test(id)||id==='teen-needhands'||id==='struggle-quit-school')return false}
  if(id==='teen-needhands')return false;
  if(sit.kind==='study'){if(/^society-recruit/.test(id))return false;if(LATE.test(id)||id==='edu-after'||id==='edu-second-offer'||/^edu-(lower|upper|tertiary)$/.test(id))return false;if(p.study.effort>=2&&/^(ad-move)$/.test(id)&&p.age<24)return false}
  if(sit.kind!=='work'&&OFFICE.test(id))return false;
  if(p.career&&(id==='edu-after'))return false;
  if(sit.kind==='school'&&/^(edu-after|edu-second-offer)$/.test(id))return false;
  return true}
function sanitize(s){const p=s.person;if(!p?.alive)return;const out=leftSchool(p);if(p.school&&out&&p.school.stoppedAge==null&&p.age<18)p.school.stoppedAge=out.age;
  if(p.school?.stopped&&p.study?.program==='second-chance')p.school.stopped=false;
  if(s.queue?.length)s.queue=s.queue.filter(e=>fits(s,p,e));
  let guard=0;while(s.pending&&!fits(s,p,s.pending)&&guard++<10)s.pending=s.queue?.shift()||null}
L.year=function(s,withEvent=true){const r=base.year(s,withEvent);if(r)sanitize(s);return r};
L.choose=function(s,i){const e=s.pending,r=base.choose(s,i);if(r){sanitize(s);if(e&&s.person.school?.stopped&&s.person.school.stoppedAge==null)s.person.school.stoppedAge=s.person.age}return r};
L.pathFits=fits;
})(typeof window!=='undefined'?window:globalThis);
