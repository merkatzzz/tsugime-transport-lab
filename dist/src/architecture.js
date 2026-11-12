import {addAtrium} from './atrium-layout.js';
import {expandStage11} from './stage11-layout.js';
import {compilePartitions} from './partitions.js';
import {redesignFacility,facilityPlacements} from './facility-plan.js';
import {WATER,waterPort,waterBoxes} from './water.js';
import {furnishShops} from './stage10-shops.js';
import {expandStage9,stage9Placements} from './stage9-layout.js';
import {expandStage8,stage8Placements} from './stage8-layout.js';
import {LOCAL_LIFT} from './local-lift-config.js';
import {repairResidentialWalls} from './stage8-walls.js';
import {potentialOpenings,WALL_ROLE} from './wall-roles.js';
import {redesign,redesignPlacements} from './stage7-layout.js';
import {doorLeaf} from './doors.js';
import {SPRINGS} from './infrastructure.js';
import {extendBodies,extensionPlacements} from './stage6-layout.js';
import {toWorld,toLocal,rotateFace,worldRect} from './pose.js';
// Geometry conventions: east +X, south +Z, vertical +Y. Port intervals increase in X for N/S and Z for E/W.
export const CELL=8,HEIGHT=6,DECK=6.4,LOWER_DECK=-6.4,LEVELS=[0,12.8,-12.8],RADIUS=.35,CLEAR_WIDTH=.82,CLEARANCE=.2,EYE=1.81,WALK_SPEED=3.6,RUN_SPEED=5.2;
export const LIFE_BOUNDS={x:0,z:0,w:134,d:66.8};
export const SIZES={same:{label:'拡張・基本搬送域',w:134,d:66.8},ring1:{label:'拡張・一回り',w:142.4,d:75.2},ring2:{label:'拡張・二回り',w:150.8,d:83.6}};
export const METHODS={serial:'空欄を再利用・順次',cooperative:'予約付き協調搬送'};
export const DEFAULT_EXPERIMENT={size:'ring1',method:'cooperative'},NEXT={A:'B',B:'C',C:'A'};
export const levelsFor=()=>LEVELS,decksFor=()=>[LOWER_DECK,DECK],LANDING={x:-2.4,z:2,w:2,d:4},SHAFT={x:-6.8,z:1.8,w:4.4,d:4.4};
export const levelName=y=>y===12.8?'第三層':y===0?'第二層':y===-12.8?'第一層':'搬送空間';
const line=(a,b)=>({a,b}),box=(x,z,w,d,h=1,color='wood')=>({x,z,w,d,h,color}),port=(id,face,a,b,height=2.1)=>({id,face,a,b,height}),room=(name,x,z)=>({name,x,z}),roof=(x,z,w,d,height)=>({x,z,w,d,height});
const crossSolids=(height)=>[box(0,0,3,3,height,'concrete'),box(5,0,3,3,height,'concrete'),box(0,5,3,3,height,'concrete'),box(5,5,3,3,height,'concrete')];
export const BODIES=[
 {id:'R1',name:'住戸301・参照地点',use:'residential',color:'#81a398',cells:[[0,0]],ceiling:2.6,
  ports:[port('W','W',3,5),port('E','E',3,5),port('S','S',3,5)],walls:[line([0,3.2],[3.4,3.2]),line([4.6,3.2],[8,3.2])],doors:[{id:'R1-door',a:[3.4,3.2],b:[4.6,3.2],open:false,label:'住戸301'}],
  solids:[box(0,5.4,3,2.6,2.6,'concrete'),box(5,5.4,3,2.6,2.6,'concrete')],furniture:[box(.5,.6,1.4,1.8,.5)],labels:[room('住戸301・起点',4,1.6),room('前廊下',4,4.4)],roofAreas:[roof(0,0,8,3.2,2.6),roof(0,3.2,8,4.8,2.3)]},
 {id:'R2',name:'住戸・分離した西通路',use:'residential',color:'#91aa91',cells:[[0,0]],ceiling:2.5,
  ports:[port('W-A','W',3,5),port('W-B','W',6,7.5),port('N','N',5,7),port('S','S',5,7),port('E','E',3,5)],
  walls:[line([3.5,2.8],[5,2.8]),line([6.2,2.8],[8,2.8])],doors:[{id:'R2-door',a:[5,2.8],b:[6.2,2.8],open:false,label:'小住戸'}],
  solids:[box(3,0,.5,8,2.5,'concrete'),box(0,0,3,2.75,2.5,'concrete'),box(0,5.4,3,.4,2.5,'concrete'),box(3.5,5.4,1.3,2.6,2.5,'concrete'),box(7.2,5.4,.8,2.6,2.5,'concrete')],
  furniture:[box(3.8,.5,1.4,1.6,.45)],labels:[room('西A・行止り',1.5,4),room('西B・独立',1.5,6.7),room('主通路',6,4.3)],roofAreas:[roof(0,0,3.5,8,2.3),roof(3.5,0,4.5,2.8,2.5),roof(3.5,2.8,4.5,5.2,2.3)]},
 {id:'R3',name:'個室201・南北通路',use:'residential',color:'#729e9c',cells:[[0,0]],ceiling:2.65,
  ports:[port('N','N',3,5),port('E','E',3,5),port('E-slit','E',6.1,6.6)],walls:[line([0,5],[4.6,5]),line([5.8,5],[8,5])],doors:[{id:'R3-door',a:[4.6,5],b:[5.8,5],open:false,label:'個室201'}],
  solids:[box(0,0,2.8,2.8,2.65,'concrete'),box(5.2,0,2.8,2.8,2.65,'concrete'),box(0,7.1,8,.9,2.65,'concrete')],furniture:[box(.5,5.4,1.4,1.5,.5)],labels:[room('南北廊下',4,3.8),room('個室201',4,6.2)],roofAreas:[roof(0,0,8,5,2.3),roof(0,5,8,3,2.65)]},
 {id:'R4',name:'低天井の居室・分岐',use:'residential',color:'#ad9981',cells:[[0,0]],ceiling:2.25,
  ports:[port('W','W',3,5),port('E','E',3,5),port('S','S',3,5)],walls:[line([0,2.9],[2.8,2.9]),line([4,2.9],[8,2.9])],doors:[{id:'R4-door',a:[2.8,2.9],b:[4,2.9],open:false,label:'小居室'}],
  solids:[box(0,5.3,3,2.7,2.25,'concrete'),box(5,5.3,3,2.7,2.25,'concrete')],furniture:[box(.4,.5,1.4,1.8,.45)],labels:[room('低天井居室',5.4,1.5),room('前廊下',4,4.2)],roofAreas:[roof(0,0,8,8,2.25)]},
 {id:'T1',name:'生活用品店・参照目的地',use:'commerce',color:'#c7a46d',cells:[[0,0],[1,0]],ceiling:3.8,
  ports:[port('W','W',3,5,2.8),port('E','E',3,5,2.8),port('S-east','S',11.4,13.4,2.8)],walls:[],doors:[],solids:[box(0,0,16,.5,3.8,'concrete')],furniture:[box(1,5.2,2.5,1.8,1.1),box(14,5.2,1.5,1.8,1.1),box(5.7,6.2,4.5,1,1)],labels:[room('生活用品店・目的地',7.2,5.4),room('店舗前通路',8,3.8)],roofAreas:[roof(0,0,16,3,3),roof(0,3,16,5,3.8)]},
 {id:'T2',name:'小売店・奥店舗',use:'commerce',color:'#bb925e',cells:[[0,0],[1,0]],ceiling:3.4,
  ports:[port('W','W',3,5,2.5),port('E','E',3,5,2.5),port('S-west','S',3,5,2.5)],walls:[line([8,3.4],[10,3.4]),line([11.2,3.4],[16,3.4]),line([8,3.4],[8,8])],doors:[{id:'T2-door',a:[10,3.4],b:[11.2,3.4],open:false,label:'奥店舗'}],
  solids:[box(0,0,16,.8,3.4,'concrete'),box(5,5.4,2.8,2.6,3.4,'concrete')],furniture:[box(.5,5.7,1,1.8,1.2),box(12,6,2.5,1,1)],labels:[room('小売店',3,4.5),room('奥店舗',11,5)],roofAreas:[roof(0,0,16,3.4,2.8),roof(0,3.4,8,4.6,3),roof(8,3.4,8,4.6,3.4)]},
 {id:'H1',name:'四連結の共用広間',use:'common',color:'#839eb8',cells:[[0,0],[1,0],[0,1],[1,1]],ceiling:5.4,
  ports:[port('N-west','N',3,5,3),port('W-north','W',3,5,3),port('W-south','W',11.4,13.4,3),port('E-north','E',3,5,3)],walls:[],doors:[],solids:[],furniture:[box(2,6,2,1,.5),box(2,12,2,1,.5),box(11,6,3,1,.5),box(11,12,3,1,.5)],labels:[room('共用通路',8,4),room('共同広間 H5.4m',8,9)],roofAreas:[roof(0,0,16,16,5.4)]},
 {id:'L1',name:'三連結L字集会室',use:'common',color:'#9796ae',cells:[[0,0],[1,0],[0,1]],ceiling:4.5,
  ports:[port('W','W',3,5,2.8),port('N-west','N',3,5,2.8),port('N-east','N',11.4,13.4,2.8),port('S','S',3,5,2.8)],walls:[line([8,6],[13,1]),line([10.1,7.9],[14.5,3.5])],doors:[],solids:[],furniture:[box(1,10,1.3,4,.6),box(5,12,1.5,1,.6)],labels:[room('集会室',4,4),room('45°区間',11.5,4.5),room('休憩翼',4.5,11)],roofAreas:[roof(0,0,16,8,4.5),roof(0,8,8,8,3.2)]},
 {id:'J1',name:'単独T字廊下・南北枝',use:'corridor',color:'#a5ac7c',cells:[[0,0]],ceiling:2.4,
  ports:[port('N','N',3,5,2.2),port('E','E',3,5,2.2),port('S','S',3,5,2.2)],walls:[],doors:[],solids:[box(0,0,3,8,2.4,'concrete'),box(5,0,3,3,2.4,'concrete'),box(5,5,3,3,2.4,'concrete')],furniture:[],labels:[room('T字廊下 J1',4,4)],roofAreas:[roof(0,0,8,8,2.4)]},
 {id:'J2',name:'単独分岐廊下・環状路節点',use:'corridor',color:'#a0b184',cells:[[0,0]],ceiling:2.6,
  ports:[port('W','W',3,5,2.3),port('E','E',3,5,2.3),port('N','N',3,7,2.3),port('S','S',5,7,2.3)],walls:[],doors:[],solids:[box(0,0,3,3,2.6,'concrete'),box(7,0,1,3,2.6,'concrete'),box(0,5,5,3,2.6,'concrete'),box(7,5,1,3,2.6,'concrete')],furniture:[],labels:[room('分岐 J2',5,4)],roofAreas:[roof(0,0,8,8,2.6)]},
 {id:'J3',name:'単独交差廊下・配置可変',use:'corridor',color:'#b3b78a',cells:[[0,0]],ceiling:2.4,
  ports:[port('N','N',3,5,2.2),port('S','S',3,5,2.2),port('W','W',3,5,2.2),port('E','E',3,5,2.2)],walls:[],doors:[],solids:crossSolids(2.4),furniture:[],labels:[room('交差廊下 J3',4,4)],roofAreas:[roof(0,0,8,8,2.4)]},
 {id:'C0',name:'予備T字廊下・近道',use:'corridor',color:'#b7b56b',cells:[[0,0]],ceiling:2.4,
  ports:[port('W','W',3,5,2.2),port('E','E',3,5,2.2),port('S','S',3,5,2.2)],walls:[],doors:[],solids:[box(0,0,8,3,2.4,'concrete'),box(0,5,3,3,2.4,'concrete'),box(5,5,3,3,2.4,'concrete')],furniture:[],labels:[room('近道 C0',4,4)],roofAreas:[roof(0,0,8,8,2.4)]}
];
// Four new one-cell bodies; each keeps its own room and bent entrance with it.
for(const [id,name,color]of[['E1','東翼・個室401','#9aa58c'],['E2','東翼・読書室','#a8a08c'],['E3','東翼・個室402','#8da7a0'],['E4','東翼・作業室','#9b9eae']])BODIES.push({id,name,use:'residential',color,cells:[[0,0]],ceiling:2.7,ports:[port('W','W',3,5,2.3),port('E','E',3,5,2.3)],walls:[line([0,2.7],[4.5,2.7]),line([5.7,2.7],[8,2.7]),line([1.8,5.8],[4,7.2])],doors:[{id:id+'-door',a:[4.5,2.7],b:[5.7,2.7],open:false,label:name}],solids:[box(0,5.1,1.6,2.9,2.7,'concrete'),box(6,6,2,2,2.7,'concrete')],furniture:[box(.5,.5,1.4,1.8,.5),box(6.5,.4,1,.8,.9)],labels:[room(name,4,1.4),room('東翼通路',4,4.2)],roofAreas:[roof(0,0,8,2.7,2.7),roof(0,2.7,8,5.3,2.35)]});
// Narrow visible booth opening: 0.50m < player's 0.70m diameter.
const booth=BODIES.find(b=>b.id==='R3');
booth.walls.push(line([2.8,5],[2.8,5.9]),line([2.8,6.4],[2.8,7.1]));
booth.furniture.push(box(.4,6.85,2.2,.2,1.2));
booth.labels.push(room('簡易個室・住人',1.5,6.2));
// Stage 5: two independently enclosed two-cell halves of the former H1.
const hall=BODIES.find(b=>b.id==='H1'),hallOriginal=structuredClone(hall);
hall.name='共用広間・北半 H1';hall.cells=[[0,0],[1,0]];hall.furniture=hallOriginal.furniture.filter(f=>f.z<8);hall.labels=[room('広間 北半',8,4)];hall.roofAreas=[roof(0,0,16,8,5.4)];hall.ports=hallOriginal.ports.filter(p=>p.id!=='W-south');hall.ports.push(port('S-join','S',1,15,4.8));
BODIES.push({...hallOriginal,id:'H2',name:'共用広間・南半 H2',cells:[[0,0],[1,0]],ports:[port('N-join','N',1,15,4.8),port('W-north','W',3,5,3),port('S','S',3,5,2.5)],furniture:hallOriginal.furniture.filter(f=>f.z>=8).map(f=>({...f,z:f.z-8})),labels:[room('広間 南半',8,4)],roofAreas:[roof(0,0,16,8,5.4)]});
for(const id of ['E1','E3'])BODIES.find(b=>b.id===id).ports.push(port('S','S',4,6,2.5));
// A small but walkable first layer: room, four-way branch, mobile landing room.
BODIES.push({...structuredClone(BODIES.find(b=>b.id==='R4')),id:'K1',name:'第一層・小居室と前廊下',color:'#aa9d8d',doors:[{id:'K1-door',a:[2.8,2.9],b:[4,2.9],open:false,label:'第一層の小居室'}],labels:[room('第一層 小居室',5.4,1.5),room('EV前廊下',4,4.2)]});
BODIES.push({...structuredClone(BODIES.find(b=>b.id==='J3')),id:'K2',name:'第一層・交差通路',color:'#a3b58d',labels:[room('第一層 分岐',4,4)]});
BODIES.push({id:'M1',name:'上下搬送・小交流室',use:'common',color:'#bba58d',cells:[[0,0]],ceiling:3,ports:[port('W','W',3,5,2.5),port('N','N',3,5,2.5),port('E','E',3,5,2.5)],walls:[],doors:[],solids:[],furniture:[box(1,1,1.5,1,.5),box(6,6,1,1,.8)],labels:[room('上下搬送 M1',4,4)],roofAreas:[roof(0,0,8,8,3)]});
extendBodies(BODIES);redesign(BODIES);repairResidentialWalls(BODIES);expandStage8(BODIES);expandStage9(BODIES);furnishShops(BODIES);expandStage11(BODIES);addAtrium(BODIES);redesignFacility(BODIES);BODIES.forEach(compilePartitions);
BODIES.find(b=>b.id==='P9').ports.push(port('water-east','E',11.6,14,2.5));
BODIES.find(b=>b.id==='N3').ports.push(port('water-west','W',3,5,2.5));
export const BY_ID=Object.fromEntries(BODIES.map(b=>[b.id,b]));
export const PHASES={A:{label:'密集建築・住戸から店舗へ迂回'},B:{label:'予備廊下C0を挿入・近道と環状路'},C:{label:'近道を撤収・別の南北経路へ'}};
const dock=(x,z,level)=>({x:x*8.4,z:z*8.4,y:LEVELS[level]});
export const storageFor=e=>({x:50.4,y:DECK,z:0});
export function legacyPlacements(phase,e=DEFAULT_EXPERIMENT){const p={R1:dock(0,0,1),R2:dock(1,phase==='B'?2:0,1),R3:dock(0,phase==='C'?1:2,1),R4:dock(0,0,0),T1:dock(2,0,1),T2:dock(2,0,0),H1:phase==='B'?dock(0,1,0):dock(2,1,1),L1:phase==='B'?dock(2,1,1):dock(phase==='C'?1:2,1,0),J1:dock(0,phase==='C'?2:1,1),J2:dock(1,1,1),J3:phase==='C'?dock(0,1,0):dock(1,0,0),C0:phase==='B'?dock(1,0,1):storageFor(e)};p.E1=dock(4,0,phase==='B'?0:1);p.E3=dock(4,0,phase==='B'?1:0);p.E2=dock(5,0,phase==='C'?0:1);p.E4=dock(5,0,phase==='C'?1:0);p.H2=phase==='B'?{x:33.6,y:0,z:8.4}:{x:16.8,y:12.8,z:16.8};p.K1=dock(0,0,2);p.K2=dock(1,0,2);p.M1=phase==='B'?dock(4,2,0):dock(2,0,2);return stage9Placements(phase,stage8Placements(phase,redesignPlacements(phase,Object.assign(p,extensionPlacements(phase)))));}
export const placements=(phase,e=DEFAULT_EXPERIMENT)=>facilityPlacements(phase,legacyPlacements(phase,e));
export const POINTS={home:{body:'R1',x:4,z:1.6,name:'住戸301'},shop:{body:'T1',x:7.2,z:5.4,name:'生活用品店'}};
export const footprint=b=>({w:(Math.max(...b.cells.map(c=>c[0]))+1)*8,d:(Math.max(...b.cells.map(c=>c[1]))+1)*8});
export const insideBody=(b,x,z)=>b.cells.some(([cx,cz])=>x>=cx*8-1e-8&&x<=cx*8+8+1e-8&&z>=cz*8-1e-8&&z<=cz*8+8+1e-8);
export function perimeter(b){const out=[],has=(x,z)=>b.cells.some(c=>c[0]===x&&c[1]===z);for(const[x,z]of b.cells){if(!has(x,z-1))out.push({face:'N',a:[x*8,z*8],b:[x*8+8,z*8]});if(!has(x,z+1))out.push({face:'S',a:[x*8,z*8+8],b:[x*8+8,z*8+8]});if(!has(x-1,z))out.push({face:'W',a:[x*8,z*8],b:[x*8,z*8+8]});if(!has(x+1,z))out.push({face:'E',a:[x*8+8,z*8],b:[x*8+8,z*8+8]});}return out;}
export const planeFor=(b,p)=>p.plane??(p.face==='N'||p.face==='W'?0:p.face==='S'?footprint(b).d:footprint(b).w);
export function portSegment(b,p,inset=.2){const f=planeFor(b,p);return p.face==='N'?line([p.a,f+inset],[p.b,f+inset]):p.face==='S'?line([p.a,f-inset],[p.b,f-inset]):p.face==='W'?line([f+inset,p.a],[f+inset,p.b]):line([f-inset,p.a],[f-inset,p.b]);}
export function portalJambs(b,p){if(!p.adaptive)return[];const outer=portSegment(b,{...p,a:p.a-.05,b:p.b+.05},0),inner=portSegment(b,{...p,a:p.a-.05,b:p.b+.05},.9);const cuts=[...new Set((p.profiles??[]).flat())].filter(x=>x>p.a&&x<p.b),extra=cuts.map(x=>{const a=portSegment(b,{...p,a:x,b:x},0),c=portSegment(b,{...p,a:x,b:x},.9);return{a:a.a,b:c.a};});return[{a:outer.a,b:inner.a},{a:outer.b,b:inner.b},...extra];}
export function boundaryWalls(b){const walls=[];for(const edge of perimeter(b)){const axis=edge.face==='N'||edge.face==='S'?0:1,other=1-axis,cuts=b.ports.filter(p=>p.face===edge.face&&Math.abs(planeFor(b,p)-edge.a[other])<1e-7).flatMap(p=>potentialOpenings(p).map(([a,b])=>[Math.max(edge.a[axis],a),Math.min(edge.b[axis],b)])).filter(([a,c])=>c>a).sort((a,c)=>a[0]-c[0]);let at=edge.a[axis];for(const[a,c]of[...cuts,[edge.b[axis],edge.b[axis]]]){if(a>at){const aa=[...edge.a],bb=[...edge.b];aa[axis]=at;bb[axis]=a;const v=edge.face==='N'||edge.face==='W'?.06:-.06;aa[other]+=v;bb[other]+=v;walls.push({...line(aa,bb),role:WALL_ROLE.SHELL});}at=Math.max(at,c);}}return walls;}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export const defaultDoors=()=>Object.fromEntries(BODIES.flatMap(b=>b.doors.map(d=>[d.id,d.open])));
const localCollisionCache=new Map();
export function localClear(b,x,z,doors=defaultDoors(),radius=RADIUS){if(!insideBody(b,x,z))return false;const key=b.id+b.doors.map(d=>doors[d.id]??d.open).join('');let colliders=localCollisionCache.get(key);if(!colliders){colliders={lines:[...boundaryWalls(b),...b.ports.flatMap(p=>portalJambs(b,p)),...b.walls.filter(l=>!(l.floor>0)),...b.doors.filter(d=>!(d.floor>0)).map(d=>doorLeaf(d,(doors[d.id]??d.open)?1:0))],solids:[...b.solids,...b.furniture].filter(s=>!(s.floor>0))};localCollisionCache.set(key,colliders);}for(const l of colliders.lines)if(segmentDistance(x,z,l.a,l.b)<radius+.06-1e-7)return false;for(const s of colliders.solids)if(Math.hypot(Math.max(s.x-x,0,x-s.x-s.w),Math.max(s.z-z,0,z-s.z-s.d))<radius+.01)return false;return true;}
const navCache=new Map();
export function localNavigation(b,doors=defaultDoors()){const key=b.id+b.doors.map(d=>doors[d.id]??d.open).join('');if(navCache.has(key))return navCache.get(key);const step=.25,f=footprint(b),nx=f.w/step,nz=f.d/step,labels=new Int16Array(nx*nz).fill(-1),free=new Uint8Array(nx*nz),components=[];for(let z=0;z<nz;z++)for(let x=0;x<nx;x++)free[z*nx+x]=localClear(b,(x+.5)*step,(z+.5)*step,doors)?1:0;
 for(let start=0;start<free.length;start++)if(free[start]&&labels[start]===-1){const id=components.length,q=[start];labels[start]=id;for(let h=0;h<q.length;h++){const k=q[h],x=k%nx,z=Math.floor(k/nx);for(const[xx,zz]of[[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){const j=zz*nx+xx;if(xx>=0&&xx<nx&&zz>=0&&zz<nz&&free[j]&&labels[j]===-1){labels[j]=id;q.push(j);}}}components.push({id,cells:q.length});}
 const componentAt=(x,z)=>{let best=null,d=Infinity;const gx=Math.floor(x/step),gz=Math.floor(z/step);for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const xx=gx+dx,zz=gz+dz;if(xx<0||xx>=nx||zz<0||zz>=nz)continue;const k=zz*nx+xx;if(labels[k]<0)continue;const dd=Math.hypot((xx+.5)*step-x,(zz+.5)*step-z);if(dd<d){d=dd;best=labels[k];}}return d<.6?best:null;};
 const ports={};for(const p of b.ports){const components=new Set((p.profiles??[[p.a,p.b]]).map(([a,c])=>{const l=portSegment(b,{...p,a,b:c},p.navInset??.9),x=(l.a[0]+l.b[0])/2,z=(l.a[1]+l.b[1])/2;return localClear(b,x,z,doors)?componentAt(x,z):null;}).filter(c=>c!==null));ports[p.id]=components.size===1?[...components][0]:null;}const result={step,nx,nz,labels,components,ports,componentAt};navCache.set(key,result);return result;
}
export const regionAt=(id,x,z,doors)=>{const c=localNavigation(BY_ID[id],doors).componentAt(x,z);return c===null?null:`${id}/${c}`;};
export const overlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
export function worldPorts(phase,e=DEFAULT_EXPERIMENT,doors=defaultDoors()){const pos=placements(phase,e),out=WATER.map(waterPort);for(const b of BODIES){const q=pos[b.id],level=LEVELS.findIndex(y=>Math.abs(q.y-y)<.01),nav=localNavigation(b,doors);for(const p of b.ports){const comp=nav.ports[p.id],l=portSegment(b,p,0),aa=toWorld(q,{x:l.a[0],z:l.a[1]}),bb=toWorld(q,{x:l.b[0],z:l.b[1]}),face=rotateFace(p.face,q.angle),ns=['N','S'].includes(face),v1=ns?aa.x:aa.z,v2=ns?bb.x:bb.z;out.push({...p,localFace:p.face,face,reversed:v2<v1,body:b.id,key:`${b.id}:${p.id}`,node:comp===null?null:`${b.id}/${comp}`,level,y:q.y,plane:ns?aa.z:aa.x,start:Math.min(v1,v2),end:Math.max(v1,v2)});}}
 for(const y of LOCAL_LIFT.levels){const i=LEVELS.indexOf(y);out.push({id:'E',body:'LF'+i,key:'LF'+i+':E',face:'E',a:1,b:3,node:'LF'+i,level:i,y,height:2.5,plane:-.4+LOCAL_LIFT.offset.x,start:3+LOCAL_LIFT.offset.z,end:5+LOCAL_LIFT.offset.z});}
 for(let level=0;level<LEVELS.length;level++)out.push({id:'E',body:`F${level}`,key:`F${level}:E`,face:'E',a:1,b:3,node:`F${level}`,level,y:LEVELS[level],height:2.5,plane:-.4,start:3,end:5});return out;}
export const localInterval=(p,start,end)=>p.reversed?[p.b-(end-p.start),p.b-(start-p.start)]:[p.a+start-p.start,p.a+end-p.start];
export const supportsInterval=(p,start,end)=>!p.profiles||p.profiles.some(([a,b])=>{const v=localInterval(p,start,end);return Math.abs(v[0]-a)<.01&&Math.abs(v[1]-b)<.01;});
const graphCache=new Map();
export function connections(phase,e=DEFAULT_EXPERIMENT,doors=defaultDoors()){const key=phase+e.size+Object.entries(doors).sort().map(([k,v])=>k+v).join('');if(graphCache.has(key))return graphCache.get(key);const ports=worldPorts(phase,e,doors),out=[];for(const p of ports)for(const q of ports){if(p.body===q.body||p.level<0||p.level!==q.level)continue;const ew=p.face==='E'&&q.face==='W',ns=p.face==='S'&&q.face==='N';if(!ew&&!ns)continue;const gap=q.plane-p.plane;if(gap<.39||gap>.81)continue;const width=overlap([p.start,p.end],[q.start,q.end]);if(width<1e-7)continue;const start=Math.max(p.start,q.start),height=Math.min(p.height,q.height),supported=(!p.cycles||p.cycles.includes(phase))&&(!q.cycles||q.cycles.includes(phase))&&supportsInterval(p,start,start+width)&&supportsInterval(q,start,start+width),status=p.node&&q.node&&supported?(width>=CLEAR_WIDTH&&height>=2?'pass':'view'):'blocked',bridge=ew?{x:p.plane,z:start,w:gap,d:width,orientation:'EW'}:{x:start,z:p.plane,w:width,d:gap,orientation:'NS'};out.push({id:`${p.key}|${q.key}`,a:p.node,b:q.node,bodyA:p.body,bodyB:q.body,portA:p.id,portB:q.id,faceA:p.face,faceB:q.face,width,height,gap,permanent:!!(p.permanent&&q.permanent),reason:supported?'':'unsupported-adapter-profile',start,end:start+width,y:p.y,level:p.level,status,bridge:{...bridge,y:p.y}});}graphCache.set(key,out);return out;}
export function extendLocalLiftReach(seen){const nodes=LOCAL_LIFT.levels.map(y=>'LF'+LEVELS.indexOf(y));let changed=false;if(nodes.some(n=>seen.has(n)))for(const node of nodes)if(!seen.has(node)){seen.add(node);changed=true;}return changed;}
export function reachable(phase,e,doors){const seen=new Set(LEVELS.map((_,i)=>`F${i}`)),edges=connections(phase,e,doors).filter(c=>c.status==='pass');let changed=true;while(changed){changed=extendLocalLiftReach(seen);for(const c of edges){if(seen.has(c.a)&&!seen.has(c.b)){seen.add(c.b);changed=true;}if(seen.has(c.b)&&!seen.has(c.a)){seen.add(c.a);changed=true;}}}return seen;}
export const reachableBodies=(phase,e,doors)=>new Set([...reachable(phase,e,doors)].filter(n=>n.includes('/')).map(n=>n.split('/')[0]));
export const isolated=(phase,e,doors)=>BODIES.filter(b=>LEVELS.some(y=>Math.abs(placements(phase,e)[b.id].y-y)<.01)&&!reachableBodies(phase,e,doors).has(b.id)).map(b=>b.id);
const portsCache=new Map();
export let architectureRevision=0;
export function invalidateArchitecture(){architectureRevision++;localCollisionCache.clear();navCache.clear();graphCache.clear();portsCache.clear();}
export function portStates(phase,e=DEFAULT_EXPERIMENT,doors=defaultDoors()){const key=phase+e.size+Object.keys(doors).sort().map(k=>k+doors[k]).join('');if(portsCache.has(key))return portsCache.get(key);const links=connections(phase,e,doors);const result=worldPorts(phase,e,doors).map(p=>{const matches=links.filter(c=>`${c.bodyA}:${c.portA}`===p.key||`${c.bodyB}:${c.portB}`===p.key),origin=p.start-p.a,openings=matches.filter(c=>c.status!=='blocked').map(c=>({a:p.reversed?p.b-(c.end-p.start):c.start-origin,b:p.reversed?p.b-(c.start-p.start):c.end-origin,height:c.height,status:c.status,id:c.id})).sort((a,b)=>a.a-b.a),masked=[];let at=p.a;for(const q of[...openings,{a:p.b,b:p.b}]){if(q.a>at+1e-7)masked.push({a:at,b:q.a});at=Math.max(at,q.b);}return {...p,status:matches.some(c=>c.status==='pass')?'pass':matches.some(c=>c.status==='view')?'view':'blocked',matches,openings,masked};});portsCache.set(key,result);return result;}
export const localLiftFixedFootprints=y=>LOCAL_LIFT.levels.includes(y)?[LOCAL_LIFT.shaft,{x:LOCAL_LIFT.offset.x+LANDING.x,z:LOCAL_LIFT.offset.z+LANDING.z,w:LANDING.w,d:LANDING.d}]:[];
export function emptyDocks(phase,e){const pos=placements(phase,e),out=[];for(const y of LEVELS){const cells=BODIES.filter(b=>Math.abs(pos[b.id].y-y)<.01).flatMap(b=>b.cells.map(([x,z])=>({x:pos[b.id].x+x*8,z:pos[b.id].z+z*8,w:8,d:8}))),xs=[...new Set([0,LIFE_BOUNDS.w,...cells.flatMap(c=>[c.x,c.x+c.w])])].sort((a,b)=>a-b),zs=[...new Set([0,LIFE_BOUNDS.d,...cells.flatMap(c=>[c.z,c.z+c.d])])].sort((a,b)=>a-b);for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=xs[i],z=zs[j],w=xs[i+1]-x,d=zs[j+1]-z;if([...SPRINGS.filter(p=>p.y===y),...localLiftFixedFootprints(y)].some(p=>x<p.x+p.w&&x+w>p.x&&z<p.z+p.d&&z+d>p.z))continue;if(w<1e-6||d<1e-6)continue;if(!cells.some(c=>x+w/2>c.x&&x+w/2<c.x+c.w&&z+d/2>c.z&&z+d/2<c.z+c.d))out.push({x,y,z,w,d,floor:false,kind:Math.min(w,d)<.9?'mechanical-clearance':'empty-dock'});}}return out;}
export function emptyDockCells(phase,e){const p=placements(phase,e),out=[];for(const y of LEVELS)for(let z=0;z*8.4+8<=LIFE_BOUNDS.d+1e-6;z++)for(let x=0;x*8.4+8<=LIFE_BOUNDS.w+1e-6;x++)if(!BODIES.some(b=>Math.abs(p[b.id].y-y)<.01&&insideBody(b,x*8.4+4-p[b.id].x,z*8.4+4-p[b.id].z))&&![...SPRINGS.filter(p=>p.y===y),...localLiftFixedFootprints(y)].some(p=>x*8.4<p.x+p.w&&x*8.4+8>p.x&&z*8.4<p.z+p.d&&z*8.4+8>p.z))out.push({col:x,row:z,x:x*8.4,z:z*8.4,y,w:8,d:8,floor:false});return out;}

// Walking connectivity and return-service safety intentionally remain separate.
export function serviceReachable(phase,e=DEFAULT_EXPERIMENT,doors=defaultDoors()){
 const seen=reachable(phase,e,doors),edges=connections(phase,e,doors).filter(c=>c.status==='pass');
 if(phase==='B'&&edges.some(c=>[c.bodyA,c.bodyB].includes('S1')&&[c.bodyA,c.bodyB].includes('D1'))){const returnWalk=reachable('C',e,doors);if([...returnWalk].some(n=>n.startsWith('S1/')))for(const c of localNavigation(BY_ID.S1,doors).components)seen.add('S1/'+c.id);}
 let changed=true;while(changed){changed=false;for(const c of edges){if(seen.has(c.a)&&!seen.has(c.b)){seen.add(c.b);changed=true;}if(seen.has(c.b)&&!seen.has(c.a)){seen.add(c.a);changed=true;}}}return seen;
}

// Real deck slots, not inhabited floor. Fixed water reservations are excluded at each elevation.
export function emptyTransportCells(phase,e=DEFAULT_EXPERIMENT,y=DECK){const p=placements(phase,e),b=e.bounds??SIZES[e.size],out=[];for(let z=0;z+8<=b.d+.001;z+=8.4)for(let x=0;x+8<=b.w+.001;x+=8.4){if(waterBoxes().some(q=>q.min[1]<y+6&&q.max[1]>y&&x<q.max[0]&&x+8>q.min[0]&&z<q.max[2]&&z+8>q.min[2]))continue;if([...SPRINGS.map(q=>({...q,h:6})),{...SHAFT,y:-13,h:32},...LOCAL_LIFT.levels.map(yy=>({...LOCAL_LIFT.shaft,y:yy,h:6})),...LEVELS.map(yy=>({...LANDING,y:yy,h:6})),...BODIES.flatMap(q=>q.cells.map(([cx,cz])=>({...worldRect(p[q.id],{x:cx*8,z:cz*8,w:8,d:8}),y:p[q.id].y,h:6})))].some(q=>q.y<y+6-.001&&q.y+q.h>y+.001&&x<q.x+q.w-.001&&x+8>q.x+.001&&z<q.z+q.d-.001&&z+8>q.z+.001))continue;out.push({x,y,z,w:8,d:8,floor:false});}return out;}
