import * as T from 'three';
import {Water} from './vendor/Water.js';

const noiseGLSL=`
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise3(p)*.57+noise3(p*2.03+7.3)*.28+noise3(p*4.07+19.1)*.15;}
`;
export function buildAtmosphere(scene,model,details,renderer,camera){
 const small=window.matchMedia('(max-width:760px)').matches;
 const waterData=new Uint8Array(256*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const a=x/256*Math.PI*2,b=y/256*Math.PI*2;const dx=.29*Math.cos(a*4+b*2)+.13*Math.cos(a*11-b*3)+.065*Math.cos(a*23+b*9),dy=.35*Math.cos(b*3+a*2)+.1*Math.cos(b*13+a*7);const n=new T.Vector3(-dx,-dy,1).normalize(),i=(y*256+x)*4;waterData[i]=(n.x*.5+.5)*255;waterData[i+1]=(n.y*.5+.5)*255;waterData[i+2]=(n.z*.5+.5)*255;waterData[i+3]=255;}
 const normal=new T.DataTexture(waterData,256,256,T.RGBAFormat);normal.wrapS=normal.wrapT=T.RepeatWrapping;normal.minFilter=T.LinearMipmapLinearFilter;normal.magFilter=T.LinearFilter;normal.generateMipmaps=true;normal.needsUpdate=true;
 model.water.visible=false;
 const river=new Water(new T.PlaneGeometry(110,3.2,1,1),{textureWidth:small?512:768,textureHeight:small?512:768,waterNormals:normal,sunDirection:new T.Vector3(-.5,.8,-.4).normalize(),sunColor:0x9fb8cf,waterColor:0x0b252a,distortionScale:1.25,alpha:1,fog:true});river.rotation.x=-Math.PI/2;river.position.set(0,-.035,5);river.name='Flowing_reflective_stream';scene.add(river);
 // Re-scale the official ocean shader for a small, slow freshwater stream.
 river.material.fragmentShader=river.material.fragmentShader.replace('uv / 103.0','uv / 2.7').replace('uv / 107.0','uv / 3.1').replace('vec2( 8907.0, 9803.0 )','vec2( 6.7, 5.3 )').replace('vec2( 1091.0, 1027.0 )','vec2( 1.9, 2.7 )').replace('time / 17.0, time / 29.0','time / 7.0, time / 83.0').replace('float rf0 = 0.3;','float rf0 = 0.055;');
 river.material.fragmentShader=river.material.fragmentShader.replace('vec3 outgoingLight = albedo;',`
 float streak=sin(worldPosition.x*.55-time*.8+sin(worldPosition.z*24.+time*.16)*.6);
 float foam=pow(max(0.,streak),22.)*.016;
 vec3 outgoingLight = albedo + vec3(.19,.29,.29)*foam;
 `);
 // Slow world-space ribbons of tiny ripples catch lantern light beside the stones.
 const rippleMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;void main(){float x=vUv.x*2.-1.;float y=vUv.y*2.-1.;float r=length(vec2(x,y*1.5));float w=pow(max(0.,sin(r*42.-time*1.3)),16.);float a=w*(1.-smoothstep(.2,1.,r))*.08;gl_FragColor=vec4(.52,.64,.62,a);}`});
 const ripples=new T.Group();scene.add(ripples);for(const [x,z,s] of [[-6.5,4.7,1.1],[-4.9,5.5,.8],[.3,5.4,.7],[4.6,4.4,.9],[8,5.6,1.2],[-1.8,6.1,.8]]){const r=new T.Mesh(new T.PlaneGeometry(1,1),rippleMat);r.rotation.x=-Math.PI/2;r.position.set(x,-.019,z);r.scale.set(s,s,1);ripples.add(r);}
 // A high, clouded night sky; actual 3D environment, not a camera-locked backdrop.
 const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time:{value:0},day:{value:0}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vP;uniform float time;uniform float day;${noiseGLSL}void main(){vec3 d=normalize(vP);float h=max(0.,d.y);vec3 col=mix(vec3(.064,.095,.12),vec3(.012,.025,.05),pow(h,.48));float n=fbm(vec3(d.x*4.+time*.003,d.y*8.,d.z*4.));col+=smoothstep(.47,.75,n)*vec3(.035,.043,.057);float moon=pow(max(0.,dot(d,normalize(vec3(-.48,.62,-.62)))),330.);col+=vec3(.36,.44,.5)*moon*.45;vec3 daylight=mix(vec3(.32,.42,.45),vec3(.19,.33,.43),h);gl_FragColor=vec4(mix(col,daylight,day),1.);}`});const sky=new T.Mesh(new T.SphereGeometry(140,48,24),skyMat);sky.name='Clouded_night_sky';sky.renderOrder=-5;scene.add(sky);
 const lanternLights=[];for(const [x,z] of details.lampPositions){const l=new T.PointLight(0xffba71,7,5,2);l.position.set(x,details.landHeight(x,z)+.9,z);scene.add(l);lanternLights.push(l);}
 const porchLight=new T.PointLight(0xffbe80,22,9,2);porchLight.position.set(3,2.8,-.15);scene.add(porchLight);
 // Sparse distant spirit lights, deliberately faint and slow.
 const spiritMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float d=length((vUv-.5)*2.);float a=exp(-d*d*13.)*.37;gl_FragColor=vec4(.12,.42,.44,a);}' });
 const spirits=[];for(let i=0;i<3;i++){const p=new T.Mesh(new T.PlaneGeometry(.25,.35),spiritMat);p.position.set(-13-i*4,.7+i*.14,5.2);scene.add(p);spirits.push(p);}
 // Render opaque scene with depth, then integrate low fog along the viewing ray.
 const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true});target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const postMaterial=new T.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{tScene:{value:target.texture},tDepth:{value:target.depthTexture},invProjection:{value:new T.Matrix4()},cameraWorld:{value:new T.Matrix4()},eye:{value:new T.Vector3()},time:{value:0},fogAmount:{value:.85},day:{value:0},texel:{value:new T.Vector2(1,1)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform sampler2D tScene;uniform sampler2D tDepth;uniform mat4 invProjection;uniform mat4 cameraWorld;uniform vec3 eye;uniform float time;uniform float fogAmount;uniform float day;uniform vec2 texel;
 ${noiseGLSL}
 vec3 worldAt(vec2 uv,float depth){vec4 q=invProjection*vec4(uv*2.-1.,depth*2.-1.,1.);q/=q.w;return(cameraWorld*q).xyz;}
 float density(vec3 p){
  float low=exp(-max(0.,p.y-.05)*1.1)*smoothstep(-.1,.17,p.y);
  float bank=exp(-pow((p.z-5.)/2.9,2.));
  float far=exp(-pow((p.z+13.)/10.,2.))*exp(-max(0.,p.y-1.2)*.36)*.5;
  vec3 q=p*vec3(.27,.45,.32);q.x-=time*.036;q.z+=sin(q.x*.8+time*.04)*.5;
  // Two anchored vortices upstream of the bridge abutments; visual advection, not CFD.
  vec2 d=p.xz-vec2(-5.7,3.15);q.xz+=vec2(-d.y,d.x)*exp(-dot(d,d)*.24)*sin(time*.07)*.36;
  vec2 e=p.xz-vec2(-5.7,6.85);q.xz+=vec2(-e.y,e.x)*exp(-dot(e,e)*.24)*.24;
  float f=fbm(q+vec3(0,fbm(q*.7),0));
  float inside=smoothstep(-1.2,-.8,p.x)*(1.-smoothstep(6.8,7.2,p.x))*smoothstep(-7.2,-6.8,p.z)*(1.-smoothstep(.25,.55,p.z));
  return max(0.,f-.22)*(low*bank+far)*(1.-inside)*fogAmount*.64;
 }
 vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
 void main(){
  vec3 color=texture2D(tScene,vUv).rgb;float dep=texture2D(tDepth,vUv).r;vec3 hit=worldAt(vUv,dep);vec3 dir=normalize(hit-eye);float maxDist=min(length(hit-eye),75.);float stepLen=maxDist/float(STEPS);float start=fract(sin(dot(vUv,vec2(12.9898,78.233)))*43758.5453);vec3 scatter=vec3(0.);float trans=1.;
  for(int i=0;i<STEPS;i++){float t=(float(i)+start)*stepLen;vec3 p=eye+dir*t;float d=density(p);float a=1.-exp(-d*stepLen);float lamp=exp(-length(p-vec3(3.,1.3,.5))*.45);vec3 fogCol=mix(vec3(.17,.245,.27),vec3(.3,.37,.37),day)+vec3(.14,.053,.011)*lamp;scatter+=fogCol*a*trans;trans*=1.-a;}
  color=color*trans+scatter;
  // Restrained highlight spread keeps the lanterns warm without whitening the fog.
  vec3 bloom=vec3(0.);for(int j=0;j<8;j++){float a=float(j)*.7854;vec2 off=vec2(cos(a),sin(a))*texel*5.;vec3 s=texture2D(tScene,vUv+off).rgb;bloom+=max(s-vec3(1.1),vec3(0.));}color+=bloom*.018;
  float vignette=1.-.14*pow(length((vUv-.5)*1.4),2.);color=aces(color*1.25)*vignette;
  color=pow(max(color,vec3(0.)),vec3(1./2.2));gl_FragColor=vec4(color,1.);
 }`,defines:{STEPS:small?18:28}});
 postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMaterial));
 let count=0;const reflectionRender=river.onBeforeRender;river.onBeforeRender=function(...args){if((count++%(small?3:2))===0)reflectionRender.apply(this,args);};
 return{river,postMaterial,sky,resize(w,h){target.setSize(w,h);postMaterial.uniforms.texel.value.set(1/w,1/h);},setFog(v){postMaterial.uniforms.fogAmount.value=v;},setDay(v){postMaterial.uniforms.day.value=v?1:0;skyMat.uniforms.day.value=v?1:0;lanternLights.forEach(l=>l.intensity=v?2:7);porchLight.intensity=v?8:22;spirits.forEach(s=>s.visible=!v);},update(t){river.material.uniforms.time.value=t*.45;rippleMat.uniforms.time.value=t;postMaterial.uniforms.time.value=t;skyMat.uniforms.time.value=t;spirits.forEach((s,i)=>{s.quaternion.copy(camera.quaternion);s.position.y=.7+i*.14+Math.sin(t*.28+i)*.07;});},render(){camera.updateMatrixWorld(true);postMaterial.uniforms.invProjection.value.copy(camera.projectionMatrixInverse);postMaterial.uniforms.cameraWorld.value.copy(camera.matrixWorld);postMaterial.uniforms.eye.value.copy(camera.position);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}};
}
