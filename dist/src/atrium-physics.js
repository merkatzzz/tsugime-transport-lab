import{gateDefinitions,gateLeaves}from'./atrium-gates.js';
import {bodyOverlaps} from './collision-volume.js';
import {ATRIUM_IDS,BASE,HOLE,SHAFT,GLASS_BAYS,ENTRY_RAMP,inside} from './atrium-layout.js';
import {BY_ID,boundaryWalls,portSegment,segmentDistance} from './architecture.js';import{doorLeaf}from'./doors.js';import{toLocal}from'./pose.js';
export const clamp=x=>Math.max(0,Math.min(1,x));
export function atriumAligned(s){const a=s.positions.AT0,b=s.positions.AT1,c=s.positions.AT2;return!!a&&[b,c].every((p,i)=>p&&Math.hypot(p.x-a.x,p.z-a.z)<1e-6&&Math.abs(p.y-a.y-6.4*(i+1))<1e-6&&(p.angle??0)===(a.angle??0));}
export function atriumChannels(s){const p=s.atrium?.progress??0;return{progress:p,collar:clamp(p/.1),well:clamp((p-.1)/.1)-clamp((p-.4)/.1),guard:clamp((p-.2)/.2),ceiling:clamp((p-.5)/.2),floor:clamp((p-.7)/.2),stairs:clamp((p-.9)/.04),stairRails:clamp((p-.94)/.02),gate:clamp((p-.96)/.04),structureReady:p>=.96&&atriumAligned(s),ready:p>=1-1e-8&&atriumAligned(s)};}
export function atriumDanger(s,opening=false,nextProgress=s.atrium?.progress??0){const p=s.atrium?.progress??0;const gateOccupied=gateSweepOccupied(s,p,nextProgress);if(opening&&p>=.96)return gateOccupied;if(!opening&&gateOccupied)return true;for(const id of ATRIUM_IDS){const q=toLocal(s.positions[id],s.player);if(q.x<0||q.x>16||q.z<0||q.z>16||q.y<-.6||q.y>6)continue;if((id!=='AT0'&&inside({x:4.65,z:4.65,w:6.7,d:6.7},q.x,q.z))||inside({x:11.5,z:2.1,w:3.4,d:6.69},q.x,q.z))return true;}return false;}
export function tickAtrium(s,dt){s.atrium??={progress:0,blocked:false};const want=s.phase==='B'&&s.mode==='idle'&&atriumAligned(s),p=s.atrium.progress;s.atrium.blocked=false;if((want&&p<1)||(!want&&p>0)){if(atriumDanger(s,want,clamp(p+(want?1:-1)*Math.min(dt,.1)*s.speed/6))){s.atrium.blocked=true;s.message='吹き抜け機構の待機：可動床・階段・ゲートの動作範囲から、離れた固定床へ歩いて移動してください。';return;}s.atrium.progress=clamp(p+(want?1:-1)*Math.min(dt,.1)*s.speed/6);s.invalidate();}}
export function atriumReadyToMove(s){if((s.atrium?.progress??0)>.000001||atriumDanger(s)){s.mode='evacuate';s.message='吹き抜けの閉鎖待ちです。階段・ゲートから数歩離れた固定床へ歩いて退避してください。';return false;}return true;}
export function atriumSurfaces(s,id,x,z){if(x<0||x>16||z<0||z>16)return[];const tier=BY_ID[id].atrium,c=atriumChannels(s),out=[];
 if(tier===0&&x<=ENTRY_RAMP.w&&z>=ENTRY_RAMP.z&&z<=ENTRY_RAMP.z+ENTRY_RAMP.d)return[BASE*Math.max(0,x-ENTRY_RAMP.landing)/(ENTRY_RAMP.w-ENTRY_RAMP.landing)];
 if(x>=12&&x<=14.4&&z>=4.62&&z<=13.2&&tier<2)return[BASE+Math.max(0,Math.min(33,Math.ceil((13.2-z-1e-7)/.26)))*.16];
 if(tier>0&&inside(SHAFT,x,z)){if(c.structureReady&&z<=4.62)return[BASE-6.4+Math.min(40,Math.ceil((13.2-z-1e-7)/.26))*.16];if(c.ceiling>.001)return[];}
 if(tier>0&&inside(HOLE,x,z)&&c.floor>.001)return[];
 if(tier>0&&c.well>.001&&GLASS_BAYS.some(r=>inside(r,x,z)))return[];
 out.push(BASE);return out;
}
export function atriumOwner(s,x,z,y){for(const id of ATRIUM_IDS){const p=s.positions[id];if(!p)continue;const q=toLocal(p,{x,y,z});if(atriumSurfaces(s,id,q.x,q.z).some(h=>Math.abs(h-q.y)<.021))return id;}return null;}
export function atriumHeight(s,x,z,y){let best=y,delta=Infinity;for(const id of ATRIUM_IDS){const p=s.positions[id],q=toLocal(p,{x,y,z});for(const h of atriumSurfaces(s,id,q.x,q.z)){const d=Math.abs(h-q.y);if(d<.181&&d<delta){best=p.y+h;delta=d;}}}return best;}
export function atriumClear(s,id,x,z,y,r){const b=BY_ID[id],q=toLocal(s.positions[id],{x,y,z}),c=atriumChannels(s),lines=[...boundaryWalls(b).map(l=>({...l,height:6,floor:-.16})),...b.walls,...b.doors.map(d=>({...doorLeaf(d,s.experience.doorProgress[d.id]??0),floor:BASE,height:2.05}))];
 if(c.guard>.01&&b.atrium>0)lines.push(...[{a:[6,6],b:[10,6]},{a:[10,6],b:[10,10]},{a:[10,10],b:[6,10]},{a:[6,10],b:[6,6]}].map(l=>({...l,floor:BASE,height:1.3})));
 if(q.x>11.5&&q.x<14.9&&q.z>4.5&&q.z<13.35&&b.atrium<2){const h=BASE+Math.ceil((13.2-q.z)/.26)*.16;if(q.y>=h-.2)for(const xx of[12,14.4])if(Math.abs(q.x-xx)<r+.04)return false;}
 if(c.structureReady&&b.atrium>0&&q.z>2.75&&q.z<4.7){const h=BASE-6.4+Math.min(40,Math.ceil((13.2-q.z)/.26))*.16;if(q.y>=h-.2)for(const xx of[12,14.4])if(Math.abs(q.x-xx)<r+.04)return false;}for(const d of gateDefinitions(b.atrium))for(const l of gateLeaves(d,c.gate))if(bodyOverlaps(q.y,l.bottom,l.top)&&segmentDistance(q.x,q.z,l.a,l.b)<r+.04)return false;
 if(inside({x:8.2,z:2.8,w:2.4,d:1.82},q.x,q.z,r)&&bodyOverlaps(q.y,.64,2))return false;
 for(const l of lines)if(bodyOverlaps(q.y,(l.floor??0)+.16,(l.floor??0)+.16+(l.height??3.4))&&segmentDistance(q.x,q.z,l.a,l.b)<r+.06-1e-7)return false;
 for(const p of b.ports){const state=s.livePorts.find(v=>v.key===id+':'+p.id);for(const m of state?.masked??[{a:p.a,b:p.b}]){const l=portSegment(b,{...p,...m});if(segmentDistance(q.x,q.z,l.a,l.b)<r+.06)return false;}}
 for(const a of b.furniture)if(bodyOverlaps(q.y,(a.floor??BASE)+.16,(a.floor??BASE)+.16+a.h)&&Math.hypot(Math.max(a.x-q.x,0,q.x-a.x-a.w),Math.max(a.z-q.z,0,q.z-a.z-a.d))<r+.01)return false;return true;
}

export function atriumSupport(s,x,z,y){for(const id of ATRIUM_IDS){const q=toLocal(s.positions[id],{x,y,z});if(atriumSurfaces(s,id,q.x,q.z).some(h=>Math.abs(h-q.y)<.331))return true;}return false;}

export function gateSweepOccupied(s,from,to){const a=clamp((from-.96)/.04),b=clamp((to-.96)/.04),n=Math.max(1,Math.ceil(Math.abs(b-a)/.02));for(const id of ATRIUM_IDS){const q=toLocal(s.positions[id],s.player);if(q.x<11.5||q.x>15||q.z<1.5||q.z>9)continue;for(let k=0;k<=n;k++)for(const d of gateDefinitions(BY_ID[id].atrium))for(const l of gateLeaves(d,a+(b-a)*k/n))if(bodyOverlaps(q.y,l.bottom,l.top)&&segmentDistance(q.x,q.z,l.a,l.b)<.39-1e-6)return true;}return false;}
