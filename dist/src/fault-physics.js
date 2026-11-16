import * as THREE from '../vendor/three.module.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),R=.35,SOLE=.16,H=1.70,EPS=1e-5;
function segmentDistance(a,b,c,d){const u=b.clone().sub(a),v=d.clone().sub(c),w=a.clone().sub(c),A=u.dot(u),B=u.dot(v),C=v.dot(v),D=u.dot(w),E=v.dot(w);let s=0,t=0;const den=A*C-B*B;if(A<1e-12)t=Math.max(0,Math.min(1,E/C));else{if(C<1e-12)s=Math.max(0,Math.min(1,-D/A));else{s=den>1e-12?Math.max(0,Math.min(1,(B*E-C*D)/den)):0;t=(B*s+E)/C;if(t<0){t=0;s=Math.max(0,Math.min(1,-D/A));}else if(t>1){t=1;s=Math.max(0,Math.min(1,(B-D)/A));}}}return a.clone().addScaledVector(u,s).distanceTo(c.clone().addScaledVector(v,t));}
function capsuleDistance(t,a,b){const direction=b.clone().sub(a),length=direction.length(),ray=new THREE.Ray(a,direction.normalize()),point=V(0,0,0),hit=ray.intersectTriangle(t.a,t.b,t.c,false,point);if(hit&&point.distanceTo(a)<=length)return 0;return Math.min(t.closestPointToPoint(a,point).distanceTo(a),t.closestPointToPoint(b,point).distanceTo(b),segmentDistance(a,b,t.a,t.b),segmentDistance(a,b,t.b,t.c),segmentDistance(a,b,t.c,t.a));}
// Spatially indexed actual render triangles. No body-envelope roof planes or invisible edge fences.
export class FaultWorld{
 constructor(triangles){this.triangles=triangles;this.grid=new Map();for(const t of triangles){t.box=new THREE.Box3().setFromPoints([t.a,t.b,t.c]);t.normal=t.getNormal(V(0,0,0));this.cells(t.box,key=>{let list=this.grid.get(key);if(!list)this.grid.set(key,list=[]);list.push(t);});}}
 cells(box,fn){for(let x=Math.floor(box.min.x/4);x<=Math.floor(box.max.x/4);x++)for(let y=Math.floor(box.min.y/4);y<=Math.floor(box.max.y/4);y++)for(let z=Math.floor(box.min.z/4);z<=Math.floor(box.max.z/4);z++)fn(x+','+y+','+z);}
 query(box){const set=new Set();this.cells(box,key=>{for(const t of this.grid.get(key)??[])if(t.box.intersectsBox(box))set.add(t);});return set;}
 clear(p){const bottom=p.y+SOLE,a=V(p.x,bottom+R,p.z),b=V(p.x,bottom+H-R,p.z),box=new THREE.Box3(V(p.x-R,bottom,p.z-R),V(p.x+R,bottom+H,p.z+R));for(const t of this.query(box))if(capsuleDistance(t,a,b)<R-EPS)return false;return true;}
 support(p,drop=.08){const sole=p.y+SOLE,ray=new THREE.Ray(V(p.x,sole+.003,p.z),V(0,-1,0)),box=new THREE.Box3(V(p.x-.001,sole-drop,p.z-.001),V(p.x+.001,sole+.004,p.z+.001));let best=null;for(const t of this.query(box)){if(t.normal.y<.65)continue;const hit=ray.intersectTriangle(t.a,t.b,t.c,false,V(0,0,0));if(hit&&hit.y<=sole+.004&&hit.y>=sole-drop&&(!best||hit.y>best.y))best={y:hit.y,owner:t.owner,kind:t.kind};}return best;}
 dispose(){this.grid.clear();this.triangles.length=0;}
}
export class FaultMotion{
 constructor(sim,world,start){this.sim=sim;this.world=world;this.start={...start};this.vy=0;this.axis=0;this.control='walk';this.grounded=false;this.lastLanding=null;}
 ownerAt(x,z,y){const p={x,z,y},s=this.world.support(p,.02);if(!s)return null;return s.kind==='roof'?'roof:'+s.owner:s.owner??'fault-floor';}
 move(dx,dz){let moved=false;const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06)),p=this.sim.player;for(let i=0;i<n;i++)for(const [x,z]of[[dx/n,0],[0,dz/n]]){if(!x&&!z)continue;const q={...p,x:p.x+x,z:p.z+z};if(this.world.clear(q)){Object.assign(p,q);moved=true;}}p.owner=this.ownerAt(p.x,p.z,p.y);return moved;}
 vertical(dy){const p=this.sim.player,n=Math.max(1,Math.ceil(Math.abs(dy)/.04));for(let i=0;i<n;i++){const from=p.y,to=from+dy/n,q={...p,y:to};if(this.world.clear(q)){p.y=to;continue;}let a=from,b=to;for(let k=0;k<16;k++){const mid=(a+b)/2;if(this.world.clear({...p,y:mid}))a=mid;else b=mid;}p.y=a;return false;}return true;}
 tick(dt){let left=Math.min(.1,Math.max(0,dt));while(left>1e-8){const h=Math.min(1/120,left);left-=h;if(this.control==='free'){this.vertical(this.axis*2*h);this.vy=0;this.grounded=false;}else{this.vy=Math.max(-55,this.vy-9.81*h);if(!this.vertical(this.vy*h)){const falling=this.vy<0;this.vy=0;const support=this.world.support(this.sim.player,.025);this.grounded=falling&&!!support;if(this.grounded)this.lastLanding=support;}else this.grounded=false;}}this.sim.player.owner=this.ownerAt(this.sim.player.x,this.sim.player.z,this.sim.player.y);}
 setAxis(axis){this.control='free';this.axis=Math.max(-1,Math.min(1,axis));this.vy=0;}
 walkMode(){if(!this.world.clear(this.sim.player)){this.sim.message='身体が建築に重なっています。上下操作で離れてください。';return false;}this.control='walk';this.axis=0;this.vy=0;return true;}
 recover(){if(!this.world.clear(this.start))throw Error('開始位置の衝突状態が変化しています');Object.assign(this.sim.player,this.start);this.vy=0;this.axis=0;this.control='walk';this.sim.message='開発用復帰：故障試験の室内開始位置へ戻しました。';return true;}
}
