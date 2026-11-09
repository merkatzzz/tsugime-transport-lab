// Coordinates: x east, z south, y vertical. Ports use increasing x (N/S), z (E/W).
export const CELL=8, HEIGHT=5, DECK=11, LEVELS=[0,24], RADIUS=.35, CLEAR_WIDTH=.82, EYE=1.81;
const line=(a,b,kind='wall',id='')=>({a,b,kind,id});
const box=(x,z,w,d,h=1,color='wood')=>({x,z,w,d,h,color});
const port=(face,a,b)=>({face,a,b,height:2.8});
const cell=(x,z)=>[x,z];
const room=(name,x,z)=>({name,x,z});
export const BODIES=[
 {id:'R1',name:'個室・前廊下',use:'residential',color:'#81a398',cells:[cell(0,0)],ceiling:3.2,
  ports:[port('N',5,7)],walls:[line([4.7,0],[4.7,2.5]),line([4.7,3.7],[4.7,8])],
  doors:[{id:'R1-door',a:[4.7,2.5],b:[4.7,3.7],open:true,label:'個室 301'}],
  solids:[box(0,6.9,4.65,1.1,3.2,'concrete'),box(7.2,0,.8,8,3.2,'concrete')],
  furniture:[box(.7,1,1.5,2.2,.55),box(.6,4.8,2,1,.8)],labels:[room('個室301',2.2,3.8),room('前廊下',6,5.5)]},
 {id:'R2',name:'簡易部屋 1–3',use:'residential',color:'#91aa91',cells:[cell(0,0)],ceiling:3.2,
  ports:[port('N',4,7.5),port('E',5,7)],
  walls:[line([0,2.6],[4,2.6]),line([0,5.2],[4,5.2]),line([4,0],[4,.7]),line([4,1.9],[4,3.3]),line([4,4.5],[4,5.8]),line([4,7],[4,8])],
  doors:[{id:'R2-1',a:[4,.7],b:[4,1.9],open:true,label:'簡易1号室'},{id:'R2-2',a:[4,3.3],b:[4,4.5],open:false,locked:true,label:'簡易2号室・非公開'},{id:'R2-3',a:[4,5.8],b:[4,7],open:false,locked:true,glass:true,label:'簡易3号室・観察窓'}],
  solids:[box(7.6,0,.4,4.9,3.2,'concrete')],furniture:[box(.6,.5,1.5,1.8,.5),box(.6,3,1.5,1.8,.5),box(.6,5.6,1.5,1.8,.5)],labels:[room('1号室',1.8,1.5),room('2号室 鍵',1.8,4),room('3号室 窓',1.8,6.5)]},
 {id:'R3',name:'居室・厚壁・細廊下',use:'residential',color:'#729e9c',cells:[cell(0,0)],ceiling:3.2,
  ports:[port('N',4.75,6.25)],walls:[line([4.6,0],[4.6,3]),line([4.6,4.2],[4.6,8])],
  doors:[{id:'R3-door',a:[4.6,3],b:[4.6,4.2],open:true,label:'個室 201'}],
  solids:[box(6.4,0,1.6,8,3.2,'concrete')],furniture:[box(.5,.7,1.6,2.2,.5),box(.5,6,2.2,1,.8)],labels:[room('個室201',2,3.7),room('厚壁',7.2,4)]},
 {id:'R4',name:'観察居室・隔離試験',use:'residential',color:'#ad9981',cells:[cell(0,0)],ceiling:3.2,
  ports:[port('N',2,5.4)],walls:[line([0,3],[1.4,3]),line([2.8,3],[8,3])],doors:[],solids:[],
  furniture:[box(.6,4.4,1.5,2.3,.5),box(5.6,5,1.4,1,.8)],labels:[room('隔離試験室',4,5),room('偏心入口',3.6,1.5)]},
 {id:'T1',name:'幅広の生活用品店',use:'commerce',color:'#c7a46d',cells:[cell(0,0),cell(1,0)],ceiling:3.5,
  ports:[port('N',5,11),port('W',5,7),port('E',4.5,7.5)],walls:[],doors:[],solids:[],
  furniture:[box(1,1,2.5,2,1.2),box(12.2,1,2.5,2,1.2),box(5.5,3,5,1,1),box(1,7.25,13.5,.45,1.3)],labels:[room('生活用品店',8,2),room('開放売場／横断通路',8,6)]},
 {id:'T2',name:'深い店舗・小売店',use:'commerce',color:'#bb925e',cells:[cell(0,0),cell(1,0)],ceiling:3.5,
  ports:[port('N',2,4),port('W',5,7),port('E',5.7,7.2)],
  walls:[line([5,0],[5,4.4]),line([8,0],[8,4.7]),line([8,6],[8,8])],
  doors:[{id:'T2-door',a:[8,4.7],b:[8,6],open:true,label:'奥の店舗入口'}],
  solids:[box(5.1,0,2.8,4.3,3.5,'concrete')],furniture:[box(.7,1,1,3.2,1.2),box(10,.7,4.7,1.2,1.1),box(10.5,3.2,3.4,1,1.1)],labels:[room('小売店',3,3),room('奥の店舗',12,5.5)]},
 {id:'H1',name:'四連結の共用広間',use:'common',color:'#839eb8',cells:[cell(0,0),cell(1,0),cell(0,1),cell(1,1)],ceiling:4.5,
  ports:[port('N',2,6),port('W',5,7)],walls:[],doors:[],solids:[],
  furniture:[box(2,4,2,1,.5),box(2,9,2,1,.5),box(10,4,4,1,.5),box(10,10,4,1,.5),box(6.5,6.5,2,2,.65)],labels:[room('共用広間',8,3),room('室内高 4.5m',8,12)]},
 {id:'L1',name:'三連結のL字集会室',use:'common',color:'#9796ae',cells:[cell(0,0),cell(1,0),cell(0,1)],ceiling:4.1,
  ports:[port('N',2,5),port('W',5,7)],
  walls:[line([8,6],[13,1]),line([10,8],[15,3])],doors:[],solids:[],
  furniture:[box(1,10,1.3,4,.6),box(4.8,11,2,1,.65)],labels:[room('集会室',4,4),room('45°通路',11.5,4.5),room('休憩翼',4.5,12)]}
];
export const BY_ID=Object.fromEntries(BODIES.map(b=>[b.id,b]));
export const PHASES={
 A:{label:'居住区域がまとまる',floors:[['R3','R4','T2','L1'],['R1','R2','T1','H1']]},
 B:{label:'生活と商業が混在する',floors:[['R4','R2','T1','H1'],['R3','R1','T2','L1']]},
 C:{label:'共用区域と居住が再集合',floors:[['R1','R3','T2','H1'],['R2','R4','T1','L1']]}
};
export const NEXT={A:'B',B:'C',C:'A'}, SLOTS=[0,8,16,32], SPINE_PORTS=[[5,7],[3,7],[2,11],[2,6]];
export function placements(phase){const p={};PHASES[phase].floors.forEach((ids,level)=>ids.forEach((id,i)=>p[id]={x:SLOTS[i],y:LEVELS[level],z:0}));return p;}
export function footprint(b){return {w:(Math.max(...b.cells.map(c=>c[0]))+1)*CELL,d:(Math.max(...b.cells.map(c=>c[1]))+1)*CELL};}
export function insideBody(b,x,z){return b.cells.some(([cx,cz])=>x>=cx*CELL&&x<=cx*CELL+CELL&&z>=cz*CELL&&z<=cz*CELL+CELL);}
export function perimeter(b){
 const edges=[];const has=(x,z)=>b.cells.some(c=>c[0]===x&&c[1]===z);
 for(const [x,z] of b.cells){
  if(!has(x,z-1))edges.push({face:'N',a:[x*8,z*8],b:[x*8+8,z*8]});
  if(!has(x,z+1))edges.push({face:'S',a:[x*8,z*8+8],b:[x*8+8,z*8+8]});
  if(!has(x-1,z))edges.push({face:'W',a:[x*8,z*8],b:[x*8,z*8+8]});
  if(!has(x+1,z))edges.push({face:'E',a:[x*8+8,z*8],b:[x*8+8,z*8+8]});
 }
 return edges;
}
export function portSegment(b,p){const f=footprint(b);return p.face==='N'?line([p.a,0],[p.b,0]):p.face==='S'?line([p.a,f.d],[p.b,f.d]):p.face==='W'?line([0,p.a],[0,p.b]):line([f.w,p.a],[f.w,p.b]);}
export function boundaryWalls(b){
 const walls=[];
 for(const e of perimeter(b)){
  const axis=e.face==='N'||e.face==='S'?0:1,other=1-axis;
  const outer=e.face==='N'?0:e.face==='S'?footprint(b).d:e.face==='W'?0:footprint(b).w;
  const cuts=b.ports.filter(p=>p.face===e.face&&e.a[other]===outer).map(p=>[Math.max(e.a[axis],p.a),Math.min(e.b[axis],p.b)]).filter(([a,c])=>c>a).sort((a,c)=>a[0]-c[0]);
  let at=e.a[axis];for(const [a,c] of [...cuts,[e.b[axis],e.b[axis]]]){if(a>at){let aa=[...e.a],bb=[...e.b];aa[axis]=at;bb[axis]=a;walls.push(line(aa,bb));}at=Math.max(at,c);}
 }
 return walls;
}
export function overlap(a,b){return Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));}
export function connections(phase){
 const result=[];const pos=placements(phase);
 for(const body of BODIES){
  const p=pos[body.id],level=LEVELS.indexOf(p.y),slot=SLOTS.indexOf(p.x),north=body.ports.find(q=>q.face==='N');
  const width=overlap([north.a,north.b],SPINE_PORTS[slot]);
  result.push({a:body.id,b:`F${level}`,face:'N',width,height:2.8,status:width>=CLEAR_WIDTH?'pass':width>0?'view':'blocked',level});
 }
 for(let i=0;i<BODIES.length;i++)for(let j=i+1;j<BODIES.length;j++){
  let a=BODIES[i],b=BODIES[j],pa=pos[a.id],pb=pos[b.id];if(pa.y!==pb.y)continue;
  if(pa.x>pb.x){[a,b]=[b,a];[pa,pb]=[pb,pa];}
  if(pa.x+footprint(a).w!==pb.x)continue;
  const east=a.ports.find(p=>p.face==='E'),west=b.ports.find(p=>p.face==='W');
  const width=east&&west?overlap([east.a+pa.z,east.b+pa.z],[west.a+pb.z,west.b+pb.z]):0;
  result.push({a:a.id,b:b.id,face:'E',width,height:2.8,status:width>=CLEAR_WIDTH?'pass':width>0?'view':'blocked',level:LEVELS.indexOf(pa.y)});
 }
 return result;
}
export function reachable(phase){const edges=connections(phase).filter(c=>c.status==='pass');const seen=new Set(['F0','F1']);let changed=true;while(changed){changed=false;for(const c of edges){if(seen.has(c.a)&&!seen.has(c.b)){seen.add(c.b);changed=true;}if(seen.has(c.b)&&!seen.has(c.a)){seen.add(c.a);changed=true;}}}return seen;}
export const isolated=phase=>BODIES.filter(b=>!reachable(phase).has(b.id)).map(b=>b.id);
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function localBlocked(body,x,z,doors={},portOpen=()=>true,radius=RADIUS){
 if(!insideBody(body,x,z))return true;
 const lines=[...boundaryWalls(body),...body.walls,...body.doors.filter(d=>!(doors[d.id]??d.open)).map(d=>line(d.a,d.b)),...body.ports.filter(p=>!portOpen(p)).map(p=>portSegment(body,p))];
 if(lines.some(l=>segmentDistance(x,z,l.a,l.b)<radius+.06-1e-7))return true;
 for(const s of [...body.solids,...body.furniture]){const dx=Math.max(s.x-x,0,x-(s.x+s.w)),dz=Math.max(s.z-z,0,z-(s.z+s.d));if(Math.hypot(dx,dz)<radius+.01)return true;}
 return false;
}
