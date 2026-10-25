/* Données de référence par pays : espérance de vie, revenu national brut par habitant
   (en parité de pouvoir d'achat = UPA, et au taux de change courant) et mortalité avant 5 ans.
   Valeurs approximatives, arrondies, d'après les ordres de grandeur publiés par l'ONU
   (World Population Prospects, UNICEF/IGME) et la Banque mondiale (WDI), vers 2021-2023.
   Elles servent à rendre les pays plus fidèles à la réalité ; ce ne sont pas des chiffres officiels
   exacts, et certains pays (en crise ou très petits) sont particulièrement incertains. */
(function(root){const L=root.Life;
/* code:espérance de vie, revenu en milliers d'UPA, revenu en milliers de dollars au taux courant, mortalité avant 5 ans (pour 1 000 naissances, - si inconnue) */
const T=`
AF:62,2.1,0.4,55 ZA:62,14.5,6.4,32 AL:77,18,6.8,8 DZ:76,11.5,4.1,22 DE:81,62,51,3.6 AD:83,60,42,3 AO:62,6.8,3,68 AG:78,23,17.5,- SA:77,57,27,6.5 AR:76,23,11,9 AM:76,17.5,7.5,11 AU:83,58,66,3.7 AT:82,62,52,3.6 AZ:74,16.5,5.5,18 BS:74,32,29,12 BH:79,50,29,6 BD:72,7.2,2.7,28 BB:79,18,18,10 BE:82,58,50,3.9 BZ:74,9.4,6,11 BJ:60,3.7,1.4,90 BT:72,11,3.5,25 BY:74,22,7.2,3 BO:69,9.6,3.6,24 BA:77,17.5,7,5 BW:61,17,7.5,35 BR:73,17.2,8.7,14 BN:75,70,33,10 BG:75,33,11.5,5.5 BF:60,2.4,0.9,99 BI:62,0.8,0.25,54 KH:70,5.1,1.7,24 CM:63,4.1,1.6,70 CA:82,55,52,4.7 CV:74,7.5,4,14 CL:79,28,15.4,6 CN:78,21.5,12.8,6.8 CY:81,45,29,2.5 CO:73,17,6.1,12 KM:64,3.5,1.5,46 CG:64,4.5,2.3,40 CD:60,1.3,0.6,80 KP:72,1.7,1,15 KR:83,50,35,2.9 CR:80,25,12.9,8 CI:59,5.5,2.4,70 HR:78,36,17,4.5 CU:78,11,9,5 DK:82,68,68,3.5 DJ:62,5.5,3.5,55 DM:74,14,8,- EG:71,14.5,4,20 AE:79,72,45,6.4 EC:77,12.5,6.2,12 ER:68,2.2,0.6,40 ES:83,45,30,3 EE:78,41,27,2.5 SZ:58,10.5,3.9,40 US:77,76,76,6.5 ET:67,2.8,1,47 FJ:68,13.5,5.8,22 FI:82,55,54,2.5 FR:82,53,42,4 GA:66,15.5,7.8,40 GM:62,2.4,0.8,48 GE:74,18.5,6.6,9 GH:64,6.7,2.3,40 GR:80,34,20,3.9 GD:74,18,9.8,- GT:70,9.2,5.7,24 GN:59,3.3,1.2,99 GQ:62,15,7,75 GW:59,2.4,0.8,76 GY:67,24,10,25 HT:64,3.4,1.5,55 HN:70,6.8,2.9,17 HU:76,38,18,4 MH:65,7,5,- SB:70,3.3,2.3,17 IN:70,8,2.4,31 ID:68,13.5,4.5,22 IQ:71,11.5,5.1,22 IR:74,16,4.5,13 IE:82,85,75,3.5 IS:83,58,68,2 IL:83,52,55,3.5 IT:83,46,35,2.7 JM:71,10.5,5.6,13 JP:84,47,42,2 JO:74,11,4.4,14 KZ:73,31,11,9 KE:62,5.8,2.1,40 KG:71,6.5,1.3,17 KI:68,4.5,2,- XK:77,15,5.7,9 KW:80,50,35,8 LA:69,8.5,2.5,40 LS:53,3.2,1.1,70 LV:76,36,20,3.5 LB:75,12,3.6,7 LR:61,1.6,0.7,70 LY:72,17,6,11 LI:83,110,160,3 LT:76,41,23,3.2 LU:83,90,85,2.5 MK:76,20,6.8,5.4 MG:64,1.9,0.5,55 MY:76,31,12,7 MW:63,1.6,0.65,40 MV:80,21,12,6 ML:59,2.5,0.85,100 MT:83,51,31,6 MA:74,8.8,3.5,19 MU:74,26,10.2,15 MR:65,5.8,2.2,45 MX:70,19.5,10.9,13 FM:70,3.9,3.8,- MD:70,16.5,5.9,14 MC:85,100,190,3 MN:71,14,5,17 ME:77,24,9.4,3.5 MZ:60,1.3,0.5,70 MM:67,5.8,1.2,45 NA:59,10.5,4.5,38 NR:65,10,12,- NP:70,4.9,1.3,28 NI:74,6.8,2.3,14 NE:62,1.6,0.6,110 NG:53,5.7,2.2,107 NO:83,74,91,2.4 NZ:82,46,48,4.5 OM:79,38,19,11 UG:63,3,0.86,42 UZ:72,9.5,2.1,17 PK:67,6.4,1.5,63 PW:73,20,16,- PA:79,31,14.7,14 PG:65,4.6,2.7,40 PY:70,14.5,5.9,17 NL:82,65,57,3.7 PE:73,15.6,6.8,13 PH:69,10,3.9,26 PL:77,41,18,4 PT:82,42,25,3.2 QA:80,90,62,6 CF:54,1,0.5,99 DO:73,21,8.6,28 RO:75,37,14.5,5.6 GB:81,50,46,4.2 RU:72,31,12.4,6 RW:66,3,0.9,40 KN:77,28,20,- SM:85,55,45,2 VC:73,17,8,- LC:76,18,10,- SV:71,11,4.4,12 WS:73,6.5,4.3,- ST:70,6.6,2.5,- SN:67,4.2,1.6,38 RS:76,24,8.6,5 SC:73,29,13.2,- SL:55,1.9,0.5,99 SG:83,105,67,2 SK:77,35,20,5.5 SI:81,44,28,2.2 SO:56,1.3,0.5,110 SD:65,4,0.7,55 SS:55,1.5,0.4,99 LK:77,14,3.8,7 SE:83,60,56,2.6 CH:84,72,93,4 SR:71,16,4.9,20 SY:72,2.5,0.5,20 TJ:71,5.3,1.1,30 TW:80,65,33,4 TZ:66,3.9,1.2,40 TD:53,1.7,0.7,110 CZ:79,47,26,3.2 PS:74,6.5,3.6,15 TH:78,20.5,7.4,8 TL:69,5.3,2,40 TG:61,2.9,1,60 TO:71,6.8,5.2,- TT:74,28,16,14 TN:74,11.5,3.8,15 TM:69,15,8,40 TR:76,36,11,10 TV:66,6,5.8,- UA:71,14,4.5,8 UY:78,25,18.5,6 VU:70,3,3.1,24 VA:80,50,40,3 VE:72,8,3.9,25 VN:74,13.5,4.1,20 YE:64,3,0.6,60 ZM:62,3.8,1.2,60 ZW:61,3.9,1.7,50
`;
const facts={};for(const t of T.trim().split(/\s+/)){const[c,v]=t.split(':'),[life,ppp,nom,u5]=v.split(',');facts[c]={life:+life,income:Math.round(+ppp*1000),nominal:Math.round(+nom*1000),u5:u5==='-'?null:+u5}}
for(const c of L.countries){const f=facts[c.code];if(!f)continue;c.life=f.life;c.income=f.income;c.nominal=f.nominal;if(f.u5!=null)c.u5=f.u5;c.profileSource='Valeurs de référence arrondies (ONU, UNICEF, Banque mondiale) vers 2021-2023';c.dataQuality='approximate'}
/* Mortalité avant 5 ans estimée pour les pays sans valeur : dérivée du revenu. */
for(const c of L.countries){if(c.u5==null){const pv=Math.max(0,Math.min(1,1-Math.log(c.income/1500)/Math.log(45000/1500)));c.u5=Math.round(3+95*Math.pow(pv,1.5))}}

/* ── Mortalité de base par pays et par âge (probabilité annuelle, personne en bonne santé moyenne) ──
   Avant 5 ans : calée sur la mortalité avant 5 ans du pays ; 5-14 ans : dérivée ; adultes : une courbe
   de Gompertz dont le niveau est ajusté pour que l'espérance de vie à la naissance corresponde au pays. */
const clampN=(x,a,b)=>Math.max(a,Math.min(b,x));
function childParts(c){const U=Math.max(1.5,c.u5)/1000,IMR=U*clampN(.82-.002*c.u5,.62,.82),h1=1-Math.pow((1-U)/(1-IMR),.25);return{IMR,h1,old:.00018+.0000125*c.u5}}
const shape=a=>a<40?.00045:a<60?.0015*Math.exp((a-40)/14):.005*Math.exp((a-60)/11);
function surviveCurve(c,F){const p=childParts(c);let S=1,sum=0;for(let a=0;a<115;a++){const h=a<1?p.IMR:a<5?p.h1:a<15?p.old:Math.min(.95,F*shape(a)*(a<40?1:1));const next=S*(1-h);sum+=(S+next)/2;S=next;if(S<1e-6)break}return sum}
function fit(c,target){let lo=.05,hi=30;for(let i=0;i<40;i++){const mid=Math.sqrt(lo*hi);if(surviveCurve(c,mid)>target)lo=mid;else hi=mid}return Math.sqrt(lo*hi)}
/* Les imprévus (infarctus, cancers…) ajoutent des décès : on réduit d'autant la mortalité de base pour que l'âge moyen au décès reste celui du pays. */
const bonus=c=>clampN(.16*(c.life-50),0,6);
function baseMortality(c,a){if(c._mortF==null){c._mortF=fit(c,c.life+bonus(c))}const p=childParts(c);a=Math.floor(Math.max(0,a));
  if(a<1)return p.IMR;if(a<5)return p.h1;if(a<15)return p.old;return Math.min(.95,c._mortF*shape(a))}
L.baseMortality=baseMortality;L.modelLifeExpectancy=c=>surviveCurve(c,c._mortF??(c._mortF=fit(c,c.life+bonus(c))));

/* « 50 % (1 chance sur 2) » : une probabilité en pourcentage et en chances. */
const fnum=(x,d=1)=>x.toLocaleString('fr-FR',{maximumFractionDigits:d});
function pctText(p){if(p==null||!Number.isFinite(p))return'—';const v=p*100;if(v>=99.95)return'100 %';if(v>=10)return fnum(Math.round(v*10)/10,Math.abs(v-Math.round(v))<.05?0:1)+' %';if(v>=1)return fnum(Math.round(v*10)/10)+' %';if(v>=.01)return fnum(Math.round(v*100)/100,2)+' %';return v>0?'moins de 0,01 %':'0 %'}
function chancesText(p){if(p==null||!Number.isFinite(p))return'';if(p<=0)return'aucune chance';if(p>=.9995)return'certain';
  if(p<.5){const n=1/p;if(n>=1e6)return'1 chance sur '+fnum(Math.round(n/1e5)/10)+' million'+(n>=2e6?'s':'');if(n>=1000)return'1 chance sur '+(Math.round(n/100)*100).toLocaleString('fr-FR');if(n>=100)return'1 chance sur '+Math.round(n/5)*5;if(n>=10)return'1 chance sur '+Math.round(n);return'1 chance sur '+fnum(Math.round(n*10)/10,n<3?1:0)}
  let best=null;for(let b=2;b<=10;b++){const a=Math.round(p*b),err=Math.abs(p-a/b);if(a<b&&(!best||err<best.err-1e-9))best={a,b,err}}if(best&&best.err<.025)return best.a+' chance'+(best.a>1?'s':'')+' sur '+best.b;
  const n=n2=>n2>=100?Math.round(n2/10)*10:Math.round(n2),N=n(1/(1-p));return(N-1)+' chances sur '+N}
const oneIn=(p,what='sur')=>{if(!(p>0))return'';if(p>=.5)return chancesText(p).replace(/ chances? /,' ');const n=1/p;return'1 '+what+' '+(n>=1e6?fnum(Math.round(n/1e5)/10)+' million'+(n>=2e6?'s':''):n>=1000?(Math.round(n/100)*100).toLocaleString('fr-FR'):n>=100?Math.round(n/5)*5:n>=10?Math.round(n):fnum(Math.round(n*10)/10,n<3?1:0))};
L.odds={pct:pctText,chances:chancesText,both:p=>pctText(p)+' ('+chancesText(p)+')',oneIn,share:p=>pctText(p)+' ('+oneIn(p)+')'};

/* Parcours scolaire connu pour quelques grands pays où l'estimation par le revenu est trop basse
   (taux d'achèvement approximatifs : primaire, collège, lycée, entrée dans le supérieur). */
const EDU={IN:[.93,.80,.58,.28],ID:[.95,.82,.68,.37],PH:[.93,.88,.74,.35],VN:[.97,.88,.72,.30],BD:[.85,.65,.45,.22],EG:[.95,.85,.70,.38],CU:[.99,.97,.85,.40],CN:[.97,.90,.75,.45],UZ:[.97,.96,.90,.20],KZ:[.99,.98,.90,.55],GE:[.98,.96,.90,.45],MN:[.97,.90,.78,.45],LK:[.98,.95,.80,.20],KR:[.99,.99,.98,.70],JP:[.99,.99,.98,.60]};
for(const c of L.countries)if(EDU[c.code])c.edu=EDU[c.code];
L.facts=facts;
})(typeof window!=='undefined'?window:globalThis);
