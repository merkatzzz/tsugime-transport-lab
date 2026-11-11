// Independent fixed water system; shared by walking, rendering and transport.
export const WATER=[
 {id:'W0',name:'北探索水路',x:8.4,y:-12.8,z:-8.4,w:48,d:8,h:6.2,tunnel:true,face:'S',a:3,b:5,height:2.8},
 {id:'W2',name:'第二層 用水路',x:75.6,y:0,z:33.6,w:8,d:8,h:6,face:'W',a:3,b:5,height:2.5},
 {id:'W3',name:'第三層 用水路',x:16.8,y:12.8,z:33.6,w:8,d:8,h:6,face:'W',a:3,b:5,height:2.5}
];
export const waterBoxes=()=>WATER.map(q=>({id:q.id,min:[q.x,q.y-(q.tunnel?1.2:.85),q.z],max:[q.x+q.w,q.y+q.h,q.z+q.d]}));
export const WATER_NETWORK={system:'independent-water',links:[['unmodelled-inlet','W3'],['W3','W2'],['W2','W0'],['W0','unmodelled-outlet']],springs:[]};
export function waterPort(q){const ns=q.face==='S';return {id:'entry',body:q.id,key:q.id+':entry',node:q.id,face:q.face,a:q.a,b:q.b,height:q.height,level:[0,12.8,-12.8].indexOf(q.y),y:q.y,plane:ns?q.z+q.d:q.x,start:(ns?q.x:q.z)+q.a,end:(ns?q.x:q.z)+q.b};}
export function waterWalkRects(q){return q.tunnel?[{x:q.x+.2,z:-3.8,w:q.w-.4,d:1.65},{x:q.x+3,z:-3.8,w:2,d:3.4}]:[{x:q.x,z:q.z+.2,w:2.4,d:7.6}];}
export function waterOwner(x,z,y){return WATER.find(q=>Math.abs(q.y-y)<.01&&waterWalkRects(q).some(r=>x>=r.x&&x<=r.x+r.w&&z>=r.z&&z<=r.z+r.d))?.id;}
export function waterWalls(q,open=false){const lines=[],add=(a,b)=>lines.push({a,b,owner:q.id,y:q.y});if(q.tunnel){add([q.x+.2,-3.8],[q.x+q.w-.2,-3.8]);add([q.x+.2,-3.8],[q.x+.2,-2.15]);add([q.x+q.w-.2,-3.8],[q.x+q.w-.2,-2.15]);add([q.x+.2,-2.15],[q.x+3,-2.15]);add([q.x+5,-2.15],[q.x+q.w-.2,-2.15]);add([q.x+3,-2.15],[q.x+3,-.4]);add([q.x+5,-2.15],[q.x+5,-.4]);if(!open)add([q.x+3,-.46],[q.x+5,-.46]);}else{add([q.x+2.4,q.z+.2],[q.x+2.4,q.z+7.8]);add([q.x,q.z+.2],[q.x+2.4,q.z+.2]);add([q.x,q.z+7.8],[q.x+2.4,q.z+7.8]);add([q.x+.06,q.z+.2],[q.x+.06,q.z+3]);add([q.x+.06,q.z+5],[q.x+.06,q.z+7.8]);if(!open)add([q.x+.06,q.z+3],[q.x+.06,q.z+5]);}return lines;}
