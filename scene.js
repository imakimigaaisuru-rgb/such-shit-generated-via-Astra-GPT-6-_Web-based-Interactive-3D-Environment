import * as T from 'three';
export const D={width:8,depth:6,porch:1.4,floor:1.05,eave:3.9,ridge:6.2,houseX:3,houseZ:-4,ground:0.3};
export function buildWorld(){
 const world=new T.Group();world.name='Higan_Water_House_Metres';
 const house=new T.Group();house.name='House_8x6m';house.position.set(D.houseX,0,D.houseZ);world.add(house);
 const roof=new T.Group();roof.name='Roof_Removable';house.add(roof);
 const envelope=new T.Group();envelope.name='Walls_and_Furniture';house.add(envelope);
 const frame=new T.Group();frame.name='Timber_Frame_Concept_Not_Engineered';house.add(frame);
 const ground=new T.Group();ground.name='Landscape';world.add(ground);
 const collisions=[];
 const mat=(name,color,roughness=.85)=>{const m=new T.MeshStandardMaterial({color,roughness});m.name=name;return m;};
 const wood=mat('Dark_cedar',0x4c3528),edge=mat('Cedar_endgrain',0x795338),plaster=mat('Earth_plaster',0xc1b291),stone=mat('Foundation_stone_cladding',0x626b63),concrete=mat('Concrete_concept_foundation',0x848a80),thatch=mat('Roof_finish_provisional',0x716044),floorMat=mat('Cedar_floorboards',0x92704d),red=mat('Muted_vermilion',0x943e31),metal=mat('Dark_metal',0x293833),linen=mat('Linen',0xd9cfb4),tatami=mat('Woven_mat',0x999b70),soil=mat('Moss_and_ground',0x40564b),pathMat=mat('Gravel_path',0x8a8a74),glass=new T.MeshStandardMaterial({color:0xc4d7c7,transparent:true,opacity:.23,roughness:.2,metalness:.1});glass.name='Glazing';
 const baseBox=new T.BoxGeometry(1,1,1);
 function box(name,x,y,z,w,h,d,m,parent=house,collide=false){const o=new T.Mesh(baseBox,m);o.name=name;o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(collide)collisions.push({minX:x-w/2+D.houseX,maxX:x+w/2+D.houseX,minZ:z-d/2+D.houseZ,maxZ:z+d/2+D.houseZ});return o;}
 function beam(name,a,b,w,d,m,parent=frame){const av=new T.Vector3(...a),bv=new T.Vector3(...b),len=av.distanceTo(bv);const o=new T.Mesh(baseBox,m);o.name=name;o.position.copy(av).add(bv).multiplyScalar(.5);o.scale.set(w,len,d);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function mesh(name,g,m,parent=ground){const o=new T.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 // Both banks are continuous solid terrain; water is lower than occupied ground.
 box('North_bank',0,-.35,-6,38,1.3,19,soil,ground);box('South_bank',0,-.35,12.75,38,1.3,12.5,soil,ground);
 box('Stream_bed',0,-.75,5,38,.35,3.2,stone,ground);
 const waterMaterial=new T.MeshStandardMaterial({color:0x427e83,metalness:.55,roughness:.23,transparent:true,opacity:.84});waterMaterial.name='Water';
 const water=mesh('Stream_surface',new T.PlaneGeometry(38,3.2,100,14),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,-.03,5);water.castShadow=false;
 box('Dry_access_path',8.8,.325,-5,2.1,.06,19,pathMat,ground);box('Front_approach',2.7,.33,1.45,14,.06,1.65,pathMat,ground);
 box('Continuous_foundation',0,.52,0,8,.44,6,concrete,frame);box('Stone_plinth_front',0,.56,3,8,.52,.2,stone,frame);box('Stone_plinth_back',0,.56,-3,8,.52,.2,stone,frame);for(const x of [-4,4])box('Stone_plinth_side',x,.56,0,.2,.52,6,stone,frame);
 for(let z=-2.85;z<3;z+=.4)box('Floor_joist',0,.865,z,7.9,.21,.08,wood,frame);
 for(let i=0;i<40;i++)box('Floor_board',-3.9+i*.2,1.005,0,.194,.09,6,floorMat,house);
 for(const x of [-3.9,-1.3,1.3,3.9])for(const z of [-2.9,0,2.9])box('Column_180_concept',x,2.38,z,.18,3.04,.18,wood,frame);
 for(const z of [-2.9,0,2.9])box('Longitudinal_beam_180x300_concept',0,3.77,z,8.16,.3,.18,wood,frame);
 for(const x of [-3.9,-1.3,1.3,3.9])box('Transverse_tie_180x300_concept',x,3.77,0,.18,.3,6,wood,frame);
 for(const x of [-3.9,3.9]){beam('Wall_diagonal_brace',[x,1.15,-2.85],[x,3.55,-1.45],.1,.12,edge);beam('Wall_diagonal_brace',[x,1.15,1.5],[x,3.55,2.85],.1,.12,edge);}
 for(const x of [-3.9,-1.3,1.3,3.9]){beam('Truss_rafter',[x,3.9,-2.9],[x,6.02,0],.16,.2,wood,roof);beam('Truss_rafter',[x,6.02,0],[x,3.9,2.9],.16,.2,wood,roof);beam('King_post',[x,3.9,0],[x,6.05,0],.14,.14,wood,roof);}
 box('Ridge_beam',0,6.02,0,9.6,.2,.18,wood,roof);
 // Roof prisms in section, with eaves on rafters; roof group can be removed.
 function roofSlope(sign){const shape=new T.Shape();shape.moveTo(0,6.2);shape.lineTo(sign*3.8,3.5);shape.lineTo(sign*3.8,3.25);shape.lineTo(0,5.95);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:9.5,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-4.75,0,0);mesh('Pitched_roof_finish',g,thatch,roof);}
 roofSlope(1);roofSlope(-1);
 for(const x of [-3.92,3.92]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([x,3.9,-2.9,x,6.02,0,x,3.9,2.9,x,3.9,2.9,x,6.02,0,x,3.9,-2.9],3));g.computeVertexNormals();mesh('Gable_finish',g,plaster,roof);}
 for(let x=-4.65;x<=4.66;x+=.3)for(const s of [-1,1])beam('Roof_surface_reed_rhythm',[x,6.215,.02*s],[x,3.52,s*3.79],.022,.025,edge,roof);
 // Proper wall openings, no solid wall across doors.
 function wallX(name,z,x1,x2,opening){
  if(!opening){box(name,(x1+x2)/2,2.475,z,x2-x1,2.85,.16,plaster,envelope,true);return;}
  const [a,b,sill,top]=opening;
  if(a>x1)box(name+'_left',(x1+a)/2,2.475,z,a-x1,2.85,.16,plaster,envelope,true);
  if(b<x2)box(name+'_right',(b+x2)/2,2.475,z,x2-b,2.85,.16,plaster,envelope,true);
  if(sill>1.05)box(name+'_sill',(a+b)/2,(1.05+sill)/2,z,b-a,sill-1.05,.16,plaster,envelope,true);
  box(name+'_lintel',(a+b)/2,(top+3.9)/2,z,b-a,3.9-top,.16,plaster,envelope);
  if(sill>1.05){box('Window_glass',(a+b)/2,(sill+top)/2,z,b-a,top-sill,.03,glass,envelope);for(let x=a;x<=b+.01;x+=.22)box('Window_lattice',x,(sill+top)/2,z+.035,.025,top-sill,.04,wood,envelope);for(let y=sill;y<=top+.01;y+=.3)box('Window_rail',(a+b)/2,y,z+.04,b-a,.026,.04,wood,envelope);}
 }
 wallX('Front_west',2.92,-4,-.65,[-3.25,-1.1,1.6,3.05]);wallX('Entry_header',2.92,-.65,.65,[-.65,.65,1.05,3.2]);wallX('Front_east',2.92,.65,4,[1.1,3.25,1.6,3.05]);
 wallX('Rear_bedroom',-2.92,-4,0,[-2.8,-1.3,1.7,2.95]);wallX('Rear_bath',-2.92,0,2.2,[.7,1.6,2.35,3.1]);wallX('Rear_utility',-2.92,2.2,4);
 for(const x of [-3.92,3.92]){box('Side_wall_rear',x,2.475,-1.8,.16,2.85,2.4,plaster,envelope,true);box('Side_wall_front',x,2.475,2.3,.16,2.85,1.4,plaster,envelope,true);box('Side_window_sill',x,1.35,.5,.16,.6,2.2,plaster,envelope,true);box('Side_window_header',x,3.5,.5,.16,.8,2.2,plaster,envelope);box('Side_glazing',x,2.375,.5,.035,1.45,2.2,glass,envelope);for(let z=-.6;z<1.7;z+=.22)box('Side_lattice',x,2.375,z,.04,1.45,.027,wood,envelope);}
 wallX('Bedroom_partition',0,-4,0,[-1.45,-.45,1.05,3.15]);wallX('Bath_partition',0,0,2.2,[.6,1.5,1.05,3.15]);wallX('Utility_partition',0,2.2,4,[2.75,3.65,1.05,3.15]);
 box('Bedroom_bath_divider',0,2.475,-1.5,.12,2.85,3,plaster,envelope,true);box('Bath_utility_divider',2.2,2.475,-1.5,.12,2.85,3,plaster,envelope,true);
 // Sliding door leaves shown parked open, preserving walking passages.
 for(const [x,z,w] of [[-1.98,.09,1],[.05,.09,.9],[2.3,.09,.9],[-1.28,3.12,1.2]]){box('Open_sliding_door',x,2.08,z,w,2.05,.055,wood,envelope);box('Door_infill',x,2.08,z+.035,w-.09,1.85,.022,linen,envelope);}
 // Front veranda: joists and bearing piers visible.
 for(let i=0;i<40;i++)box('Veranda_board',-3.9+i*.2,1.005,3.7,.194,.09,1.4,floorMat,house);
 for(const x of [-3.9,-1.3,1.3,3.9]){box('Porch_pier',x,.61,4.2,.36,.62,.36,stone,frame);box('Porch_post',x,2.11,4.2,.14,2.42,.14,wood,frame);beam('Porch_rafter',[x,3.73,2.9],[x,3.21,4.55],.1,.12,wood,roof);}
 box('Porch_edge_beam',0,.84,4.2,8,.2,.15,wood,frame);box('Porch_header',0,3.25,4.2,8,.18,.16,wood,frame);
 const awning=box('Porch_roof',0,3.48,3.74,8.5,.11,1.85,wood,roof);awning.rotation.x=.305;
 for(let i=0;i<5;i++)box('Entry_step',0,.3+(i+1)*.15/2,5.82-i*.3,1.5,(i+1)*.15,.3,stone,house);
 for(const x of [-.88,.88]){beam('Stair_handrail',[x,1.18,5.96],[x,1.95,4.4],.05,.05,wood,frame);for(const z of [4.45,5.85])box('Stair_post',x,z<5?1.5:.78,z,.06,.9,.06,wood,frame);}
 for(const side of [-1,1]){const a=side<0?-3.95:1.0,b=side<0?-1.0:3.95;box('Porch_guardrail',(a+b)/2,2.12,4.35,b-a,.08,.06,wood,frame);for(let x=a;x<b;x+=.12)box('Porch_baluster',x,1.59,4.35,.035,1.02,.035,wood,frame);}
 // Living / dining / kitchen and rear rooms.
 box('Living_woven_rug',-2.25,1.062,1.45,2.6,.022,2.35,tatami,envelope);
 box('Low_table',-2.25,1.43,1.5,1.25,.09,.75,wood,envelope);for(const x of [-2.72,-1.78])for(const z of [1.26,1.74])box('Table_leg',x,1.25,z,.07,.35,.07,wood,envelope);
 for(const z of [.66,2.37])box('Floor_cushion',-2.25,1.13,z,.55,.13,.55,linen,envelope);
 box('Kitchen_base',3.48,1.5,1.38,.73,.9,1.9,wood,envelope,true);box('Kitchen_counter',3.48,1.98,1.38,.78,.06,1.96,stone,envelope);box('Induction_hob',3.48,2.022,1.88,.49,.025,.48,metal,envelope);box('Sink',3.48,2.021,.87,.48,.025,.43,metal,envelope);beam('Tap',[3.7,2.03,.87],[3.7,2.33,.87],.025,.025,metal,envelope);beam('Tap_spout',[3.7,2.33,.87],[3.48,2.33,.87],.025,.025,metal,envelope);
 box('Bed_frame',-2.45,1.2,-1.63,1.8,.3,2.15,wood,envelope,true);box('Mattress',-2.45,1.43,-1.63,1.72,.18,2.02,linen,envelope);box('Bed_cover',-2.45,1.55,-1.24,1.73,.05,1.18,tatami,envelope);for(const x of [-2.86,-2.06])box('Pillow',x,1.57,-2.27,.62,.13,.36,linen,envelope);
 box('Wardrobe',-3.57,2.06,-.57,.58,2.02,.8,wood,envelope,true);
 box('Bathroom_tile',1.1,1.07,-1.5,2.05,.04,2.85,stone,envelope);box('Shower_tray',1.57,1.12,-2.42,1.02,.1,.96,linen,envelope);box('Shower_screen',1.0,2.05,-2.42,.025,1.9,.94,glass,envelope);box('Washbasin_cabinet',.42,1.44,-2.42,.65,.78,.65,wood,envelope);box('Washbasin',.42,1.88,-2.42,.68,.1,.65,linen,envelope);box('Toilet_base',1.68,1.3,-.83,.4,.5,.65,linen,envelope);box('Toilet_cistern',1.68,1.65,-1.07,.4,.64,.2,linen,envelope);
 box('Service_cabinet',3.39,2.15,-2.61,.82,2.2,.56,wood,envelope,true);box('Laundry',3.39,1.5,-1.8,.65,.9,.64,linen,envelope,true);
 // Warm lanterns and lights.
 const glow=new T.MeshStandardMaterial({color:0xffd79b,emissive:0xffa342,emissiveIntensity:1.2,roughness:.8});glow.name='Lantern_paper';
 function lantern(x,y,z,parent=ground){box('Lantern_base',x,y,z,.3,.1,.3,wood,parent);box('Lantern_light',x,y+.23,z,.23,.38,.23,glow,parent);box('Lantern_cap',x,y+.45,z,.35,.07,.35,wood,parent);}
 for(const x of [-3.55,3.55])lantern(x,2.08,3.14,envelope);
 const lights=[];for(const [x,z] of [[-2,1.4],[2.1,1.2],[-2,-1.7],[1.1,-1.5]]){const l=new T.PointLight(0xffce89,10,6,2);l.position.set(x,3.2,z);house.add(l);lights.push(l);}
 // Independent footbridge across a 3m stream, 4.2m abutment span.
 const bx=-5.7;const bridge=new T.Group();bridge.name='Bridge_Concept';world.add(bridge);
 for(const z of [2.9,7.1])box('Bridge_abutment',bx,.13,z,2,.7,.65,stone,bridge);
 const bh=z=>.52+.34*Math.sin(Math.PI*(z-2.9)/4.2);
 for(let i=0;i<35;i++){const z=2.9+(i+.5)*4.2/35;const o=box('Bridge_deck_board',bx,bh(z),z,1.6,.085,.115,wood,bridge);o.rotation.x=Math.atan(.34*Math.PI/4.2*Math.cos(Math.PI*(z-2.9)/4.2));}
 for(const x of [bx-.67,bx+.67])for(let i=0;i<28;i++){const za=2.9+i*.15,zb=za+.15;beam('Bridge_stringer',[x,bh(za)-.17,za],[x,bh(zb)-.17,zb],.15,.26,red,bridge);}
 for(const x of [bx-.79,bx+.79]){for(let i=0;i<=35;i++){const z=2.9+i*.12;box('Bridge_baluster',x,bh(z)+.58,z,.038,1.08,.038,red,bridge);}for(let i=0;i<28;i++){const z=2.9+i*.15;beam('Bridge_handrail',[x,bh(z)+1.15,z],[x,bh(z+.15)+1.15,z+.15],.09,.09,red,bridge);}for(const z of [2.9,5,7.1])box('Bridge_main_post',x,bh(z)+.64,z,.13,1.3,.13,red,bridge);}
 for(const z of [2.7,7.3]){box('Bridge_approach',bx,.39,z,1.7,.18,.45,pathMat,ground);lantern(bx+1.2,.3,z);}
 // Moored wooden boat, formed hull instead of a floating rectangular block.
 const boat=new T.Group();boat.name='Moored_boat';boat.position.set(5.8,-.08,5.8);boat.rotation.y=-.23;world.add(boat);
 const hull=new T.Shape();hull.moveTo(-.45,-1.5);hull.quadraticCurveTo(-.95,0,-.45,1.25);hull.quadraticCurveTo(0,1.75,.45,1.25);hull.quadraticCurveTo(.95,0,.45,-1.5);hull.lineTo(-.45,-1.5);const hole=new T.Path();hole.moveTo(-.32,-1.3);hole.lineTo(.32,-1.3);hole.quadraticCurveTo(.75,0,.32,1.07);hole.quadraticCurveTo(0,1.5,-.32,1.07);hole.quadraticCurveTo(-.75,0,-.32,-1.3);hull.holes.push(hole);const hg=new T.ExtrudeGeometry(hull,{depth:.42,bevelEnabled:false});hg.rotateX(Math.PI/2);const ho=mesh('Boat_hull',hg,wood,boat);ho.position.y=.5;box('Boat_floor',0,.1,0,.85,.08,2.5,wood,boat);for(const z of [-.75,.35])box('Boat_seat',0,.35,z,1.1,.08,.23,edge,boat);
 // Deterministic landscape geometry and red spider lily filaments.
 let seed=137;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const rockGeo=new T.DodecahedronGeometry(1,0),rockMat=mat('River_stones',0x697a70);const rock=new T.InstancedMesh(rockGeo,rockMat,160);rock.name='Riverbank_rocks';ground.add(rock);rock.castShadow=true;rock.receiveShadow=true;const dummy=new T.Object3D();
 for(let i=0;i<160;i++){const x=rnd()*35-17.5,z=(i%2?3.3:6.7)+(rnd()-.5)*.6,s=.15+rnd()*.4;dummy.position.set(x,.06,z);dummy.scale.set(s*(1+rnd()),s,s);dummy.rotation.set(rnd(),rnd(),rnd());dummy.updateMatrix();rock.setMatrixAt(i,dummy.matrix);}
 const trunks=[],crowns=[];for(let i=0;i<88;i++){let x=rnd()*37-18.5,z=rnd()*28-15;if(z>-10&&z<10&&x>-10&&x<12){z=-11-rnd()*4;}const h=3+rnd()*5;trunks.push([x,z,h]);crowns.push([x,z,h]);}
 const tr=new T.InstancedMesh(new T.CylinderGeometry(.12,.2,1,6),wood,trunks.length),cr=new T.InstancedMesh(new T.ConeGeometry(1,1,9),mat('Forest_cedar',0x23453c),trunks.length*3);tr.name='Cedar_trunks';cr.name='Cedar_canopy';ground.add(tr,cr);tr.castShadow=cr.castShadow=true;
 trunks.forEach(([x,z,h],i)=>{dummy.position.set(x,.3+h/2,z);dummy.scale.set(1,h,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();tr.setMatrixAt(i,dummy.matrix);for(let j=0;j<3;j++){dummy.position.set(x,.3+h*.5+j*h*.2,z);dummy.scale.set(h*.29-j*.15,h*.65,h*.29-j*.15);dummy.updateMatrix();cr.setMatrixAt(i*3+j,dummy.matrix);}});
 const stems=new T.InstancedMesh(new T.CylinderGeometry(.009,.012,.56,4),mat('Lily_stems',0x455832),420);stems.name='Manjushage_stems';ground.add(stems);
 const petals=[];for(let k=0;k<6;k++){const a=k*Math.PI/3;const pts=[];for(let j=0;j<=7;j++){const t=j/7,r=.045+.20*t;pts.push(new T.Vector3(Math.cos(a)*r,.58+.13*Math.sin(t*Math.PI)-.02*t,Math.sin(a)*r));}petals.push(new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,.012,3,false));const ps=[];for(let j=0;j<=6;j++){const t=j/6,r=.24*t;ps.push(new T.Vector3(Math.cos(a+.25)*r,.61+.22*t-.10*t*t,Math.sin(a+.25)*r));}petals.push(new T.TubeGeometry(new T.CatmullRomCurve3(ps),6,.005,3,false));}
 const positions=[],normals=[];for(const g of petals){const ng=g.toNonIndexed();positions.push(...ng.attributes.position.array);normals.push(...ng.attributes.normal.array);}
 const flowerGeo=new T.BufferGeometry();flowerGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));flowerGeo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));const flower=new T.InstancedMesh(flowerGeo,mat('Manjushage_crimson',0xc33436),420);flower.name='Manjushage_flowers';ground.add(flower);
 for(let i=0;i<420;i++){let x=rnd()*30-15,z=(i%2?2.7:7.4)+(rnd()-.5)*1.5;if(Math.abs(x-bx)<1.2)x+=2.5;const s=.6+rnd()*.65;dummy.position.set(x,.3+.28*s,z);dummy.scale.set(s,s,s);dummy.rotation.set(0,rnd()*6.28,0);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);dummy.position.y=.3;dummy.updateMatrix();flower.setMatrixAt(i,dummy.matrix);}
 const grid=new T.GridHelper(12,12,0xd4b888,0x667873);grid.name='Structure_1m_grid';grid.position.set(3,1.06,-4);grid.visible=false;world.add(grid);
 world.updateMatrixWorld(true);return{world,house,roof,envelope,frame,ground,water,grid,lights,collisions};
}
