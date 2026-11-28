(function(){
var CFG={apiKey:"AIzaSyAHVABrqV3OBAHRAHKKpuE7mlDmTjcAc50",authDomain:"mar-multi-ia.firebaseapp.com",projectId:"mar-multi-ia",storageBucket:"mar-multi-ia.firebasestorage.app",messagingSenderId:"691424215175",appId:"1:691424215175:web:c5a690d2458b8d8cce3822"};
var app=firebase.initializeApp(CFG,'hostres');
var fs=app.firestore(),au=app.auth();
var ready=au.signInAnonymously().catch(function(e){console.error('auth',e);});
var DEF={mesas:10,duracion:90,personasMesa:4};
var TURNOS=[['comida',['13:00','13:30','14:00','14:30','15:00','15:30']],['cena',['20:00','20:30','21:00','21:30','22:00','22:30']]];
var C='hostres_reservas',O='hostres_ocupa',K='hostres_config';
function toMin(h){var p=String(h).split(':');return Number(p[0])*60+Number(p[1]);}
function necesarias(per,cfg){return Math.max(1,Math.ceil(per/cfg.personasMesa));}
function activa(e){return e==='pendiente'||e==='confirmada'||e==='sentada';}
function carga(list,at,cfg){var s=0;list.forEach(function(r){if(!activa(r.estado))return;var t=toMin(r.hora);if(t<=at&&at<t+cfg.duracion)s+=r.mesas||1;});return s;}
function hayHueco(list,hora,per,cfg){var n=necesarias(per,cfg),t=toMin(hora);for(var a=t;a<t+cfg.duracion;a+=30){if(carga(list,a,cfg)+n>cfg.mesas)return false;}return true;}
function getConfig(){return ready.then(function(){return fs.collection(K).doc('ajustes').get();}).then(function(d){var c=Object.assign({},DEF,d.exists?d.data():{});return c;}).catch(function(){return Object.assign({},DEF);});}
function setConfig(c){return ready.then(function(){return fs.collection(K).doc('ajustes').set(c,{merge:true});});}
function ocupaDia(fecha){return ready.then(function(){return fs.collection(O).where('fecha','==',fecha).get();}).then(function(q){return q.docs.map(function(d){var o=d.data();o.id=d.id;return o;});});}
function crear(r){return ready.then(function(){return getConfig();}).then(function(cfg){
 var ref=fs.collection(C).doc(),b=fs.batch(),now=Date.now();
 var d=Object.assign({estado:'pendiente',origen:'web',mesa:'',notas:'',telefono:''},r);
 d.turno=d.hora<'17:00'?'comida':'cena';d.mesas=necesarias(d.personas,cfg);d.createdAtLocal=now;d.updatedAtLocal=now;
 b.set(ref,d);b.set(fs.collection(O).doc(ref.id),{fecha:d.fecha,hora:d.hora,mesas:d.mesas,estado:d.estado});
 return b.commit().then(function(){d.id=ref.id;return d;});});}
function estado(id,e){return ready.then(function(){var b=fs.batch();b.update(fs.collection(C).doc(id),{estado:e,updatedAtLocal:Date.now()});b.update(fs.collection(O).doc(id),{estado:e});return b.commit();});}
function borrar(id){return ready.then(function(){var b=fs.batch();b.delete(fs.collection(C).doc(id));b.delete(fs.collection(O).doc(id));return b.commit();});}
function onReservas(cb){ready.then(function(){fs.collection(C).onSnapshot(function(s){cb(s.docs.map(function(d){var o=d.data();o.id=d.id;return o;}),s.docChanges());},function(e){console.error(e);});});}
function onReserva(id,cb){ready.then(function(){fs.collection(C).doc(id).onSnapshot(function(d){cb(d.exists?Object.assign({id:d.id},d.data()):null);});});}
window.HR={TURNOS:TURNOS,toMin:toMin,necesarias:necesarias,hayHueco:hayHueco,getConfig:getConfig,setConfig:setConfig,ocupaDia:ocupaDia,crear:crear,estado:estado,borrar:borrar,onReservas:onReservas,onReserva:onReserva,activa:activa};
})();
