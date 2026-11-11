import {PEOPLE} from './life.js';
import {WALL_ROLE} from './wall-roles.js';
const wall=(a,b)=>({a,b,role:WALL_ROLE.ROOM}),port=(id,face,a,b)=>({id,face,a,b,height:2.4,role:WALL_ROLE.CONNECTOR});
export function expandStage9(bodies){
 for(const n of PEOPLE){const r=n.shop,b=bodies.find(b=>b.id===n.work.body);b.walls.push(...[wall([r.x,r.z],[r.x+r.w,r.z]),wall([r.x,r.z],[r.x,r.z+r.d]),wall([r.x+r.w,r.z],[r.x+r.w,r.z+r.d])].map((l,i)=>({...l,id:'shop:'+n.id+':'+i,height:r.h})));}
 const get=id=>bodies.find(b=>b.id===id);get('G5').ports.push(port('E-life','E',4,6));get('G3').ports.push(port('E-life','E',12,14));
 const base={generation:9,ceiling:2.8,color:'#a9aa8c',use:'common',walls:[],doors:[],solids:[],furniture:[],labels:[]};
 bodies.push({...structuredClone(base),id:'J9',name:'生活施設への接続廊下',cells:[[0,0]],ports:[port('W','W',4,6),port('E','E',4,6)],roofAreas:[{x:0,z:0,w:8,d:8,height:2.8}],furniture:[{x:1,z:1,w:2,d:1,h:.6,color:'wood'}],labels:[{name:'生活施設へ',x:4,z:5}]});
 bodies.push({...structuredClone(base),id:'P9',name:'四連結の生活共同棟',cells:[[0,0],[1,0],[0,1],[1,1]],ports:[port('W','W',11.6,14)],walls:[wall([0,5],[3.4,5]),wall([4.6,5],[11.4,5]),wall([12.6,5],[16,5]),wall([8,0],[8,5])],doors:[{id:'P9-home',label:'店主の住戸901',a:[3.4,5],b:[4.6,5],kind:'hinge',hinge:'a',swing:-90,open:false},{id:'P9-study',label:'共同作業室',a:[11.4,5],b:[12.6,5],kind:'hinge',hinge:'a',swing:-90,open:false}],privateRooms:[{x:0,z:0,w:8,d:5,role:WALL_ROLE.ROOM}],furniture:[{x:.5,z:.5,w:1.5,d:2,h:.5,color:'wood'},{x:10,z:1,w:3,d:1,h:.8,color:'wood'},{x:5,z:9,w:5,d:1.5,h:.7,color:'wood'},{x:12,z:12,w:2,d:1,h:.5,color:'wood'}],labels:[{name:'住戸と共同生活室',x:8,z:13}],roofAreas:[{x:0,z:0,w:16,d:8,height:2.8},{x:0,z:8,w:16,d:8,height:3.6}]});
}
export const stage9Placements=(phase,p)=>Object.assign(p,{J9:{x:50.4,y:0,z:33.2},P9:{x:58.8,y:0,z:phase==='B'?25.6:25.2}});
