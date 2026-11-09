import {BODIES,BY_ID,CELL,HEIGHT,DECK,LEVELS,placements} from './architecture.js';
export const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});
export function boxes(id,p){return BY_ID[id].cells.map(([x,z])=>({id,min:[p.x+x*CELL,p.y,p.z+z*CELL],max:[p.x+(x+1)*CELL,p.y+HEIGHT,p.z+(z+1)*CELL]}));}
export const intersects=(a,b)=>a.min.every((v,i)=>v<b.max[i]-1e-7&&a.max[i]>b.min[i]+1e-7);
export const FIXED=[{id:'EV',min:[-6,-1,-4],max:[-2,30,0]},{id:'ANNEX',min:[48,0,4],max:[52,5,8]},...LEVELS.map((y,i)=>({id:`SPINE${i}`,min:[-2,y,-4],max:[48,y+HEIGHT,0]}))];
const swept=(a,b)=>({id:a.id,min:a.min.map((v,i)=>Math.min(v,b.min[i])),max:a.max.map((v,i)=>Math.max(v,b.max[i]))});
// Exact continuous relative-motion slab test, including contact at ends.
export function movingCollision(a0,a1,b0,b1){
 let enter=0,exit=1;
 for(let k=0;k<3;k++){
  const v=(a1.min[k]-a0.min[k])-(b1.min[k]-b0.min[k]);
  if(Math.abs(v)<1e-10){if(a0.max[k]<=b0.min[k]+1e-7||a0.min[k]>=b0.max[k]-1e-7)return false;continue;}
  let t1=(b0.min[k]-a0.max[k])/v,t2=(b0.max[k]-a0.min[k])/v;
  if(t1>t2)[t1,t2]=[t2,t1];enter=Math.max(enter,t1);exit=Math.min(exit,t2);
  if(enter>=exit-1e-8)return false;
 }
 return enter<exit-1e-8&&exit>0&&enter<1;
}
export function planTransfer(from,to){
 const current=structuredClone(placements(from)),target=placements(to),stages=[];
 const add=(label,ends)=>{const motions=Object.entries(ends).map(([id,end])=>({id,from:{...current[id]},to:{...end}}));const distance=Math.max(0,...motions.map(m=>Math.hypot(m.to.x-m.from.x,m.to.y-m.from.y,m.to.z-m.from.z)));if(distance<1e-8)return;stages.push({label,motions,duration:Math.max(.4,distance/8)});for(const m of motions)current[m.id]={...m.to};};
 const groups=LEVELS.map(y=>BODIES.filter(b=>current[b.id].y===y).map(b=>b.id));
 // Far parking row first. Parallel envelopes occupy disjoint x intervals.
 for(let level=0;level<2;level++){
  const ids=groups[level];add(`${level===0?'第二層':'第三層'}・4搬送体を降着デッキへ`,Object.fromEntries(ids.map(id=>[id,{...current[id],y:DECK}])));
  add(`${level===0?'遠方64m':'近方40m'}退避ベイへ同時移動`,Object.fromEntries(ids.map(id=>[id,{...current[id],z:level===0?64:40}])));
 }
 // Near row must clear before the far row can pass. Horizontal repositioning occurs at z=20.
 for(const id of [...groups[1],...groups[0]]){
  add(`${id}・退避ベイから横行路へ`,{[id]:{...current[id],z:20}});
  add(`${id}・横行位置合わせ`,{[id]:{...current[id],x:target[id].x}});
  add(`${id}・目的ドックへ`,{[id]:{...current[id],z:0}});
  add(`${id}・生活階へ固定`,{[id]:target[id]});
 }
 return {from,to,stages,duration:stages.reduce((s,x)=>s+x.duration,0)};
}
export function validatePlan(plan,initial=placements(plan.from)){
 const positions=structuredClone(initial),errors=[];let checks=0,maxConcurrent=0;
 for(let si=0;si<plan.stages.length;si++){
  const stage=plan.stages[si],moving=new Map(stage.motions.map(m=>[m.id,m]));maxConcurrent=Math.max(maxConcurrent,moving.size);
  for(const m of stage.motions){
   if(['x','y','z'].some(k=>Math.abs(positions[m.id][k]-m.from[k])>1e-6))errors.push({stage:si,id:m.id,type:'discontinuous-start'});
   if(['x','y','z'].filter(k=>Math.abs(m.from[k]-m.to[k])>1e-7).length!==1)errors.push({stage:si,id:m.id,type:'non-axis-route'});
  }
  const ids=BODIES.map(b=>b.id);
  for(let i=0;i<ids.length;i++){
   const id=ids[i],m=moving.get(id),a0=boxes(id,positions[id]),a1=boxes(id,m?.to??positions[id]);
   if(m)for(let k=0;k<a0.length;k++)for(const f of FIXED){checks++;if(intersects(swept(a0[k],a1[k]),f))errors.push({stage:si,id,other:f.id,type:'fixed-collision'});}
   for(let j=i+1;j<ids.length;j++){
    const jd=ids[j],n=moving.get(jd);if(!m&&!n)continue;
    const b0=boxes(jd,positions[jd]),b1=boxes(jd,n?.to??positions[jd]);
    for(let a=0;a<a0.length;a++)for(let b=0;b<b0.length;b++){checks++;if(movingCollision(a0[a],a1[a],b0[b],b1[b]))errors.push({stage:si,id,other:jd,type:'body-collision'});}
   }
  }
  for(const m of stage.motions)positions[m.id]={...m.to};
 }
 const final=placements(plan.to);for(const id of Object.keys(final))if(['x','y','z'].some(k=>Math.abs(final[id][k]-positions[id][k])>1e-7))errors.push({id,type:'wrong-destination'});
 return {ok:errors.length===0,stages:plan.stages.length,checks,maxConcurrent,duration:plan.duration,errors};
}
export function positionDuring(plan,time){const pos=placements(plan.from);let elapsed=0;for(const s of plan.stages){if(time>=elapsed+s.duration){for(const m of s.motions)pos[m.id]={...m.to};}else{const t=Math.max(0,(time-elapsed)/s.duration);for(const m of s.motions)pos[m.id]=mix(m.from,m.to,t);break;}elapsed+=s.duration;}return pos;}
