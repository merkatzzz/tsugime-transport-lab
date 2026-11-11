import * as THREE from '../vendor/three.module.js';import {BY_ID,boundaryWalls,footprint} from './architecture.js';import {CAPSULE_SLABS} from './stage11-layout.js';import {groupPose} from './pose.js';import {doorLeaf,doorJambEnds} from './doors.js';import {exposeBoxSurfaces} from './surfaces.js';
export function buildStage11Body(v,b,g){
 if(b.capsule){
  for(const r of CAPSULE_SLABS){const m=v.cube(g,r.x,3,r.z,r.w,.16,r.d,'#b5b9a7');m.userData.internalFloor=3;}
  for(let i=0;i<20;i++){const h=(i+1)*.15,z=6.6-(i+1)*.27;v.cube(g,5.4,.16,z,2.4,h,.27,'#9ca99e');}
  const rail=(a,b,base,h=.9)=>{const group=new THREE.Group();g.add(group);const n=8;for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=typeof base==='function'?base(t):base;v.cube(group,x-.025,y,z-.025,.05,h,.05,'metal');}const points=Array.from({length:21},(_,i)=>{const t=i/20;return new THREE.Vector3(a[0]+(b[0]-a[0])*t,(typeof base==='function'?base(t):base)+h,a[1]+(b[1]-a[1])*t);});const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.028,5,false),v.mats.metal);group.add(tube);};
  for(const x of[5.4,7.8]){rail([x,1.2],[x,6.6],3.16);rail([x,1.2],[x,6.6],t=>3.16-3*t);}rail([5.4,6.6],[7.8,6.6],3.16);
  v.text(g,'内部上階 +3m / 階段 ↑',4.6,2.35,7.81,{size:.18,rotation:Math.PI});
 }
 if(b.loadedInterior){v.cube(g,1.25,.16,5.5,.03,2.05,2,'dark');v.text(g,'研究所 / 二枚扉 E',1.1,2.55,6.5,{size:.26,rotation:-Math.PI/2});}
 if(b.id==='MK1'){for(const r of[{x:2.6,z:.3,w:3.2,d:2.4},{x:3.6,z:5.3,w:2.2,d:2.4}])v.cube(g,r.x,2.46,r.z,r.w,.12,r.d,'#9c8b71');}
 if(b.sharedHalf){v.text(g,b.id==='SH1'?'共同街路 / 西半':'共同街路 / 東半',b.id==='SH1'?5.88:2.12,2.1,1.2,{size:.2,rotation:b.id==='SH1'?Math.PI/2:-Math.PI/2});}
}
function makeLabScene(v){const b=BY_ID.LB1,scene=new THREE.Scene();scene.background=new THREE.Color('#c6d1cb');scene.add(new THREE.HemisphereLight('#f1f2de','#718984',2.8));const light=new THREE.DirectionalLight('#fff3d5',2);light.position.set(30,60,30);scene.add(light);const g=new THREE.Group();scene.add(g);for(const[x,z]of b.cells)v.floorTile(g,x*8,z*8,b.color);for(const l of boundaryWalls(b))v.wall(g,l,b.ceiling);v.wall(g,{a:[.06,5.5],b:[.06,7.5]},b.ceiling);for(const l of b.walls)v.wall(g,l,l.height??b.ceiling);for(const r of b.roofAreas)v.cube(g,r.x,r.height+.16,r.z,r.w,.16,r.d,'#c5cbbb');for(const r of b.furniture)v.cube(g,r.x,.16,r.z,r.w,r.h,r.d,'wood');const doors=[];
 for(const d of b.doors){const start=doorLeaf(d,0),len=Math.hypot(start.b[0]-start.a[0],start.b[1]-start.a[1]),hinge=new THREE.Group();hinge.position.set(start.a[0],0,start.a[1]);const angle=-Math.atan2(start.b[1]-start.a[1],start.b[0]-start.a[0]);hinge.rotation.y=angle;hinge.userData.target=d.id;g.add(hinge);const mesh=v.cube(hinge,0,.16,-.04,len,2.05,.08,'wood');v.wall(g,d,b.ceiling-2.05,'wall',.12,2.21);for(const end of doorJambEnds(b,d))v.cube(g,end[0]-.065,.16,end[1]-.065,.13,2.05,.13,'metal');doors.push({id:d.id,mesh,hinge,angle,swing:d.swing});}
 for(const label of b.labels)v.text(g,label.name,label.x,2.6,label.z,{size:.22});exposeBoxSurfaces(g,new Set(doors.map(d=>d.hinge)));v.labScene={scene,g,doors,bounds:footprint(b),buildCount:1};
}
export function stage11RenderScene(v){
 const visit=v.sim.experience.visit;if(visit?.testModel){const d=BY_ID.CP1.doors.find(d=>d.id===visit.door);if(!v.capsuleModel){const original=v.people.find(p=>p.n.id==='resident');v.capsuleModel=original.g.clone(true);v.capsuleModel.traverse(o=>{o.userData={...o.userData,target:'capsule-test-model'};});v.groups.CP1.add(v.capsuleModel);}v.capsuleModel.visible=true;v.capsuleModel.position.set(d.capsuleView.model.x,d.capsuleView.model.y+.16,d.capsuleView.model.z);v.capsuleModel.rotation.y=Math.PI/2;}else if(v.capsuleModel)v.capsuleModel.visible=false;
 if(!v.sim.loadedInterior||v.mode!=='explore')return v.scene;if(!v.labScene)makeLabScene(v);groupPose(v.labScene.g,v.sim.positions.LB1);for(const d of v.labScene.doors)d.hinge.rotation.y=d.angle-d.swing*Math.PI/180*(v.sim.experience.doorProgress[d.id]??0);return v.labScene.scene;
}
