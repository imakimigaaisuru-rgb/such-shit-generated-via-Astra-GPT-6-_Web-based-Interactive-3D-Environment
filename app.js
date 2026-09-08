import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {buildWorld,D} from './scene.js?v=2';
import {detailWorld,applyPhotographicMaterials,landHeight,optimiseForRealtime} from './landscape.js?v=2';
import {buildAtmosphere} from './atmosphere.js?v=2';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
// Navigation and drawings work even on devices without WebGL.
$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('.page').forEach(p=>p.classList.toggle('active',p.id===b.dataset.tab));$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));window.dispatchEvent(new Event('resize'));});
const drawingNames={plan:'主屋尺寸平面配置图',elevations:'正面與側面立面圖',section:'剖面與結構示意圖',site:'水岸基地配置圖'};
$$('[data-drawing]').forEach(b=>b.onclick=()=>{const d=b.dataset.drawing;$('#drawingImage').src=`assets/${d}.svg`;$('#drawingImage').alt=drawingNames[d];$('#drawingDownload').href=`assets/${d}.svg`;$$('[data-drawing]').forEach(x=>x.classList.toggle('selected',x===b));});
$('#toolsToggle').onclick=()=>$('.tools').classList.toggle('open');
init().catch(e=>{console.error(e);$('#loading').textContent='3D 載入未完成。請重新整理，或使用支援 WebGL 2 的 Safari／Chrome；設計底稿仍可查看與下載。';});
async function init(){
 const viewport=$('#viewport');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.innerWidth<760?1.15:1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;viewport.appendChild(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').style.display='grid';$('#loading').textContent='3D 顯示已暫停。請重新整理；也可先查看設計底稿。';});
 const scene=new T.Scene();scene.background=new T.Color(0x182931);scene.fog=new T.FogExp2(0x182931,.018);
 const camera=new T.PerspectiveCamera(43,1,.06,230);camera.position.set(13,6.7,19);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(.3,2.25,-1.25);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=.65;controls.maxDistance=60;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=true;controls.screenSpacePanning=true;
 const hemi=new T.HemisphereLight(0x9dbbc7,0x353329,1.5);scene.add(hemi);
 const sun=new T.DirectionalLight(0xb8cbdf,2.25);sun.position.set(-12,19,-5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;sun.shadow.camera.far=65;sun.shadow.normalBias=.045;sun.shadow.bias=-.0002;scene.add(sun);
 const back=new T.DirectionalLight(0x83a9b7,.65);back.position.set(8,8,-10);scene.add(back);
 const model=buildWorld();const details=detailWorld(model);scene.add(model.world);
 $('#loading').textContent='正在載入木屋材質、密林與溪谷…';
 await applyPhotographicMaterials(model,details,new T.TextureLoader());
 optimiseForRealtime(model.world);
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const atmosphere=buildAtmosphere(scene,model,details,renderer,camera);
 let motion=true,fogAmount=1.05,flow=.65;
 $('#motion').onchange=()=>motion=$('#motion').checked;
 $('#fogAmount').oninput=()=>{fogAmount=Number($('#fogAmount').value)/100;$('#fogValue').textContent=Math.round(fogAmount*100)+'%';atmosphere.setFog($('#mist').checked?fogAmount:0);};
 $('#flowAmount').oninput=()=>{flow=Number($('#flowAmount').value)/100;};
 atmosphere.setFog(fogAmount);
 let walk=false,yaw=0,pitch=0,drag=null,goal=null;const keys=new Set();let active=true;
 function resize(){if(!$('#explore').classList.contains('active'))return;const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();atmosphere.resize(renderer.domElement.width,renderer.domElement.height);}
 window.addEventListener('resize',resize);new ResizeObserver(resize).observe(viewport);resize();
 const views={overall:[[13,6.7,19],[.3,2.25,-1.25]],front:[[3,5,12],[3,2.7,-4]],back:[[3,6,-17],[3,2.6,-4]],top:[[3,19,-3.95],[3,0,-4]],interior:[[2.0,2.65,-1.9],[2,2.2,-5]]};
 function setView(v){walk=false;controls.enabled=true;$('#walkControls').hidden=true;$('#modeLabel').textContent='環繞';$('#hint').textContent='拖曳旋轉 · 雙指縮放／平移 · 可切換室內探索';$$('.views button').forEach(b=>b.classList.toggle('selected',b.dataset.view===v));goal={pos:new T.Vector3(...views[v][0]),target:new T.Vector3(...views[v][1])};if(v==='top'){$('#roof').checked=false;applyLayers();}if(v==='interior'){scene.fog.density=.012;$('.tools').classList.remove('open');}}
 $$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
 function applyLayers(){const structural=$('#structure').checked;model.roof.visible=$('#roof').checked;model.envelope.visible=!structural;model.grid.visible=structural;model.roof.traverse(o=>{if(o.isMesh)o.visible=!(structural&&(/finish|rhythm/.test(o.name)))});}
 $('#roof').onchange=applyLayers;$('#structure').onchange=applyLayers;
 $('#mist').onchange=()=>{atmosphere.setFog($('#mist').checked?fogAmount:0);scene.fog.density=$('#mist').checked?.018:.005;};
 $('#day').onchange=()=>{const day=$('#day').checked;scene.fog.color.set(day?0x718c91:0x182931);hemi.intensity=day?2.6:1.5;sun.intensity=day?3.6:2.25;sun.color.set(day?0xffe5be:0xb8cbdf);atmosphere.setDay(day);renderer.shadowMap.needsUpdate=true;model.lights.forEach(l=>l.intensity=day?3:10);};
 $('#reset').onclick=()=>{$('#roof').checked=true;$('#structure').checked=false;applyLayers();setView('overall');};
 $('#walk').onclick=()=>{if(walk){setView('overall');return;}walk=true;goal=null;controls.enabled=false;camera.position.set(3,2.65,-1.8);yaw=0;pitch=0;camera.rotation.set(0,0,0,'YXZ');$('#walkControls').hidden=false;$('#modeLabel').textContent='漫遊';$('#hint').textContent='拖曳環顧 · 方向鍵／WASD 移動 · Esc 返回環繞';$$('.views button').forEach(b=>b.classList.toggle('selected',b.id==='walk'));$('.tools').classList.remove('open');};
 const keymap={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&walk)setView('overall');if(walk&&keymap[e.key]){e.preventDefault();keys.add(keymap[e.key]);}});window.addEventListener('keyup',e=>keys.delete(keymap[e.key]));window.addEventListener('blur',()=>{keys.clear();drag=null;});
 $$('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.move);});
 renderer.domElement.addEventListener('pointerdown',e=>{if(!walk)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(!walk||!drag||e.pointerId!==drag.id)return;yaw-=(e.clientX-drag.x)*.004;pitch=T.MathUtils.clamp(pitch-(e.clientY-drag.y)*.004,-1.3,1.3);drag.x=e.clientX;drag.y=e.clientY;camera.rotation.set(pitch,yaw,0,'YXZ');});
 renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);
 const floorHeight=(x,z)=>{if(x>-1.05&&x<7.05&&z>-7.05&&z<.45)return 1.05;if(Math.abs(x-3)<.77&&z>=.4&&z<1.97)return .3+Math.max(1,Math.min(5,Math.floor((1.97-z)/.3)+1))*.15;if(Math.abs(x+5.7)<.78&&z>=2.8&&z<=7.2)return .562+.34*Math.sin(Math.PI*T.MathUtils.clamp((z-2.9)/4.2,0,1));return landHeight(x,z);};
 function passable(x,z,oldY){if(x<-17||x>17||z<-14||z>16)return false;if(z>3.4&&z<6.6&&Math.abs(x+5.7)>.65)return false;for(const c of model.collisions)if(x>c.minX-.14&&x<c.maxX+.14&&z>c.minZ-.14&&z<c.maxZ+.14)return false;return Math.abs(floorHeight(x,z)-oldY)<.26;}
 let prev=performance.now(),elapsed=0;
 function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-prev)/1000,.04);prev=now;if(!$('#explore').classList.contains('active')||document.hidden)return;if(motion)elapsed+=dt*flow;
  if(goal){camera.position.lerp(goal.pos,.1);controls.target.lerp(goal.target,.1);if(camera.position.distanceTo(goal.pos)<.02)goal=null;}
  if(walk){const f=(keys.has('forward')?1:0)-(keys.has('back')?1:0),r=(keys.has('right')?1:0)-(keys.has('left')?1:0);const len=Math.hypot(f,r)||1,spd=2.1*dt/len;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*spd,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*spd;let y=floorHeight(camera.position.x,camera.position.z);if(passable(camera.position.x+dx,camera.position.z,y))camera.position.x+=dx;y=floorHeight(camera.position.x,camera.position.z);if(passable(camera.position.x,camera.position.z+dz,y))camera.position.z+=dz;camera.position.y=T.MathUtils.lerp(camera.position.y,floorHeight(camera.position.x,camera.position.z)+1.6,.25);}else controls.update();
  atmosphere.update(elapsed);atmosphere.render();
 }
 controls.addEventListener('start',()=>goal=null);$('#loading').style.display='none';requestAnimationFrame(animate);
}
