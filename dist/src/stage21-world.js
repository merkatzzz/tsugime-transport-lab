import * as THREE from '../vendor/three.module.js';
import {FaultWorld} from './fault-physics.js';
import {RAIL_NODES,RAIL_EDGES} from './stage21-rail.js';

const vec=p=>new THREE.Vector3(...p);
function material(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.86,...extra});}
function box(scene,id,x,y,z,w,h,d,color,physical=true){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));
  mesh.position.set(x+w/2,y+h/2,z+d/2);mesh.userData.owner=id;mesh.userData.nonPhysical=!physical;scene.add(mesh);return mesh;
}
function floor(scene,id,x,z,w,d,top){return box(scene,id,x,top-.3,z,w,.3,d,0x718179);}
function tube(scene,points,radius,color,physical=false){
  const path=new THREE.CatmullRomCurve3(points.map(vec));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,points.length*6,radius,7,false),material(color));
  mesh.userData.nonPhysical=!physical;scene.add(mesh);return mesh;
}
function label(scene,text,x,y,z,rotation=0){
  if(!globalThis.document?.createElement)return;
  const c=document.createElement('canvas'),ctx=c.getContext?.('2d');if(!ctx)return;
  c.width=768;c.height=128;ctx.fillStyle='#1e302c';ctx.fillRect(0,0,768,128);ctx.fillStyle='#e4dec5';ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,78,730);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.6),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.userData.nonPhysical=true;scene.add(mesh);
}
function light(scene,x,y,z,intensity=18){const l=new THREE.PointLight(0xf3d5b0,intensity,12,1.6);l.position.set(x,y,z);scene.add(l);}
function worldFromScene(scene){
  const triangles=[];scene.updateMatrixWorld(true);
  scene.traverse(m=>{
    if(!m.isMesh||!m.visible)return;
    for(let p=m;p;p=p.parent)if(p.userData.nonPhysical)return;
    const a=m.geometry.attributes.position,index=m.geometry.index;
    for(let i=0;i<(index?.count??a.count);i+=3){
      const points=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(m.matrixWorld));
      const t=new THREE.Triangle(...points);if(t.getArea()<1e-9)continue;
      t.owner=m.userData.owner??'side';t.kind='floor';triangles.push(t);
    }
  });
  return new FaultWorld(triangles);
}
function pickup(result,id,name,x,y,z,collectible=true,shape='part'){
  const mesh=shape==='canister'?new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.55,8),material(0x9bad98)):new THREE.Mesh(new THREE.BoxGeometry(.45,.2,.35),material(shape==='paper'?0xc9bc91:0x8b7d67));
  mesh.position.set(x,y,z);mesh.userData.nonPhysical=true;result.scene.add(mesh);
  result.objects.push({id,name,x,y,z,collectible,mesh});
}
function platform(result,id){
  const [x,y,z]=RAIL_NODES[id].p,top=y+.12;
  floor(result.scene,id,x-4,z+.85,8,6.15,top);
  for(const dx of[-4,3.88])box(result.scene,id,x+dx,top,z+.85,.12,1.1,6.15,0x434e47);
  if(id==='base'||id==='parasite')for(const[dx,w]of[[-4,3],[1,3]])box(result.scene,id,x+dx,top,z+6.88,w,1.1,.12,0x434e47);
  else box(result.scene,id,x-4,top,z+6.88,8,1.1,.12,0x434e47);
  const spawn={x,y:top-.16,z:z+2,yaw:Math.PI,pitch:0};result.stations[id]=spawn;
  label(result.scene,RAIL_NODES[id].name,x,top+2,z+6.8,Math.PI);light(result.scene,x,top+2.8,z+3,10);
  return {x,y,z,top};
}
function caveShell(scene,edge){
  // Omit the duplicated common approach of each branch in the visual rail pair.
  const shell=new THREE.TubeGeometry(edge.curve,90,5.3,12,false),p=shell.attributes.position;
  for(let i=0;i<p.count;i++){
    const j=Math.floor(i/13),center=edge.curve.getPointAt(j/90),v=new THREE.Vector3().fromBufferAttribute(p,i).sub(center);
    v.multiplyScalar(1+.045*Math.sin(i*1.73)+.07*Math.sin(j*.48));p.setXYZ(i,center.x+v.x,center.y+v.y,center.z+v.z);
  }
  shell.computeVertexNormals();const skin=new THREE.Mesh(shell,material(0x702d35,{side:THREE.BackSide,roughness:.65}));skin.userData.nonPhysical=true;scene.add(skin);
  const start=edge.branch?4:0;
  for(const side of[-1,1]){
    const pts=[];for(let d=start;d<edge.length+.001;d+=.7){const u=Math.min(1,d/edge.length),q=edge.curve.getPointAt(u),t=edge.curve.getTangentAt(u);pts.push(new THREE.Vector3(q.x+side*.37*t.z,q.y+.055,q.z-side*.37*t.x));}
    pts.push(edge.curve.getPointAt(1).add(new THREE.Vector3(side*.37*edge.curve.getTangentAt(1).z,.055,-side*.37*edge.curve.getTangentAt(1).x)));
    const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),Math.ceil(edge.length*3),.045,5,false),material(0x9b9989,{metalness:.55}));rail.userData.nonPhysical=true;scene.add(rail);
  }
  for(let d=start;d<edge.length;d+=1.5){const q=edge.curve.getPointAt(d/edge.length),t=edge.curve.getTangentAt(d/edge.length),s=box(scene,'track',q.x-.65,q.y-.1,q.z-.08,1.3,.1,.16,0x4c5149,false);s.rotation.y=Math.atan2(t.x,t.z);}
  for(let i=1;i<7;i++){
    const q=edge.curve.getPointAt(i/7),t=edge.curve.getTangentAt(i/7),side=i%2?1:-1,n={x:t.z*side,z:-t.x*side};
    tube(scene,[[q.x+n.x*4.5,q.y-1,q.z+n.z*4.5],[q.x+n.x*4.1,q.y+2.5,q.z+n.z*4.1],[q.x+n.x*2.2,q.y+4.1,q.z+n.z*2.2]],.22,0xc6bba2);
    tube(scene,[[q.x-n.x*4.7,q.y-2,q.z-n.z*4.7],[q.x-n.x*4.2+1,q.y+1,q.z-n.z*4.2],[q.x-n.x*4.8,q.y+3,q.z-n.z*4.8]],.11,0x9c3348);
  }
}
function railMap(result){
  const s=result.scene,groups={};
  for(const e of RAIL_EDGES)caveShell(s,e);
  for(const id of['entry','observe','parasite','base']){
    const group=new THREE.Group();groups[id]=group;s.add(group);
    const p=platform({...result,scene:group},id),cavity=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),material(0x692d34,{side:THREE.BackSide,roughness:.65}));
    cavity.position.set(p.x+3,p.y+1,p.z+5);cavity.scale.set(id==='base'?18:15,11,id==='base'?21:16);cavity.userData.nonPhysical=true;group.add(cavity);
  }
  const a=RAIL_NODES.observe.p,os=groups.observe;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(6.2,.8,9,22),material(0x9b3b42));ring.rotation.x=Math.PI/2;ring.position.set(a[0],a[1]-6,a[2]-8);ring.userData.nonPhysical=true;os.add(ring);
  result.observation={center:[a[0],a[1]-6,a[2]-8],ringRadius:6.2,identity:'unconfirmed-organ'};
  const deep=new THREE.Mesh(new THREE.SphereGeometry(6.8,18,12),material(0x4a1725,{side:THREE.BackSide}));deep.position.set(a[0],a[1]-13,a[2]-8);deep.scale.y=1.8;deep.userData.nonPhysical=true;os.add(deep);
  for(let i=0;i<9;i++){const t=i*Math.PI*2/9;tube(os,[[a[0]+Math.cos(t)*6,a[1]-5,a[2]-8+Math.sin(t)*6],[a[0]+Math.cos(t)*4,a[1]-10,a[2]-8+Math.sin(t)*4],[a[0]+Math.cos(t)*2,a[1]-15,a[2]-8+Math.sin(t)*2]],.2,0xc6bba2);}
  const b=RAIL_NODES.parasite.p,top=b[1]+.12,ps=groups.parasite;
  floor(ps,'parasite',b[0]-4,b[2]+7,24,8,top);
  for(const dz of[7,14.85])box(ps,'parasite',b[0]-4,top,b[2]+dz,24,2.8,.15,0x78837b);
  for(const dx of[-4,4,12,19.85]){
    if(dx===-4||dx===19.85)box(ps,'parasite',b[0]+dx,top,b[2]+7,.15,2.8,8,0x78837b);
    else for(const [z,d]of[[7,2.8],[11.3,3.7]])box(ps,'parasite',b[0]+dx,top,b[2]+z,.15,2.8,d,0x78837b);
  }
  // Opening between the arrival platform and the first room.
  const front=ps.children.find(o=>o.userData.owner==='parasite'&&Math.abs(o.position.z-(b[2]+7.075))<.01&&o.geometry?.parameters.width===24);
  if(front){ps.remove(front);front.geometry.dispose();front.material.dispose();}
  for(const [x,w]of[[-4,3],[1,19]])box(ps,'parasite',b[0]+x,top,b[2]+7,w,2.8,.15,0x78837b);
  for(const dx of[0,8,16]){const p=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,1),material(0x744b6d));p.position.set(b[0]+dx,top+.5,b[2]+11);p.userData.nonPhysical=true;ps.add(p);tube(ps,[[b[0]+dx-.5,top+.1,b[2]+11],[b[0]+dx,top+.9,b[2]+11.4],[b[0]+dx+.5,top+.1,b[2]+11]],.07,0x6e8157);}
  result.parasiteRooms={count:3,cellMetres:8,combatIntegrated:false};
  label(ps,'無人区域 / 試験生物・戦闘未統合',b[0]+8,top+2,b[2]+14.7,Math.PI);
  const c=RAIL_NODES.base.p,y=c[1]+.12;
  floor(s,'base',c[0]-4,c[2]+7,21,10,y);
  box(s,'base',c[0]-4,y,c[2]+16.85,21,2.8,.15,0x6a7770);
  for(const x of[-4,16.85])box(s,'base',c[0]+x,y,c[2]+7,.15,2.8,10,0x6a7770);
  for(const x of[2,9])for(const [z,d]of[[8,2],[12,5]])box(s,'base',c[0]+x,y,c[2]+z,.12,2.7,d,0x6a7770);
  box(s,'base',c[0]-2,y,c[2]+13,2,.5,2.6,0x99856e);
  box(s,'base',c[0]+4,y,c[2]+14,3,.9,1,0x788a7f);
  box(s,'base',c[0]+11,y,c[2]+14,2,.7,1.6,0x8c7d69);
  label(s,'居住 / 仮配置',c[0]-1,y+2,c[2]+16.7,Math.PI);
  label(s,'回復設備の設置場所 / 供給設定未確定',c[0]+5,y+2,c[2]+16.7,Math.PI);
  label(s,'趣味・作業 / 仮配置',c[0]+12,y+2,c[2]+16.7,Math.PI);
  result.baseZones=[{id:'living',x:c[0]-3,z:c[2]+10},{id:'recovery-location',x:c[0]+5,z:c[2]+11},{id:'hobby-work',x:c[0]+12,z:c[2]+11},{id:'salvage',x:c[0]+14,z:c[2]+9}];
  pickup(result,'base-scrap','回収部品（試料）',c[0]+14,y+.35,c[2]+9);
  label(s,'回収場所',c[0]+14,y+1.8,c[2]+8,0);
  result.entry={x:-2,z:3,y:-19.88};
  box(s,'entry',-3,-19.88,3.5,1,2,.3,0x667973);label(s,'地上へ / 仮の旧EV',-2.5,-17.7,3.4,0);
  for(const id of['j1','j2']){const p=RAIL_NODES[id].p;light(s,p[0]+2,p[1]+2,p[2],6);box(s,id,p[0]+2,p[1],p[2]+1,.2,1,.2,0xa7a18a,false);}
  // Align platforms and their rooms with the incoming tangent, outside the swept track.
  for(const id of ['observe','parasite']){
    const group=groups[id],n=vec(RAIL_NODES[id].p),edge=RAIL_EDGES.find(e=>e.b===id),t=edge.curve.getTangentAt(1),angle=Math.atan2(t.x,t.z)-Math.PI/2;
    for(const o of group.children)o.position.sub(n);
    group.position.copy(n);group.rotation.y=angle;
    const spawn=result.stations[id],point=new THREE.Vector3(spawn.x,spawn.y,spawn.z).sub(n).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(n);
    Object.assign(spawn,{x:point.x,y:point.y,z:point.z,yaw:spawn.yaw+angle});
    if(id==='observe')result.observation.center=vec(result.observation.center).sub(n).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(n).toArray();
  }
  result.spawn={...result.stations.entry};
}
function water(scene,x,z,w,d,y){return box(scene,'water',x,y-.025,z,w,.025,d,0x476e66,false);}
function canalMap(result,upper){
  const s=result.scene;
  if(!upper){
    floor(s,'home',0,0,12,3.7,0);floor(s,'bed',0,3.7,12,2.3,-.8);water(s,0,3.7,12,2.3,-.4);
    box(s,'home',0,0,0,12,3,.2,0x7d8c83);box(s,'home',0,-.8,5.85,12,3.8,.15,0x7d8c83);
    box(s,'home',0,0,0,.2,3,3.7,0x7d8c83);box(s,'home',11.85,0,0,.15,3,3.7,0x7d8c83);
    box(s,'culvert',10,-.8,3.7,2,1.8,.15,0x65786f,false);box(s,'culvert',10,.9,3.7,2,.2,2.3,0x65786f,false);
    label(s,'固定用水路 / 潜水地点 E',8,1.8,5.7,Math.PI);light(s,6,3,2,24);
    result.spawn={x:4,y:-.16,z:2.5,yaw:Math.PI/2,pitch:0};result.dive={x:8,z:3.2,y:0,to:'canal-upper'};
  }else{
    floor(s,'lower',0,0,11,3.8,0);
    // The wall itself supports the upper walkway. Real top surfaces are 6m and 16m.
    box(s,'upper',11,-.3,0,21,6.3,4.25,0x7c8b82);
    box(s,'upper',11,-.3,4.25,21,5.6,1.75,0x7c8b82);
    box(s,'beyond',32,5.7,0,7,10.3,6,0x566a61);
    for(const z of[0,5.85]){
      box(s,'lower',0,0,z,11,5,.15,0x687c72);
      box(s,'upper',11,z===0?6:5.3,z,28,z===0?14:14.7,.15,0x687c72);
    }
    box(s,'lower',0,0,0,.15,5,6,0x687c72);
    floor(s,'waterbed',0,3.8,10.9,1.9,-.8);water(s,.2,3.8,10.7,1.9,-.4);
    // Recessed channel sits on the upper retaining block, beside the walking strip.
    water(s,11,4.4,20.95,1.35,5.7);
    box(s,'upper',11,6,4.25,20.95,.25,.12,0x5c7368);
    result.anchors=[
      {body:'lower',kind:'frame',key:'lower:wall-edge',y:0,a:{x:11,z:.6},b:{x:11,z:4},n:{x:1,z:0}},
      {body:'upper',kind:'frame',key:'upper:six-metre-top',y:6,a:{x:11,z:.6},b:{x:11,z:4},n:{x:-1,z:0}},
      {body:'upper',kind:'frame',key:'upper:high-wall-foot',y:6,a:{x:32,z:.6},b:{x:32,z:4},n:{x:1,z:0}},
      {body:'beyond',kind:'frame',key:'beyond:ten-metre-top',y:16,a:{x:32,z:.6},b:{x:32,z:4},n:{x:-1,z:0}}
    ];
    pickup(result,'shell','寄生生物の殻',18,6.28,2.7,false);
    pickup(result,'canister','空の携帯型順応気体容器（試料）',21,6.3,2.5,true,'canister');
    pickup(result,'feed','餌を連想させる包材',24,6.2,2.8,false);
    pickup(result,'memo','記録紙（仮の回収品）',26,6.14,2.5,true,'paper');
    pickup(result,'old-part','古い部品',28,6.2,3.3,false);
    tube(s,[[34,17,5],[35,20,5.5],[38,22,4]],.5,0x743b42);
    box(s,'hint',35,16,2,1,3,.4,0x4c5e58,false);
    label(s,'6m / Qで登る・Cで戻る',10.9,3.4,2,Math.PI/2);
    label(s,'高壁 10m / 現行アームでは到達不可',31.9,9,2.5,Math.PI/2);
    label(s,'戻る潜水地点 E',2,1.5,5.7,Math.PI);
    light(s,7,3,2,20);light(s,20,9,2,16);
    result.spawn={x:2,y:-.16,z:2.7,yaw:Math.PI/2,pitch:0};result.dive={x:2,z:3.2,y:0,to:'canal-home'};
    result.eventZone={x:29.5,z:2.5,radius:1.3};result.water={x:11,z:4.4,w:20.95,d:1.35,y:5.7};
  }
}
export function buildStage21Map(id){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x0d1413);
  scene.add(new THREE.HemisphereLight(0xa5b8ae,0x241317,.24));
  const result={id,scene,anchors:[],objects:[],stations:{}};
  if(id==='rail-ground'){
    floor(scene,'ground',-4,-2,8,9,0);
    for(const x of[-1.6,1.45])box(scene,'lift',x,0,-1.5,.15,3,3.5,0x61726c);
    box(scene,'lift',-1.6,0,-1.5,3.2,3,.15,0x61726c);
    box(scene,'lift',-1.6,3,-1.5,3.2,.2,3.5,0x61726c);
    label(scene,'地下交通試験 / 仮の旧EV E',0,2.2,-1.3,0);light(scene,0,3,3,28);
    result.spawn={x:0,y:-.16,z:3,yaw:Math.PI,pitch:0};result.entry={x:0,y:0,z:1};
  }else if(id==='rail')railMap(result);
  else if(id==='canal-home'||id==='canal-upper')canalMap(result,id==='canal-upper');
  else throw Error('Unknown Stage21 map: '+id);
  result.world=worldFromScene(scene);
  if(!result.world.clear(result.spawn)||!result.world.support(result.spawn,.03))throw Error('Invalid map spawn: '+id);
  return result;
}
export function disposeStage21Map(map){
  map.world.dispose();const geometries=new Set(),materials=new Set();
  map.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});
}
export {worldFromScene};
