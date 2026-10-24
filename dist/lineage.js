/* Capital de lignée : ce que chaque génération lègue à la suivante.
   Un enfant de famille très pauvre part avec presque rien ; ses petits-enfants
   peuvent hériter d'un réseau, d'un nom, d'études et de moyens. Les portes les
   plus hautes (gouvernement, présidence, direction d'un groupe) restent possibles
   dès la première génération, mais très improbables : les descendants les ouvrent. */
(function(root){const L=root.Life,clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const base={year:L.year,checkModel:L.checkModel};
const OFFICE_RANK={local:1,mayor:1,national:2,minister:3,head:5};
function peakRank(p){let r=p.career?(p.career.rank||p.career.level||0):0;for(const h of p.careerHistory||[])r=Math.max(r,h.rank||0);return r}
/* Réussite d'une personne, de 0 à 100. */
function achievement(s,p){const ref=Math.max(1,L.reference(s,p));
  const rank=peakRank(p)*7;
  const politics=Math.min(30,Math.max(0,...(p.politics?.wins||[]).map(w=>OFFICE_RANK[w.key]||0))*5+(p.politics?.terms||0)*4);
  const wealth=Math.min(25,Math.log2(1+Math.max(0,L.balance(p))/ref)*5);
  const school=Math.min(12,p.education*4);
  const fame=Math.min(15,Math.max(0,...Object.values(p.visibility||{creative:0}))*.12);
  return clamp(rank+politics+wealth+school+fame,0,100)}
function stigmaOf(p){return clamp((p.outlaw?.record||0)*4+(p.outlaw?.level||0)*6+(p.outlaw?.former?4:0),0,30)}
function parentsOf(s,p){const out=[];for(const link of p.parents||[]){const a=s.people?.[link.id];if(a){out.push(a);const mate=a.partner&&s.people[a.partner.id];if(mate&&mate.id!==a.id)out.push(mate)}}return out}
/* Capital hérité à la majorité : la moitié de celui des parents + leur propre réussite. */
function inheritedCapital(s,p){const parents=parentsOf(s,p);
  if(!parents.length)return{capital:Math.round(clamp((p.wealthTier||0)*10,0,12)),stigma:0};
  const cap=Math.max(...parents.map(x=>x.lineage?.capital||0)),got=parents.reduce((n,x)=>n+achievement(s,x),0)/parents.length,stig=Math.max(...parents.map(x=>(x.lineage?.stigma||0)*.5+stigmaOf(x)*.5));
  return{capital:Math.round(clamp(cap*.5+got*.6,0,100)),stigma:Math.round(clamp(stig,0,30))}}
function apply(s,p){const{capital:cap,stigma}=inheritedCapital(s,p);
  p.lineage={capital:cap,stigma,applied:true,year:s.year};
  p.network=clamp(p.network+cap*.25);p.reputation=clamp(p.reputation+cap*.1-stigma*.3);
  p.skills.academic=clamp(p.skills.academic+cap*.08);
  p.politics.profile=clamp(p.politics.profile+cap*.22);p.politics.local=clamp(p.politics.local+cap*.2);p.politics.trust=clamp(p.politics.trust+cap*.12-stigma*.5);
  if(cap>=25)p.politics.party=clamp(p.politics.party+cap*.3);
  for(const k of Object.keys(p.familyCapital))p.familyCapital[k]=clamp(p.familyCapital[k]+cap*.15,0,100)}
function lineageYear(s){for(const p of Object.values(s.people||{})){if(!p.alive||p.age<18||p.lineage?.applied)continue;apply(s,p)}}
L.year=function(s,withEvent=true){const result=base.year(s,withEvent);if(result)lineageYear(s);return result};
/* Bonus au D20 pour les emplois et les promotions : le capital pèse, sans jamais garantir. */
L.checkModel=function(s,type,v={}){const m=base.checkModel(s,type,v);if(!m||!['job','promotion'].includes(type))return m;const p=s.person;if(!p.lineage?.applied)return m;
  const plus=Math.min(3,Math.floor(p.lineage.capital/20)),minus=Math.min(2,Math.floor(p.lineage.stigma/12));if(!plus&&!minus)return m;
  const bonuses=[...m.bonuses];if(plus)bonuses.push({label:'Capital de lignée (réseau, nom, études transmis)',value:plus});if(minus)bonuses.push({label:'Réputation familiale difficile',value:-minus});
  const modifier=m.modifier+plus-minus,dc=m.dc,adv=m.advantage;const ok=n=>n===20||(n!==1&&n+modifier>=dc);let wins=0,total=adv==='normal'?20:400;
  if(adv==='normal'){for(let n=1;n<=20;n++)if(ok(n))wins++}else for(let a=1;a<=20;a++)for(let b=1;b<=20;b++)if(ok(adv==='advantage'?Math.max(a,b):Math.min(a,b)))wins++;
  return{...m,bonuses,modifier,probability:wins/total,formula:'D20 '+(modifier>=0?'+ ':'− ')+Math.abs(modifier)+' ≥ '+dc}};
/* Frise des générations pour l'interface. */
function chain(s,p=s.person){const out=[];let cur=p,guard=0;while(cur&&guard++<12){out.unshift({id:cur.id,name:cur.name+' '+cur.surname,job:cur.job,age:cur.age,alive:cur.alive,country:cur.country,capital:cur.lineage?.capital??null,stigma:cur.lineage?.stigma||0,achievement:Math.round(achievement(s,cur)),peak:peakRank(cur)});const parent=cur.parents?.map(x=>s.people?.[x.id]).find(Boolean);cur=parent}return out}
L.lineage={achievement,inheritedCapital,chain,peakRank,stigma:stigmaOf};
})(typeof window!=='undefined'?window:globalThis);
