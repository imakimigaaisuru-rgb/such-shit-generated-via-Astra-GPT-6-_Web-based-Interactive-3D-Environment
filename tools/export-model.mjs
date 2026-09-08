import fs from 'node:fs';
import * as T from 'three';
import {buildWorld,D} from '../dist/scene.js';
import {detailWorld,applyPhotographicMaterials} from '../dist/landscape.js';
import {Canvas,Image,loadImage} from '@napi-rs/canvas';
import {GLTFExporter} from '../dist/vendor/GLTFExporter.js';
globalThis.OffscreenCanvas=Canvas;
globalThis.HTMLCanvasElement=Canvas;
globalThis.HTMLImageElement=Image;
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(x=>{this.result=x;this.onloadend?.();}).catch(e=>this.onerror?.(e));}readAsDataURL(blob){blob.arrayBuffer().then(x=>{this.result='data:'+blob.type+';base64,'+Buffer.from(x).toString('base64');this.onloadend?.();});}};
const m=buildWorld();const detail=detailWorld(m);
await applyPhotographicMaterials(m,detail,{loadAsync:async path=>{const image=await loadImage('dist/'+path);const t=new T.Texture(image);t.needsUpdate=true;return t;}});
m.grid.removeFromParent();
// Expand landscape instances to ordinary glTF meshes for broad Blender/Unreal interoperability.
const inst=[];m.world.traverse(o=>{if(o.isInstancedMesh)inst.push(o);});
for(const o of inst){const g=new T.Group();g.name=o.name;g.position.copy(o.position);g.quaternion.copy(o.quaternion);g.scale.copy(o.scale);for(let i=0;i<o.count;i++){const mesh=new T.Mesh(o.geometry,o.material),matrix=new T.Matrix4();o.getMatrixAt(i,matrix);matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.name=o.name+'_'+i;g.add(mesh);}o.parent.add(g);o.removeFromParent();}
m.world.updateMatrixWorld(true);
let meshes=0,invalid=[];m.world.traverse(o=>{if(o.isMesh){meshes++;if(!o.geometry.attributes.position)invalid.push(o.name);for(const n of [...o.position,...o.scale])if(!Number.isFinite(n))invalid.push(o.name);}});if(invalid.length)throw Error(invalid.join(','));
const exporter=new GLTFExporter();const glb=await exporter.parseAsync(m.world,{binary:true,onlyVisible:true});fs.writeFileSync('dist/assets/higan-house.glb',Buffer.from(glb));
fs.writeFileSync('dist/assets/design-parameters.json',JSON.stringify({revision:'02',units:'metres',status:'concept_not_for_construction',dimensions:D,roomZones:[{name:'Living_kitchen',x:[-4,4],z:[0,3]},{name:'Bedroom',x:[-4,0],z:[-3,0]},{name:'Bathroom',x:[0,2.2],z:[-3,0]},{name:'Utility',x:[2.2,4],z:[-3,0]}],collisions:m.collisions},null,2));
console.log(JSON.stringify({meshes,glbBytes:glb.byteLength,invalidTransforms:invalid.length}));
