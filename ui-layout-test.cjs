const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');const nodes={};
function node(){return{innerHTML:'',textContent:'',value:'',addEventListener:()=>{},setAttribute:()=>{},style:{},classList:{add:()=>{},remove:()=>{},toggle:()=>{}},querySelector:()=>null,insertAdjacentHTML(){},open:false,showModal(){this.open=true},close(){this.open=false}}}
const get=sel=>nodes[sel]||(nodes[sel]=node());
const context={console,Intl,URL,URLSearchParams,Blob,crypto:require('node:crypto').webcrypto,performance,setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},requestAnimationFrame:()=>1,matchMedia:()=>({matches:true}),location:{search:'',href:'https://example.test'},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{}},document:{querySelector:get,getElementById:()=>null,addEventListener:()=>{},hidden:false}};
context.window=context;context.globalThis=context;context.scrollTo=()=>{};vm.createContext(context);
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
for(const f of scripts)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),context,{filename:f});
const app=()=>nodes['#app'].innerHTML;
for(const age of [0,3,8,17,34,70]){vm.runInContext(`state=Life.create('LAYOUT-${age}','FR');state.birthRevealed=true;{let g=0;while(state.person.age<${age}&&g++<300){if(state.pending)Life.choose(state,Math.max(0,state.pending.choices.findIndex(c=>!Life.canChoose(state,c))));else Life.year(state)}}page='life';render()`,context);
  const html=app();assert(html.includes('class="life-grid"'),'grille '+age);assert(html.indexOf('char-rail')<html.indexOf('life-center'),'personnage à gauche avant le centre '+age);assert(!html.includes('NaN'),'NaN '+age);assert(!/La vie continue|Laisser la vie avancer/.test(html),'bloc supprimé '+age);
  if(age>=6)assert(html.includes('focus-strip'),'focus '+age);if(age>=18)assert(html.includes('Capital de lignée'));}
vm.runInContext("nav('standing')",context);assert(app().includes('stand-table')&&!app().includes('NaN')&&app().includes('Votre lignée'));
vm.runInContext("state.person.alive=false;page='life';render()",context);assert(!app().includes('NaN'));
console.log(JSON.stringify({layoutUI:'passed',scripts:scripts.length}));
