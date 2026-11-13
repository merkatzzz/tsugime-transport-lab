import {ring} from './atrium-mesh.js';
import {INCOMING_RAIL_X,STAIR_CASE,HOLES,OFFSET,CEILING_PANELS,expandedHoles,GLASS as BANDS,incomingStairPose,leafPose,stairHatchPose} from './atrium-shape.js';
import{gateDefinitions,gateLeaves}from'./atrium-gates.js';
import * as THREE from '../vendor/three.module.js';
import {BASE,HOLE,SHAFT,FLOOR_PANELS,GLASS,GLASS_BAYS,ENTRY_RAMP,subtractRects} from './atrium-layout.js';
import {atriumChannels,clamp} from './atrium-physics.js';
import {boundaryWalls,portSegment} from './architecture.js';
import {doorLeaf,doorJambEnds} from './doors.js';
import {exposeBoxSurfaces} from './surfaces.js';
const WHOLE={x:0,z:0,w:16,d:16};
function mechanism(parent,name){const g=new THREE.Group();g.userData.target='atrium:'+name;g.userData.atriumMechanism=name;parent.add(g);return g;}
export function buildAtriumBody(v,b,g){
 const tier=b.atrium,row={id:b.id,tier,floors:[],ceilings:[],guards:[],wells:[],collars:[],gates:[]};(v.atriumRows??=[]).push(row);
 const slabs=(rects,y,h,mat,roof=false)=>{for(const r of rects){const m=v.cube(g,r.x,y,r.z,r.w,h,r.d,mat);if(roof)v.roofs.push(m);}};
 const holes=tier>0?[...expandedHoles(.10),SHAFT] :[ENTRY_RAMP];
 const fixed=subtractRects(WHOLE,holes),foundation=tier>0?subtractRects(WHOLE,[...expandedHoles(OFFSET),SHAFT]):fixed;slabs(foundation,0,.16,'concrete');slabs(fixed,.54,.1,b.color);
 if(tier===0){const r={...ENTRY_RAMP,x:ENTRY_RAMP.landing,w:ENTRY_RAMP.w-ENTRY_RAMP.landing};v.cube(g,0,0,r.z,ENTRY_RAMP.landing,.16,r.d,b.color);const verts=[r.x,0,r.z,r.x+r.w,0,r.z,r.x+r.w,0,r.z+r.d,r.x,0,r.z+r.d,r.x,.16,r.z,r.x+r.w,BASE+.16,r.z,r.x+r.w,BASE+.16,r.z+r.d,r.x,.16,r.z+r.d],geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geom.setIndex([0,1,2,0,2,3,4,6,5,4,7,6,0,5,1,0,4,5,3,2,6,3,6,7,0,3,7,0,7,4,1,5,6,1,6,2]);geom.computeVertexNormals();const ramp=new THREE.Mesh(geom,v.material(b.color,b.color));ramp.userData.atriumRamp=true;g.add(ramp);}
 // Roof skins leave a real attic slot; sliding pieces never share an exposed plane.
 const roofHoles=tier<2?[...expandedHoles(OFFSET),SHAFT]:[];slabs(subtractRects(WHOLE,roofHoles),5.76,.08,'concrete',true);slabs(subtractRects(WHOLE,tier<2?[...expandedHoles(OFFSET),{x:11.94,z:2.74,w:2.52,d:5.82}]:[]),5.99,.01,'concrete',true);
 for(const l of boundaryWalls(b))v.wall(g,l,6,'wall',.12,0);
 for(const l of b.walls)v.wall(g,l,l.height,'wall',.12,BASE+.16);
 for(const f of b.furniture)v.cube(g,f.x,BASE+.16,f.z,f.w,f.h,f.d,'wood');
 for(const r of b.roomCeilings??[]){const m=v.cube(g,r.x,r.y,r.z,r.w,r.h,r.d,'concrete');m.userData.privateCeiling=true;v.roofs.push(m);}
 for(const d of b.doors){const l=doorLeaf(d,0),len=Math.hypot(l.b[0]-l.a[0],l.b[1]-l.a[1]),h=mechanism(g,'door:'+d.id),angle=-Math.atan2(l.b[1]-l.a[1],l.b[0]-l.a[0]);h.position.set(l.a[0],BASE,l.a[1]);h.rotation.y=angle;const mesh=v.cube(h,0,.16,-.04,len,2.05,.08,'wood');v.doorMeshes.push({mesh,id:d.id,hinge:h,angle,swing:d.swing,definition:d});v.wall(g,d,1.35,'wall',.12,BASE+2.21);for(const p of doorJambEnds(b,d))v.cube(g,p[0]-.065,BASE+.16,p[1]-.065,.13,2.05,.13,'metal');}
 for(const p of b.ports){const l=portSegment(b,p),n=p.b-p.a,portal=new THREE.Group();portal.position.set((l.a[0]+l.b[0])/2,0,(l.a[1]+l.b[1])/2);portal.rotation.y=-Math.atan2(l.b[1]-l.a[1],l.b[0]-l.a[0]);g.add(portal);v.cube(portal,-n/2,p.height+.16,-.06,n,6-p.height-.16,.12,'wall');for(const x of[-n/2-.1,n/2])v.cube(portal,x,.16,-.14,.1,5.84,.28,'metal');v.cube(portal,-n/2-.1,p.height+.16,-.18,n+.2,.15,.36,'metal');const roll=mechanism(portal,'entry-shutter');v.cube(roll,-n/2,.16,-.045,n,p.height,.09,'metal');v.shutters.push({group:roll,id:b.id,port:p,height:p.height});}
 if(tier>0){
  for(const p of FLOOR_PANELS){const m=mechanism(g,'floor:'+p.id);v.cube(m,p.x,0,p.z,p.w,p.h,p.d,b.color);row.floors.push({g:m,p});}
  const h=mechanism(g,'incoming-floor');for(let i=0;i<2;i++){const leaf=new THREE.Group();h.add(leaf);v.cube(leaf,SHAFT.x+i*1.2,0,SHAFT.z,1.2,.025,SHAFT.d,b.color);}row.incomingFloor=h;
  // Four telescopic bands occupy separate 16mm slots; deck strips stay fixed.
  for(const [lo,hi]of [[0,.006],[.022,.028],[.044,.050],[.066,.072],[.088,.10]])ring(v,g,lo,hi,.54,.10,'metal');
  const glass=new THREE.MeshStandardMaterial({color:'#b8dcda',transparent:true,opacity:.12,roughness:.12,metalness:0,side:THREE.DoubleSide,depthWrite:false});
  for(const p of BANDS){const root=mechanism(g,'glass:'+p.i);ring(v,root,p.offset-.006,p.offset+.006,0,p.i===3?p.height-.012:p.height,glass,{top:p.i!==3});if(p.i===3)ring(v,root,p.offset-.007,p.offset+.007,p.height-.012,.012,'metal');row.guards.push({root,p});}
  const liner=mechanism(g,'floor-reveals');row.liner=liner;row.linerBands=[];
  ring(v,g,.394,OFFSET,.15,.01,'metal');
  for(let i=0;i<4;i++){const band=new THREE.Group();liner.add(band);ring(v,band,.4+i*.018,.412+i*.018,0,.11,'metal');row.linerBands.push({g:band,i});const stair=new THREE.Group();liner.add(stair);const d=i*.008,o={x:SHAFT.x-d-.006,z:SHAFT.z-d-.006,w:SHAFT.w+2*d+.012,d:SHAFT.d+2*d+.012},inner={x:SHAFT.x-d,z:SHAFT.z-d,w:SHAFT.w+2*d,d:SHAFT.d+2*d};for(const a of subtractRects(o,[inner]))v.cube(stair,a.x,0,a.z,a.w,.11,a.d,'metal');row.linerBands.push({g:stair,i});}
  const incoming=mechanism(g,'incoming-stairs');for(let i=34;i<=40;i++){const h=BASE-6.4+i*.16;v.cube(incoming,12,h+.04,13.2-i*.26,2.4,.12,.26,b.color);}row.incoming=incoming;row.stairRails=[];for(let i=34;i<=40;i++)for(const x of INCOMING_RAIL_X){const h=new THREE.Group();h.position.set(x,BASE-6.4+i*.16+.173,13.2-i*.26);incoming.add(h);const panel=v.cube(h,-.0125,0,0,.025,.9,.26,'metal');panel.userData.hinged=true;row.stairRails.push({h,sign:x<13?-1:1});}
  // The incoming treads park beneath the fixed flight, not in a room-side box.
  for(const a of STAIR_CASE){const m=v.cube(g,a.x,.64,a.z,a.w,a.h,a.d,'metal');m.userData.stairCase=true;}

 }
 if(tier<2){
  for(const p of CEILING_PANELS){const m=mechanism(g,'ceiling:'+p.id);v.cube(m,p.x,0,p.z,p.w,p.h,p.d,'concrete');row.ceilings.push({g:m,p});v.roofs.push(m);}
  const hatch=mechanism(g,'stair-roof');for(let i=0;i<2;i++){const leaf=new THREE.Group();hatch.add(leaf);v.cube(leaf,SHAFT.x+i*1.2,0,SHAFT.z,1.2,.03,SHAFT.d,'concrete');}row.stairRoof=hatch;v.roofs.push(hatch);
  for(let i=1;i<=33;i++){const h=BASE+i*.16,z=13.2-i*.26;v.cube(g,12,h+.04,z,2.4,.12,.26,b.color);for(const x of[12,14.4]){const rail=Math.min(.9,5.70-h);if(rail>.02)v.cube(g,x-.025,h+.16,z,.05,rail,.05,'metal');}}
  const collar=mechanism(g,'central-collar');collar.userData.telescopic=true;for(let i=0;i<3;i++){const g=new THREE.Group();g.userData.stroke=i;collar.add(g);ring(v,g,OFFSET-.06+i*.02,OFFSET-.04+i*.02,0,.20,'metal');}row.collars.push(collar);
  // Side cheeks seal the transport gap without crossing the stair walking line.
  const sleeve=mechanism(g,'stair-collar');for(const a of[[11.94,2.74,.06,5.82],[14.4,2.74,.06,5.82],[12,2.74,2.4,.06],[12,8.5,2.4,.06]])v.cube(sleeve,a[0],0,a[1],a[2],.4,a[3],'metal');row.collars.push(sleeve);
 }
 for(const d of gateDefinitions(tier)){const root=mechanism(g,'stair-gate:'+d.id),leaves=[];for(let i=0;i<6;i++){const h=new THREE.Group();root.add(h);v.cube(h,.19,d.bottom,-.015,.02,d.height,.03,'metal');for(const dy of[0,d.height/2,d.height-.04])v.cube(h,.04,d.bottom+dy,-.015,.32,.04,.03,'metal');const pin=new THREE.Mesh(new THREE.CylinderGeometry(.0175,.0175,d.height+.02,12),v.mats.metal);pin.position.set(0,d.bottom+d.height/2,0);h.add(pin);exposeBoxSurfaces(h);leaves.push(h);}row.gates.push({root,d,leaves});}
 const label=v.text(g,b.name,7,BASE+.17,14,{size:.35});label.rotation.x=-Math.PI/2;v.labels.push(label);
 v.surfaceStats??=[];v.surfaceStats.push(exposeBoxSurfaces(g));
}
export function renderAtrium(v){const c=atriumChannels(v.sim);for(const r of v.atriumRows??[]){
 for(const {g,p}of r.floors){const q=leafPose(p,c.floor,.64-p.h);g.position.set(q.x,q.y,q.z);}
 for(const {g,p}of r.ceilings){const q=leafPose(p,c.ceiling,5.93);g.position.set(q.x,q.y,q.z);}
 for(const [i,g]of (r.incomingFloor?.children??[]).entries()){const q=stairHatchPose(i,c.ceiling);g.position.set(q.x,q.y,q.z);}
 for(const [i,g]of (r.stairRoof?.children??[]).entries()){const q=stairHatchPose(i,c.ceiling,true);g.position.set(q.x,q.y,q.z);}
 for(const {root,p}of r.guards)root.position.y=p.storedY+(p.deployedY-p.storedY)*c.guard;
 for(const g of r.collars){if(g.userData.telescopic){for(const h of g.children){const i=h.userData.stroke;h.position.y=5.3+i*.008+(6+i*.175-5.3-i*.008)*c.collar;}}else{g.position.y=5.9+.1*c.collar;g.scale.y=Math.max(.001,c.collar);}}
 for(const {g,i}of r.linerBands??[])g.position.y=.16+i*.004+i*.086*c.stairs;
 if(r.incoming){const q=incomingStairPose(c.stairs);r.incoming.position.set(q.x,q.y,q.z);}
 for(const rail of r.stairRails??[])rail.h.rotation.z=rail.sign*(1-c.stairRails)*Math.PI/2;for(const gate of r.gates){const poses=gateLeaves(gate.d,c.gate);gate.leaves.forEach((g,i)=>{g.position.set(poses[i].x,0,poses[i].z);g.rotation.y=poses[i].rotation;});}
 }}
