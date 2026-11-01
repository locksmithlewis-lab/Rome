import * as THREE from 'three';
import './style.css';

document.querySelector('#app').innerHTML = `
<div id="game"><div id="topbar"><div><div class="brand">ROMA AETERNA</div><div class="sub">THE FRONTIER CAMPAIGN</div></div><div class="panel"><div class="stat">LEGIONARY HEALTH</div><div class="bar"><div id="hp" class="fill health" style="width:100%"></div></div><div class="stat">STAMINA</div><div class="bar"><div id="st" class="fill stamina" style="width:100%"></div></div><div class="stat">ENEMY</div><div class="bar"><div id="eh" class="fill enemy" style="width:100%"></div></div></div></div><div id="message"></div><div id="bottom">WASD move · Mouse look · <kbd>Click</kbd> sword · <kbd>F</kbd> shield · <kbd>Shift</kbd> sprint · <kbd>Esc</kbd> release mouse</div></div>
<div id="start"><div class="modal"><h1>RISE OF ROME</h1><p>Frontier of the Republic. Stand with your legion, defeat the enemy champion, and earn the right to expand Roman rule.</p><p class="small">A lightweight 3D prototype designed to run on integrated graphics.</p><button id="begin" class="btn">ENTER THE ARENA</button></div></div>
<div id="campaign" class="hidden"><div class="modal"><h1>VICTORIA!</h1><p>The frontier champion has fallen. Your victory strengthens Rome.</p><div class="provinces"><div class="province owned">ITALIA<br>ROMAN</div><div class="province owned">GALLIA<br>ROMAN</div><div class="province owned">HISPANIA<br>ROMAN</div><div class="province enemyProvince">GERMANIA<br>UNREST</div><div class="province enemyProvince">RAETIA<br>HOSTILE</div><div class="province enemyProvince">DACIA<br>HOSTILE</div></div><p id="campaignText">Treasury: 120 denarii · Legion: 800</p><button id="recruit" class="btn">RECRUIT LEGIONARIES · 40</button><button id="next" class="btn">NEXT BATTLE</button><div class="small">Campaign progression prototype</div></div></div>`;

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9a8870); scene.fog = new THREE.Fog(0x9a8870,24,75);
const camera = new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,120); camera.position.set(0,1.7,7);
const renderer = new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=false; document.querySelector('#game').prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd9e2e5,0x62513c,2));
const sun = new THREE.DirectionalLight(0xffe0b0,1.6); sun.position.set(-8,15,8); scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const stone=mat(0x9a8a72), darkStone=mat(0x62594b), sand=mat(0x9b835f), red=mat(0x7e2924), bronze=mat(0x9c713b), skin=mat(0xb88765), iron=mat(0x555b5d);
function cube(x,y,z,sx,sy,sz,m){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);scene.add(o);return o}
cube(0,-.18,0,48,.35,48,sand);
for(let i=-20;i<=20;i+=2){cube(i,.005,0,.035,.02,42,darkStone);cube(0,.006,i,42,.02,.035,darkStone)}
// courtyard walls, towers and gate
cube(0,3,-20,44,6,1.2,stone);cube(-22,3,0,1.2,6,42,stone);cube(22,3,0,1.2,6,42,stone);
for(const x of [-20,20])for(const z of [-18,18]){cube(x,4,z,4,8,4,darkStone);cube(x,8.2,z,5,.5,5,stone)}
cube(0,2.5,-19.2,8,5,1.3,darkStone);cube(-5,3,-19.2,2,6,2,stone);cube(5,3,-19.2,2,6,2,stone);
for(let i=0;i<8;i++){cube(-17+i*4,.25,-12,1.2,.5,1.2,bronze)}
// standards
for(const x of [-12,12]){cube(x,3,-10,.12,6,.12,bronze);cube(x,4.8,-10,1.8,1.2,.08,red)}
// low-poly tree props
for(const [x,z] of [[-17,-2],[17,3],[-15,12],[15,13]]){cube(x,1,z,.45,2,.45,bronze);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.7,4,5),mat(0x43543b));crown.position.set(x,3.8,z);scene.add(crown)}
function makeSoldier(x,z,isEnemy=false){const g=new THREE.Group();const tunic=new THREE.Mesh(new THREE.CylinderGeometry(.42,.55,1.25,7),isEnemy?red:red);tunic.position.y=1.05;g.add(tunic);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),skin);head.position.y=1.9;g.add(head);const helmet=new THREE.Mesh(new THREE.SphereGeometry(.31,8,5,0,Math.PI*2,0,Math.PI/2),bronze);helmet.position.y=2.02;g.add(helmet);const shield=new THREE.Mesh(new THREE.BoxGeometry(.72,1,.12),bronze);shield.position.set(-.48,1.1,0);g.add(shield);const sword=new THREE.Mesh(new THREE.BoxGeometry(.09,.9,.08),iron);sword.position.set(.48,1.15,0);sword.rotation.z=-.25;g.add(sword);g.position.set(x,0,z);scene.add(g);return g}
const enemy=makeSoldier(0, -5,true);enemy.rotation.y=Math.PI;
const dummy=makeSoldier(-7,-7);dummy.scale.setScalar(.9);
let hp=100, stamina=100, enemyHp=100, glory=0, treasury=120,troops=800,active=false,shielding=false,attacking=false,won=false;
const keys={};let yaw=0,pitch=0;const hpEl=document.querySelector('#hp'),stEl=document.querySelector('#st'),ehEl=document.querySelector('#eh'),msg=document.querySelector('#message');
function updateHud(){hpEl.style.width=hp+'%';stEl.style.width=stamina+'%';ehEl.style.width=enemyHp+'%'}
function reset(){hp=100;stamina=100;enemyHp=100;enemy.position.set(0,0,-5);won=false;active=true;document.querySelector('#campaign').classList.add('hidden');document.querySelector('#start').classList.add('hidden');msg.textContent='';camera.position.set(0,1.7,7);yaw=0;pitch=0;updateHud()}
document.querySelector('#begin').onclick=()=>{reset();renderer.domElement.requestPointerLock?.()};
document.querySelector('#next').onclick=()=>{reset();renderer.domElement.requestPointerLock?.()};
document.querySelector('#recruit').onclick=()=>{if(treasury>=40){treasury-=40;troops+=150;document.querySelector('#campaignText').textContent='Treasury: '+treasury+' denarii · Legion: '+troops}else document.querySelector('#campaignText').textContent='Not enough denarii'};
document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyF')shielding=true});
document.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyF')shielding=false});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-1.2,Math.min(1.2,pitch))}});
renderer.domElement.addEventListener('click',()=>{if(active&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.();else if(active)attack()});
function attack(){if(attacking||stamina<12||won)return;attacking=true;stamina-=12;const dx=enemy.position.x-camera.position.x,dz=enemy.position.z-camera.position.z;const dist=Math.hypot(dx,dz);const facing=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const dir=new THREE.Vector3(dx,0,dz).normalize();if(dist<3.1&&facing.dot(dir)>.45){enemyHp=Math.max(0,enemyHp-25);if(enemyHp===0){won=true;glory+=100;msg.textContent='GLORIA ROMAE';setTimeout(()=>{active=false;document.exitPointerLock?.();document.querySelector('#campaign').classList.remove('hidden')},900)}}updateHud();setTimeout(()=>attacking=false,380)}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(active&&!won){const speed=(keys.ShiftLeft?7:4)*dt;let forward=(keys.KeyW?1:0)-(keys.KeyS?1:0),side=(keys.KeyD?1:0)-(keys.KeyA?1:0);const v=new THREE.Vector3(side,0,-forward);if(v.lengthSq())v.normalize().multiplyScalar(speed);v.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);camera.position.x+=v.x;camera.position.z+=v.z;camera.position.x=THREE.MathUtils.clamp(camera.position.x,-19,19);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-18,18);camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;stamina=Math.min(100,stamina+(shielding?3:10)*dt);
const dx=camera.position.x-enemy.position.x,dz=camera.position.z-enemy.position.z,dist=Math.hypot(dx,dz);if(dist>1.65){enemy.position.x+=dx/dist*dt*1.25;enemy.position.z+=dz/dist*dt*1.25;enemy.rotation.y=Math.atan2(dx,dz)}else if(Math.random()<dt*.8){if(!shielding)hp=Math.max(0,hp-7);if(hp===0){active=false;msg.textContent='ROMA REMEMBERS';setTimeout(()=>document.querySelector('#start').classList.remove('hidden'),1200)}}updateHud()}
renderer.render(scene,camera)}
const clock=new THREE.Clock();animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1))});
