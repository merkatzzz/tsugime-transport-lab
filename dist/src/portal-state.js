import {wallSweepOccupied} from './large-room-safety.js';
import {canEverOpen} from './wall-roles.js';
import {BODIES,BY_ID,portStates} from './architecture.js';
export const panelIntervals=p=>{const cuts=[...new Set([p.a,p.b,...(p.profiles??[]).flat()].filter(v=>v>=p.a&&v<=p.b))].sort((a,b)=>a-b);return cuts.slice(0,-1).map((a,i)=>({a,b:cuts[i+1]})).filter(q=>canEverOpen(p,q.a,q.b));};
export const panelKey=(id,p,a)=>id+':'+p.id+':'+a.toFixed(2);
export function portalTargets(s){const key=s.phase+':'+(['closing','moving','retracting'].includes(s.mode))+':'+(s.shutter>.01)+':'+JSON.stringify(s.doors);if(s.portalTargetKey===key)return s.portalTargetRows;s.portalTargetKey=key;const out=[];for(const b of BODIES)for(const p of b.ports.filter(p=>p.adaptive)){const state=portStates(s.phase,s.experiment,s.doors).find(q=>q.key===b.id+':'+p.id);for(const {a,b:end}of panelIntervals(p)){const open=!['closing','moving','retracting'].includes(s.mode)&&state?.openings.some(o=>a>=o.a-1e-6&&end<=o.b+1e-6);out.push({key:panelKey(b.id,p,a),target:open?0:1,body:b.id,port:p});}}s.portalTargetRows=out;return out;}
export function tickPortals(s,dt,init=false){s.portalAmounts??={};let changed=false;s.wideWallBlocked=false;for(const {key,target,body,port}of portalTargets(s)){const old=s.portalAmounts[key],next=init||old===undefined?target:old+Math.sign(target-old)*Math.min(Math.abs(target-old),dt/.65);if(!init&&old!==undefined&&next!==old&&wallSweepOccupied(s,BY_ID[body],port,old,next)){s.wideWallBlocked=true;s.message='大部屋の可動壁：開口から室内へ一歩離れるまで待機します。';continue;}if(next!==old){changed=true;s.portalAmounts[key]=next;}}if(changed)s.invalidate();}
export const portalsClosed=s=>Object.values(s.portalAmounts??{}).every(v=>v>=1-1e-6);
export const portalsReady=s=>portalTargets(s).every(({key,target})=>Math.abs(s.portalAmounts[key]-target)<1e-6);

export const widePortReady=(s,id,p)=>!p.wideSafety||panelIntervals(p).every(a=>(s.portalAmounts?.[panelKey(id,p,a.a)]??0)<1e-6);
export const wideConnectionReady=(s,c)=>[['bodyA','portA'],['bodyB','portB']].every(([bk,pk])=>{const p=BY_ID[c[bk]]?.ports.find(p=>p.id===c[pk]);return !p||widePortReady(s,c[bk],p);});

export const wideWallsSettled=s=>portalTargets(s).filter(r=>r.port.wideSafety).every(r=>Math.abs((s.portalAmounts?.[r.key]??r.target)-r.target)<1e-8);

export const widePortalSignature=s=>BODIES.flatMap(b=>b.ports.filter(p=>p.wideSafety).map(p=>b.id+':'+p.id+':'+widePortReady(s,b.id,p))).join('|');
