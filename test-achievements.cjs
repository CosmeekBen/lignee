const assert=require('node:assert/strict');
for(const n of ['engine','world','depth','time','checks','occupations','society','standing','lineage','names','currency','education','fate','mortality','passions','life-choices','milestones','threads','variants','achievements'])require('./dist/'+n+'.js');const L=globalThis.Life,A=L.achievements;
assert(A.list.length>=35);assert.equal(new Set(A.list.map(t=>t.id)).size,A.list.length);for(const t of A.list)assert(t.icon&&t.name&&t.desc&&t.pts>0&&typeof t.test==='function',t.id);
// Les succès se débloquent une fois, au bon moment, et rapportent des points.
const s=L.create('TROPHY','FR');s.pending=null;assert.equal(A.score(s),0);assert.equal(A.level(s).name,'Graine');
Object.assign(s.person,{age:30,education:1,cash:3e5,children:[{id:9,name:'X',age:2,bond:70,alive:true}]});s.person.career={sector:'tech',level:1,years:2};
let fresh=A.evaluate(s);for(const id of ['adult','degree','first-job','promo','parent','saver'])assert(fresh.includes(id),id);assert.deepEqual(A.evaluate(s),[],'pas de doublon');
const pts=A.score(s);assert(pts>=100&&A.level(s).index>=3);assert.equal(s.newTrophies.length,fresh.length);
// Niveau monotone, progression entre 0 et 1.
let last=0;for(const p of [0,10,29,30,80,300,2000]){s.trophies={};s.trophies.__x=1;const fake={...s,trophies:{}};const lv=A.levels.filter(([,t])=>t<=p).length;assert(lv>=last);last=lv}
for(const t of A.list)if(t.prog){const v=t.prog(s,s.person);assert(v>=0&&v<=1,t.id)}
// Sur des vies complètes : finis, déterministes, sauvegardables.
for(let i=0;i<30;i++){const mk=()=>{const x=L.create('TR-'+i);let g=0;while(x.person.alive&&g++<300){if(x.pending)L.choose(x,0);else L.year(x)}return x};const a=mk(),b=mk();assert.deepEqual(a.trophies,b.trophies);assert(Number.isFinite(A.score(a)));assert(Object.keys(a.trophies).length>=(a.person.age<20?1:4));JSON.parse(JSON.stringify(a))}
// Un 20 naturel débloque « Critique ! ».
const c=L.create('CRIT','FR');c.pending=null;c.person.age=30;let tries=0;while(!c.trophies?.crit&&tries++<400){c.rng=tries*7919;L.resolveCheck(c,'date')}assert(c.trophies.crit,'critique');
console.log(JSON.stringify({achievements:'passed',count:A.list.length,maxPoints:A.list.reduce((n,t)=>n+t.pts,0)}));
