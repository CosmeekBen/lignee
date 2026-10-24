/* Repères : où vous vous situez parmi les autres (monde, pays, âge, métier).
   Ce sont des distributions de jeu (log-normales et normales calibrées sur les
   profils de pays du modèle), pas des statistiques officielles. */
(function(root){const L=root.Life,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const erf=x=>{const s=Math.sign(x);x=Math.abs(x);const t=1/(1+.3275911*x);return s*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x))};
const phi=z=>.5*(1+erf(z/Math.SQRT2));
const lnCdf=(x,median,sigma)=>x<=0?0:phi((Math.log(x)-Math.log(median))/sigma);
const interp=(table,a)=>{if(a<=table[0][0])return table[0][1];for(let i=1;i<table.length;i++)if(a<=table[i][0]){const[x0,y0]=table[i-1],[x1,y1]=table[i];return y0+(y1-y0)*(a-x0)/(x1-x0)}return table.at(-1)[1]};
const incomeAge=a=>a<18?0:a>=65?.45:.25+.75*Math.sin(Math.PI*Math.min(1,(a-18)/54));
const wealthAge=a=>interp([[18,.05],[25,.25],[30,.6],[40,1.5],[50,2.5],[60,3.4],[70,3.2],[85,2.4]],a);
const poorness=c=>clamp(1-Math.log(c.income/1500)/Math.log(45000/1500),0,1);
const sigmaIncome=c=>.55+.4*poorness(c),sigmaWealth=c=>1.25+.5*poorness(c);
const noWork=c=>.12+.2*poorness(c),noAssets=c=>.14+.1*poorness(c);
const healthMean=(a,c)=>clamp(interp([[0,92],[20,92],[40,86],[60,76],[75,64],[90,48]],a)+(c.life-73)*.35,25,99),healthSd=a=>6+a*.18;
const joyMean=c=>clamp(55+3*Math.log(c.income/10000),47,65);
const survival=(a,c)=>1/(1+Math.exp((a-(c.life+3))/8));
const tertiary=c=>clamp(.06+.5*(Math.log(c.income/1500)/Math.log(45000/1500)),.05,.6);
const skillMean=a=>interp([[6,5],[18,25],[30,45],[45,60],[60,70],[80,78]],a);

let weights=null;
function mix(){if(!weights){const total=L.countries.reduce((n,c)=>n+c.population,0);weights=L.countries.map(c=>[c,c.population/total])}return weights}
const worldMix=f=>mix().reduce((n,[c,w])=>n+w*f(c),0);

/* Part de personnes situées sous la valeur, en pourcentage (0-100). */
function earnings(x,c,k,age){const med=c.income*k*.9,z=noWork(c);
  const f=a=>x<=0?z*.5:z+(1-z)*lnCdf(x,med*(a==null?.78:incomeAge(a)),sigmaIncome(c)+(a==null?.1:0));return f(age)}
function wealth(x,c,k,age){const z=noAssets(c),med=c.income*k*(age==null?1.6:wealthAge(age));
  return x<=0?z*.5:z+(1-z)*lnCdf(x,med,sigmaWealth(c)+(age==null?.2:0))}
function normalPct(x,mean,sd){return phi((x-mean)/sd)}

function standing(s,p=s.person){const c=L.country(s,p),k=L.reference(s,p)/c.income,age=p.age,rows=[];
  const percent=v=>Math.round(clamp(v,0,1)*1000)/10;
  const row=(id,label,display,world,country,byAge,job,note)=>rows.push({id,label,display,world:percent(world),country:percent(country),age:percent(byAge),job:job==null?null:percent(job),note});
  const adult=age>=18,fmt=n=>Math.round(n).toLocaleString('fr-FR')+' UPA';
  const j=p.career&&L.jobById?L.jobById(p.career.jobId):null,skillKey=p.career&&L.sectors[p.career.sector]?.skill;
  if(adult){
    const pay=L.income(s,p),peerMedian=c.income*k*(j?j.income:1)*.9;
    const peerPay=j&&pay>0?lnCdf(pay,peerMedian*(1+Math.min(.3,(p.career.years||0)*.02)),.3):null;
    row('income','Revenu annuel',fmt(pay),worldMix(x=>earnings(pay,x,k)),earnings(pay,c,k),worldMix(x=>earnings(pay,x,k,age)),peerPay,'Parmi les adultes, chômage et inactivité inclus.');
    const net=L.balance(p);
    row('wealth','Patrimoine net',fmt(net),worldMix(x=>wealth(net,x,k)),wealth(net,c,k),worldMix(x=>wealth(net,x,k,age)),null,'Épargne, placements, logement, entreprise moins dettes.');
    if(j&&p.career){const years=p.career.years||0;row('seniority','Ancienneté dans le métier',years+' an'+(years>1?'s':''),1-Math.exp(-years/9),1-Math.exp(-years/9),1-Math.exp(-years/9),1-Math.exp(-years/9),'Face aux personnes qui exercent le même métier.')}
    const top=Math.max(0,p.education);const share=top<=0?1:top===1?tertiary(c):top===2?tertiary(c)*.45:tertiary(c)*.08;
    const shareWorld=top<=0?1:worldMix(x=>top===1?tertiary(x):top===2?tertiary(x)*.45:tertiary(x)*.08);
    row('education','Niveau d’études',['Études de base','Études supérieures','Master / ingénieur','Doctorat'][Math.min(3,top)],1-shareWorld,1-share,1-share*(age<30?1.1:1),null,'Part des adultes ayant un niveau inférieur au vôtre.');
  }
  const hm=healthMean(age,c),hmWorld=worldMix(x=>normalPct(p.health,healthMean(age,x),healthSd(age)));
  row('health','Santé',Math.round(p.health)+' / 100',hmWorld,normalPct(p.health,hm,healthSd(age)),normalPct(p.health,healthMean(age,{life:73}),healthSd(age)),null,'Face à des personnes du même âge.');
  const jm=joyMean(c);
  row('happiness','Épanouissement',Math.round(p.happiness)+' / 100',worldMix(x=>normalPct(p.happiness,joyMean(x),15)),normalPct(p.happiness,jm,15),normalPct(p.happiness,55,15),null,'Le revenu moyen d’un pays déplace légèrement la moyenne.');
  if(age>=6){const keys=Object.keys(p.skills),best=keys.reduce((a,b)=>p.skills[b]>p.skills[a]?b:a),v=p.skills[best],byAge=normalPct(v,skillMean(age),14);
    const peers=skillKey&&j?normalPct(p.skills[skillKey],25+2.5*9+(Math.max(0,p.education))*5,15):null;
    row('skill','Compétence phare · '+L.skills[best],Math.round(v)+' / 100',byAge,byAge,byAge,peers,peers==null?'Face aux personnes du même âge.':'Métier : votre compétence-clef face à celle des pairs.')}
  if(age>=1){const alive=survival(age,c),sw=worldMix(x=>survival(age,x));{row('survival','Atteignent votre âge',age+' ans',sw,alive,alive,null,'Part des personnes nées comme vous qui arrivent jusqu’à cet âge.');rows.at(-1).share=true}}
  return{age,country:c.name,job:j?j.title:null,rows}}

/* Les deux écarts les plus marqués, pour un coup d’œil. */
function highlights(rows,n=3){return rows.filter(r=>r.id!=='survival'&&r.id!=='seniority').map(r=>({...r,gap:Math.abs(r.world-50)})).sort((a,b)=>b.gap-a.gap).slice(0,n)}
function describe(pct){if(pct>=50)return pct>=90?'Top '+(Math.max(.1,Math.round((100-pct)*10)/10)).toLocaleString('fr-FR')+' %':'devant '+Math.round(pct)+' %';return pct<=10?'Derniers '+(Math.max(.1,Math.round(pct*10)/10)).toLocaleString('fr-FR')+' %':'devant '+Math.round(pct)+' %'}

L.standing=standing;L.standingHighlights=highlights;L.describePercentile=describe;L.statistics={phi,lnCdf,earnings,wealth};
})(typeof window!=='undefined'?window:globalThis);
