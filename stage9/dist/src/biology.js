import {BIOS,SPRINGS,springBoxes} from './infrastructure.js';
import {BODIES,BY_ID,LEVELS,serviceReachable,portSegment,segmentDistance,boundaryWalls} from './architecture.js';
import {toWorld,rotateFace,worldRect} from './pose.js';
export function segmentHitsBox(a,b,box,r=.1){let lo=0,hi=1;for(const [i,k]of ['x','y','z'].entries()){const d=b[k]-a[k],min=box.min[i]-r,max=box.max[i]+r;if(Math.abs(d)<1e-10){if(a[k]<min||a[k]>max)return false;}else{let u=(min-a[k])/d,v=(max-a[k])/d;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);if(lo>hi)return false;}}return true;}
export function connectionCheck(sim,bio,spring,claimed=new Set()){
 const p=sim.positions[bio.body],body=BY_ID[bio.body],face=rotateFace(bio.face,p.angle),opposite={E:'W',W:'E',N:'S',S:'N'};
 if(Math.abs(p.y-spring.y)>.01)return{ok:false,reason:'階が異なる'};
 if(opposite[face]!==spring.face)return{ok:false,reason:'接続方向が不一致'};
 const opening=body.ports.find(q=>q.id===bio.port&&q.face===bio.face);if(!opening||opening.height<1||opening.b-opening.a<.6)return{ok:false,reason:'実開口がない'};
 const a=toWorld(p,bio.anchor),mouth={...spring.mouth,y:spring.y+.9},axis=['E','W'].includes(face)?'x':'z',other=axis==='x'?'z':'x',direction=['E','S'].includes(face)?1:-1;
 if(Math.abs(a[other]-mouth[other])>.01||(mouth[axis]-a[axis])*direction<=0)return{ok:false,reason:'開口中心が整列していない'};
 const b={...mouth};b[axis]+=direction*1.1;b.y-=.05;const length=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
 if(length>bio.maxLength)return{ok:false,reason:'触手の長さが不足'};
 // Check the real local room shell/furniture before exempting its own body envelope.
 const la=bio.anchor,le={x:8,y:.9,z:4};for(const l of [...boundaryWalls(body),...body.walls])for(let t=0;t<=1;t+=.05)if(segmentDistance(la.x+(le.x-la.x)*t,la.z+(le.z-la.z)*t,l.a,l.b)<.16)return{ok:false,reason:'寄生壁側の開口経路が塞がれている'};
 for(const otherBody of BODIES){if(otherBody.id===bio.body)continue;const q=sim.positions[otherBody.id];for(const[cx,cz]of otherBody.cells){const r=worldRect(q,{x:cx*8,z:cz*8,w:8,d:8});if(segmentHitsBox(a,b,{min:[r.x,q.y,r.z],max:[r.x+r.w,q.y+6,r.z+r.d]}))return{ok:false,reason:'途中のチャンクが経路を占有：'+otherBody.id};}}
 for(const q of springBoxes().filter(q=>q.id!==spring.id))if(segmentHitsBox(a,b,q))return{ok:false,reason:'別の固定貯留槽が遮断'};
 if(claimed.has(spring.id))return{ok:false,reason:'泉は別個体が接続中'};
 return{ok:true,reason:'実開口・方向・長さ・経路を確認',spring:spring.id,from:a,to:b,length,face,gap:Math.abs(mouth[axis]-toWorld(p,{x:8,z:4})[axis])};
}
export class Biology{
 constructor(sim){this.sim=sim;this.wells=Object.fromEntries(SPRINGS.map(p=>[p.id,{toxicity:.8,connected:null,state:'毒性が高い'}]));this.animals=Object.fromEntries(BIOS.map(b=>[b.id,{progress:0,gate:0,connection:null,reason:'接続確認中'}]));this.reservations=[];this.lastUse=null;}
 get retracted(){return Object.values(this.animals).every(a=>a.progress<1e-6&&a.gate<1e-6);}
 tick(dt){const s=this.sim,canExtend=s.mode==='idle',claimed=new Set();this.reservations=[];
  for(const bio of BIOS){const a=this.animals[bio.id];if(canExtend){const key=s.phase+JSON.stringify(s.positions);if(this.candidateKey!==key){this.candidateKey=key;this.candidates={};const used=new Set();for(const b of BIOS){let match=null;const reasons=[];for(const p of SPRINGS){const check=connectionCheck(s,b,p,used);if(check.ok){match=check;break;}reasons.push(p.id+': '+check.reason);}this.candidates[b.id]={match,reason:match?.reason??reasons.join(' ／ ')};if(match)used.add(match.spring);}}const {match,reason}=this.candidates[bio.id];a.connection=match;a.reason=reason;a.gate=Math.max(0,Math.min(1,a.gate+dt/.2*(match?1:-1)));a.progress=Math.max(0,Math.min(1,a.progress+dt/.8*(match&&a.gate>=.999?1:-1)));}else{a.progress=Math.max(0,a.progress-dt/.5);if(a.progress<1e-6)a.gate=Math.max(0,a.gate-dt/.2);}
   if(a.progress>0&&a.connection)this.reservations.push({bio:bio.id,spring:a.connection.spring,from:a.connection.from,to:a.connection.to,radius:.1});
  }
  for(const p of SPRINGS){const w=this.wells[p.id],active=canExtend?BIOS.find(b=>{const a=this.animals[b.id];return a.progress>=.999&&a.connection?.spring===p.id;}):null;w.connected=active?.id??null;w.toxicity=Math.max(0,Math.min(1,w.toxicity+dt*(.025-(active ? .12 : 0))));w.state=active?(w.toxicity<=.2?'利用可能':'泉全体を中和中'):w.toxicity<=.2?'接続解除・再び毒性上昇中':'毒性が高い';}
 }
 available(){const s=this.sim,reachable=serviceReachable(s.phase,s.experiment,s.safetyDoors);return LEVELS.map(y=>({y,connected:BIOS.filter(b=>{const a=this.animals[b.id];return s.positions[b.body].y===y&&a.progress>=.999&&a.connection&&reachable.has(b.body+'/0');}).length,ready:BIOS.filter(b=>{const a=this.animals[b.id];return s.positions[b.body].y===y&&a.progress>=.999&&a.connection&&this.wells[a.connection.spring].connected===b.id&&this.wells[a.connection.spring].toxicity<=.2&&reachable.has(b.body+'/0');}).length}));}
 interact(id=null){const s=this.sim;if(s.mode!=='idle')return false;const bio=BIOS.find(b=>(!id||b.id===id)&&s.owner===b.body&&(()=>{const p=toWorld(s.positions[b.body],b.supply);return Math.hypot(p.x-s.player.x,p.z-s.player.z)<1.7;})());if(!bio)return false;const a=this.animals[bio.id],w=a.connection&&this.wells[a.connection.spring];if(a.progress>=.999&&w?.connected===bio.id&&w.toxicity<=.2){this.lastUse={bio:bio.id,spring:a.connection.spring,time:s.clock};s.message='供給器官から中和済みの液体を受け取りました。';s.experience.event('supply',bio.body);}else s.message='供給器官は待機中です。泉全体の中和完了を待ってください。';return true;}
}
