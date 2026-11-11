import {WALL_ROLE} from './wall-roles.js';
const eps=1e-7;
function axisLine(l){const axis=Math.abs(l.a[1]-l.b[1])<eps?0:Math.abs(l.a[0]-l.b[0])<eps?1:null;if(axis===null)return null;return{axis,plane:l.a[1-axis],a:Math.min(l.a[axis],l.b[axis]),b:Math.max(l.a[axis],l.b[axis])};}
function outerEdges(cells){const lines=[],has=(x,z)=>cells.some(c=>c[0]===x&&c[1]===z);for(const[x,z]of cells){if(!has(x,z-1))lines.push({a:[x*8,z*8],b:[x*8+8,z*8]});if(!has(x,z+1))lines.push({a:[x*8,z*8+8],b:[x*8+8,z*8+8]});if(!has(x-1,z))lines.push({a:[x*8,z*8],b:[x*8,z*8+8]});if(!has(x+1,z))lines.push({a:[x*8+8,z*8],b:[x*8+8,z*8+8]});}return lines;}
function subtract(interval,cuts){let out=[interval];for(const[a,b]of cuts)out=out.flatMap(([x,y])=>b<=x+eps||a>=y-eps?[[x,y]]:[[x,Math.min(a,y)],[Math.max(b,x),y]].filter(([x,y])=>y-x>eps));return out;}
// Private-room envelopes are semantic building data, independent of cell seams.
// Fill missing straight wall intervals; authored doors/openings and the true outer shell own their intervals.
export function compilePartitions(body){
 const walls=[...body.walls],repairs=[],outer=outerEdges(body.cells);
 for(const [room,r]of (body.privateRooms??[]).entries()){
  const edges=[{a:[r.x,r.z],b:[r.x+r.w,r.z]},{a:[r.x+r.w,r.z],b:[r.x+r.w,r.z+r.d]},{a:[r.x,r.z+r.d],b:[r.x+r.w,r.z+r.d]},{a:[r.x,r.z],b:[r.x,r.z+r.d]}];
  for(const l of edges){const e=axisLine(l),cuts=[];for(const q of[...walls,...outer,...body.doors,...(r.openings??[])]){const v=axisLine(q);if(v&&v.axis===e.axis&&Math.abs(v.plane-e.plane)<eps)cuts.push([v.a,v.b]);}
   for(const s of body.solids??[]){if(s.h<body.ceiling-eps)continue;const lo=e.axis===0?s.z:s.x,hi=lo+(e.axis===0?s.d:s.w);if(e.plane>=lo-eps&&e.plane<=hi+eps)cuts.push(e.axis===0?[s.x,s.x+s.w]:[s.z,s.z+s.d]);}
   for(const[a,b]of subtract([e.a,e.b],cuts)){const aa=[...l.a],bb=[...l.b];aa[e.axis]=a;bb[e.axis]=b;const w={a:aa,b:bb,role:WALL_ROLE.ROOM,source:'room-envelope',room};walls.push(w);repairs.push(w);}
  }
 }
 body.walls=walls;body.partitionRepairs=repairs;return body;
}
