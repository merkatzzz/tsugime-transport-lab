import {marketPlan,marketPorts} from './market-plan.js';
import {WALL_ROLE} from './wall-roles.js';
const wall=(a,b)=>({a,b,role:WALL_ROLE.ROOM,height:2.35});
export function stabilizeBuildings(bodies){
 for(const id of ['SH1','SH2']){const b=bodies.find(b=>b.id===id),right=id==='SH2';
  b.walls=marketPlan(right).walls;b.ports=marketPorts(right);
  b.furniture=marketPlan(right).furniture;
 }
 bodies.find(b=>b.id==='U4').ports=bodies.find(b=>b.id==='U4').ports.filter(p=>p.id!=='market');bodies.find(b=>b.id==='P9').ports.push({id:'market-south',face:'S',a:6.1,b:7.7,height:2.5,role:WALL_ROLE.CONNECTOR});
 const b=bodies.find(b=>b.id==='LB1');
 b.walls=b.walls.filter(w=>w.exterior).concat([wall([10,5.2],[10.8,5.2]),wall([11.9,5.2],[14,5.2]),wall([15.1,5.2],[16,5.2]),wall([13.1,5.2],[13.1,8])].map(w=>({...w,height:3.4})));
 b.doors=b.doors.filter(d=>d.entrance).concat([{id:'LB1-work',a:[10.8,5.2],b:[11.9,5.2],label:'補助実験室'},{id:'LB1-store',a:[14,5.2],b:[15.1,5.2],label:'保管室'}].map(d=>({...d,kind:'hinge',hinge:'a',swing:90,open:false})));
 b.furniture=[{x:4,z:.6,w:4,d:.8,h:.9},{x:5,z:2.8,w:3,d:.7,h:1},{x:10.3,z:7.1,w:1.8,d:.5,h:.8},{x:14,z:7.1,w:1.5,d:.5,h:1}].map(r=>({...r,color:'wood'}));
 b.labels=[{name:'研究所・前室',x:2.2,z:6.5},{name:'主研究室・観察装置',x:6,z:2},{name:'補助実験室',x:11.5,z:6.5},{name:'保管室',x:14.5,z:6.5}];
 const d=bodies.find(b=>b.id==='T2').doors.find(d=>d.id==='T2-door');Object.assign(d,{kind:'slide',slide:1.32});
}
