(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.InkCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const STATUSES=['new','contacted','quoted','scheduled','completed','closed'];
  const LABELS={new:'Nueva',contacted:'Contactada',quoted:'Cotizada',scheduled:'Cita acordada',completed:'Completada',closed:'Cerrada'};
  const STYLES=['Fine line','Blackwork','Realismo','Neotradicional'];
  const ARTISTS=[
    {id:'luna',name:'Luna Solano',studio:'Línea Clara',province:'San José',city:'Barrio Escalante',style:'Fine line',tags:['Botánica','Minimalismo'],portrait:'assets/portrait-luna.webp',work:'assets/tattoo-fineline.webp',bio:'Diseños botánicos y trazos delicados. En esta demo, Luna acompaña tu primera idea desde la referencia hasta una propuesta personalizada.',soon:true,experience:'Botánica · Trazo fino',status:'approved',demo:true},
    {id:'mateo',name:'Mateo Vargas',studio:'Sombra Atelier',province:'Heredia',city:'Heredia centro',style:'Blackwork',tags:['Geometría','Ornamental'],portrait:'assets/portrait-mateo.webp',work:'assets/tattoo-blackwork.webp',bio:'Composiciones geométricas, contrastes sólidos y piezas que dialogan con el cuerpo. Perfil ficticio para explorar el proceso de cotización.',soon:true,experience:'Geometría · Negro sólido',status:'approved',demo:true},
    {id:'valeria',name:'Valeria Mora',studio:'Forma Estudio',province:'Cartago',city:'Cartago centro',style:'Realismo',tags:['Black & grey','Naturaleza'],portrait:'assets/portrait-valeria.webp',work:'assets/tattoo-realism.webp',bio:'Naturaleza y volumen en blanco y negro. Este portafolio es una muestra generada para ilustrar cómo comparar artistas por estilo.',soon:false,experience:'Naturaleza · Black & grey',status:'approved',demo:true},
    {id:'diego',name:'Diego Araya',studio:'Buen Augurio',province:'Alajuela',city:'Alajuela centro',style:'Neotradicional',tags:['Color','Ilustración'],portrait:'assets/portrait-diego.webp',work:'assets/tattoo-traditional.webp',bio:'Color, líneas con carácter y composiciones ilustrativas. Un perfil de demostración para quienes imaginan un primer tatuaje lleno de personalidad.',soon:true,experience:'Color · Ilustración',status:'approved',demo:true}
  ];
  function dateString(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function initialState(now=new Date()){
    const stamp=now.toISOString();
    return {version:1,nextId:5,favorites:[],registrations:[],availability:{},reviews:[],leads:[
      {id:'IC-DEMO-001',artistId:'luna',name:'Cliente de ejemplo A',contact:'cliente.a@example.test',idea:'Una flor pequeña de trazo fino en el antebrazo. Es mi primer tatuaje.',area:'Antebrazo',size:'5–10 cm',budget:'₡30.000–₡60.000',timing:'Este mes',status:'new',createdAt:stamp,updatedAt:stamp,history:[{status:'new',at:stamp}],notes:'Solicitud ficticia para explorar el panel.',amount:0,seed:true},
      {id:'IC-DEMO-002',artistId:'mateo',name:'Cliente de ejemplo B',contact:'cliente.b@example.test',idea:'Una pieza ornamental con geometría y negro sólido en el brazo.',area:'Brazo',size:'10–15 cm',budget:'₡60.000–₡100.000',timing:'Sin prisa',status:'contacted',createdAt:stamp,updatedAt:stamp,history:[{status:'new',at:stamp},{status:'contacted',at:stamp}],notes:'Conversación simulada para definir tamaño.',amount:0,seed:true},
      {id:'IC-DEMO-003',artistId:'valeria',name:'Cliente de ejemplo C',contact:'cliente.c@example.test',idea:'Un ave en blanco y negro, con detalles naturales en la pantorrilla.',area:'Pierna',size:'15–20 cm',budget:'Más de ₡100.000',timing:'Próximo mes',status:'quoted',createdAt:stamp,updatedAt:stamp,history:[{status:'new',at:stamp},{status:'contacted',at:stamp},{status:'quoted',at:stamp}],notes:'Propuesta de ejemplo; precio ilustrativo, sin cobro.',amount:120000,seed:true},
      {id:'IC-DEMO-004',artistId:'luna',name:'Cliente de ejemplo D',contact:'cliente.d@example.test',idea:'Una pequeña rama delicada en la muñeca con líneas finas.',area:'Muñeca',size:'Menos de 5 cm',budget:'₡30.000–₡60.000',timing:'Este mes',status:'quoted',createdAt:stamp,updatedAt:stamp,history:[{status:'new',at:stamp},{status:'contacted',at:stamp},{status:'quoted',at:stamp}],notes:'Cotización ficticia lista para simular una cita.',amount:45000,seed:true}
    ]};
  }
  function allArtists(state){return ARTISTS.concat(state.registrations.filter(a=>a.status==='approved'));}
  function normalize(raw){if(!raw||raw.version!==1||!Array.isArray(raw.leads)||!Array.isArray(raw.favorites)||!Array.isArray(raw.registrations))throw Error('Datos de demo no compatibles.');return {...raw,nextId:Math.max(Number(raw.nextId)||5,5),availability:raw.availability||{},reviews:Array.isArray(raw.reviews)?raw.reviews:[]};}
  function validateRequest(f){
    if(!f.name||f.name.trim().length<2||f.name.trim().length>80)throw Error('Escribe un nombre de entre 2 y 80 caracteres.');
    const c=(f.contact||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)&&!/^(?:\+?506[\s-]?)?[2-8]\d{3}[\s-]?\d{4}$/.test(c))throw Error('Usa un correo válido o un teléfono de Costa Rica de 8 dígitos.');
    if(!f.idea||f.idea.trim().length<20||f.idea.trim().length>1500)throw Error('Describe tu idea en 20 a 1500 caracteres.');
    if(!f.area||!f.size||!f.timing)throw Error('Completa la zona, el tamaño y cuándo te gustaría hacerlo.');
    if(!f.consent)throw Error('Confirma que usarás datos de prueba y que tienes 18 años o más.');
  }
  function createLead(state,artistId,f,now=new Date()){
    if(!allArtists(state).some(a=>a.id===artistId))throw Error('Este artista aún no está disponible.');
    validateRequest(f);const at=now.toISOString();const id=`IC-${String(now.getFullYear()).slice(-2)}-${String(state.nextId++).padStart(4,'0')}`;
    const lead={id,artistId,name:f.name.trim(),contact:f.contact.trim(),idea:f.idea.trim(),area:f.area,size:f.size,budget:f.budget||'Por definir',timing:f.timing,reference:f.reference||'',status:'new',createdAt:at,updatedAt:at,history:[{status:'new',at}],notes:'',amount:0,seed:false};state.leads.unshift(lead);return lead;
  }
  function moveLead(state,id,status,extra={},now=new Date()){
    const lead=state.leads.find(l=>l.id===id);if(!lead)throw Error('No se encontró la solicitud.');
    const transitions={new:['contacted','closed'],contacted:['quoted','closed'],quoted:['scheduled','closed'],scheduled:['completed','closed'],completed:[],closed:[]};
    if(!transitions[lead.status].includes(status))throw Error('Ese cambio no corresponde al siguiente paso de la solicitud.');
    const at=now.toISOString();
    if(status==='quoted'){
      const amount=Number(extra.amount);if(!Number.isFinite(amount)||amount<=0||amount>10000000)throw Error('Escribe un monto de cotización válido.');lead.amount=Math.round(amount);
    }
    if(status==='scheduled'){
      const slot=extra.appointment;
      if(!slot||!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)||!['10:00','13:00','16:00'].includes(slot.time)||!availableDays(state,lead.artistId,now).includes(slot.date))throw Error('Selecciona una fecha y hora disponibles.');
      if(state.leads.some(l=>l.id!==id&&l.artistId===lead.artistId&&['scheduled','completed'].includes(l.status)&&l.appointment?.date===slot.date&&l.appointment?.time===slot.time))throw Error('Este espacio ya está reservado. Elige otro horario.');
      lead.appointment={date:slot.date,time:slot.time};
    }
    if(extra.notes!==undefined)lead.notes=String(extra.notes).slice(0,1500);
    lead.status=status;lead.updatedAt=at;lead.history.push({status,at});return lead;
  }
  function availableDays(state,artistId,now=new Date()){
    const artist=allArtists(state).find(a=>a.id===artistId);const soon=state.availability[artistId]===undefined?artist?.soon:state.availability[artistId];const first=soon?1:14;
    const dates=[];for(let i=first;i<first+18;i++){const d=new Date(now);d.setDate(d.getDate()+i);if(d.getDay()!==0&&d.getDay()!==1)dates.push(dateString(d));if(dates.length===8)break;}return dates;
  }
  function availableTimes(state,artistId,date){return ['10:00','13:00','16:00'].filter(time=>!state.leads.some(l=>l.artistId===artistId&&['scheduled','completed'].includes(l.status)&&l.appointment?.date===date&&l.appointment?.time===time));}
  function csvCell(v){let s=String(v??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
  function exportCsv(state){const head=['Código','Artista','Cliente','Contacto','Estilo','Estado','Cotización CRC','Fecha de cita','Hora','Estado de cita','Origen','Creada'];const rows=state.leads.map(l=>{const a=allArtists(state).find(a=>a.id===l.artistId);return [l.id,a?.name||l.artistId,l.name,l.contact,a?.style,LABELS[l.status],l.amount||'',l.appointment?.date||'',l.appointment?.time||'',l.appointment?(l.status==='closed'?'Cancelada':l.status==='completed'?'Completada':'Acordada'):'','Ink Collector · Demo',l.createdAt];});return '\uFEFF'+[head,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');}
  function registerArtist(state,f,now=new Date()){
    if(!f.name?.trim()||!f.studio?.trim()||!STYLES.includes(f.style)||!f.province||!/^https:\/\//.test(f.portfolio||'')||!f.consent)throw Error('Completa tu perfil, un enlace HTTPS a tu portafolio y la confirmación de demo.');
    const a={id:'artist-'+now.getTime().toString(36)+'-'+state.registrations.length,name:f.name.trim().slice(0,80),studio:f.studio.trim().slice(0,100),province:f.province,city:f.city?.trim().slice(0,100)||f.province,style:f.style,tags:['Nuevo perfil'],bio:f.bio?.trim().slice(0,600)||'Perfil ficticio registrado para probar el flujo de aprobación.',portrait:null,work:ARTISTS.find(a=>a.style===f.style).work,portfolio:f.portfolio.slice(0,500),soon:false,status:'pending',demo:true,createdAt:now.toISOString()};state.registrations.push(a);return a;
  }
  function submitReview(state,leadId,values,now=new Date()){
    const lead=state.leads.find(l=>l.id===leadId);if(!lead||lead.status!=='completed')throw Error('Completa una cita demo antes de escribir una reseña.');
    if(state.reviews.some(r=>r.leadId===leadId))throw Error('Esta cita ya tiene una reseña de demostración.');
    const rating=Number(values.rating),text=String(values.text||'').trim();
    if(!Number.isInteger(rating)||rating<1||rating>5||text.length<10||text.length>500)throw Error('Elige de 1 a 5 estrellas y escribe entre 10 y 500 caracteres.');
    const review={leadId,artistId:lead.artistId,rating,text,createdAt:now.toISOString(),demo:true};state.reviews.push(review);return review;
  }
  return {STATUSES,LABELS,STYLES,ARTISTS,dateString,initialState,normalize,allArtists,validateRequest,createLead,moveLead,availableDays,availableTimes,exportCsv,csvCell,registerArtist,submitReview};
});
