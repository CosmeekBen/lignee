/* La mort en chiffres : combien de personnes nées dans ce pays meurent avant cet âge, quel était
   le risque de cette cause, ce que changerait l'accès aux soins d'un pays riche.
   Tout est calculé avec le même modèle de mortalité que le jeu, pas avec des statistiques officielles. */
(function(root){const L=root.Life;
const norm=t=>(t||'').replace(/^(un|une|la|le|les|l’|des)\s+/i,'').trim();
const health0=85;
const MASC=new Set('SD ML MA NE NG GH KE TD SN TG BJ GA CM CG CD ZW MX PE CL BR CA JP VN LA KH PK BD NP BT LB YE IQ KW QA BH DK PT LU GB MZ BW MW BI RW UG PY UY EC SV VE PA HN SR GY BZ NZ?'.replace(' NZ?','').split(' '));
const PLUR={US:'aux États-Unis',PH:'aux Philippines',NL:'aux Pays-Bas',AE:'aux Émirats arabes unis',MV:'aux Maldives',BS:'aux Bahamas',SB:'aux Îles Salomon',SC:'aux Seychelles',KM:'aux Comores',MH:'aux Îles Marshall'};
const loc=c=>PLUR[c.code]||((MASC.has(c.code)?'au ':/^[AEIOUÉÎÂ]/i.test(c.name)||/e$|a$/i.test(c.name)&&!MASC.has(c.code)?'en ':'au ')+c.name);
const fr=x=>String(x).replace('.',',');
const risk=(s,code,age,health=health0)=>L.deathRate(s,{country:code,age,health,insurance:false});
const cum=(s,code,age)=>{let c=1;for(let a=0;a<age;a++)c*=1-risk(s,code,a);return 1-c};
let weights=null;const worldW=()=>{if(!weights){const tot=L.countries.reduce((n,c)=>n+c.population,0);weights=L.countries.map(c=>[c.code,c.population/tot])}return weights};
const worldCum=(s,age)=>worldW().reduce((n,[code,w])=>n+w*cum(s,code,age),0);
const worldRisk=(s,age)=>worldW().reduce((n,[code,w])=>n+w*risk(s,code,age),0);
const FATE={infarctus:['cardiac',(cr)=>.1*cr+.5*(1-cr)],'accident vasculaire cérébral':['stroke',cr=>.18*(1-.5*cr)+.1],'un cancer':['cancer',cr=>.5*(1-Math.min(.9,.35+.55*cr))+.1],'accident de la route':['road',()=>0],paludisme:['tropical',cr=>.02*(1.2-cr)],dengue:['tropical',cr=>.004*(1.2-cr)],'accident du travail':['workplace',cr=>.01*(1-.4*cr)],'catastrophe naturelle':['disaster',()=>.004],'un conflit armé':['conflict',()=>.012],'une épidémie mondiale':['pandemic',()=>.02],'un incendie domestique':['fire-home',()=>.01]};
/* Risque annuel de mourir de cette cause à cet âge, pour 100 000 personnes, dans le pays donné. */
function causeRisk(s,p,code,age,cause){const base=risk(s,code,age),q={...p,country:code,age,health:health0};
  const w=L.causeWeights(s,q,age),tot=w.reduce((n,x)=>n+x[1],0),hit=w.find(x=>norm(x[0])===norm(cause));if(hit)return{per100k:base*hit[1]/tot*1e5,share:hit[1]/tot,via:'cause'};
  const roadKey=norm(cause).includes('accident de la route');if(roadKey){const c=L.country(s,q),pv=1-Math.min(1,Math.max(0,Math.log(Math.max(1,c.income)/1500)/Math.log(30)));return{per100k:(4+20*pv)*(age>=15&&age<=45?1.4:age>=60?1.1:.8),share:null,via:'route'}}
  const key=Object.keys(FATE).find(k=>norm(cause)===norm(k)||norm(cause).includes(norm(k)));if(key&&L.fate){const[hid,frac]=FATE[key],h=L.fate.hazards.find(x=>x.id===hid),c=L.country(s,q),cr=L.fate.care(s,q,c);if(h){const r=h.rate({s,p:q,c,age,care:cr});const v=Math.max(0,r)*frac(cr);return{per100k:v*1e5,share:null,via:'imprévu'}}}
  return{per100k:null,share:null,via:'inconnue'}}
function stats(s,p=s.person){const c=L.country(s,p),age=Math.max(0,Math.round(p.age)),fr='FR',cause=p.cause||(p.alive?null:L.causeOfDeath?.(s,p));
  const out={age,country:c.name,alive:p.alive,life:c.life,cumCountry:cum(s,c.code,age),cumFR:cum(s,fr,age),cumWorld:worldCum(s,age),riskCountry:risk(s,c.code,age),riskFR:risk(s,fr,age),riskWorld:worldRisk(s,age),survival:1-cum(s,c.code,age),cause};
  if(cause){out.causeCountry=causeRisk(s,p,c.code,age,cause);out.causeFR=causeRisk(s,p,fr,age,cause);const a=out.causeCountry.per100k,b=out.causeFR.per100k;out.ratio=a&&b?a/b:null}
  return out}
const per=(x,n=1000)=>{const v=x*n;return v>=100?Math.round(v).toLocaleString('fr-FR'):v>=10?(Math.round(v*10)/10).toLocaleString('fr-FR'):(Math.round(v*100)/100).toLocaleString('fr-FR')};
function lines(s,p=s.person){const m=stats(s,p),who=m.age<15?'enfants nés':m.age<40?'jeunes nés':'personnes nées',place=loc(L.country(s,p));const L1=[];
  if(m.age>=1)L1.push({label:`Sur 1 000 ${who} ${place}, ${per(m.cumCountry)} meurent avant ${m.age} an${m.age>1?'s':''}.`,note:`France : ${per(m.cumFR)} · monde : ${per(m.cumWorld)}`});
  L1.push({label:`À ${m.age} an${m.age>1?'s':''}, le risque de mourir dans l’année est de ${per(m.riskCountry)} pour 1 000 ${place}.`,note:`France : ${per(m.riskFR)} pour 1 000 · monde : ${per(m.riskWorld)} pour 1 000`});
  if(m.cause&&m.causeCountry?.per100k!=null){const a=m.causeCountry.per100k,b=m.causeFR.per100k;L1.push({label:`Cause : ${m.cause}. Risque annuel de mourir de cette cause à cet âge : ${per(a,1).replace(/,00$/,'')} pour 100 000 ${place}.`,note:`${b!=null?`France : ${per(b,1)} pour 100 000`:''}${m.ratio?` · ${m.ratio>=1.15?`≈ ${fr(m.ratio>=10?Math.round(m.ratio):Math.round(m.ratio*10)/10)} fois plus élevé ici`:m.ratio<=.87?`≈ ${fr(Math.round(1/m.ratio*10)/10)} fois plus faible ici`:'comparable'}`:''}`}
    );if(m.causeCountry.share!=null)L1.push({label:`Parmi les décès à cet âge ${place}, ${Math.round(m.causeCountry.share*100)} % ont cette cause.`,note:`France : ${m.causeFR.share!=null?Math.round(m.causeFR.share*100)+' %':'—'}`})}
  else if(m.cause)L1.push({label:`Cause : ${m.cause}. Un imprévu rare : le modèle ne l’attribue pas à un taux de mortalité fixe pour cet âge.`,note:''});
  L1.push({label:`Chance d’avoir atteint ${m.age} an${m.age>1?'s':''}, pour une personne née ${place} : ${fr(Math.round(m.survival*1000)/10)} %.`,note:`Espérance de vie à la naissance dans le modèle : ${m.life} ans`});
  return L1}
L.mortality={stats,lines,causeRisk,cum,risk,locative:loc};
})(typeof window!=='undefined'?window:globalThis);
