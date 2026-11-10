import {BODIES} from './architecture.js';
import {doorSweepDistance} from './doors.js';
import {toWorld,toLocal} from './pose.js';
// All character and camera coordinates are local to their rigid transport body.
export const NPCS=[
 {id:'shopkeeper',body:'T1',name:'生活用品店の店主',x:12,y:0,z:1.9,radius:.32,color:'#596e82',lines:['何か用か？　ここはいつでも開いているよ。','廊下が動いても、店はこの場所で営業中だ。'],anchor:{x:11,y:0,z:3.5}},
 {id:'resident',body:'R3',name:'簡易個室の住人',x:1.55,y:0,z:6.25,radius:.3,color:'#a17e65',lines:['ここは私の部屋だ。入口からで頼む。','狭いが、廊下が移ってもこの部屋は一緒についてくる。'],anchor:{x:3.55,y:0,z:6.15},camera:{x:3.55,y:1.7,z:6.15},look:{x:1.5,y:1.35,z:6.25}}
];
export function worldPoint(sim,body,p){const q=sim.positions[body];return toWorld(q,p);}
export class Experience{
 constructor(sim){this.sim=sim;this.visit=null;this.dialogue=null;this.focus=null;this.blend=0;this.doorTargets={...sim.doors};this.doorProgress=Object.fromEntries(Object.entries(sim.doors).map(([k,v])=>[k,v?1:0]));this.events=[];this.transition=null;this.transitionDuration=.14;this.transitionSerial=0;}
 event(type,body){this.events.push({type,body,time:this.sim.clock});if(this.events.length>32)this.events.shift();}
 get blocking(){return !!this.visit||!!this.dialogue||this.blend>.001;}
 nearNPC(id){const s=this.sim;return NPCS.filter(n=>!id||n.id===id).find(n=>{const p=worldPoint(s,n.body,n.anchor);let clear=true;const distance=Math.hypot(p.x-s.player.x,p.z-s.player.z);for(let i=1;i<=Math.ceil(distance/.08);i++){const t=i/Math.ceil(distance/.08);if(!s.isFree(s.player.x+(p.x-s.player.x)*t,s.player.z+(p.z-s.player.z)*t,s.player.y,.02)){clear=false;break;}}return clear&&s.owner===n.body&&Math.abs(p.y-s.player.y)<.1&&Math.hypot(p.x-s.player.x,p.z-s.player.z)<1.8;});}
 interact(id){if(this.visit){if(this.dialogue)this.next();else this.dialogue={npc:NPCS[1],index:0};return true;}if(this.dialogue){this.next();return true;}if(this.blend>.001)return true;const n=this.nearNPC(id);if(n?.id==='resident')return false;if(!n||this.sim.mode!=='idle')return false;this.dialogue={npc:n,index:0};this.focus=n;this.event('talk',n.body);return true;}
 next(){if(!this.dialogue)return;if(++this.dialogue.index>=this.dialogue.npc.lines.length)this.end();}
 end(){this.dialogue=null;}
 transitionTo(kind){this.transition={kind,elapsed:0,duration:kind==='enter'?this.transitionDuration:Math.max(.1,this.transitionDuration-.02),serial:++this.transitionSerial};}
 leave(){if(!this.visit){this.end();return;}const s=this.sim,p=s.positions[this.visit.body];s.player={...this.visit.player,x:p.x+this.visit.local.x,y:p.y,z:p.z+this.visit.local.z};this.visit=null;this.dialogue=null;this.focus=null;this.blend=0;this.transitionTo('exit');this.doorTargets['R3-door']=false;this.doorProgress['R3-door']=0;s.doors['R3-door']=false;s.invalidate();this.event('door','R3');}
 toggleDoor(b,d){const s=this.sim;if(d.id==='R3-door'&&!this.visit){const p=s.positions.R3;if(s.owner!=='R3'||s.player.z-p.z>=5)return false;this.visit={body:'R3',npc:'resident',player:{...s.player},local:{x:s.player.x-p.x,z:s.player.z-p.z}};this.doorTargets[d.id]=true;this.transitionTo('enter');this.event('door',b.id);return true;}if(this.blocking)return false;const target=!(this.doorTargets[d.id]??s.doors[d.id]);
  // Closing is refused anywhere in the complete leaf sweep, not just at its endpoint.
  const {x,z}=toLocal(s.positions[b.id],s.player),len=Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]),ux=(d.b[0]-d.a[0])/len,uz=(d.b[1]-d.a[1])/len;
  if(d.kind==='hinge'){if(doorSweepDistance(d,{x,z},this.doorProgress[d.id],target?1:0)<.4){s.message='扉の開閉範囲から少し離れてください。';return false;}}else if(!target){const t=(x-d.a[0])*ux+(z-d.a[1])*uz,perp=Math.abs((x-d.a[0])*uz-(z-d.a[1])*ux);if(t>-.46&&t<len*2+.55&&perp<.48){s.message='扉の動く範囲から離れてください。';return false;}}
  this.doorTargets[d.id]=target;this.event('door',b.id);s.message=d.label+(target?'を開きます。':'を閉じます。');return true;}
 tick(dt){const s=this.sim;if(this.transition){this.transition.elapsed+=dt;if(this.transition.elapsed>=this.transition.duration)this.transition=null;}this.blend=Math.max(0,Math.min(1,this.blend+(this.dialogue&&this.focus?1:-1)*dt/0.32));if(this.blend===0&&!this.dialogue)this.focus=null;
  for(const [id,target] of Object.entries(this.doorTargets)){const p=this.doorProgress[id],v=Math.max(0,Math.min(1,p+(target?1:-1)*dt/.65));if(v!==p){const body=BODIES.find(b=>b.doors.some(d=>d.id===id)),door=body?.doors.find(d=>d.id===id);if(door&&s.owner===body.id&&doorSweepDistance(door,toLocal(s.positions[body.id],s.player),p,v)<.4){s.message='扉の動く範囲から離れてください。';continue;}this.doorProgress[id]=v;s.doors[id]=v>=1-1e-8;s.invalidate();}}
 }
 camera(){if(!this.focus||this.blend===0)return null;const n=this.focus;return{position:n.camera?worldPoint(this.sim,n.body,n.camera):{x:this.sim.player.x,y:this.sim.player.y+1.81,z:this.sim.player.z},look:worldPoint(this.sim,n.body,n.look??{x:n.x,y:1.56,z:n.z}),blend:this.blend*this.blend*(3-2*this.blend)};}
}
