import {WALL_ROLE} from './wall-roles.js';
const line=(a,b)=>({a,b,role:WALL_ROLE.ROOM}),box=(x,z,w,d)=>({x,z,w,d,h:.6,color:'wood'});
export function repairResidentialWalls(bodies){const get=id=>bodies.find(b=>b.id===id),r1=get('R1'),r2=get('R2'),v1=get('V1'),v3=get('V3');
 // R1's old partition at z=3.2 overlapped the side portal [3,5].
 r1.walls=r1.walls.map(l=>line(l.a.map((v,i)=>i===1?2.6:v),l.b.map((v,i)=>i===1?2.6:v)));Object.assign(r1.doors[0],{a:[3.4,2.6],b:[4.6,2.6]});
 // R2's north port must enter a vestibule, not the enclosed small residence.
 r2.walls=[line([3.5,1.5],[5.8,1.5]),line([5.8,1.5],[5.8,2.2]),line([5.8,3.4],[5.8,4.3]),line([3.5,4.3],[5.8,4.3])];Object.assign(r2.doors[0],{a:[5.8,2.2],b:[5.8,3.4],hinge:'b',swing:-90});r2.furniture=[box(3.7,1.7,.7,1.8)];r2.labels=r2.labels.map(l=>l.name==='主通路'?{...l,x:6.8}:l);
 // Keep the genuine six-metre north portal; move the private enclosure to
 // the SW cell, away from both the north connector and the west Q1 branch.
 v1.walls=[line([0,8.8],[2.8,8.8]),line([0,12.2],[2.8,12.2]),line([2.8,8.8],[2.8,10]),line([2.8,11.2],[2.8,12.2]),...v1.walls.slice(3)];Object.assign(v1.doors[0],{a:[2.8,10],b:[2.8,11.2],label:'西の居室'});v1.furniture[0]=box(.4,9.1,1.1,1.9);v1.furniture[2]=box(1,14,1.4,.6);
 v3.ports.find(p=>p.id==='N').a=3;v3.walls=[line([0,2.7],[2.6,2.7]),line([2.6,0],[2.6,1]),line([2.6,2.2],[2.6,2.7])];Object.assign(v3.doors[0],{a:[2.6,1],b:[2.6,2.2]});v3.furniture[0]=box(.4,.4,.8,1.8);
 for(const b of bodies){for(const l of b.walls)l.role=WALL_ROLE.ROOM;for(const p of b.ports)p.role=p.id==='E-slit'?WALL_ROLE.WINDOW:WALL_ROLE.CONNECTOR;}
 const rooms={R1:[[0,0,8,2.6]],R2:[[3.5,1.5,2.3,2.8]],R4:[[0,0,8,2.9]],K1:[[0,0,8,2.9]],V1:[[0,8.8,2.8,3.4],[8,11,8,5]],V2:[[0,0,3,3],[11,0,5,3]],V3:[[0,0,2.6,2.7]]};for(const [id,areas]of Object.entries(rooms))get(id).privateRooms=areas.map(([x,z,w,d])=>({x,z,w,d,role:WALL_ROLE.ROOM}));
}
