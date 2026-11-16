import {planTransfer,validatePlan,mix,positionDuring} from './transport.js';
// Experimental timing override only. The normal scheduler and its cached plans are untouched.
export const FAULT_PRESET={id:'ab-roof-first-1',time:4.3,delayBody:'SM1',delay:2.3,room:'SM0',roof:'SM1',openPorts:['SM0:E'],start:{x:46,y:0,z:62.4,yaw:Math.PI/2,pitch:0,owner:'SM0'}};
let cached;
let routeCached;
export function faultPlan(route=false){
 if(route&&routeCached)return structuredClone(routeCached);
 if(!route&&cached)return structuredClone(cached);
 const base=planTransfer('A','B',{size:'ring1',method:'cooperative'}),segments=[];let time=0;
 for(const stage of base.stages){for(const m of stage.motions){const offset=m.id===FAULT_PRESET.delayBody?(route?2.033333333333333:FAULT_PRESET.delay):0;segments.push({m,start:time+offset,end:time+stage.duration+offset,label:stage.label});}time+=stage.duration;}
 const cuts=[...new Set([0,...segments.flatMap(s=>[s.start,s.end])])].sort((a,b)=>a-b),stages=[];
 for(let i=1;i<cuts.length;i++){const start=cuts[i-1],end=cuts[i];if(end-start<1e-8)continue;const active=segments.filter(s=>s.start<=start+1e-8&&s.end>=end-1e-8);stages.push({label:active.length?'故障試験・既存経路の時間予約':'故障試験・予約待機',duration:end-start,motions:active.map(s=>({id:s.m.id,from:mix(s.m.from,s.m.to,(start-s.start)/(s.end-s.start)),to:mix(s.m.from,s.m.to,(end-s.start)/(s.end-s.start))}))});}
 const plan={...base,stages,reservations:base.reservations.map(r=>r.id===FAULT_PRESET.delayBody?{...r,start:r.start+(route?2.033333333333333:FAULT_PRESET.delay),end:r.end+(route?2.033333333333333:FAULT_PRESET.delay)}:r),duration:cuts.at(-1),planningError:null};
 const check=validatePlan(plan);if(!check.ok)throw Error('故障試験経路の離隔不成立: '+JSON.stringify(check.errors.slice(0,2)));
 if(route)routeCached=plan;else cached=plan;return structuredClone(plan);
}
export const faultPositions=(route=false)=>positionDuring(faultPlan(route),FAULT_PRESET.time);
