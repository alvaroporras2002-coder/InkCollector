/* Small, dependency-free motion layer. No customer data leaves the device. */
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer=null,photoOrigin=null,photoSrc=null;
  try{document.body.dataset.motion=localStorage.getItem('inkcollector.motion')||'on';}catch{}
  const allowed=()=>!media.matches&&document.body.dataset.motion!=='off';
  const nav=$('.bottom-nav'),dialog=$('#app-dialog');
  function selectNav(index){
    if(!nav)return;
    nav.style.setProperty('--nav-index',String(index));
    Array.from(nav.children).filter(e=>e.tagName==='BUTTON').forEach((b,i)=>{b.classList.toggle('nav-current',i===index);b.classList.toggle('is-active',i===index);if(i===index)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');if(i===index){b.classList.remove('nav-tapped');void b.offsetWidth;b.classList.add('nav-tapped');}});
  }
  function toggle(){const next=document.body.dataset.motion==='off'?'on':'off';document.body.dataset.motion=next;try{localStorage.setItem('inkcollector.motion',next);}catch{}}
  function cancelClose(){clearTimeout(closeTimer);dialog.classList.remove('is-leaving');}
  function favorite(id){
    if(!allowed())return;
    $$(`button.favorite-button[data-id="${id}"]`).forEach(b=>{b.classList.remove('heart-pop');void b.offsetWidth;b.classList.add('heart-pop');const burst=document.createElement('span');burst.className='favorite-sparkles';burst.setAttribute('aria-hidden','true');for(let i=0;i<5;i++){const d=document.createElement('i');d.style.setProperty('--angle',`${i*72}deg`);burst.append(d);}b.append(burst);setTimeout(()=>{burst.remove();b.classList.remove('heart-pop');},650);});
  }
  function expandPhoto(source,rect){
    const target=$('.profile-cover img',dialog);
    photoOrigin=rect||null;photoSrc=source?.currentSrc||source?.src||null;
    if(!target||!source||!rect||rect.width<1||!allowed())return;
    const destination=target.getBoundingClientRect(),base=dialog.getBoundingClientRect();
    const clone=source.cloneNode(false);clone.removeAttribute('id');clone.removeAttribute('loading');clone.className='hero-transition';clone.alt='';clone.setAttribute('aria-hidden','true');dialog.append(clone);target.style.opacity='0';
    const anim=clone.animate([{left:`${rect.left-base.left}px`,top:`${rect.top-base.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:'48px 15px 0 0'},{left:`${destination.left-base.left}px`,top:`${destination.top-base.top}px`,width:`${destination.width}px`,height:`${destination.height}px`,borderRadius:'0px'}],{duration:390,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    anim.finished.catch(()=>{}).finally(()=>{target.style.opacity='';clone.remove();});
  }
  function close(callback){
    if(!dialog.open)return;
    if(!allowed()){callback();return;}
    cancelClose();dialog.classList.add('is-leaving');
    closeTimer=setTimeout(()=>{dialog.classList.remove('is-leaving');callback();},190);
  }
  function enhanceWizard(form){
    if(!form)return;
    const steps=$$('.quote-step',form),labels=$$('.wizard-steps li'),next=$('[data-wizard=next]',form),prev=$('[data-wizard=prev]',form),submit=$('[type=submit]',form);
    let current=0;const key='inkcollector.draft.'+form.dataset.artist;
    try{const draft=JSON.parse(localStorage.getItem(key)||'null');if(draft&&typeof draft==='object')for(const [name,value]of Object.entries(draft)){const field=form.elements.namedItem(name);if(field&&field.type!=='file'&&field.type!=='checkbox'&&typeof value==='string')field.value=value;}}catch{}
    function save(){const data={};for(const field of form.elements)if(field.name&&!['file','checkbox'].includes(field.type))data[field.name]=field.value;try{localStorage.setItem(key,JSON.stringify(data));}catch{}}
    function review(){const panel=$('#quote-review',form);panel.replaceChildren();for(const [label,name]of [['Tu idea','idea'],['Zona','area'],['Tamaño','size'],['Presupuesto','budget'],['Cuándo','timing']]){const row=document.createElement('div'),title=document.createElement('span'),value=document.createElement('p');title.textContent=label;value.textContent=form.elements.namedItem(name).value;row.append(title,value);panel.append(row);}}
    function show(index){current=index;form.dataset.wizardStep=String(index);steps.forEach((s,i)=>s.hidden=i!==index);labels.forEach((l,i)=>{l.classList.toggle('complete',i<index);l.classList.toggle('current',i===index);if(i===index)l.setAttribute('aria-current','step');else l.removeAttribute('aria-current');});$('.wizard-progress span').style.width=`${(index+1)*25}%`;prev.hidden=index===0;next.hidden=index===3;submit.hidden=index!==3;if(index===3)review();if(index>0){dialog.scrollTo({top:0,behavior:allowed()?'smooth':'instant'});const heading=$('h3',steps[index]);heading.tabIndex=-1;heading.focus({preventScroll:true});}}
    function goNext(){for(const el of $$('input,select,textarea',steps[current]))if(!el.checkValidity()){el.reportValidity();return;}save();show(Math.min(3,current+1));}
    next.addEventListener('click',goNext);prev.addEventListener('click',()=>{save();show(Math.max(0,current-1));});form.addEventListener('input',save);form.addEventListener('change',save);
    form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'&&current<3){e.preventDefault();goNext();}});
    form.addEventListener('submit',e=>{if(current!==3){e.preventDefault();e.stopImmediatePropagation();goNext();return;}for(let i=0;i<steps.length;i++)for(const el of $$('input,select,textarea',steps[i]))if(!el.checkValidity()){e.preventDefault();e.stopImmediatePropagation();show(i);el.reportValidity();return;}});
    show(0);
  }
  document.addEventListener('pointerdown',e=>{
    if(!allowed())return;
    const b=e.target.closest('.btn,.bottom-nav>button,.style-filters button,.menu-row');if(!b||b.disabled)return;
    const rect=b.getBoundingClientRect(),wave=document.createElement('span');wave.className='tap-wave';wave.setAttribute('aria-hidden','true');const size=Math.max(rect.width,rect.height)*2;wave.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;b.prepend(wave);setTimeout(()=>wave.remove(),550);
  });
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('motion-paused',document.hidden));
  window.InkMotion={allowed,selectNav,toggle,cancelClose,favorite,expandPhoto,close,enhanceWizard};
})();
