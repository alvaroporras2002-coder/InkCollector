const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function element(){const classes=new Set();return {hidden:false,dataset:{},style:{setProperty(k,v){this[k]=v;}},handlers:{},classList:{toggle(k,b){if(b)classes.add(k);else classes.delete(k);},add(k){classes.add(k);},remove(k){classes.delete(k);}},addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},focus(){this.focused=true;},get offsetWidth(){return 10;},trigger(k,e={}){for(const f of this.handlers[k]||[])f(e);}};}
function fixture(reduced=false){
 const memory=new Map(),body=element(),progress=element(),dialog=element(),nav=element();body.dataset.motion='on';nav.children=Array.from({length:5},()=>({...element(),tagName:'BUTTON'}));dialog.scrollTo=()=>{};
 const labels=Array.from({length:4},element);
 const document={body,querySelector(s){return ({'.bottom-nav':nav,'#app-dialog':dialog,'.wizard-progress span':progress})[s]||null;},querySelectorAll(s){return s==='.wizard-steps li'?labels:[];},addEventListener(){},createElement(){return {...element(),append(){},remove(){}};}};
 const sandbox={document,window:{matchMedia:()=>({matches:reduced})},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync(require.resolve('../motion.js'),'utf8'),sandbox);
 return {api:sandbox.window.InkMotion,memory,body,labels,progress,nav};
}
function formFixture(){
 const form=element();form.dataset.artist='luna';const field=(name,required=false,type='text')=>({...element(),name,type,value:'',required,checkValidity(){return !this.required||Boolean(this.value);},reportValidity(){this.reported=true;return this.checkValidity();}});
 const fields={idea:field('idea',true),area:field('area',true),size:field('size',true),timing:field('timing',true),reference:field('reference',false,'file'),name:field('name',true),contact:field('contact',true),consent:field('consent',true,'checkbox')};
 const groups=[[fields.idea],[fields.area,fields.size,fields.timing],[fields.reference],[fields.name,fields.contact,fields.consent]];
 const steps=groups.map(g=>({...element(),querySelectorAll:()=>g,querySelector:()=>element()}));
 const prev=element(),next=element(),submit=element(),review={replaceChildren(){},append(){}};
 form.querySelectorAll=s=>s==='.quote-step'?steps:[];
 form.querySelector=s=>({'[data-wizard=next]':next,'[data-wizard=prev]':prev,'[type=submit]':submit,'#quote-review':review})[s];
 form.elements=Object.values(fields);form.elements.namedItem=name=>fields[name]||{value:'Por definir'};
 return {form,fields,steps,prev,next,submit};
}
test('wizard validates each step, saves text drafts and keeps submit on the final step',()=>{
 const env=fixture(),f=formFixture();env.api.enhanceWizard(f.form);
 assert.equal(f.form.dataset.wizardStep,'0');assert.equal(f.submit.hidden,true);
 f.next.trigger('click');assert.equal(f.form.dataset.wizardStep,'0');assert.equal(f.fields.idea.reported,true);
 f.fields.idea.value='Una flor para mi primer tatuaje';f.next.trigger('click');assert.equal(f.form.dataset.wizardStep,'1');
 f.fields.area.value='Antebrazo';f.fields.size.value='5–10 cm';f.fields.timing.value='Este mes';f.next.trigger('click');assert.equal(f.form.dataset.wizardStep,'2');
 f.next.trigger('click');assert.equal(f.form.dataset.wizardStep,'3');assert.equal(f.submit.hidden,false);assert.equal(f.next.hidden,true);assert.equal(env.progress.style.width,'100%');
 let stopped=false;f.form.trigger('submit',{preventDefault(){stopped=true;},stopImmediatePropagation(){}});assert.equal(stopped,true);assert.equal(f.fields.name.reported,true);
 f.prev.trigger('click');assert.equal(f.form.dataset.wizardStep,'2');assert.equal(f.submit.hidden,true);
 const saved=JSON.parse(env.memory.get('inkcollector.draft.luna'));assert.equal(saved.idea,f.fields.idea.value);assert(!('reference'in saved));assert(!('consent'in saved));
});
test('navigation moves the indicator and reduced-motion preference always wins',()=>{
 const env=fixture();env.api.selectNav(3);assert.equal(env.nav.style['--nav-index'],'3');assert.equal(env.nav.children[3]['aria-current'],'page');assert.equal(env.nav.children[0]['aria-current'],undefined);
 assert.equal(env.api.allowed(),true);env.api.toggle();assert.equal(env.api.allowed(),false);assert.equal(env.memory.get('inkcollector.motion'),'off');env.api.toggle();assert.equal(env.api.allowed(),true);
 const reduced=fixture(true);assert.equal(reduced.api.allowed(),false);
});
