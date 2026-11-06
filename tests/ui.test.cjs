const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../core.js');
// Small DOM contract harness: exercises app handlers without claiming browser/layout coverage.
function fixture(saved){
 const listeners={},elements=new Map(),memory=new Map();if(saved)memory.set('inkcollector.demo.v1',JSON.stringify(saved));
 function element(){const classes=new Set();return {dataset:{},style:{},value:'',innerHTML:'',hidden:false,options:[],classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},toggle(k,v){const on=v===undefined?!classes.has(k):v;on?classes.add(k):classes.delete(k);return on;}},setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]},addEventListener(){},add(o){this.options.push(o)},focus(){this.focused=true},scrollIntoView(){},querySelector(){return null},getBoundingClientRect(){return {left:0,top:0,width:400,height:400}}};}
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');for(const m of html.matchAll(/\bid="([^"]+)"/g))elements.set(m[1],element());
 for(const id of ['province-filter','availability-filter'])elements.get(id).value='all';
 const dialog=elements.get('app-dialog');dialog.open=false;dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
 const body=element(),nav=Array.from({length:5},()=>element());
 const document={body,querySelector(s){if(s.startsWith('#'))return elements.get(s.slice(1))||null;return null;},querySelectorAll(s){if(s==='[id^="view-"]')return [...elements.entries()].filter(([k])=>k.startsWith('view-')).map(([id,e])=>({...e,id}));if(s==='.bottom-nav [data-mobile-tab]')return nav;return [];},addEventListener(k,fn){(listeners[k]??=[]).push(fn)}};
 const window={InkCore:C,scrollTo(){},InkMotion:{selectNav(i){window.selectedNav=i},cancelClose(){},favorite(){},expandPhoto(){},enhanceWizard(){},toggle(){},close(fn){fn()}}};
 const sandbox={window,document,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},Intl,Date,console,Option:function(label,value){this.value=value},setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),sandbox);
 function click(type,dataset){const b=element();b.dataset=dataset;b.closest=()=>null;const selector=type==='tab'?'[data-mobile-tab]':type==='view'?'[data-view]':'[data-action]';const target={closest:s=>s===selector?b:null};for(const fn of listeners.click||[])fn({target,preventDefault(){}});return b;}
 return {window,body,elements,memory,click,dialog};
}
test('collection, search and home remain separate routes and retain existing favorites',()=>{
 const state=C.initialState();state.favorites=['luna'];const f=fixture(state);
 assert.match(f.elements.get('artist-grid').innerHTML,/Luna Solano/);
 f.click('tab',{mobileTab:'saved'});assert.equal(f.body.dataset.screen,'saved');assert.match(f.elements.get('artist-grid').innerHTML,/Luna Solano/);assert.doesNotMatch(f.elements.get('artist-grid').innerHTML,/Mateo Vargas/);
 f.click('action',{action:'focus-search'});assert.equal(f.body.dataset.screen,'search');assert.equal(f.window.selectedNav,1);assert.match(f.elements.get('artist-grid').innerHTML,/Mateo Vargas/);
 f.click('tab',{mobileTab:'explore'});assert.equal(f.body.dataset.screen,'explore');assert.deepEqual(JSON.parse(f.memory.get('inkcollector.demo.v1')).favorites,['luna']);
});
test('profile, quote entry and studio render after the redesign without losing local requests',()=>{
 const state=C.initialState();const lead=C.createLead(state,'luna',{name:'Prueba demo',contact:'demo@example.test',idea:'Una flor botánica en la muñeca con trazos delicados.',area:'Muñeca',size:'5–10 cm',timing:'Sin prisa',consent:true});const f=fixture(state);
 f.click('action',{action:'profile',id:'luna'});assert.equal(f.dialog.open,true);assert.match(f.elements.get('dialog-content').innerHTML,/Desde el estudio/);assert.match(f.elements.get('dialog-content').innerHTML,/Cotiza tu idea/);
 f.click('action',{action:'quote',id:'luna'});assert.match(f.elements.get('dialog-content').innerHTML,/id="quote-form"/);assert.match(f.elements.get('dialog-content').innerHTML,/data-artist="luna"/);assert.match(f.elements.get('dialog-content').innerHTML,/quote-artist/);
 f.click('view',{view:'requests'});assert.match(f.elements.get('view-requests').innerHTML,new RegExp(lead.id));
 f.click('view',{view:'artist'});assert.match(f.elements.get('view-artist').innerHTML,/Mi estudio|Tu espacio/);assert.equal(f.window.InkDemo.getState().leads.length,state.leads.length);
 f.click('action',{action:'app-menu'});const menu=f.elements.get('dialog-content').innerHTML;assert.match(menu,/InkApp/);assert.doesNotMatch(menu,/INK COLLECTOR/);assert.match(menu,/menu-grid/);
});
