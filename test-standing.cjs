const assert=require('node:assert/strict');
for(const n of ['engine','world','facts','depth','time','checks','occupations','society','standing','lineage','names','currency','education','fate','mortality','passions','life-choices','milestones','threads','outcomes','variants','achievements','path'])require('./dist/'+n+'.js');const L=globalThis.Life;
const mk=(code,fn)=>{const s=L.create('STAND-'+code,code);s.pending=null;Object.assign(s.person,{age:35,education:1,health:80,happiness:60});fn&&fn(s);return L.standing(s)};
const get=(st,id)=>st.rows.find(r=>r.id===id);
// Un revenu plus élevé place plus haut, dans chaque cadre.
const low=mk('FR',s=>{s.person.salary=15000;s.person.career=null}),high=mk('FR',s=>{s.person.career={sector:'tech',level:2,years:8,jobId:'tech-5'};s.person.salary=120000;s.person.job='Ingénieur·e logiciel'});
for(const k of ['world','country','age'])assert(get(high,'income')[k]>get(low,'income')[k],'revenu '+k);
// Un même revenu pèse plus dans un pays pauvre que dans un pays riche.
const rich=mk('US',s=>{s.person.career={sector:'tech',level:1,years:3,jobId:'tech-5'};s.person.salary=30000}),poor=mk('SD',s=>{s.person.career={sector:'tech',level:1,years:3,jobId:'tech-5'};s.person.salary=30000});
assert(get(poor,'income').country>get(rich,'income').country,'même revenu, pays plus pauvre');
// Les valeurs sont des pourcentages finis ; le métier n'apparaît que pour un emploi.
for(const st of [low,high,rich,poor])for(const r of st.rows)for(const k of ['world','country','age','job'])assert(r[k]===null||(Number.isFinite(r[k])&&r[k]>=0&&r[k]<=100),r.id+' '+k);
assert.equal(get(low,'income').job,null);assert(get(high,'income').job!==null);
// Les enfants n'ont ni revenu ni patrimoine.
const kid=L.create('KID','FR');assert(!L.standing(kid).rows.some(r=>r.id==='income'||r.id==='wealth'));
// Percentiles monotones : plus de patrimoine ⇒ plus haut.
const w=[-1e4,0,1e4,1e5,1e6,1e7].map(x=>get(mk('FR',s=>{s.person.cash=Math.max(0,x);s.person.debt=Math.max(0,-x)}),'wealth').world);for(let i=1;i<w.length;i++)assert(w[i]>=w[i-1],'patrimoine monotone');assert(w.at(-1)>99);
assert.match(L.describePercentile(97),/^Top 3 %$/);assert.match(L.describePercentile(40),/devant 40 %/);
// Toute la population des 197 pays produit des repères valides, sur toute une vie.
let n=0;for(const c of L.countries){const s=L.create('ALL-'+c.code,c.code);for(let a=0;a<60&&s.person.alive;a++){if(s.pending)L.choose(s,0);else L.year(s)}const st=L.standing(s);for(const r of st.rows)for(const k of ['world','country','age'])assert(Number.isFinite(r[k]),c.code+' '+r.id+' '+k);n++}
console.log(JSON.stringify({standing:'passed',countriesChecked:n}));
