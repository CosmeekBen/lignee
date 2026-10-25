/* Choix de vie intimes et luttes : qui on aime, ce pour quoi on se bat.
   - Identité et relations : envie d'une relation, attirance, en parler ou non ; le sexe du partenaire suit.
   - Luttes : mariage imposé, école arrêtée, reprise d'une affaire familiale, service militaire, salaire non payé,
     discrimination, corruption, expulsion, héritage disputé… On accepte, on résiste, on négocie, on temporise ou on fuit,
     et la famille (ou l'employeur, ou l'État) accepte ou non. Les probabilités dépendent du lien familial, du foyer et du pays. */
(function(root){const L=root.Life,clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const base={year:L.year,choose:L.choose,action:L.action};
const hash=(...a)=>L.hash(a.join('|'));
const lg=(x,a,b)=>clamp(Math.log(Math.max(1,x)/a)/Math.log(b/a),0,1);
const ch=(label,note,fx={})=>({label,note,fx});
const bondOf=p=>p.parents?.length?p.parents.reduce((n,x)=>n+(x.bond??60),0)/p.parents.length:60;
const poorness=c=>1-lg(c.income,1500,45000);

/* ── Identité, attirance, relations ── */
const ID={orientation:{hetero:'Attiré·e par des personnes de l’autre sexe',gay:'Attiré·e par des personnes du même sexe',bi:'Attiré·e par des personnes des deux sexes',unsure:'Encore en questionnement',none:'Pas d’attirance romantique'}};
function sexOpposite(p){return p.sex==='F'?'M':'F'}
L.partnerSex=(s,p)=>{const o=p.identity?.orientation||'unsure';if(o==='hetero')return sexOpposite(p);if(o==='gay')return p.sex;if(o==='bi')return hash(s.seed,p.id,'psex',s.serial)<.5?p.sex:sexOpposite(p);return hash(s.seed,p.id,'psex',s.serial)<.9?sexOpposite(p):p.sex};
function romanceIntentEvent(s,p){return{id:'teen-romance',title:'Envie d’une relation ?',text:'Autour de vous, certain·es parlent de petits copains, de petites copines, de rendez-vous. Vous sentez peut-être de la curiosité, de la distance, ou rien de tout ça. Il n’y a pas de bonne réponse.',category:'Adolescence',required:true,
  choices:[ch('Oui, ça me tente','Relations +3 · curiosité',{skills:{social:3},identity:{romance:'open'}}),ch('Pas pour l’instant','Sérénité · vous pourrez changer d’avis',{stress:-2,identity:{romance:'later'}}),ch('Je ne ressens pas d’attirance romantique ou sexuelle','Vous vous connaissez · épanouissement +2',{happy:2,identity:{romance:'none',orientation:'none'}})]}}
function attractionEvent(s,p){const sex=p.sex==='F'?'filles':'garçons',other=p.sex==='F'?'garçons':'filles';return{id:'teen-attraction',title:'Qui vous attire ?',text:'Avec le temps, vos émotions prennent forme. Vous n’êtes pas obligé·e de savoir, ni de choisir une étiquette. Ce que vous ressentez compte.',category:'Adolescence',required:true,
  choices:[ch(`Des ${other}`,'Vous vous reconnaissez',{identity:{orientation:'hetero'}}),ch(`Des ${sex}`,'Vous vous reconnaissez · vous aurez peut-être à en parler',{identity:{orientation:'gay'}}),ch(`Des ${sex} et des ${other}`,'Vous vous reconnaissez · vous aurez peut-être à en parler',{identity:{orientation:'bi'}}),ch('Je ne sais pas encore','Prendre le temps · aucune pression',{identity:{orientation:'unsure'}})]}}
function confideEvent(s,p){return{id:'teen-confide',title:'En parler, ou pas ?',text:'Ce que vous ressentez fait partie de vous. En parler peut soulager ou inquiéter. Les réactions varient beaucoup, selon les familles, les amis, les endroits. Vous décidez à qui, quand, et comment.',category:'Adolescence',required:true,stats:[{label:'Familles qui accueillent bien la nouvelle, dans votre situation',pct:Math.round(famAccept(s,p)*100),strong:true}],statsKicker:'Ce que disent les chiffres du modèle',
  choices:[ch('En parler à un·e ami·e de confiance','Amitié +6 · stress −4 (ou moins, selon la réaction)',{identity:{confide:'friend'}}),ch('En parler à ma famille','Liens en jeu · stress +6',{identity:{confide:'family'}}),ch('Attendre d’être prêt·e','Pas de pression',{identity:{confide:'wait'}}),ch('Vivre discrètement pour l’instant','Sécurité · stress +4',{stress:4,identity:{confide:'quiet'}})]}}
const famAccept=(s,p)=>clamp(.3+.45*(bondOf(p)/100)+.1*(p.urban?1:0)+.1*((p.wealthTier??.5)-.5),.12,.9);
function adultReflectEvent(s,p){return{id:'ad-reflect',title:'Ce que vous ressentez a-t-il changé ?',text:'Avec les années, certaines certitudes bougent. Vous pouvez reprendre le fil de ce que vous ressentez, ou le laisser tel quel.',category:'Vie personnelle',required:true,
  choices:[ch('Je me découvre autrement','Vous prenez le temps de vous comprendre',{identity:{orientation:p.identity?.orientation==='hetero'||p.identity?.orientation==='gay'?'bi':'unsure',romance:p.identity?.romance==='none'?'open':p.identity?.romance}}),ch('Je suis très bien comme je suis','Sérénité · épanouissement +4',{happy:4}),ch('J’aimerais me concentrer sur d’autres choses','Énergie +5',{energy:5,identity:{romance:'later'}})]}}
function identityFx(s,p,f){p.identity??={orientation:'unsure',romance:'later',out:{}};if(f.romance)p.identity.romance=f.romance;if(f.orientation)p.identity.orientation=f.orientation;
  if(f.confide){p.identity.out??={};const u=hash(s.seed,p.id,'confide',f.confide),acc=f.confide==='family'?famAccept(s,p):f.confide==='friend'?.72+.1*((p.wealthTier??.5)-.5):1;
    if(f.confide==='wait'||f.confide==='quiet')return;
    const ok=u<acc;p.identity.out[f.confide]=ok?'accepted':'difficult';
    if(f.confide==='friend'){const fr=p.friends?.[0];if(ok){p.happiness=clamp(p.happiness+6);p.stress=clamp(p.stress-4);if(fr)fr.bond=clamp(fr.bond+8);L.log(s,'Votre ami·e vous écoute et vous soutient. Vous vous sentez moins seul·e.',true,'identity')}else{p.stress=clamp(p.stress+6);if(fr)fr.bond=clamp(fr.bond-10);L.log(s,'La réaction de votre ami·e est maladroite, voire blessante. Il faudra du temps.',true,'identity')}}
    else{if(ok){p.happiness=clamp(p.happiness+8);p.stress=clamp(p.stress-6);p.parents?.forEach(x=>x.bond=clamp(x.bond+8));L.log(s,'Votre famille vous accueille, parfois maladroitement, mais sincèrement.',true,'identity')}else{p.stress=clamp(p.stress+10);p.happiness=clamp(p.happiness-6);p.parents?.forEach(x=>x.bond=clamp(x.bond-14));L.log(s,'La conversation est difficile. Votre famille a besoin de temps, ou n’y arrive pas. Vos amis comptent encore plus.',true,'identity')}}}}
/* La relation amoureuse n'est pas une obligation. */
L.action=function(s,type,...a){const p=s.person;if(type==='date'&&p.identity?.romance==='none')return{ok:false,error:'Vous ne recherchez pas de relation amoureuse. Vous pouvez changer d’avis plus tard.'};return base.action(s,type,...a)};

/* ── Luttes ── */
const S=(id,o)=>({id,min:15,max:60,cap:1,rate:.08,when:()=>true,...o});
const ctxOf=(s,p)=>{const c=L.country(s,p);return{s,p,c,bond:bondOf(p)/100,tier:p.wealthTier??.5,poor:poorness(c),urban:!!p.urban}};
const CONSCRIPT=new Set('KR KP IL TR RU UA TW EG SY IR SG CH AT FI NO SE DK EE LT LV GR CY AM AZ GE TJ UZ MN BY'.split(' '));
const struggles=[
S('forced-marriage',{min:15,max:27,rate:.14,scale:({poor})=>.12+.88*poor,when:({p,c,poor,tier,urban})=>!p.partner&&(poor>.35||tier<.4)&&(!urban||tier<.45),
 title:'Un mariage organisé sans vous demander',text:(x)=>`Votre famille a trouvé quelqu’un pour vous : une alliance entre deux familles, une situation « raisonnable ». On vous dit que c’est pour votre bien, que la date approche et que tout est presque décidé. Personne ne vous a demandé ce que vous voulez.`,
 stances:{
  accept:{label:'Accepter, par loyauté',note:'Liens familiaux +10 · épanouissement −10',pOk:()=>1,okText:'Vous acceptez. Le mariage a lieu. Vous construirez votre vie à partir de là.',ok:{parents:10,happy:-10,stress:6,struggleFlag:'marriage-accepted',partner:{forced:true}}},
  refuse:{label:'Refuser ouvertement',note:'Vous défendez votre choix · la famille réagira',pOk:({bond,tier,poor})=>clamp(.2+.5*bond+.15*tier-.15*poor,.08,.85),okText:'Votre famille cède, avec mauvaise grâce. Elle respectera votre refus, au moins pour l’instant.',koText:'Votre famille refuse d’entendre. Les relations se tendent, et votre soutien matériel diminue.',ok:{parents:-6,stress:8,happy:4,reputation:2},ko:{parents:-30,stress:16,happy:-8,cash:-300,wealthDrop:.2}},
  stall:{label:'Temporiser',note:'« Laissez-moi finir mes études / trouver un travail »',pOk:({bond,tier})=>clamp(.45+.3*bond+.1*tier,.2,.8),okText:'Vous gagnez du temps : la famille accepte d’attendre. La question reviendra peut-être.',koText:'La famille refuse d’attendre. La date est avancée.',ok:{stress:4,skills:{academic:3},struggleFlag:'marriage-delayed'},ko:{stress:10,parents:-4,happy:-6,struggleFlag:'marriage-accepted',partner:{forced:true}}},
  negotiate:{label:'Négocier : rencontrer la personne, avoir un vrai mot à dire',note:'Chance moyenne · compromis',pOk:({bond,tier})=>clamp(.4+.35*bond+.05*tier,.2,.8),okText:'On vous laisse rencontrer la personne et décider. Vous gardez un droit de réponse.',koText:'Le compromis échoue : on vous reproche votre « manque de respect ».',ok:{stress:2,parents:2,network:3},ko:{parents:-10,stress:10,happy:-4}},
  flee:{label:'Partir',note:'Quitter la maison · soutien perdu · liberté gagnée',pOk:({tier,poor,urban})=>clamp(.35+.25*tier+.15*(urban?1:0)-.2*poor,.1,.7),okText:'Vous partez, aidé·e par une amie, une association ou un proche. Vous recommencez ailleurs, seul·e mais libre.',koText:'Votre fuite est difficile : peu de ressources, peu d’appuis, des risques. Vous tenez bon, mais le coût est lourd.',ok:{parents:-35,stress:12,happy:6,cash:-200,network:4,struggleFlag:'left-home',wealthDrop:.25},ko:{parents:-45,stress:18,health:-6,happy:-8,cash:-300,struggleFlag:'left-home',wealthDrop:.3}}}}),
S('quit-school',{min:11,max:18,rate:.1,when:({p,c,poor,tier})=>c.income<9000&&(poor>.35||tier<.35)&&L.schoolLevel(p)>=1&&L.schoolLevel(p)<4&&!p.school?.stopped&&!p.study&&p.school?.history?.some(h=>h.ok),
 title:'On voudrait vous retirer de l’école',text:()=>`À la maison, on compte sur vous : pour travailler, aider aux champs, garder les plus petits, ou simplement parce que l’école coûte trop cher. Ce n’est pas de la méchanceté. Mais vous voyez bien ce que ça ferme.`,
 stances:{
  obey:{label:'Obéir',note:'Liens +8 · scolarité arrêtée',pOk:()=>1,okText:'Vous quittez l’école. Votre famille respire un peu. Vous savez ce que vous avez laissé derrière.',ok:{parents:8,happy:-8,quitSchool:true,cash:150}},
  convince:{label:'Plaider pour rester',note:'Vous défendez votre place',pOk:({bond,tier,p})=>clamp(.3+.4*bond+.1*tier+(p.skills.academic-20)/250,.1,.85),okText:'Vous convainquez votre famille de vous laisser continuer, à condition d’aider matin et soir.',koText:'On vous répond que ce n’est pas possible. Vous quittez l’école à contrecœur.',ok:{energy:-6,skills:{academic:3},parents:2},ko:{parents:-4,happy:-10,quitSchool:true,stress:8}},
  ally:{label:'Chercher un allié (enseignant·e, voisin·e, association)',note:'Réseau +4 · une chance de plus',pOk:({tier,poor,urban})=>clamp(.3+.25*tier+.1*(urban?1:0)-.1*poor,.15,.75),okText:'Un·e enseignant·e parle à vos parents et propose une aide : cahiers, cantine, bourse locale. Vous restez.',koText:'Personne ne peut vraiment vous aider cette fois.',ok:{network:4,skills:{academic:3},happy:4},ko:{stress:8,happy:-6,quitSchool:true}},
  both:{label:'Travailler et étudier en même temps',note:'Énergie −10 · deux vies en une',pOk:()=>.7,okText:'Vous tenez, un peu épuisé·e. Ça ne durera pas éternellement.',koText:'Le rythme est trop lourd. Vos résultats chutent et vous arrêtez.',ok:{energy:-10,stress:8,cash:150,skills:{management:3}},ko:{energy:-12,stress:12,quitSchool:true}}}}),
S('family-business',{min:18,max:35,rate:.07,when:({p,tier})=>tier>=.35&&!p.career?.rank,
 title:'On attend que vous repreniez l’affaire familiale',text:()=>`Votre famille a bâti quelque chose : une ferme, un atelier, une boutique, une entreprise. On attend que vous preniez la suite. Vous avez peut-être d’autres projets.`,
 stances:{
  accept:{label:'Reprendre l’affaire',note:'Liens +10 · revenus stables · autre voie fermée',pOk:()=>1,okText:'Vous rejoignez l’affaire. Votre famille est soulagée. Vous apprenez le métier sur le tas.',ok:{parents:10,network:5,cash:300,happy:-2,skills:{management:5}}},
  refuse:{label:'Suivre ma propre voie',note:'Vous défendez vos projets',pOk:({bond,tier})=>clamp(.25+.5*bond+.1*tier,.1,.85),okText:'Votre famille comprend, ou fait semblant. Vous partez avec sa bénédiction, du bout des lèvres.',koText:'Votre famille le prend comme une trahison. La rupture est lourde.',ok:{parents:-2,happy:6,stress:4},ko:{parents:-30,stress:12,happy:-4,wealthDrop:.2}},
  hybrid:{label:'Proposer un compromis (quelques années, puis ma voie)',note:'Gestion +4 · temps partagé',pOk:({bond})=>clamp(.45+.3*bond,.2,.85),okText:'Vous vous donnez trois ans dans l’affaire, puis vous verrez.',koText:'On vous répond « tout ou rien ».',ok:{skills:{management:4},parents:4,network:3},ko:{parents:-8,stress:8}},
  delay:{label:'Demander du temps',note:'Stress +3 · pas de décision',pOk:()=>.65,okText:'On vous laisse du temps, pour l’instant.',koText:'On vous presse davantage.',ok:{stress:3},ko:{stress:10,parents:-4}}}}),
S('conscription',{min:17,max:26,rate:.25,when:({p,c})=>CONSCRIPT.has(c.code)&&p.sex==='M'||(CONSCRIPT.has(c.code)&&['IL','NO','SE','DK','NO','KP'].includes(c.code)),
 title:'Votre convocation au service militaire',text:()=>`L’État vous convoque pour effectuer votre service. Plusieurs mois ou années loin de vos projets. Certains y voient un devoir, d’autres une contrainte. Il existe parfois des alternatives, rarement sans coût.`,
 stances:{
  serve:{label:'Faire mon service',note:'Santé +4 · discipline · une année de moins pour mes projets',pOk:()=>1,okText:'Vous faites votre service. Vous en sortez plus solide, parfois changé·e.',ok:{health:4,stress:6,network:4,skills:{management:3},status:{label:'Service militaire',years:1}}},
  exempt:{label:'Demander une dispense (études, santé, famille)',note:'Chance moyenne',pOk:({p})=>clamp(.3+(L.schoolLevel(p)>=4?.2:0)+(p.health<60?.25:0),.15,.7),okText:'Votre dossier est accepté : une dispense ou un report.',koText:'Votre dossier est refusé. Vous êtes appelé·e.',ok:{stress:-2,skills:{academic:2}},ko:{stress:8,status:{label:'Service militaire',years:1}}},
  civil:{label:'Demander un service civil',note:'Une alternative pour l’intérêt général',pOk:({c})=>clamp(.35+.3*lg(c.income,1500,40000),.15,.7),okText:'Votre demande est acceptée : un service civil auprès d’une association ou d’un hôpital.',koText:'Cette option n’existe pas ou n’est pas ouverte ici. Vous êtes appelé·e.',ok:{impact:4,network:3,status:{label:'Service civil',years:1}},ko:{stress:8,status:{label:'Service militaire',years:1}}},
  evade:{label:'Partir avant la date',note:'Illégal · risques sérieux',pOk:({tier})=>clamp(.3+.2*tier,.1,.55),okText:'Vous réussissez à quitter le pays. Vous êtes en sécurité, mais loin de tout.',koText:'Vous êtes retrouvé·e ou bloqué·e à la frontière. Les conséquences sont lourdes.',ok:{stress:14,cash:-300,parents:-10,happy:-4,fate:{flee:true}},ko:{stress:18,reputation:-8,cash:-300,status:{label:'Sanction',years:2}}}}}),
S('wage-theft',{min:18,max:60,rate:.1,when:({p})=>!!p.career&&p.career.rank<=1&&p.career.sector!=='politics',
 title:'Votre salaire n’est pas payé',text:()=>`Deux mois de retard, puis trois. Votre employeur promet « la semaine prochaine ». Vous avez des factures. Plusieurs d’autres sont dans la même situation.`,
 stances:{
  confront:{label:'Réclamer seul·e',note:'Risque de renvoi',pOk:({c})=>clamp(.35+.25*lg(c.income,1500,40000),.15,.7),okText:'L’employeur paie, de mauvaise grâce.',koText:'Il vous renvoie. Vous n’êtes pas payé·e non plus.',ok:{cash:400,stress:6,reputation:2},ko:{stress:14,fate:{leaveJob:true},cash:-100}},
  organize:{label:'Organiser les collègues',note:'Réseau +6 · risques plus grands, gain plus grand',pOk:({c})=>clamp(.4+.3*lg(c.income,1500,40000),.2,.8),okText:'Ensemble, vous obtenez le paiement et de meilleures conditions.',koText:'La direction réprime : plusieurs personnes sont renvoyées, vous compris·e.',ok:{network:8,reputation:5,cash:500,stress:6},ko:{stress:16,network:3,fate:{leaveJob:true}}},
  quit:{label:'Partir et chercher mieux',note:'Stress +6 · perte du salaire dû',pOk:()=>.9,okText:'Vous partez. Vous retrouvez rapidement du travail ailleurs.',koText:'Votre recherche est longue.',ok:{stress:6,fate:{leaveJob:true}},ko:{stress:12,fate:{leaveJob:true}}},
  endure:{label:'Tenir, en espérant',note:'Stress +10',pOk:()=>.5,okText:'L’employeur finit par payer une partie.',koText:'Rien ne vient. Vous perdez des mois.',ok:{stress:10,cash:250},ko:{stress:16,cash:-150}}}}),
S('discrimination',{min:20,max:55,rate:.07,when:({p})=>!p.career||p.career.rank<=2,
 title:'Un recrutement qui s’est mal passé',text:()=>`Vous avez toutes les qualités demandées, et pourtant on vous écarte. Plus tard, une personne vous glisse la vraie raison : votre nom, votre origine, votre âge, votre sexe ou votre quartier. Rien n’est écrit noir sur blanc.`,
 stances:{
  legal:{label:'Contester en justice',note:'Long, coûteux, incertain',pOk:({c})=>clamp(.15+.45*lg(c.income,1500,40000),.1,.65),okText:'Vous gagnez, après de longs mois. Une indemnité et un précédent.',koText:'La procédure n’aboutit pas. Vous avez perdu du temps et de l’argent.',ok:{cash:600,reputation:4,impact:3,stress:8},ko:{cash:-300,stress:14}},
  document:{label:'Documenter et alerter (associations, presse)',note:'Réputation +4 · risques de représailles',pOk:()=>.5,okText:'Votre témoignage est entendu. D’autres témoignent à leur tour.',koText:'Votre alerte passe presque inaperçue.',ok:{reputation:5,impact:4,network:4,stress:6},ko:{stress:8}},
  adapt:{label:'Adapter mes candidatures et continuer',note:'Stress −2 · compromis',pOk:()=>.65,okText:'Vous modifiez votre approche, et décrochez un entretien.',koText:'Rien n’y fait cette fois.',ok:{network:3,stress:-2},ko:{stress:8}},
  move:{label:'Chercher ailleurs (autre ville, autre secteur)',note:'Énergie −4 · nouveau départ',pOk:()=>.6,okText:'Un nouveau cadre, de nouvelles portes.',koText:'Le changement est plus dur que prévu.',ok:{energy:-4,network:3,happy:3},ko:{energy:-8,stress:8}}}}),
S('corruption',{min:20,max:65,rate:.09,when:({c,poor})=>poor>.4,
 title:'On vous demande un « petit geste »',text:()=>`Un papier bloqué, un permis qui n’avance pas, un contrôle. Quelqu’un fait comprendre qu’une enveloppe accélérerait les choses. Dans votre entourage, tout le monde le fait. Personne ne veut en parler.`,
 stances:{
  pay:{label:'Payer',note:'Argent −3 % · le problème disparaît, le système aussi',pOk:()=>.95,okText:'Vous payez. Tout se débloque aussitôt.',koText:'Même après paiement, rien ne bouge.',ok:{cash:-150,stress:3,reputation:-1},ko:{cash:-150,stress:10}},
  refuse:{label:'Refuser',note:'Votre dossier peut traîner',pOk:()=>.35,okText:'Votre dossier finit par passer, sans enveloppe. Vous êtes soulagé·e et fier·e.',koText:'Votre dossier est bloqué pendant des mois.',ok:{reputation:4,happy:4,stress:3},ko:{stress:12,happy:-4,cash:-100}},
  report:{label:'Signaler',note:'Risqué · peut aider d’autres',pOk:({c})=>clamp(.15+.35*lg(c.income,1500,40000),.1,.5),okText:'Votre signalement aboutit. Le fonctionnaire est écarté.',koText:'Votre signalement se retourne contre vous : pressions, menaces.',ok:{reputation:8,impact:5,stress:8},ko:{stress:18,reputation:-3,cash:-200}},
  middle:{label:'Passer par un intermédiaire',note:'Coût plus bas · zone grise',pOk:()=>.75,okText:'L’intermédiaire règle ça pour un prix moindre.',koText:'L’intermédiaire disparaît avec l’argent.',ok:{cash:-100,network:2},ko:{cash:-250,stress:8}}}}),
S('eviction',{min:20,max:70,rate:.07,when:({s,p})=>(p.home||0)===0&&p.cash<L.reference(s,p)*.12,
 title:'Un avis d’expulsion',text:()=>`Votre propriétaire veut récupérer le logement, ou augmenter le loyer au-delà de vos moyens. Vous avez quelques semaines.`,
 stances:{
  contest:{label:'Contester',note:'Peut gagner du temps',pOk:({c})=>clamp(.25+.35*lg(c.income,1500,40000),.1,.6),okText:'Vous obtenez un délai, voire le maintien dans les lieux.',koText:'La décision est confirmée.',ok:{stress:6,reputation:1},ko:{stress:14,cash:-100}},
  negotiate:{label:'Négocier un arrangement',note:'Chance moyenne',pOk:()=>.5,okText:'Un échéancier est trouvé.',koText:'Aucun accord.',ok:{cash:-150,stress:4},ko:{stress:12}},
  move:{label:'Déménager',note:'Argent −8 % · nouveau départ',pOk:()=>.85,okText:'Vous trouvez un nouveau logement, plus modeste.',koText:'Plusieurs semaines chez des proches avant de retrouver un toit.',ok:{cash:-200,stress:6,energy:-4},ko:{stress:14,energy:-6,friendbond:4}},
  help:{label:'Demander l’aide d’une association ou de proches',note:'Réseau +3',pOk:()=>.6,okText:'On vous aide à trouver une solution.',koText:'Les aides sont saturées.',ok:{network:3,friendbond:4,stress:4},ko:{stress:12}}}}),
S('caregiver',{min:30,max:60,rate:.08,when:({p})=>p.age>=30,
 title:'Un parent a besoin de vous au quotidien',text:()=>`Un de vos parents vieillit et ne peut plus vivre sans aide. Dans la famille, tout le monde pense que quelqu’un d’autre devrait s’en occuper. Et ce quelqu’un, c’est souvent la personne qui répond au téléphone.`,
 stances:{
  take:{label:'M’en occuper moi-même',note:'Liens +14 · énergie −12 · carrière freinée',pOk:()=>1,okText:'Vous prenez en charge. Cela vous épuise, et vous rapproche.',ok:{parents:14,energy:-12,stress:10,happy:-2,status:{label:'Proche aidant·e',years:4}}},
  share:{label:'Partager entre frères et sœurs',note:'Chance dépend de la famille',pOk:({bond})=>clamp(.35+.4*bond,.2,.8),okText:'La famille s’organise. Chacun·e prend sa part.',koText:'Les autres se désengagent. Vous restez seul·e à la manœuvre.',ok:{parents:6,friendbond:3,stress:4},ko:{parents:-8,stress:12,energy:-8}},
  pay:{label:'Financer une aide professionnelle',note:'Argent −10 % du revenu de référence/an',pOk:()=>.9,okText:'Une aide à domicile vient régulièrement. Vous gardez du temps pour vous.',koText:'Le service n’est pas à la hauteur. Vous devez quand même intervenir.',ok:{cash:-400,stress:-2,parents:4},ko:{cash:-400,stress:10}},
  refuse:{label:'Dire que je ne peux pas',note:'Culpabilité · liens −10',pOk:({bond})=>clamp(.3+.3*bond,.2,.7),okText:'La famille comprend, avec le temps.',koText:'La famille ne vous le pardonne pas facilement.',ok:{parents:-4,stress:4},ko:{parents:-20,stress:10,happy:-6}}}}),
S('inheritance-dispute',{min:30,max:70,rate:.06,when:({p})=>(p.parentsLost||0)>=1&&p.age>=30&&(p.wealthTier??.5)>.3,cap:1,
 title:'Un héritage disputé',text:()=>`Après un deuil, la répartition des biens ravive d’anciennes rancunes. Des frères, des sœurs, des cousins ont leur version de ce qui a été promis.`,
 stances:{
  contest:{label:'Défendre ma part',note:'Procédure · tension familiale',pOk:({c})=>clamp(.35+.3*lg(c.income,1500,40000),.2,.75),okText:'Vous obtenez gain de cause, au prix d’une famille meurtrie.',koText:'Le tribunal vous donne tort.',ok:{cash:700,parents:-10,stress:10},ko:{cash:-300,parents:-14,stress:12}},
  agree:{label:'Accepter un partage équitable',note:'Liens +6',pOk:()=>.8,okText:'Un compromis est trouvé. La famille se retrouve.',koText:'Même un accord à l’amiable laisse des regrets.',ok:{cash:300,parents:6,friendbond:2},ko:{cash:150,stress:6}},
  mediate:{label:'Proposer une médiation',note:'Gestion +3 · réputation +2',pOk:({bond})=>clamp(.4+.3*bond,.2,.8),okText:'La médiation apaise les tensions.',koText:'La médiation échoue.',ok:{cash:300,parents:6,skills:{social:3,management:3}},ko:{stress:8,parents:-6}}}}),
S('abroad-offer',{min:18,max:30,rate:.07,when:({p,c})=>L.schoolLevel(p)>=3&&p.skills.academic>=45&&c.income<9000,
 title:'Partir étudier loin ?',text:()=>`Une bourse, un programme d’échange, une école à l’étranger : vous avez les résultats pour y prétendre. Cela voudrait dire quitter votre famille, qui a ses propres attentes.`,
 stances:{
  go:{label:'Partir',note:'Nouvel horizon · famille tiraillée',pOk:({bond})=>clamp(.4+.4*bond,.25,.85),okText:'Votre famille vous laisse partir, fière et inquiète.',koText:'Votre famille s’y oppose fermement. Vous partez quand même, ou pas.',ok:{parents:2,skills:{academic:5},network:5,happy:6,fate:{migrate:'FR'}},ko:{parents:-20,stress:12,skills:{academic:3}}},
  stay:{label:'Rester',note:'Liens +8 · portes qui se ferment',pOk:()=>1,okText:'Vous restez. Votre famille est soulagée.',ok:{parents:8,happy:-4}},
  ask:{label:'Chercher la bénédiction avant de décider',note:'Temps + dialogue',pOk:({bond})=>clamp(.45+.35*bond,.25,.85),okText:'Après plusieurs discussions, votre famille vous encourage à partir.',koText:'La discussion tourne court.',ok:{parents:6,fate:{migrate:'FR'},network:4},ko:{stress:8,parents:-6}}}}),
S('pressure-children',{min:24,max:42,rate:.08,when:({p})=>p.children.length===0&&p.age>=24,
 title:'« Alors, c’est pour quand ? »',text:()=>`Chaque repas de famille revient sur la même question : mariage, enfants. Les attentes ne sont pas toujours dites, mais elles sont partout.`,
 stances:{
  discuss:{label:'En parler franchement',note:'Liens +2 · tension possible',pOk:({bond})=>clamp(.4+.35*bond,.2,.85),okText:'On vous écoute. La pression retombe.',koText:'On ne vous entend pas. La pression continue.',ok:{stress:-4,parents:3},ko:{stress:8,parents:-6}},
  deflect:{label:'Changer de sujet à chaque fois',note:'Stress +4',pOk:()=>.4,okText:'À force, on vous laisse tranquille.',koText:'Cela s’aggrave.',ok:{stress:2},ko:{stress:8,parents:-4}},
  comply:{label:'Céder à la pression',note:'Liens +6 · épanouissement −4',pOk:()=>1,okText:'Vous cédez, par loyauté.',ok:{parents:6,happy:-4,stress:4}}}}),
S('protest',{min:18,max:45,rate:.06,when:({c,poor})=>poor>.3||CONFLICT_LIKE.has(c.code),
 title:'Une manifestation dans votre ville',text:()=>`Une foule se rassemble autour d’une cause qui vous touche : le prix du pain, des salaires, des libertés. Vous pouvez y aller, soutenir à distance, ou vous tenir à l’écart. Les conséquences dépendent des autorités, des voisins, du jour.`,
 stances:{
  join:{label:'Rejoindre le cortège',note:'Impact +4 · risques',pOk:({c})=>clamp(.55+.3*lg(c.income,1500,40000),.4,.85),okText:'Le rassemblement se passe dans le calme. Vous êtes fier·e d’y avoir été.',koText:'Des tensions éclatent. Vous êtes bousculé·e, parfois interpellé·e.',ok:{impact:4,network:5,reputation:3,stress:4},ko:{health:-6,stress:14,status:{label:'Interpellé·e',years:1},reputation:-1}},
  support:{label:'Soutenir sans y aller',note:'Réseau +2 · prudence',pOk:()=>.95,okText:'Vous aidez autrement : eau, messages, hébergement.',koText:'Cela vous cause des tensions avec votre entourage.',ok:{network:2,impact:2},ko:{stress:6}},
  avoid:{label:'Rester à l’écart',note:'Sérénité',pOk:()=>1,okText:'Vous évitez le quartier, et regardez de loin.',ok:{stress:-2}}}})
];
const CONFLICT_LIKE=new Set('IR BY RU MM SY EG SD VE NI CU CN KP TM UZ TJ ET'.split(' '));
const byId=Object.fromEntries(struggles.map(x=>[x.id,x]));
function struggleEvent(s,p,st){const ctx=ctxOf(s,p);const text=st.text(ctx),stances=Object.entries(st.stances);
  return{id:'struggle-'+st.id,title:st.title,text,category:'Une lutte',required:true,announce:false,
   choices:stances.map(([k,v])=>ch(v.label,v.note,{struggle:{id:st.id,stance:k}}))}}
function planStruggles(s){const p=s.person;if(!p.alive||s.pending||p.age<11||L.coreDue?.(p))return;s.queue??=[];if(s.queue.some(e=>(e.id||'').startsWith('struggle')||(e.id||'').startsWith('teen-')&&false))return;p.struggles??={done:{},last:-99};const age=p.age+1;if(s.year-p.struggles.last<5)return;
  const ctx={...ctxOf(s,p),p:{...p,age}};for(const st of struggles){if((p.struggles.done[st.id]||0)>=st.cap)continue;if(age<st.min||age>st.max)continue;let ok=false;try{ok=!!st.when(ctx)}catch(e){ok=false}if(!ok)continue;
    if(hash(s.seed,p.id,'struggle',st.id,age)<st.rate*(st.id==='conscription'?1:.7)*(st.scale?st.scale(ctx):1)){s.queue.push(struggleEvent(s,p,st));return}}}
function planIdentity(s){const p=s.person;if(!p.alive||s.pending||p.age<11||L.coreDue?.(p))return;s.queue??=[];const age=p.age+1;p.identity??={orientation:'unsure',romance:null,out:{}};if(s.queue.some(e=>/^(teen-romance|teen-attraction|teen-confide|ad-reflect)/.test(e.id||'')))return;
  if(age>=12&&age<=16&&!p.identity.romance&&!p.events.includes('teen-romance')&&hash(s.seed,p.id,'idromance',age)<.4){s.queue.push(romanceIntentEvent(s,p));return}
  if(age>=13&&age<=18&&p.identity.romance&&p.identity.romance!=='none'&&!p.events.includes('teen-attraction')&&hash(s.seed,p.id,'idattract',age)<.4){s.queue.push(attractionEvent(s,p));return}
  if(age>=14&&age<=22&&['gay','bi'].includes(p.identity.orientation)&&p.events.includes('teen-attraction')&&!p.events.includes('teen-confide')&&hash(s.seed,p.id,'idconf',age)<.45){s.queue.push(confideEvent(s,p));return}
  if(age>=24&&age<=40&&!p.events.includes('ad-reflect')&&hash(s.seed,p.id,'idrefl',age)<.025)s.queue.push(adultReflectEvent(s,p))}
function processStruggle(s,x,e){const f=x?.fx;const p=s.person;
  if(f?.identity)identityFx(s,p,f.identity);
  if(f?.struggle){const st=byId[f.struggle.id],v=st.stances[f.struggle.stance],ctx=ctxOf(s,p),prob=clamp(v.pOk(ctx),0,1),u=hash(s.seed,p.id,'struggle-result',st.id,s.year),ok=u<prob;
    p.struggles??={done:{},last:-99};p.struggles.done[st.id]=(p.struggles.done[st.id]||0)+1;p.struggles.last=s.year;
    const out=ok?v.ok:(v.ko||v.ok),stats=prob>=1?[]:[{label:v.pLabel||(['accept','take','serve','stay','comply','avoid','agree'].includes(f.struggle.stance)?'':'Chances que cela se passe bien pour vous'),pct:Math.round(prob*100),strong:true}].filter(z=>z.label);
    const text=ok?v.okText:v.koText;L.log(s,`${st.title} — ${v.label}. ${text}`,true,'struggle');
    s.queue??=[];s.queue.unshift({id:'struggle-out-'+st.id,title:ok?'Ce qui s’est passé':'Ce qui s’est passé',text,category:'Une lutte',required:true,stats,statsKicker:'Ce que disaient les chiffres du modèle',tone:ok?'good':'bad',
      choices:[ch('Continuer',[out.parents?(out.parents>0?'Liens familiaux +':'Liens familiaux ')+out.parents:'',out.stress?(out.stress>0?'Stress +':'Stress ')+out.stress:'',out.happy?(out.happy>0?'Épanouissement +':'Épanouissement ')+out.happy:''].filter(Boolean).join(' · ')||'La vie continue',{...out,strugglePost:{id:st.id,flag:out.struggleFlag}})]})}
  if(f?.strugglePost){const o=f;if(o.wealthDrop)p.wealthTier=clamp((p.wealthTier??.5)-o.wealthDrop,0,1);if(o.quitSchool){p.school??={level:L.schoolLevel(p),history:[]};p.school.stopped=true;p.skills.academic=clamp(p.skills.academic-2)}
    if(o.partner){const mate=L.nameFor?L.nameFor(s,{country:p.country,origin:p.origin,sex:p.sex==='F'?'M':'F',role:'partner',key:'forced|'+p.id}):null;p.partner={id:++s.serial,name:mate?mate.given:'Alex',surname:mate?.surname,sex:mate?.sex,age:p.age+Math.floor(hash(s.seed,p.id,'fmage')*6)-1,bond:36,compatibility:30,autonomy:40,wantsChildren:true,income:L.reference(s,p)*.4,health:85,alive:true,memories:[],forced:true};L.log(s,`${p.partner.name} devient votre conjoint·e, selon l’arrangement de vos familles.`,true,'family')}
    if(o.status){p.statuses??=[];p.statuses.push({id:'st-'+s.year,label:o.status.label,years:o.status.years})}
    if(o.struggleFlag)p.struggleFlags=[...(p.struggleFlags||[]),o.struggleFlag];p.struggles.last=s.year}}
L.year=function(s,withEvent=true){if(withEvent&&s.person?.alive&&!s.pending){planIdentity(s);planStruggles(s)}return base.year(s,withEvent)};
L.choose=function(s,i){const e=s.pending,x=e?.choices?.[i];const r=base.choose(s,i);if(r){processStruggle(s,x,e);if(!s.pending&&s.queue?.length&&s.person.alive)s.pending=s.queue.shift()}return r};
L.struggles=struggles;L.orientationLabels=ID.orientation;L.familyAcceptance=famAccept;
})(typeof window!=='undefined'?window:globalThis);
