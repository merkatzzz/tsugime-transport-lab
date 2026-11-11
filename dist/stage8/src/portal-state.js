import {canEverOpen} from './wall-roles.js';
import {BODIES} from './architecture.js';
export const panelIntervals=p=>{const cuts=[...new Set([p.a,p.b,...(p.profiles??[]).flat()].filter(v=>v>=p.a&&v<=p.b))].sort((a,b)=>a-b);return cuts.slice(0,-1).map((a,i)=>({a,b:cuts[i+1]})).filter(q=>canEverOpen(p,q.a,q.b));};
export const panelKey=(id,p,a)=>id+':'+p.id+':'+a.toFixed(2);
export function portalTargets(s){const key=s.phase+':'+(['closing','moving','retracting'].includes(s.mode))+':'+(s.shutter>.01)+':'+JSON.stringify(s.doors);if(s.portalTargetKey===key)return s.portalTargetRows;s.portalTargetKey=key;const out=[];for(const b of BODIES)for(const p of b.ports.filter(p=>p.adaptive)){const state=s.livePorts.find(q=>q.key===b.id+':'+p.id);for(const {a,b:end}of panelIntervals(p)){const open=!['closing','moving','retracting'].includes(s.mode)&&state?.openings.some(o=>a>=o.a-1e-6&&end<=o.b+1e-6);out.push({key:panelKey(b.id,p,a),target:open?0:1});}}s.portalTargetRows=out;return out;}
export function tickPortals(s,dt,init=false){s.portalAmounts??={};for(const {key,target}of portalTargets(s)){const old=s.portalAmounts[key];s.portalAmounts[key]=init||old===undefined?target:old+Math.sign(target-old)*Math.min(Math.abs(target-old),dt/.65);}}
export const portalsClosed=s=>Object.values(s.portalAmounts??{}).every(v=>v>=1-1e-6);
export const portalsReady=s=>portalTargets(s).every(({key,target})=>Math.abs(s.portalAmounts[key]-target)<1e-6);
