const assert=require('node:assert/strict');
for(const n of ['engine','world','facts','depth','time','checks','occupations','society','standing','lineage','names','currency','education','fate','mortality','passions','life-choices','milestones','threads','outcomes','variants','achievements','path'])require('./dist/'+n+'.js');const L=globalThis.Life;
const N=60,perAge={},seen=new Set();let big=0,lost=0;
for(let i=0;i<N;i++){const s=L.create('MSN-'+i,['FR','SD','US','IN'][i%4]);let g=0;const got=new Set();
  while(s.person.alive&&g++<300){if(s.pending){const e=s.pending;assert(e.choices.length>=1);if(s.person.age<=17&&e.id!=='birth')perAge[s.person.age]=(perAge[s.person.age]||0)+1;if(e.announce){assert(e.big&&e.sub,'annonce complète');seen.add(e.id)}got.add(e.id);const ok=e.choices.findIndex(c=>!L.canChoose(s,c));assert(ok>=0,'aucune impasse '+e.id);assert(L.choose(s,ok))}else L.year(s)}
  for(const [id,age] of [['school',8],['talent',13],['teen',18],['adult',22]])if(s.person.age>=age)assert(s.person.events.includes(id),id+' toujours rencontré');if(s.person.age>=12){big++;assert(got.has('ms-nursery')&&(got.has('edu-lower')||(s.person.school?.history||[]).some(h=>h.stage==='primary'&&!h.ok)))}else lost++}
// Presque chaque année de 5 à 17 ans apporte une décision.
for(let a=5;a<=17;a++)assert(perAge[a]/(N-lost)>=.8,'décisions à '+a+' ans : '+perAge[a]/N);
assert(big>=N-3,'crèche et collège pour tout le monde (hors morts précoces)');for(const id of ['ms-nursery','ms-quarter','ms-forty','ms-sixty'])assert(seen.has(id),id);
// Mêmes choix, même vie : pas de hasard caché dans le catalogue.
const run=seed=>{const s=L.create(seed);let g=0;while(s.person.alive&&g++<300){if(s.pending)L.choose(s,0);else L.year(s)}return s};assert.deepEqual(run('DET-MS'),run('DET-MS'));
// Chaque décision du catalogue est jouable : effets connus, choix non vides.
for(const d of L.milestones.choices)assert(d.options.length>=3&&d.title&&d.text,d.id);
console.log(JSON.stringify({milestones:'passed',decisionsPerAge5to17:Object.fromEntries(Object.entries(perAge).map(([a,n])=>[a,+(n/N).toFixed(2)])),catalogue:L.milestones.choices.length}));
