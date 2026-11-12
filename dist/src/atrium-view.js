import * as THREE from '../vendor/three.module.js';
import {BASE,HOLE,SHAFT,FLOOR_PANELS,GLASS,GLASS_BAYS,subtractRects} from './atrium-layout.js';
import {atriumChannels,clamp} from './atrium-physics.js';
import {boundaryWalls,portSegment} from './architecture.js';
import {doorLeaf,doorJambEnds} from './doors.js';
import {exposeBoxSurfaces} from './surfaces.js';
const WHOLE={x:0,z:0,w:16,d:16};
function mechanism(parent,name){const g=new THREE.Group();g.userData.target='atrium:'+name;g.userData.atriumMechanism=name;parent.add(g);return g;}
export function buildAtriumBody(v,b,g){
 const tier=b.atrium,row={id:b.id,tier,floors:[],ceilings:[],guards:[],wells:[],collars:[],gates:[]};(v.atriumRows??=[]).push(row);
 const slabs=(rects,y,h,mat,roof=false)=>{for(const r of rects){const m=v.cube(g,r.x,y,r.z,r.w,h,r.d,mat);if(roof)v.roofs.push(m);}};
 const holes=tier>0?[HOLE,SHAFT,...GLASS_BAYS]:[{x:0,z:3,w:1.6,d:2}];
 const fixed=subtractRects(WHOLE,holes),foundation=tier>0?subtractRects(WHOLE,[{x:5.94,z:5.94,w:4.12,d:4.12},SHAFT,...GLASS_BAYS]):fixed;slabs(foundation,0,.16,'concrete');slabs(fixed,.54,.1,b.color);
 if(tier===0)for(let i=0;i<4;i++)v.cube(g,i*.4,i*.16,3,.4,.16,2,b.color);
 // Roof skins leave a real attic slot; sliding pieces never share an exposed plane.
 const roofHoles=tier<2?[HOLE,SHAFT]:[];slabs(subtractRects(WHOLE,roofHoles),5.76,.08,'concrete',true);slabs(subtractRects(WHOLE,tier<2?[{x:5.94,z:5.94,w:4.12,d:4.12},{x:11.94,z:2.74,w:2.52,d:5.82}]:[]),5.99,.01,'concrete',true);
 for(const l of boundaryWalls(b))v.wall(g,l,6,'wall',.12,0);
 for(const l of b.walls)v.wall(g,l,l.height,'wall',.12,BASE+.16);
 for(const f of b.furniture)v.cube(g,f.x,BASE+.16,f.z,f.w,f.h,f.d,'wood');
 for(const d of b.doors){const l=doorLeaf(d,0),len=Math.hypot(l.b[0]-l.a[0],l.b[1]-l.a[1]),h=mechanism(g,'door:'+d.id),angle=-Math.atan2(l.b[1]-l.a[1],l.b[0]-l.a[0]);h.position.set(l.a[0],BASE,l.a[1]);h.rotation.y=angle;const mesh=v.cube(h,0,.16,-.04,len,2.05,.08,'wood');v.doorMeshes.push({mesh,id:d.id,hinge:h,angle,swing:d.swing,definition:d});v.wall(g,d,1.35,'wall',.12,BASE+2.21);for(const p of doorJambEnds(b,d))v.cube(g,p[0]-.065,BASE+.16,p[1]-.065,.13,2.05,.13,'metal');}
 for(const p of b.ports){const l=portSegment(b,p),n=p.b-p.a,portal=new THREE.Group();portal.position.set((l.a[0]+l.b[0])/2,0,(l.a[1]+l.b[1])/2);portal.rotation.y=-Math.atan2(l.b[1]-l.a[1],l.b[0]-l.a[0]);g.add(portal);v.cube(portal,-n/2,p.height+.16,-.06,n,6-p.height-.16,.12,'wall');for(const x of[-n/2-.1,n/2])v.cube(portal,x,.16,-.14,.1,5.84,.28,'metal');v.cube(portal,-n/2-.1,p.height+.16,-.18,n+.2,.15,.36,'metal');const roll=mechanism(portal,'entry-shutter');v.cube(roll,-n/2,.16,-.045,n,p.height,.09,'metal');v.shutters.push({group:roll,id:b.id,port:p,height:p.height});}
 if(tier>0){
  for(const p of FLOOR_PANELS){const m=mechanism(g,'floor:'+p.id);v.cube(m,p.x,0,p.z,2,.1,2,b.color);row.floors.push({g:m,p});}
  const h=mechanism(g,'incoming-floor');for(let i=0;i<2;i++){const leaf=new THREE.Group();h.add(leaf);v.cube(leaf,SHAFT.x+i*1.2,0,SHAFT.z,1.2,.025,SHAFT.d,b.color);}row.incomingFloor=h;
  for(const [i,p]of GLASS_BAYS.entries()){const m=mechanism(g,'glass-well:'+i);v.cube(m,p.x,0,p.z,p.w,.02,p.d,b.color);row.wells.push({g:m,p,i});}
  const glass=new THREE.MeshStandardMaterial({color:'#8fc9c4',transparent:true,opacity:.28,roughness:.2,metalness:.02,side:THREE.DoubleSide,depthWrite:false});
  for(const [i,p]of GLASS.entries()){const root=mechanism(g,'glass:'+i),lower=new THREE.Group(),upper=new THREE.Group();root.position.set(p.x,0,p.z);root.rotation.y=p.rotation;root.add(lower);lower.add(upper);v.cube(lower,0,0,-.0125,2,.65,.025,glass);v.cube(upper,0,0,-.0125,2,.65,.025,glass);v.cube(lower,0,.62,-.02,2,.03,.04,'metal');v.cube(upper,0,.62,-.02,2,.03,.04,'metal');row.guards.push({root,lower,upper,i});}
  const incoming=mechanism(g,'incoming-stairs');for(let i=34;i<=40;i++){const h=BASE-6.4+i*.16;v.cube(incoming,12,h+.04,13.2-i*.26,2.4,.12,.26,b.color);}row.incoming=incoming;row.stairRails=[];for(let i=34;i<=40;i++)for(const x of[12,14.4]){const h=new THREE.Group();h.position.set(x,BASE-6.4+i*.16+.16,13.2-i*.26);incoming.add(h);const panel=v.cube(h,-.0125,0,0,.025,.9,.26,'metal');panel.userData.hinged=true;row.stairRails.push({h,sign:x===12?-1:1});}const liner=mechanism(g,'floor-reveals');for(const a of[[5.96,6,.04,4,.46],[10,6,.04,4,.46],[6,5.96,4,.04,.46],[6,10,4,.04,.46],[5.96,5.96,.04,.04,.38],[10,5.96,.04,.04,.38],[5.96,10,.04,.04,.38],[10,10,.04,.04,.38],[11.96,2.8,.04,5.7,.38],[14.4,2.8,.04,5.7,.38],[12,2.76,2.4,.04,.38],[12,8.5,2.4,.04,.38]])v.cube(liner,a[0],0,a[1],a[2],a[4],a[3],'metal');row.liner=liner;
  // The stored stair occupies a closed cabinet, outside every walking and hatch zone.
  for(const l of[{a:[8.15,2.75],b:[10.65,2.75]},{a:[8.15,4.67],b:[10.65,4.67]},{a:[8.15,2.75],b:[8.15,4.67]}])v.wall(g,l,1.30,'metal',.06,.64);v.cube(g,8.12,1.94,2.72,2.56,.06,1.98,'metal');
 }
 if(tier<2){
  for(const p of FLOOR_PANELS){const m=mechanism(g,'ceiling:'+p.id);v.cube(m,p.x,0,p.z,2,.16,2,'concrete');row.ceilings.push({g:m,p});v.roofs.push(m);}
  const hatch=mechanism(g,'stair-roof');v.cube(hatch,SHAFT.x,5.94,SHAFT.z,SHAFT.w,.04,SHAFT.d,'concrete');row.stairRoof=hatch;v.roofs.push(hatch);
  for(let i=1;i<=33;i++){const h=BASE+i*.16,z=13.2-i*.26;v.cube(g,12,h+.04,z,2.4,.12,.26,b.color);for(const x of[12,14.4]){const rail=Math.min(.9,5.70-h);if(rail>.02)v.cube(g,x-.025,h+.16,z,.05,rail,.05,'metal');}}
  const collar=mechanism(g,'central-collar');for(const a of[[5.94,5.94,.06,4.12],[10,5.94,.06,4.12],[6,5.94,4,.06],[6,10,4,.06]])v.cube(collar,a[0],0,a[1],a[2],.56,a[3],'metal');row.collars.push(collar);
  // Side cheeks seal the transport gap without crossing the stair walking line.
  const sleeve=mechanism(g,'stair-collar');for(const a of[[11.94,2.74,.06,5.82],[14.4,2.74,.06,5.82],[12,2.74,2.4,.06],[12,8.5,2.4,.06]])v.cube(sleeve,a[0],0,a[1],a[2],.4,a[3],'metal');row.collars.push(sleeve);
 }
 const gate=(z,y,h)=>{const m=mechanism(g,'stair-gate');m.position.set(14.4,0,z);v.cube(m,-2.4,y,-.035,2.4,h,.07,'metal');row.gates.push(m);};if(tier<2)gate(8.4,3.2,2);if(tier>0)gate(2.6,BASE+.16,1.3);
 const label=v.text(g,b.name,7,BASE+.17,14,{size:.35});label.rotation.x=-Math.PI/2;v.labels.push(label);
 v.surfaceStats??=[];v.surfaceStats.push(exposeBoxSurfaces(g));
}
export function renderAtrium(v){const c=atriumChannels(v.sim);for(const r of v.atriumRows??[]){
 for(const {g,p}of r.floors){const down=clamp(c.floor/.3),slide=clamp((c.floor-.3)/.7);g.position.set(p.dx*slide,.54-.32*down,p.floorDz*slide);}
 for(const {g,p}of r.ceilings){const down=clamp(c.ceiling/.3),slide=clamp((c.ceiling-.3)/.7);g.position.set(0,5.84-.24*down,p.dz*slide);}
 if(r.incomingFloor){const down=clamp(c.ceiling/.3),slide=clamp((c.ceiling-.3)/.7);r.incomingFloor.position.y=.615-.275*down;r.incomingFloor.children[0].position.x=-1.5*slide;r.incomingFloor.children[1].position.x=1.45*slide;}
 if(r.stairRoof)r.stairRoof.position.x=-3*c.ceiling;
 for(const {g,p,i}of r.wells){const down=clamp(c.well/.3),slide=clamp((c.well-.3)/.7),dx=i<2?-.9:i<4?0:i<6?.9:0,dz=i<2?0:i<4?-.9:i<6?0:.9;g.position.set(dx*slide,.62-.44*down,dz*slide);}
 for(const {root,lower,upper,i}of r.guards){const lift=clamp(c.guard/.5),unfold=clamp((c.guard-.5)/.5),theta=(1-unfold)*Math.PI/2,stored=i<2||i>=4&&i<6?.44:.50;root.position.y=stored+(.54-stored)*lift+.1*unfold;lower.rotation.x=theta;upper.position.set(0,.65,.04*Math.sin(theta));upper.rotation.x=-2*theta;}
 for(const g of r.collars){g.position.y=6-.1*(1-c.collar);g.scale.y=Math.max(.001,c.collar);}
 if(r.liner){r.liner.position.y=.16;r.liner.scale.y=Math.max(.001,c.stairs);}if(r.incoming)r.incoming.position.set(-3.8*(1-clamp(c.stairs/.5)),1.2*(1-clamp((c.stairs-.5)/.5)),0);
 for(const rail of r.stairRails??[])rail.h.rotation.z=rail.sign*(1-c.stairRails)*Math.PI/2;for(const g of r.gates)g.rotation.y=Math.PI/2*c.stairs;
 }}
