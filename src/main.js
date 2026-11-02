import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import './style.css';
document.querySelector('#app').innerHTML = '<div id="game"><div id="topbar"><div><div class="brand">ROMA AETERNA</div><div class="sub">THE FRONTIER CAMPAIGN</div></div><div class="panel"><div class="stat">LEGIONARY</div><div class="bar"><div id="hp" class="fill health"></div></div><div class="stat">STAMINA</div><div class="bar"><div id="st" class="fill stamina"></div></div><div class="stat">ENEMY</div><div class="bar"><div id="eh" class="fill enemy"></div></div></div></div><div id="crosshair">+</div><div id="message"></div><div id="bottom">WASD move · Mouse look · Left click attack · 1–7 weapons · F raise shield · Shift sprint · Esc release mouse</div></div><div id="start"><div class="title-screen"><div class="title-kicker">ROMAN FRONTIER · TRAINING CAMPAIGN</div><div class="title-mark">✦</div><h1>RISE OF ROME</h1><div class="title-rule"></div><p class="title-lead">THE LEGION AWAITS</p><p class="title-copy">Enter the frontier training yard. Face the enemy champion, master your gladius and shield, and earn your place in the legion.</p><div class="mission-strip"><span><b>01</b> SINGLE COMBAT</span><span><b>02</b> GLADIUS & SCUTUM</span><span><b>03</b> FRONTIER YARD</span></div><button id="begin" class="btn start-cta" type="button"><span>ENTER THE ARENA</span><span class="cta-arrow">→</span></button><div class="title-foot">WASD MOVE <i>·</i> MOUSE LOOK <i>·</i> 1–7 WEAPONS <i>·</i> F BLOCK</div></div></div><div id="campaign" class="hidden"><div class="modal"><h1>VICTORIA!</h1><p>The enemy has fallen. Your victory strengthens Rome.</p><div class="provinces"><div class="province owned">ITALIA<br>ROMAN</div><div class="province owned">GALLIA<br>ROMAN</div><div class="province owned">HISPANIA<br>ROMAN</div><div class="province enemyProvince">GERMANIA<br>UNREST</div><div class="province enemyProvince">RAETIA<br>HOSTILE</div><div class="province enemyProvince">DACIA<br>HOSTILE</div></div><p id="campaignText">Treasury: 120 denarii · Legion: 800</p><button id="recruit" class="btn">RECRUIT LEGIONARIES · 40</button><button id="next" class="btn">NEXT BATTLE</button></div></div>';

const scene=new THREE.Scene();scene.background=new THREE.Color(0x9b8a72);scene.fog=new THREE.Fog(0x9b8a72,55,155);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,220);camera.position.set(0,1.7,8);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;document.querySelector('#game').prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe1e7ed,0x554331,2));const sun=new THREE.DirectionalLight(0xffdfb2,2);sun.position.set(-9,18,10);scene.add(sun);
const mat=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const stone=mat(0x9e907b),lightStone=mat(0xb4a58d),darkStone=mat(0x62584b),sand=mat(0x9a805b),red=mat(0x742b27),redDark=mat(0x451d1b),bronze=mat(0x9b713d,.48,.62),gold=mat(0xc39a55,.42,.68),iron=mat(0x59636a,.34,.82),steel=mat(0xaab4b8,.26,.88),leather=mat(0x493126),skin=mat(0xb98261),wood=mat(0x63452c),green=mat(0x42533c);
function surfaceTexture(base,kind='stone'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
 ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
 for(let i=0;i<(kind==='stone'?900:650);i++){const x=Math.random()*256,y=Math.random()*256,a=kind==='metal'?.035:.09;ctx.fillStyle=Math.random()>.5?'rgba(255,240,210,'+a+')':'rgba(20,15,10,'+a+')';const s=kind==='metal'?1+Math.random()*2:1+Math.random()*4;ctx.fillRect(x,y,s,s)}
 if(kind==='stone'){ctx.strokeStyle='rgba(48,39,29,.22)';ctx.lineWidth=1;for(let i=0;i<18;i++){const x=Math.random()*256,y=Math.random()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(Math.random()-.5)*35,y+(Math.random()-.5)*35);ctx.stroke()}}
 if(kind==='wood'){ctx.strokeStyle='rgba(20,12,7,.28)';for(let i=0;i<22;i++){const y=Math.random()*256;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(70,y-5,170,y+5,256,y+(Math.random()-.5)*8);ctx.stroke()}}
 if(kind==='metal'){ctx.strokeStyle='rgba(245,220,170,.25)';for(let i=0;i<30;i++){const x=Math.random()*256,y=Math.random()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.random()*16,y+Math.random()*3);ctx.stroke()}}
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=2;return t;
}
stone.map=surfaceTexture('#9e907b');lightStone.map=surfaceTexture('#b4a58d');darkStone.map=surfaceTexture('#62584b');
sand.map=surfaceTexture('#9a805b');red.map=surfaceTexture('#742b27','cloth');redDark.map=surfaceTexture('#451d1b','cloth');
bronze.map=surfaceTexture('#9b713d','metal');gold.map=surfaceTexture('#c39a55','metal');iron.map=surfaceTexture('#59636a','metal');steel.map=surfaceTexture('#aab4b8','metal');
leather.map=surfaceTexture('#493126','leather');wood.map=surfaceTexture('#63452c','wood');green.map=surfaceTexture('#42533c','cloth');
for(const m of [stone,lightStone,darkStone,sand,red,redDark,bronze,gold,iron,steel,leather,wood,green])m.needsUpdate=true;

function box(p,x,y,z,a,b,c,m){const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(x,y,z);p.add(o);return o}
function cyl(p,x,y,z,a,b,h,m,n=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,n),m);o.position.set(x,y,z);p.add(o);return o}
function ball(p,x,y,z,r,m){const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,7),m);o.position.set(x,y,z);p.add(o);return o}
box(scene,0,-.22,0,52,.4,52,sand);
for(let i=-24;i<=24;i+=2){box(scene,i,-.005,0,.025,.015,48,darkStone);box(scene,0,-.004,i,48,.015,.025,darkStone)}
box(scene,0,3,-22,48,6,1.4,stone);box(scene,-24,3,0,1.4,6,44,stone);box(scene,24,3,0,1.4,6,44,stone);
for(const x of [-21,21])for(const z of [-20,20]){box(scene,x,4,z,4.8,8,4.8,darkStone);box(scene,x,8.2,z,5.5,.5,5.5,lightStone);for(let k=-1;k<=1;k++)box(scene,x+k*1.45,8.65,z,.5,.4,4.8,stone)}
box(scene,0,2.7,-21.15,9,5.4,1.1,darkStone);box(scene,0,5.5,-21.1,10,.5,1.5,lightStone);
for(let x=-3.4;x<=3.4;x+=1.7)box(scene,x,2.5,-20.45,.13,5,.16,wood);
for(const x of [-12,12]){cyl(scene,x,3,-11,.09,.09,6,bronze);box(scene,x,4.9,-11,1.7,1.7,.08,red);box(scene,x,4.9,-10.92,.09,1.25,.08,gold)}
for(const x of [-17,17])for(const z of [-8,8]){cyl(scene,x,.9,z,.55,.7,1.8,darkStone,10);cyl(scene,x,1.9,z,.72,.72,.18,lightStone,10);cyl(scene,x,3.1,z,.5,.62,2.3,stone,10);cyl(scene,x,4.3,z,.72,.72,.18,lightStone,10)}
for(const [x,z] of [[-9,-13],[9,-13],[-15,13],[15,13]]){box(scene,x,.6,z,1.5,1.2,1.5,wood);box(scene,x,.62,z,.08,1.23,1.56,bronze)}
for(const [x,z] of [[-19,2],[19,4],[-18,15],[18,15]]){cyl(scene,x,1,z,.2,.25,2,wood,7);const t=new THREE.Mesh(new THREE.ConeGeometry(1.7,4.5,6),green);t.position.set(x,4,z);scene.add(t)}

function makeSword(parent){const g=new THREE.Group();parent.add(g);cyl(g,0,-.43,0,.055,.055,.36,leather);ball(g,0,-.64,0,.09,bronze);box(g,0,-.22,0,.42,.075,.12,gold);const s=new THREE.Shape();s.moveTo(-.105,0);s.lineTo(-.12,.13);s.lineTo(-.075,.78);s.lineTo(0,.98);s.lineTo(.075,.78);s.lineTo(.12,.13);s.lineTo(.105,0);s.close();const blade=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.035,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.012}),steel);blade.position.y=-.17;g.add(blade);box(g,0,.25,.055,.025,.48,.012,iron);g.position.set(.48,-.36,-.78);g.rotation.set(-.16,0,-.25);return g}
function makeShield(parent){const g=new THREE.Group();parent.add(g);box(g,0,0,0,.72,1.02,.12,red);for(const x of [-.35,.35])box(g,x,0,.075,.055,1.04,.06,bronze);for(const y of [-.48,.48])box(g,0,y,.075,.72,.055,.06,bronze);const boss=new THREE.Mesh(new THREE.SphereGeometry(.18,10,7),bronze);boss.scale.set(1,.85,.42);boss.position.z=.12;g.add(boss);box(g,0,0,.085,.07,.78,.04,gold);g.position.set(-.48,-.38,-.82);g.rotation.set(.04,0,.12);return g}
const rig=new THREE.Group();camera.add(rig);scene.add(camera);const sword=makeSword(rig),shield=makeShield(rig);

function makeEnemy(x,z){const root=new THREE.Group();scene.add(root);root.position.set(x,0,z);const torso=new THREE.Group();torso.position.y=1.05;root.add(torso);cyl(torso,0,0,0,.43,.53,1.05,red,9);for(let y=-.35;y<=.35;y+=.18){box(torso,0,y,.31,.76,.105,.12,bronze);for(const side of [-1,1]){const rivet=new THREE.Mesh(new THREE.SphereGeometry(.027,6,5),gold);rivet.position.set(side*.31,y,.39);torso.add(rivet)}}box(torso,0,-.38,.02,.9,.1,.58,leather);
const strap=box(torso,0,.02,.375,.105,.78,.045,leather);strap.rotation.z=-.34;const clasp=box(torso,.12,-.24,.42,.16,.12,.035,gold);for(let i=-2;i<=2;i++)box(torso,i*.15,-.58,.31,.12,.34,.06,redDark);
const head=new THREE.Group();head.position.set(0,.68,0);torso.add(head);ball(head,0,.12,0,.25,skin);const helmet=new THREE.Mesh(new THREE.SphereGeometry(.29,10,7,0,Math.PI*2,0,Math.PI*.56),bronze);helmet.position.y=.2;head.add(helmet);box(head,0,.34,0,.09,.55,.08,red);box(head,0,-.02,.23,.42,.09,.07,gold);
for(const side of [-1,1]){const cheek=box(head,side*.2,-.02,.12,.12,.28,.12,bronze);cheek.rotation.z=side*.18}
const crestBase=box(head,0,.43,-.015,.12,.12,.48,redDark);crestBase.rotation.x=.18;
for(let i=-2;i<=2;i++){const plume=box(head,i*.045,.52,.015,.035,.2,.42,red);plume.rotation.x=.18}
const arms=[],legs=[];for(const side of [-1,1]){const a=new THREE.Group();a.position.set(side*.48,.32,0);torso.add(a);cyl(a,0,-.3,0,.13,.12,.58,skin,7);box(a,0,-.34,.02,.25,.2,.27,bronze);arms.push(a);const l=new THREE.Group();l.position.set(side*.2,-.53,0);root.add(l);cyl(l,0,-.38,0,.18,.14,.72,redDark,7);box(l,0,-.7,.09,.29,.16,.42,leather);legs.push(l)}
const enemyShield=makeShield(root);enemyShield.position.set(-.68,1.08,.04);enemyShield.scale.set(.88,.94,.9);const enemySword=makeSword(root);enemySword.position.set(.65,1.12,.05);enemySword.scale.set(.68,.68,.68);
return {root,torso,head,arms,legs,enemyShield,enemySword,alive:true,hp:100,walk:0,cooldown:0,hit:0}}
let enemy=makeEnemy(0,-5);const dummy=makeEnemy(-8,-8);dummy.root.scale.setScalar(.9);dummy.root.rotation.y=.3;
let hp=100,stamina=100,glory=0,treasury=120,troops=800,active=false,shielding=false,attacking=false,won=false,swing=0,block=0,yaw=0,pitch=0;
const keys={},hpEl=document.querySelector('#hp'),stEl=document.querySelector('#st'),ehEl=document.querySelector('#eh'),msg=document.querySelector('#message');
function hud(){hpEl.style.width=hp+'%';stEl.style.width=stamina+'%';ehEl.style.width=(enemy.alive?enemy.hp:0)+'%'}
const fallen=[];
function drop(mesh,pos,vel){const o=mesh.clone(true);o.traverse(v=>{if(v.isMesh){v.geometry=v.geometry.clone();v.material=v.material.clone()}});scene.add(o);o.position.copy(pos);o.userData.fallen=true;o.userData.v=vel.clone();o.userData.spin=new THREE.Vector3((Math.random()-.5)*5,(Math.random()-.5)*5,(Math.random()-.5)*5);fallen.push(o)}
function defeat(){if(!enemy.alive)return;enemy.torso.remove(enemy.head);enemy.arms.forEach(a=>enemy.torso.remove(a));enemy.alive=false;enemy.root.visible=false;won=true;glory+=100;const parts=[[enemy.torso,new THREE.Vector3(0,1.05,0),new THREE.Vector3(-1,3,1)],[enemy.head,new THREE.Vector3(0,1.9,0),new THREE.Vector3(.8,3,-.5)],[enemy.arms[0],new THREE.Vector3(-.5,1.35,0),new THREE.Vector3(-3,3,1)],[enemy.arms[1],new THREE.Vector3(.5,1.35,0),new THREE.Vector3(3,2,-1)],[enemy.legs[0],new THREE.Vector3(-.2,.55,0),new THREE.Vector3(-1,2,2)],[enemy.legs[1],new THREE.Vector3(.2,.55,0),new THREE.Vector3(1,2,-2)],[enemy.enemySword,new THREE.Vector3(.7,1.1,0),new THREE.Vector3(2,3,1)],[enemy.enemyShield,new THREE.Vector3(-.7,1.1,0),new THREE.Vector3(-2,3,1)]];
for(const [part,offset,vel] of parts){const wp=enemy.root.localToWorld(offset.clone());drop(part,wp,vel)}msg.textContent='GLORIA ROMAE';setTimeout(()=>{active=false;document.exitPointerLock?.();document.querySelector('#campaign').classList.remove('hidden')},1500)}
function reset(){hp=100;stamina=100;enemy.hp=100;enemy.alive=true;enemy.root.visible=true;enemy.root.position.set(0,0,-5);enemy.root.rotation.set(0,Math.PI,0);enemy.legs.forEach(l=>l.rotation.set(0,0,0));enemy.arms.forEach(a=>a.rotation.set(0,0,0));enemy.torso.rotation.set(0,0,0);enemy.head.rotation.set(0,0,0);for(const p of fallen)scene.remove(p);fallen.length=0;won=false;active=true;attacking=false;swing=0;shielding=false;document.querySelector('#campaign').classList.add('hidden');document.querySelector('#start').classList.add('hidden');msg.textContent='';camera.position.set(0,1.7,8);yaw=0;pitch=0;hud()}
function enterArena(event){event?.preventDefault?.();event?.stopPropagation?.();if(active)return;try{reset();msg.textContent='';const lock=renderer.domElement.requestPointerLock?.();if(lock&&typeof lock.catch==='function')lock.catch(()=>{msg.textContent='ARENA READY — CLICK TO LOOK AROUND'});}catch(error){console.error('Arena start failed:',error);msg.textContent='START ERROR — '+(error?.message||'Please refresh');}}
const beginButton=document.querySelector('#begin');beginButton.addEventListener('click',enterArena);
document.querySelector('#next').addEventListener('click',()=>{reset();renderer.domElement.requestPointerLock?.()});
document.querySelector('#recruit').onclick=()=>{if(treasury>=40){treasury-=40;troops+=150;document.querySelector('#campaignText').textContent='Treasury: '+treasury+' denarii · Legion: '+troops}};
document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyF')shielding=true;const wm={Digit1:'gladius',Digit2:'spear',Digit3:'pilum',Digit4:'spatha',Digit5:'axe',Digit6:'bow',Digit7:'dagger'};if(wm[e.code])selectWeapon(wm[e.code])});document.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyF')shielding=false});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0021;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0021,-1.15,1.15)}});
renderer.domElement.addEventListener('click',()=>{if(active&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.();else if(active)startAttack()});
function startAttack(){if(attacking||stamina<14||won)return;attacking=true;swing=0;weaponGroups[selectedWeapon].userData.hit=false;stamina-=14;hud()}
function hitEnemy(){const dx=enemy.root.position.x-camera.position.x,dz=enemy.root.position.z-camera.position.z,dist=Math.hypot(dx,dz);const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),to=new THREE.Vector3(dx,0,dz).normalize();if(enemy.alive&&dist<weaponStats[selectedWeapon].reach&&f.dot(to)>.32){enemy.hp=Math.max(0,enemy.hp-weaponStats[selectedWeapon].damage);enemy.hit=.2;enemy.root.position.addScaledVector(f,.25);enemy.torso.rotation.x=-.2;if(enemy.hp===0)defeat()}hud()}

/* FRONTIER EXPANSION */
const terrain={grass:mat(0x596044),scrub:mat(0x77704f),mud:mat(0x51483a),gravel:mat(0x817969),field:mat(0x88754d),water:new THREE.MeshStandardMaterial({color:0x425d62,roughness:.24,transparent:true,opacity:.9})};
function patch(x,z,w,d,m){const q=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);q.rotation.x=-Math.PI/2;q.position.set(x,-.008,z);scene.add(q)}
function prop(x,y,z,w,h,d,m,ry=0){const q=box(scene,x,y,z,w,h,d,m);q.rotation.y=ry;return q}
function tree(x,z,k=1){cyl(scene,x,.8*k,z,.16*k,.22*k,1.6*k,wood,7);const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2*k,1),green);c.position.set(x,2*k,z);scene.add(c);const c2=new THREE.Mesh(new THREE.IcosahedronGeometry(.75*k,0),mat(0x526044));c2.position.set(x+.3*k,2.6*k,z);scene.add(c2)}
function ruin(x,z,a=0){prop(x,.9,z,7,1.8,.65,stone,a);prop(x-2.8,2,z,1.1,2.5,.65,darkStone,a);prop(x+2.8,1.5,z,1.1,2,.65,lightStone,a);for(let j=-2;j<=2;j++)prop(x+j*1.35,2,z,.12,.15,.8,gold,a)}
// 180 x 180 metre frontier: grassland, scrub, farm plots, roads, stream and rocky ridges.
box(scene,0,-.34,0,184,.25,184,terrain.grass);
for(let x=-80;x<=80;x+=16)for(let z=-80;z<=80;z+=16){const n=Math.abs(x*7+z*11)%5;patch(x,z,15.8,15.8,n===0?terrain.scrub:n===1?terrain.gravel:n===2?terrain.field:terrain.grass)}
patch(0,8,13,150,terrain.mud);patch(-30,18,58,9,terrain.gravel);patch(30,-30,8,58,terrain.mud);
for(const side of [-1,1]){prop(side*88,3,0,1.8,6,176,darkStone);for(let z=-84;z<=84;z+=5)prop(side*88,6.35,z,2.1,.7,2.2,lightStone);for(const z of [-72,-36,36,72]){prop(side*88,5,z,5,10,5,stone);prop(side*88,10.2,z,5.8,.6,5.8,lightStone)}}
prop(0,3,-88,176,6,1.8,darkStone);prop(0,3,88,176,6,1.8,darkStone);prop(0,3.4,88,13,6.8,2.2,stone);
patch(48,42,18,84,terrain.mud);const stream=new THREE.Mesh(new THREE.PlaneGeometry(11,84),terrain.water);stream.rotation.x=-Math.PI/2;stream.position.set(48,-.025,42);scene.add(stream);
for(let z=5;z<=80;z+=4){prop(48,.08,z,14,.18,1.1,wood);prop(41.3,.35,z,.22,.55,.22,wood);prop(54.7,.35,z,.22,.55,.22,wood)}
for(const [x,z,r,h] of [[-70,-62,15,8],[-58,65,18,10],[68,-62,17,9],[72,66,15,8],[-82,8,12,6],[82,-8,12,6]]){const hill=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),mat(0x625d4c));hill.scale.y=h/r;hill.position.set(x,h*.55,z);scene.add(hill);for(let j=0;j<5;j++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.8+Math.random(),0),darkStone);rock.position.set(x+(Math.random()-.5)*r,z*.0+.3,z+(Math.random()-.5)*r);rock.scale.y=.6;scene.add(rock)}}
for(const [x,z] of [[-55,-28],[-54,-8],[-55,12],[-54,32]]){patch(x,z,15,13,terrain.field);for(let r=0;r<5;r++)for(let c=0;c<9;c++)prop(x-6.5+c*1.6,.22,z-4+r*1.8,.12,.42,.12,green);for(const zz of [z-7,z+7])prop(x,.35,zz,16,.7,.35,wood)}
for(const [x,z] of [[-70,-20],[-68,5],[-70,29],[65,-20],[70,5],[68,28],[-42,70],[42,72],[-38,-72],[38,-72]])tree(x,z,.8+Math.random()*.45);
ruin(-37,-47,.18);ruin(35,-54,-.2);ruin(61,15,Math.PI/2);
for(const [x,z] of [[-48,48],[-32,55],[28,55],[42,-38]]){prop(x,.9,z,9,1.8,7,lightStone);prop(x,2.2,z,9,.25,7,wood);const roof=new THREE.Mesh(new THREE.ConeGeometry(6.3,2.5,4),red);roof.rotation.y=Math.PI/4;roof.position.set(x,3.45,z);scene.add(roof);prop(x,1,z-3.56,1.5,2,.12,wood)}
for(let i=0;i<28;i++){const x=(Math.sin(i*12.31)*.5+.5)*150-75,z=(Math.cos(i*8.17)*.5+.5)*150-75;if(Math.abs(x)<27&&Math.abs(z)<27)continue;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.4+(i%4)*.15,0),i%2?darkStone:stone);rock.position.set(x,.22,z);scene.add(rock)}
/* Weapon rack: gladius, spear, pilum, spatha, axe, bow and dagger. */
const weaponGroups={gladius:sword};
function handWeapon(type){const g=new THREE.Group();rig.add(g);
if(type==='spear'||type==='pilum'){cyl(g,0,0,0,.035,.045,1.75,wood,7);cyl(g,0,.91,0,.012,.095,.42,type==='pilum'?iron:steel,6);if(type==='pilum')cyl(g,0,.55,0,.018,.018,.55,iron,6);g.position.set(.43,-.34,-.92)}
if(type==='spath a'){box(g,0,.1,0,.095,1,.035,steel);box(g,0,-.48,0,.34,.07,.1,bronze);cyl(g,0,-.7,0,.045,.05,.35,leather,7);g.position.set(.48,-.36,-.82)}
if(type==='axe'){cyl(g,0,-.1,0,.04,.05,1.05,wood,7);const h=new THREE.Mesh(new THREE.BoxGeometry(.42,.36,.09),iron);h.position.set(.16,.35,0);g.add(h);const e=new THREE.Mesh(new THREE.BoxGeometry(.12,.43,.1),steel);e.position.set(.38,.35,0);g.add(e);g.position.set(.48,-.36,-.8)}
if(type==='bow'){const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,-.65,0),new THREE.Vector3(.42,0,0),new THREE.Vector3(0,.65,0));g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,16,.035,5,false),wood));g.position.set(.48,-.34,-.82)}
if(type==='dagger'){box(g,0,.18,0,.075,.58,.025,steel);box(g,0,-.18,0,.24,.05,.08,bronze);g.position.set(.48,-.38,-.78)}
g.visible=false;return g}
weaponGroups.spear=handWeapon('spear');weaponGroups.pilum=handWeapon('pilum');weaponGroups.spatha=handWeapon('spath a');weaponGroups.axe=handWeapon('axe');weaponGroups.bow=handWeapon('bow');weaponGroups.dagger=handWeapon('dagger');
let selectedWeapon='gladius';
const weaponStats={gladius:{damage:34,reach:3.2},spear:{damage:27,reach:4.5},pilum:{damage:42,reach:4.1},spatha:{damage:38,reach:3.8},axe:{damage:48,reach:2.9},bow:{damage:24,reach:18},dagger:{damage:19,reach:2.2}};
function selectWeapon(name){if(!weaponGroups[name])return;selectedWeapon=name;for(const [key,obj] of Object.entries(weaponGroups))obj.visible=key===name;msg.textContent='EQUIPPED: '+name.toUpperCase();setTimeout(()=>{if(msg.textContent.startsWith('EQUIPPED:'))msg.textContent=''},900)}
for(const [code,name] of Object.entries({Digit1:'gladius',Digit2:'spear',Digit3:'pilum',Digit4:'spatha',Digit5:'axe',Digit6:'bow',Digit7:'dagger'})){}

selectWeapon('gladius');
// Load the Blender-built frontier when its GLB is present. Keep the procedural
// environment as a fallback, and merge static meshes by material for Intel HD GPUs.
const frontierLoader=new GLTFLoader();
frontierLoader.load('/assets/Roman_Frontier_Ultra.glb',gltf=>{
  try{
    const imported=gltf.scene;
    imported.updateMatrixWorld(true);
    const batches=new Map();
    imported.traverse(node=>{
      if(!node.isMesh||!node.geometry||Array.isArray(node.material))return;
      const material=node.material;
      if(!batches.has(material.uuid))batches.set(material.uuid,{material,geometries:[]});
      const geometry=node.geometry.clone();
      geometry.applyMatrix4(node.matrixWorld);
      batches.get(material.uuid).geometries.push(geometry);
    });
    const optimized=new THREE.Group();
    let mergedCount=0;
    for(const batch of batches.values()){
      if(!batch.geometries.length)continue;
      const merged=batch.geometries.length===1?batch.geometries[0]:mergeGeometries(batch.geometries,false);
      if(merged){
        merged.computeBoundingSphere();
        optimized.add(new THREE.Mesh(merged,batch.material));
        mergedCount++;
      }
      for(const geometry of batch.geometries)if(geometry!==merged)geometry.dispose();
    }
    if(mergedCount>0){
      // Only hide the old static environment after the imported scene is ready.
      for(const object of scene.children)if(object.isMesh)object.visible=false;
      scene.add(optimized);
      console.info('Blender frontier loaded:',mergedCount,'merged material batches');
    }else{
      scene.add(imported);
      console.warn('Blender frontier loaded without mesh batching; using original meshes');
    }
  }catch(error){
    console.error('Frontier optimization failed; keeping procedural environment:',error);
    scene.add(gltf.scene);
  }
},undefined,error=>{
  console.info('Blender frontier GLB not found yet; using built-in frontier.',error);
});

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.035);
if(active&&!won){const speed=((keys.ShiftLeft||keys.ShiftRight)?6:3.8)*dt;const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0),v=new THREE.Vector3(s,0,-f);if(v.lengthSq())v.normalize().multiplyScalar(speed);v.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);camera.position.x=THREE.MathUtils.clamp(camera.position.x+v.x,-84,84);camera.position.z=THREE.MathUtils.clamp(camera.position.z+v.z,-84,84);camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;stamina=Math.min(100,stamina+(shielding?2.5:9)*dt);
if(attacking){swing+=dt;const k=Math.min(1,swing/.48);weaponGroups[selectedWeapon].rotation.x=-k*.75;weaponGroups[selectedWeapon].rotation.z=-k*.9;if(k>=.34&&!weaponGroups[selectedWeapon].userData.hit){weaponGroups[selectedWeapon].userData.hit=true;hitEnemy()}if(k>=1){attacking=false;weaponGroups[selectedWeapon].rotation.set(0,0,0)}}
block=THREE.MathUtils.damp(block,shielding?1:0,13,dt);shield.position.set(-.48+block*.16,-.38+block*.08,-.82+.18*block);shield.rotation.set(.04-block*.2,0,.12-block*.28);
if(enemy.alive){const dx=camera.position.x-enemy.root.position.x,dz=camera.position.z-enemy.root.position.z,d=Math.hypot(dx,dz);enemy.root.rotation.y=Math.atan2(dx,dz);if(d>1.75){enemy.root.position.x+=dx/d*dt*1.2;enemy.root.position.z+=dz/d*dt*1.2;enemy.walk+=dt*7;enemy.legs[0].rotation.x=Math.sin(enemy.walk)*.42;enemy.legs[1].rotation.x=-Math.sin(enemy.walk)*.42;enemy.arms[0].rotation.x=-Math.sin(enemy.walk)*.25}else{enemy.cooldown-=dt;enemy.arms[1].rotation.x=THREE.MathUtils.damp(enemy.arms[1].rotation.x,-1.1,9,dt);if(enemy.cooldown<=0){enemy.cooldown=1.25;if(!shielding)hp=Math.max(0,hp-9);else stamina=Math.max(0,stamina-8);if(hp===0){active=false;msg.textContent='ROMA REMEMBERS';setTimeout(()=>document.querySelector('#start').classList.remove('hidden'),1300)}}}if(enemy.hit>0){enemy.hit-=dt;enemy.torso.rotation.x=THREE.MathUtils.damp(enemy.torso.rotation.x,0,8,dt)}else enemy.arms[1].rotation.x=THREE.MathUtils.damp(enemy.arms[1].rotation.x,0,5,dt)}
hud()}
for(const p of fallen){const v=p.userData.v;v.y-=9.8*dt;p.position.addScaledVector(v,dt);p.rotation.x+=p.userData.spin.x*dt;p.rotation.y+=p.userData.spin.y*dt;p.rotation.z+=p.userData.spin.z*dt;if(p.position.y<.16){p.position.y=.16;v.y*=-.2;v.x*=.72;v.z*=.72;p.userData.spin.multiplyScalar(.45);if(Math.abs(v.y)<.6)v.y=0}}
renderer.render(scene,camera)}
animate();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1))});
