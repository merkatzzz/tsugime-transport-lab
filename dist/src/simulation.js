import {BODIES,BY_ID,CELL,HEIGHT,DECK,LEVELS,RADIUS,NEXT,PHASES,SLOTS,SPINE_PORTS,placements,connections,isolated,insideBody,boundaryWalls,portSegment,segmentDistance} from './architecture.js';
import {planTransfer,validatePlan,positionDuring} from './transport.js';
export function spineWalls(){
 const result=[{a:[-2,-4],b:[48,-4]},{a:[48,-4],b:[48,0]},{a:[-2,-4],b:[-2,-3.6]},{a:[-2,-.4],b:[-2,0]}];
 let last=-2;for(let i=0;i<4;i++){const [a,b]=SPINE_PORTS[i].map(v=>v+SLOTS[i]);result.push({a:[last,0],b:[a,0]});last=b;}result.push({a:[last,0],b:[48,0]});return result;
}
export class Simulation{
 constructor(){this.reset();}
 reset(){
  this.phase='A';this.positions=placements('A');this.player={x:6,y:24,z:-1.8,yaw:0,pitch:0,owner:'fixed'};
  this.doors=Object.fromEntries(BODIES.flatMap(b=>b.doors.map(d=>[d.id,d.open])));
  this.mode='idle';this.elapsed=0;this.plan=null;this.stageIndex=-1;this.paused=false;this.speed=2;this.experimental=false;this.shutter=0;
  this.liftY=24;this.liftTarget=24;this.liftTime=0;this.liftFrom=24;this.liftActive=false;this.liftPassenger=false;this.message='第三層の固定回廊から探索を開始します。';
  this.history=[];this.lastCheck=null;this.completed=0;this.clock=0;this.invalidate();
 }
 invalidate(){this._colliders=null;}
 get next(){return NEXT[this.phase];}
 get liveConnections(){return connections(this.phase).map(c=>this.shutter>.01?{...c,status:'blocked'}:c);}
 get liveReachable(){const seen=new Set(['F0','F1']);let changed=true;while(changed){changed=false;for(const c of this.liveConnections.filter(c=>c.status==='pass')){if(seen.has(c.a)&&!seen.has(c.b)){seen.add(c.b);changed=true;}if(seen.has(c.b)&&!seen.has(c.a)){seen.add(c.a);changed=true;}}}return seen;}
 get targetIsolated(){return isolated(this.next);}
 portIsOpen(id,port){if(this.shutter>.01)return false;return connections(this.phase).some(c=>(c.a===id&&c.face===port.face||c.b===id&&c.face==='E'&&port.face==='W')&&c.status!=='blocked');}
 get owner(){return this.ownerAt(this.player.x,this.player.z,this.player.y);}
 ownerAt(x,z,y=this.player.y){
  if(x>=-6&&x<-2&&z>=-4&&z<=0&&Math.abs(y-this.liftY)<.01)return 'lift';
  for(const b of BODIES){const p=this.positions[b.id];if(Math.abs(p.y-y)<.01&&insideBody(b,x-p.x,z-p.z))return b.id;}
  if(x>=-2&&x<=48&&z>=-4&&z<=0&&LEVELS.some(v=>Math.abs(v-y)<.01))return 'fixed';return null;
 }
 floorSupports(x,z,y){return !!this.ownerAt(x,z,y);}
 colliders(){
  if(this._colliders)return this._colliders;
  const lines=[],solids=[];
  const add=(l,p={x:0,z:0},owner='fixed',y=0)=>lines.push({a:[l.a[0]+p.x,l.a[1]+p.z],b:[l.b[0]+p.x,l.b[1]+p.z],owner,y,kind:l.kind??'wall'});
  for(const y of LEVELS){for(const l of spineWalls())add(l,undefined,'fixed',y);
   // Absent cabin is guarded by a real landing shutter.
   if(this.liftActive||Math.abs(this.liftY-y)>.01)add({a:[-2,-3.6],b:[-2,-.4]},undefined,'fixed',y);
  }
  for(const l of [{a:[-6,-4],b:[-2,-4]},{a:[-6,0],b:[-2,0]},{a:[-6,-4],b:[-6,0]}])add(l,undefined,'lift',this.liftY);
  for(const b of BODIES){const p=this.positions[b.id];for(const l of [...boundaryWalls(b),...b.walls])add(l,p,b.id,p.y);
   for(const d of b.doors)if(!this.doors[d.id])add(d,p,b.id,p.y);
   for(const port of b.ports)if(!this.portIsOpen(b.id,port))add(portSegment(b,port),p,b.id,p.y);
   for(const s of [...b.solids,...b.furniture])solids.push({...s,x:s.x+p.x,z:s.z+p.z,y:p.y,owner:b.id});
  }
  // Fixed side of every docking opening closes together with its moving partner.
  if(this.shutter>.01)for(const y of LEVELS)for(let i=0;i<4;i++)add({a:[SLOTS[i]+SPINE_PORTS[i][0],0],b:[SLOTS[i]+SPINE_PORTS[i][1],0]},undefined,'fixed',y);
  return this._colliders={lines,solids};
 }
 isFree(x,z,y=this.player.y,radius=RADIUS){
  if(!this.floorSupports(x,z,y))return false;
  // An entire body disc needs continuous supporting floor, also across a seam.
  for(let i=0;i<12;i++){const a=i*Math.PI/6;if(!this.floorSupports(x+Math.cos(a)*radius,z+Math.sin(a)*radius,y))return false;}
  const c=this.colliders();
  for(const l of c.lines)if(Math.abs(l.y-y)<.01&&segmentDistance(x,z,l.a,l.b)<radius+.06-1e-7)return false;
  for(const s of c.solids)if(Math.abs(s.y-y)<.01){const dx=Math.max(s.x-x,0,x-s.x-s.w),dz=Math.max(s.z-z,0,z-s.z-s.d);if(Math.hypot(dx,dz)<radius+.01)return false;}
  return true;
 }
 move(dx,dz){
  if(!['idle','warning','evacuate'].includes(this.mode)||this.liftActive)return false;
  let moved=false;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));
  for(let i=0;i<steps;i++)for(const [ax,az] of [[dx/steps,0],[0,dz/steps]]){
   const x=this.player.x+ax,z=this.player.z+az,nextOwner=this.ownerAt(x,z);
   if((this.mode==='warning'||this.mode==='evacuate')&&!this.experimental&&this.targetIsolated.includes(nextOwner)&&this.owner!==nextOwner){this.message='閉鎖予定区画への新規入場を制限しています。';continue;}
   if(this.isFree(x,z)){this.player.x=x;this.player.z=z;moved=true;}
  }
  this.player.owner=this.owner;return moved;
 }
 startTransfer(){
  if(this.mode!=='idle'||this.liftActive)return false;
  this.plan=planTransfer(this.phase,this.next);this.lastCheck=validatePlan(this.plan);
  if(!this.lastCheck.ok){this.message='経路検証に失敗したため搬送を停止しました。';return false;}
  this.mode='warning';this.elapsed=0;this.paused=false;
  this.message=this.targetIsolated.length?`次周期で ${this.targetIsolated.join(', ')} が孤立します。5秒の退避時間。`:'搬送まで5秒。移動する搬送体に乗るか、固定回廊へ退避してください。';return true;
 }
 cancelWarning(){if(['warning','evacuate'].includes(this.mode)){this.mode='idle';this.plan=null;this.elapsed=0;this.message='搬送準備を取り消しました。';}}
 beginClosing(){
  const own=this.owner;
  if(!this.experimental&&this.targetIsolated.includes(own)){this.mode='evacuate';this.message='退避待ち：この区画は次周期で孤立します。固定回廊まで歩いて退避してください。';return;}
  // A body disc spanning a detachable seam must clear it before mechanical closure.
  if(this.player.z>-.46&&this.player.z<.46){this.mode='evacuate';this.message='継ぎ目上で待機中です。廊下または搬送体の内側へ移動してください。';return;}
  // Also protect lateral detachable seams (permanent internal chunk seams are safe).
  if(BY_ID[own]){const p=this.positions[own];for(const port of BY_ID[own].ports){if((port.face==='E'||port.face==='W')&&Math.abs(this.player.x-(p.x+(port.face==='E'?Math.max(...BY_ID[own].cells.map(c=>c[0]+1))*8:0)))<.46){this.mode='evacuate';this.message='側面継ぎ目から離れてください。';return;}}}
  this.passenger=BY_ID[own]?{id:own,x:this.player.x-this.positions[own].x,z:this.player.z-this.positions[own].z}:null;
  this.fixedBefore={...this.player};this.mode='closing';this.elapsed=0;this.invalidate();
 }
 tick(dt){
  this.clock+=dt;if(this.paused)return;
  const delta=Math.min(dt,.1)*this.speed;
  if(this.liftActive){this.liftTime+=delta;const t=Math.min(1,this.liftTime/5);this.liftY=this.liftFrom+(this.liftTarget-this.liftFrom)*t;if(this.liftPassenger)this.player.y=this.liftY;this.invalidate();if(t===1){this.liftActive=false;this.message=this.liftPassenger?`${this.liftY===24?'第三層':'第二層'}に到着しました。固定回廊へ降りられます。`:'呼び出したかごが到着しました。中へ歩いて入り、Eで階を移動できます。';}}
  if(this.mode==='idle')return;
  if(this.mode==='evacuate'){this.beginClosing();return;}
  this.elapsed+=delta;
  if(this.mode==='warning'){if(this.elapsed>=5)this.beginClosing();return;}
  if(this.mode==='closing'){this.shutter=Math.min(1,this.elapsed/1.2);this.invalidate();if(this.elapsed>=1.5){this.mode='moving';this.elapsed=0;this.shutter=1;}return;}
  if(this.mode==='moving'){
   this.positions=positionDuring(this.plan,Math.min(this.elapsed,this.plan.duration));
   let sum=0;this.stageIndex=this.plan.stages.findIndex(s=>{sum+=s.duration;return this.elapsed<sum;});
   if(this.passenger){const p=this.positions[this.passenger.id];this.player.x=p.x+this.passenger.x;this.player.z=p.z+this.passenger.z;this.player.y=p.y;}
   this.invalidate();
   if(this.elapsed>=this.plan.duration){
    this.phase=this.plan.to;this.positions=placements(this.phase);this.mode='opening';this.elapsed=0;this.completed++;
    this.history.unshift(`${this.plan.from} → ${this.phase}：${this.lastCheck.checks}件の連続衝突検査、干渉0`);this.history=this.history.slice(0,6);
   }return;
  }
  if(this.mode==='opening'){this.shutter=1-Math.min(1,this.elapsed/1.2);this.invalidate();if(this.elapsed>=1.3){this.mode='idle';this.shutter=0;this.invalidate();this.message=isolated(this.phase).includes(this.owner)?'意図的な孤立状態です。次の周期で物理的に再接続できます。':'搬送完了。新しい開口と到達範囲を探索できます。';}}
 }
 useLift(){
  if(this.mode!=='idle'||this.liftActive)return false;
  if(this.owner!=='lift'){
   if(this.owner==='fixed'&&this.player.x<.5&&this.player.z<-0.5){
    if(Math.abs(this.liftY-this.player.y)<.01){this.message='かごが到着しています。西側のかご内へ歩いて入ってください。';return false;}
    this.liftFrom=this.liftY;this.liftTarget=this.player.y;this.liftTime=0;this.liftActive=true;this.liftPassenger=false;this.invalidate();this.message='固定エレベーターを呼び出しています。';return true;
   }
   this.message='西端の固定エレベーターの乗り場またはかご内で E を押してください。';return false;
  }
  if(this.player.x>-2.5){this.message='エレベーターの継ぎ目から離れ、かごの奥へ進んでください。';return false;}
  this.liftFrom=this.liftY;this.liftTarget=this.liftY===24?0:24;this.liftTime=0;this.liftActive=true;this.liftPassenger=true;this.invalidate();this.message='固定エレベーターが生活階の間を移動しています。';return true;
 }
 interact(){
  if(this.mode!=='idle'&&this.mode!=='warning'&&this.mode!=='evacuate')return;
  if(this.owner==='lift'||(this.owner==='fixed'&&this.player.x<.5)){this.useLift();return;}
  let near=null,dist=2.1;
  for(const b of BODIES){const p=this.positions[b.id];if(Math.abs(p.y-this.player.y)>.01)continue;
   for(const d of b.doors){const n=segmentDistance(this.player.x-p.x,this.player.z-p.z,d.a,d.b);if(n<dist){near=d;dist=n;}}
  }
  if(near){if(near.locked){this.message=`${near.label}：設計上の閉鎖です。${near.glass?'窓からの視認のみ可能。':'搬送による孤立とは異なります。'}`;return;}this.doors[near.id]=!this.doors[near.id];this.invalidate();
   // Do not materialize a closed door through the player.
   if(!this.isFree(this.player.x,this.player.z)){this.doors[near.id]=true;this.invalidate();this.message='扉から少し離れてください。';}else this.message=`${near.label}を${this.doors[near.id]?'開き':'閉じ'}ました。`;return;}
  this.message='E：近くの通常扉を開閉／エレベーター内で階を移動。';
 }
 rescue(){this.player={x:6,y:24,z:-1.8,yaw:0,pitch:0,owner:'fixed'};this.passenger=null;if(this.liftActive){this.liftActive=false;this.liftY=this.liftTarget;}this.invalidate();this.message='デバッグ復帰：第三層の固定回廊へ移動しました。物理的な出口の証明には含めません。';}
}
