import test from 'node:test';
import assert from 'node:assert/strict';
import {BODIES,BY_ID,CELL,HEIGHT,LEVELS,NEXT,placements,connections,isolated,footprint,insideBody,portSegment,segmentDistance} from '../dist/src/architecture.js';
import {Simulation} from '../dist/src/simulation.js';
import {planTransfer,validatePlan,positionDuring,boxes,movingCollision,intersects,FIXED} from '../dist/src/transport.js';
const atPhase=phase=>{const s=new Simulation();s.phase=phase;s.positions=placements(phase);s.invalidate();return s;};
function runUntil(s,predicate,max=20000){for(let i=0;i<max&&!predicate();i++)s.tick(.05);assert.ok(predicate(),`timeout: ${s.mode}`);}
function place(s,id,x,z){const p=s.positions[id];s.player={x:p.x+x,y:p.y,z:p.z+z,yaw:0,pitch:0,owner:id};assert.ok(s.isFree(s.player.x,s.player.z),`invalid fixture ${id}`);}
function flood(s,y){
 const step=.25,seen=new Set(),queue=[[24,-8]],key=(x,z)=>`${x},${z}`;
 for(let head=0;head<queue.length;head++){const [x,z]=queue[head],k=key(x,z);if(seen.has(k)||x< -24||x>192||z< -16||z>64||!s.isFree(x*step,z*step,y))continue;seen.add(k);queue.push([x+1,z],[x-1,z],[x,z+1],[x,z-1]);}
 return {seen,has:(x,z)=>seen.has(key(Math.round(x/step),Math.round(z/step))),owners:new Set([...seen].map(k=>{const [x,z]=k.split(',').map(Number);return s.ownerAt(x*step,z*step,y);} ))};
}
test('uniform occupied cells and independent interior dimensions, including an exact 3-cell L',()=>{
 assert.equal(CELL,8);assert.equal(HEIGHT,5);assert.deepEqual(BODIES.map(b=>b.cells.length).sort(),[1,1,1,1,2,2,3,4]);assert.equal(BODIES.reduce((s,b)=>s+b.cells.length,0),15);
 for(const b of BODIES){const p={x:0,y:0,z:0};for(const a of boxes(b.id,p))assert.deepEqual(a.max.map((v,i)=>v-a.min[i]),[8,5,8]);assert.ok(b.ceiling<HEIGHT);}
 assert.equal(insideBody(BY_ID.L1,12,12),false);assert.equal(insideBody(BY_ID.H1,12,12),true);assert.notEqual(BY_ID.R1.ports[0].b-BY_ID.R1.ports[0].a,footprint(BY_ID.R1).w);
});
for(const phase of ['A','B','C'])test(`${phase}: all graph connections agree with an actual body-disc traversal through both built wall faces`,()=>{
 const s=atPhase(phase);
 for(const c of connections(phase)){
  const b=BY_ID[c.a],p=s.positions[b.id],face=c.face,qa=b.ports.find(q=>q.face===face);let pass=false;
  if(qa){const seg=portSegment(b,qa);for(let t=0;t<=1;t+=.025){const x=p.x+seg.a[0]+(seg.b[0]-seg.a[0])*t,z=p.z+seg.a[1]+(seg.b[1]-seg.a[1])*t;let clear=true;for(let o=-.6;o<=.60001;o+=.05){if(!s.isFree(x+(face==='E'?o:0),z+(face==='N'?o:0),p.y)){clear=false;break;}}if(clear){pass=true;break;}}}
  assert.equal(pass,c.status==='pass',`${phase} ${c.a}–${c.b} width=${c.width}`);
 }
});
for(const phase of ['A','B','C'])test(`${phase}: geometry flood matches reachable bodies; closed rooms remain closed`,()=>{
 const s=atPhase(phase),found=new Set();
 for(const y of LEVELS){const f=flood(s,y);for(const id of f.owners)found.add(id);
  const r2=s.positions.R2;if(r2.y===y){assert.equal(f.has(r2.x+3,1.25),true,'simple room 1 enterable');assert.equal(f.has(r2.x+2,4),false,'room 2 locked');assert.equal(f.has(r2.x+2,6.5),false,'room 3 glazed and blocked');}
  for(const id of ['R1','R3','T1','T2','H1','L1']){const p=s.positions[id];if(p.y!==y)continue;const label=BY_ID[id].labels[0];assert.equal(f.has(p.x+label.x,p.z+label.z),true,`${id} representative interior`);}
 }
 assert.deepEqual(BODIES.filter(b=>!found.has(b.id)).map(b=>b.id),isolated(phase));
});
test('B provides a 0.4m visible slit but rejects a 0.7m body, with no fallback side route',()=>{
 const s=atPhase('B'),p=s.positions.R4;assert.equal(connections('B').find(c=>c.a==='R4'&&c.face==='N').status,'view');assert.equal(s.portIsOpen('R4',BY_ID.R4.ports[0]),true);
 assert.ok(s.isFree(p.x+5.2,0,p.y,.02),'thin sight ray crosses');assert.equal(s.isFree(p.x+5.2,0,p.y),false);assert.deepEqual(isolated('B'),['R4']);
});
for(const from of ['A','B','C'])test(`${from}→${NEXT[from]}: continuous envelopes clear fixed works and all other movers for the complete route`,()=>{
 const plan=planTransfer(from,NEXT[from]),v=validatePlan(plan);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(v.maxConcurrent,4);assert.ok(v.checks>1000);
 for(let t=0;t<=plan.duration;t+=.25){const p=positionDuring(plan,t);for(let i=0;i<BODIES.length;i++)for(const a of boxes(BODIES[i].id,p[BODIES[i].id])){assert.ok(a.min[0]>=0&&a.max[0]<=48&&a.min[1]>=0&&a.max[1]<=29&&a.min[2]>=0&&a.max[2]<=80,'within enclosed facility');for(const f of FIXED)assert.equal(intersects(a,f),false);for(let j=i+1;j<BODIES.length;j++)for(const b of boxes(BODIES[j].id,p[BODIES[j].id]))assert.equal(intersects(a,b),false);}}
 assert.deepEqual(positionDuring(plan,plan.duration),placements(NEXT[from]));
});
test('continuous collision rejects a crossing missed by endpoint-only testing',()=>{
 const a0={min:[0,0,0],max:[1,1,1]},a1={min:[4,0,0],max:[5,1,1]},b0={min:[2,0,-2],max:[3,1,-1]},b1={min:[2,0,2],max:[3,1,3]};assert.equal(intersects(a0,b0),false);assert.equal(intersects(a1,b1),false);assert.equal(movingCollision(a0,a1,b0,b1),true);
});
test('broken route and occupied destinations are refused rather than certified',()=>{
 const p=planTransfer('A','B');p.stages[0].motions[0].to.x=40;assert.equal(validatePlan(p).ok,false);const q=planTransfer('A','B');q.stages[1].motions[0].to.x=9;assert.ok(validatePlan(q).errors.some(e=>e.type==='non-axis-route'));
});
test('real walking stops at walls, thick unused structure, locked doors and furniture',()=>{
 const s=new Simulation();for(let i=0;i<50;i++)s.move(0,.1);assert.equal(s.owner,'R1');const initial=s.player.z;for(let i=0;i<100;i++)s.move(0,.1);assert.ok(s.player.z<7.61&&s.player.z>initial);
 assert.equal(s.isFree(7.6,3,24),false);assert.equal(s.isFree(1.2,1.5,24),false);s.player={x:12.8,y:24,z:4,yaw:0,pitch:0};for(let i=0;i<30;i++)s.move(-.1,0);assert.ok(s.player.x>12.4);s.interact();assert.match(s.message,/非公開/);
});
test('every moving passenger keeps its local position, while the fixed gallery stays fixed over a complete cycle',()=>{
 for(const id of BODIES.map(b=>b.id)){
  const s=new Simulation();s.experimental=true;const port=BY_ID[id].ports[0],x=(port.a+port.b)/2;place(s,id,x,1.2);const local={x,z:1.2};s.startTransfer();runUntil(s,()=>s.mode==='moving');
  for(let i=0;i<3000&&s.mode==='moving';i++){s.tick(.05);const p=s.positions[id];assert.ok(Math.abs(s.player.x-p.x-local.x)<1e-7);assert.ok(Math.abs(s.player.z-p.z-local.z)<1e-7);assert.equal(s.player.y,p.y);}
  runUntil(s,()=>s.mode==='idle');assert.equal(s.phase,'B');
 }
 const s=new Simulation(),start={...s.player};for(let i=0;i<3;i++){s.startTransfer();runUntil(s,()=>s.mode==='idle');assert.deepEqual(s.player,start);}assert.equal(s.phase,'A');assert.equal(s.completed,3);
});
test('shutters close and exploration locks until docking; pause freezes even halfway through a route',()=>{
 const s=new Simulation();s.startTransfer();runUntil(s,()=>s.mode==='moving');const p=structuredClone(s.positions);assert.equal(s.shutter,1);assert.equal(s.move(0,.5),false);assert.equal(s.isFree(6,0,24),false);s.paused=true;for(let i=0;i<100;i++)s.tick(.1);assert.deepEqual(s.positions,p);s.paused=false;runUntil(s,()=>s.mode==='idle');assert.equal(s.shutter,0);assert.equal(s.isFree(5.5,0,24),true);
});
test('normal mode waits for evacuation and blocks new admission; deliberate isolation reconnects in C',()=>{
 const s=new Simulation();place(s,'R4',3.8,1.2);s.startTransfer();runUntil(s,()=>s.mode==='evacuate');assert.equal(s.phase,'A');assert.match(s.message,/退避待ち/);for(let i=0;i<50;i++)s.move(0,-.1);assert.equal(s.owner,'fixed');runUntil(s,()=>s.mode==='idle');assert.equal(s.phase,'B');
 const a=new Simulation();a.player={x:11.8,y:0,z:-.6,yaw:0,pitch:0};a.startTransfer();for(let i=0;i<20;i++)a.move(0,.1);assert.equal(a.owner,'fixed');assert.match(a.message,/新規入場/);
 const e=new Simulation();e.experimental=true;place(e,'R4',3.8,1.2);e.startTransfer();runUntil(e,()=>e.mode==='idle');assert.equal(e.phase,'B');assert.equal(e.owner,'R4');assert.ok(isolated(e.phase).includes('R4'));e.startTransfer();runUntil(e,()=>e.mode==='idle');assert.equal(e.phase,'C');assert.equal(e.owner,'R4');assert.ok(!isolated(e.phase).includes('R4'));
});
test('mechanical closure waits while a body disc straddles a detachable seam',()=>{
 const s=new Simulation();s.player.z=0;s.startTransfer();runUntil(s,()=>s.mode==='evacuate');assert.equal(s.shutter,0);s.move(0,1);runUntil(s,()=>s.mode==='moving');assert.equal(s.passenger.id,'R1');
});
test('fixed elevator travels continuously in both directions; absent cabin can be called without moving the caller',()=>{
 const s=new Simulation();s.player.x=-4;s.player.z=-2;assert.equal(s.owner,'lift');assert.ok(s.useLift());s.tick(.1);assert.ok(s.player.y<24&&s.player.y>0);assert.equal(s.player.y,s.liftY);assert.equal(s.startTransfer(),false);runUntil(s,()=>!s.liftActive);assert.equal(s.player.y,0);s.useLift();runUntil(s,()=>!s.liftActive);assert.equal(s.player.y,24);
 s.liftY=0;s.player={x:-1,y:24,z:-2,yaw:0,pitch:0};s.invalidate();assert.equal(s.isFree(-2,-2,24),false);assert.ok(s.useLift());const y=s.player.y;s.tick(.1);assert.equal(s.player.y,y);assert.ok(s.liftY>0&&s.liftY<24);runUntil(s,()=>!s.liftActive);assert.equal(s.liftY,24);assert.ok(s.isFree(-2,-2,24));
});
test('debug recovery is explicit and does not manufacture a physical exit',()=>{
 const s=atPhase('B');place(s,'R4',3.8,1.2);assert.ok(isolated(s.phase).includes(s.owner));s.rescue();assert.equal(s.owner,'fixed');assert.equal(s.phase,'B');assert.match(s.message,/デバッグ/);assert.deepEqual(isolated(s.phase),['R4']);
});
