// East +X, south +Z, vertical +Y. Interiors and transport envelopes are independent.
export const CELL=8,HEIGHT=6,GAP=.4,CLEARANCE=.2,DECK=6.4,LEVELS=[0,12.8],RADIUS=.35,CLEAR_WIDTH=.82,EYE=1.81;
export const LIFE_BOUNDS={x:0,z:0,w:49.2,d:24.4};
export const SIZES={same:{label:'同程度',w:49.2,d:24.4},ring1:{label:'一回り',w:57.6,d:32.8},ring2:{label:'二回り',w:66,d:41.2},generous:{label:'研究用・十分な空間',w:66,d:49.6}};
export const METHODS={serial:'空欄を再利用・順次',cooperative:'協調搬送・1デッキ',vertical:'高さ退避・2デッキ'};
export const DEFAULT_EXPERIMENT={size:'same',method:'cooperative'};
export const levelsFor=e=>[0,e?.method==='vertical'?19.2:12.8];
export const decksFor=e=>e?.method==='vertical'?[6.4,12.8]:[6.4];
const line=(a,b,kind='wall')=>({a,b,kind}),box=(x,z,w,d,h=1,color='wood')=>({x,z,w,d,h,color}),port=(face,a,b,height=2.1)=>({face,a,b,height}),room=(name,x,z)=>({name,x,z}),roof=(x,z,w,d,height)=>({x,z,w,d,height});
export const BODIES=[
 {id:'R1',name:'個室301＋前廊下',use:'residential',color:'#81a398',cells:[[0,0]],ceiling:2.6,
  ports:[port('W',1,3),port('E',1,3)],walls:[line([0,3.25],[2.5,3.25]),line([3.7,3.25],[8,3.25])],
  doors:[{id:'R1-door',a:[2.5,3.25],b:[3.7,3.25],open:true,label:'個室301'}],
  solids:[box(0,0,8,.65,2.6,'concrete'),box(6.8,3.3,1.2,4.7,2.6,'concrete'),box(0,7.25,6.8,.75,2.6,'concrete')],furniture:[box(.6,4.8,1.4,2,.5),box(4.6,6.1,1.4,.7,.75)],labels:[room('個室301',4.6,5),room('可動廊下 2m',4,2)],roofAreas:[roof(0,0,8,3.25,2.3),roof(0,3.25,8,4.75,2.6)]},
 {id:'R2',name:'簡易1〜3号室＋共通廊下',use:'residential',color:'#91aa91',cells:[[0,0]],ceiling:2.4,
  ports:[port('W',.9,3.3),port('E',.9,3.3)],walls:[line([0,3.2],[.6,3.2]),line([1.8,3.2],[3.2,3.2]),line([4.4,3.2],[5.8,3.2]),line([7,3.2],[8,3.2]),line([2.6,3.2],[2.6,8]),line([5.2,3.2],[5.2,8])],
  doors:[{id:'R2-1',a:[.6,3.2],b:[1.8,3.2],open:true,label:'1号室'},{id:'R2-2',a:[3.2,3.2],b:[4.4,3.2],open:false,locked:true,label:'2号室 非公開'},{id:'R2-3',a:[5.8,3.2],b:[7,3.2],open:false,locked:true,glass:true,label:'3号室 観察窓'}],
  solids:[box(0,0,8,.65,2.4,'concrete')],furniture:[box(.4,5.8,1.4,1.7,.5),box(3,5.8,1.4,1.7,.5),box(5.6,5.8,1.4,1.7,.5)],labels:[room('1号室',1.3,4.6),room('2号室 鍵',3.9,4.6),room('3号室 窓',6.5,4.6),room('可動廊下',4,2)],roofAreas:[roof(0,0,8,3.2,2.3),roof(0,3.2,8,4.8,2.4)]},
 {id:'R3',name:'個室201＋細廊下・設備帯',use:'residential',color:'#729e9c',cells:[[0,0]],ceiling:2.65,
  ports:[port('W',1.4,2.9),port('E',1.4,2.9)],walls:[line([0,2.96],[3,2.96]),line([4.2,2.96],[8,2.96])],doors:[{id:'R3-door',a:[3,2.96],b:[4.2,2.96],open:true,label:'個室201'}],
  solids:[box(0,0,8,1.34,2.65,'concrete'),box(6,3.02,2,4.98,2.65,'concrete')],furniture:[box(.6,5.1,1.5,2.2,.5)],labels:[room('個室201',3.8,5.5),room('廊下 約1.5m',4,2.1),room('設備帯',7,5.5)],roofAreas:[roof(0,0,8,2.96,2.3),roof(0,2.96,8,5.04,2.65)]},
 {id:'R4',name:'小居室＋低天井の前廊下',use:'residential',color:'#ad9981',cells:[[0,0]],ceiling:2.25,
  ports:[port('W',1,3),port('E',1,3)],walls:[line([0,3.25],[1.8,3.25]),line([3,3.25],[8,3.25])],doors:[{id:'R4-door',a:[1.8,3.25],b:[3,3.25],open:true,label:'小居室'}],
  solids:[box(0,0,8,.65,2.25,'concrete'),box(0,6.8,8,1.2,2.25,'concrete'),box(4.5,3.3,3.5,3.5,2.25,'concrete')],furniture:[box(.5,4.3,1.3,2,.45)],labels:[room('小居室',3.2,5),room('廊下 H2.25m',4,2)],roofAreas:[roof(0,0,8,8,2.25)]},
 {id:'T1',name:'生活用品店＋広い前通路',use:'commerce',color:'#c7a46d',cells:[[0,0],[1,0]],ceiling:3.8,
  ports:[port('W',.8,3.6,2.8),port('E',.8,3.6,2.8)],walls:[],doors:[],solids:[box(0,0,16,.5,3.8,'concrete')],furniture:[box(1,4.6,2.5,1.8,1.1),box(12,4.6,2.5,1.8,1.1),box(5.7,6,4.5,1,1)],labels:[room('開放売場',8,5),room('可動・幅広通路 2.8m',8,2)],roofAreas:[roof(0,0,16,3.8,3),roof(0,3.8,16,4.2,3.8)]},
 {id:'T2',name:'小売店・奥店舗＋前通路',use:'commerce',color:'#bb925e',cells:[[0,0],[1,0]],ceiling:3.4,
  ports:[port('W',1.2,3.2,2.5),port('E',1.2,3.2,2.5)],walls:[line([8,3.4],[10,3.4]),line([11.2,3.4],[16,3.4]),line([8,3.4],[8,8])],doors:[{id:'T2-door',a:[10,3.4],b:[11.2,3.4],open:true,label:'奥店舗'}],
  solids:[box(0,0,16,.8,3.4,'concrete'),box(5,3.8,2.8,4.2,3.4,'concrete')],furniture:[box(.5,5,1,2,1.2),box(12,6,2.5,1,1)],labels:[room('小売店',3,5.5),room('奥店舗',11,5),room('可動前通路',8,2.2)],roofAreas:[roof(0,0,16,3.4,2.8),roof(0,3.4,8,4.6,3),roof(8,3.4,8,4.6,3.4)]},
 {id:'H1',name:'高天井広間＋共用通路',use:'common',color:'#839eb8',cells:[[0,0],[1,0],[0,1],[1,1]],ceiling:5.4,
  ports:[port('W',1,4,3),port('E',1,4,3)],walls:[],doors:[],solids:[],furniture:[box(2,6,2,1,.5),box(2,12,2,1,.5),box(11,6,3,1,.5),box(11,12,3,1,.5)],labels:[room('可動・共用通路',8,2),room('共同広間 H5.4m',8,9)],roofAreas:[roof(0,0,16,16,5.4)]},
 {id:'L1',name:'L字集会室＋休憩翼・通路',use:'common',color:'#9796ae',cells:[[0,0],[1,0],[0,1]],ceiling:4.5,
  ports:[port('W',1,3,2.8)],walls:[line([8,6],[13,1]),line([10.1,7.9],[15,3])],doors:[],solids:[],furniture:[box(1,10,1.3,4,.6),box(5,12,1.5,1,.6)],labels:[room('可動集会通路',4,2),room('45°通路',11.5,4.5),room('休憩翼',4.5,11)],roofAreas:[roof(0,0,16,8,4.5),roof(0,8,8,8,3.2)]}
];
export const BY_ID=Object.fromEntries(BODIES.map(b=>[b.id,b])),SLOTS=[0,8.4,16.8,33.2],NEXT={A:'B',B:'C',C:'A'};
export const PHASES={A:{label:'可動廊下が居住区を連結',floors:[['R3','R4','T2','L1'],['R1','R2','T1','H1']]},B:{label:'第三層の廊下終端が空きドックへ',floors:[['R4','R2','T1','H1'],['R3','R1','T2','L1']]},C:{label:'第三層を再接続・第二層の広間を分離',floors:[['R1','R3','T2','H1'],['R2','R4','T1','L1']]}};
export function placements(phase,e=DEFAULT_EXPERIMENT){const p={};PHASES[phase].floors.forEach((ids,l)=>ids.forEach((id,i)=>p[id]={x:SLOTS[i],y:levelsFor(e)[l],z:phase==='B'&&id==='L1'||phase==='C'&&id==='H1'?8.4:0}));return p;}
export const footprint=b=>({w:(Math.max(...b.cells.map(c=>c[0]))+1)*8,d:(Math.max(...b.cells.map(c=>c[1]))+1)*8});
export const insideBody=(b,x,z)=>b.cells.some(([cx,cz])=>x>=cx*8-1e-8&&x<=cx*8+8+1e-8&&z>=cz*8-1e-8&&z<=cz*8+8+1e-8);
export function perimeter(b){const edges=[],has=(x,z)=>b.cells.some(c=>c[0]===x&&c[1]===z);for(const[x,z]of b.cells){if(!has(x,z-1))edges.push({face:'N',a:[x*8,z*8],b:[x*8+8,z*8]});if(!has(x,z+1))edges.push({face:'S',a:[x*8,z*8+8],b:[x*8+8,z*8+8]});if(!has(x-1,z))edges.push({face:'W',a:[x*8,z*8],b:[x*8,z*8+8]});if(!has(x+1,z))edges.push({face:'E',a:[x*8+8,z*8],b:[x*8+8,z*8+8]});}return edges;}
export function portSegment(b,p){const f=footprint(b);return p.face==='N'?line([p.a,.2],[p.b,.2]):p.face==='S'?line([p.a,f.d-.2],[p.b,f.d-.2]):p.face==='W'?line([.2,p.a],[.2,p.b]):line([f.w-.2,p.a],[f.w-.2,p.b]);}
export function boundaryWalls(b){const walls=[];for(const e of perimeter(b)){const axis=e.face==='N'||e.face==='S'?0:1,other=1-axis,outer=e.face==='N'?0:e.face==='S'?footprint(b).d:e.face==='W'?0:footprint(b).w;const cuts=b.ports.filter(p=>p.face===e.face&&e.a[other]===outer).map(p=>[Math.max(e.a[axis],p.a),Math.min(e.b[axis],p.b)]).filter(([a,c])=>c>a).sort((a,c)=>a[0]-c[0]);let at=e.a[axis];for(const[a,c]of[...cuts,[e.b[axis],e.b[axis]]]){if(a>at){let aa=[...e.a],bb=[...e.b];aa[axis]=at;bb[axis]=a;const v=e.face==='N'||e.face==='W'?.06:-.06;aa[other]+=v;bb[other]+=v;walls.push(line(aa,bb));}at=Math.max(at,c);}}return walls;}
export const overlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
export const LANDING={x:-2.4,z:0,w:2,d:4},ANNEX={x:49.6,z:0,w:4,d:4};
export function connections(phase,e=DEFAULT_EXPERIMENT){const pos=placements(phase,e),levels=levelsFor(e),nodes=BODIES.map(b=>({...b,...pos[b.id],...footprint(b)}));for(let i=0;i<2;i++)nodes.push({id:`F${i}`,...LANDING,y:levels[i],ports:[port('E',1,3,2.5)]});nodes.push({id:'ANNEX',...ANNEX,y:0,ports:[port('W',1,3,2.5)]});const out=[];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){let a=nodes[i],b=nodes[j];if(Math.abs(a.y-b.y)>.01)continue;if(a.x>b.x)[a,b]=[b,a];if(Math.abs(a.x+a.w+GAP-b.x)>1e-5||Math.min(a.z+a.d,b.z+b.d)-Math.max(a.z,b.z)<=0)continue;let width=0,start=0,height=0;for(const p of a.ports.filter(p=>p.face==='E'))for(const q of b.ports.filter(p=>p.face==='W')){const w=overlap([a.z+p.a,a.z+p.b],[b.z+q.a,b.z+q.b]);if(w>width){width=w;start=Math.max(a.z+p.a,b.z+q.a);height=Math.min(p.height,q.height);}}out.push({a:a.id,b:b.id,face:'E',width,height,status:width>=CLEAR_WIDTH&&height>=2?'pass':width>0?'view':'blocked',level:levels.indexOf(a.y),y:a.y,bridge:{x:a.x+a.w,z:start,w:GAP,d:width},ports:{[a.id]:'E',[b.id]:'W'}});}return out;}
export function reachable(phase,e){const seen=new Set(['F0','F1']),edges=connections(phase,e).filter(c=>c.status==='pass');let changed=true;while(changed){changed=false;for(const c of edges){if(seen.has(c.a)&&!seen.has(c.b)){seen.add(c.b);changed=true;}if(seen.has(c.b)&&!seen.has(c.a)){seen.add(c.a);changed=true;}}}return seen;}
export const isolated=(phase,e)=>BODIES.filter(b=>!reachable(phase,e).has(b.id)).map(b=>b.id);
export const isolatedZones=(phase,e)=>[...isolated(phase,e),...(!reachable(phase,e).has('ANNEX')?['ANNEX']:[])];
export function emptyDocks(phase,e){const pos=placements(phase,e),out=[];for(const y of levelsFor(e)){const cells=BODIES.filter(b=>Math.abs(pos[b.id].y-y)<.01).flatMap(b=>b.cells.map(([x,z])=>({x:pos[b.id].x+x*8,z:pos[b.id].z+z*8,w:8,d:8})));const xs=[...new Set([0,LIFE_BOUNDS.w,...cells.flatMap(c=>[c.x,c.x+c.w])])].sort((a,b)=>a-b),zs=[...new Set([0,LIFE_BOUNDS.d,...cells.flatMap(c=>[c.z,c.z+c.d])])].sort((a,b)=>a-b);for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=xs[i],z=zs[j],w=xs[i+1]-x,d=zs[j+1]-z;if(w<1e-6||d<1e-6)continue;const cx=x+w/2,cz=z+d/2;if(!cells.some(c=>cx>c.x&&cx<c.x+c.w&&cz>c.z&&cz<c.z+c.d))out.push({x,y,z,w,d,kind:Math.min(w,d)<.5?'mechanical-clearance':'transfer-well',floor:false});}}return out;}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
