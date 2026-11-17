import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {Simulation} from '../dist/src/simulation.js';import {primePlans,planTransfer,validatePlan,motionBoxes} from '../dist/src/transport.js';
import {ACCESS22,state22,operateGround,tickAccess} from '../dist/src/stage22-access.js';
import {IntegratedSession} from '../dist/src/stage22-session.js';import {RAIL_NODES} from '../dist/src/stage21-rail.js';import {snapshot,restore} from '../dist/src/save-life.js';
primePlans(JSON.parse(fs.readFileSync('dist/assets/transport-plans.json')));
const tick=(s,n)=>{for(let i=0;i<n;i++)s.tick(1/60);};
function go(s,x,z){for(let i=0;i<2200;i++){const p=s.player,d=Math.hypot(x-p.x,z-p.z);if(d<.065)return;p.yaw=Math.atan2(x-p.x,z-p.z);s.walk(1,0,1/60);s.tick(1/60);}assert.fail(JSON.stringify(s.player));}
function trip(s,to){assert.ok(s.chooseAndGo(to));const p={...s.cart.pose};while(s.seatTurn)s.tick(1/60);assert.deepEqual(s.cart.pose,p);for(let i=0;i<2200&&s.cart.moving;i++){const p={...s.cart.pose};s.walk(1,1,1/60);s.tick(1/60);assert.ok(Math.hypot(s.cart.pose.x-p.x,s.cart.pose.y-p.y,s.cart.pose.z-p.z)<.076);assert.equal(s.player.x,s.cart.pose.x);}assert.equal(s.cart.node,to);}
test('F0 north extension is a real walk from the existing landing, with a closed door, entry and load-ready closure',()=>{
 const s=new Simulation();s.player={x:-1.4,y:-12.8,z:4,yaw:Math.PI,pitch:0};for(let i=0;i<92;i++)s.move(0,-.06);assert.ok(s.player.z<-.8&&s.player.z>-2.2);assert.equal(operateGround(s),'opening');for(let i=0;i<40;i++)tickAccess(s,1/60);assert.equal(state22(s).gate,0);for(let i=0;i<42;i++)s.move(0,-.06);assert.ok(s.player.z<-2.6);assert.equal(operateGround(s),'closing');let ready=false;for(let i=0;i<40;i++)ready=tickAccess(s,1/60)||ready;assert.ok(ready);assert.equal(state22(s).gate,1);
 const u=new IntegratedSession('rail',s);tick(u,100);assert.equal(u.gate,0);go(u,-3.5,3.5);go(u,2.5,2);assert.ok(u.map.world.clear(u.player));assert.ok(u.nearby().some(o=>o.id==='call'));go(u,-3.5,3.5);go(u,-5.6,3.5);assert.ok(u.interact('home-ev'));tick(u,150);assert.equal(u.returnRequested,true);u.dispose();
});
test('new fixed extension lies outside every certified moving envelope in all 18 transport plans',()=>{
 const rows=[];for(const size of ['same','ring1','ring2'])for(const method of ['cooperative','serial'])for(const phase of ['A','B','C']){const p=planTransfer(phase,{A:'B',B:'C',C:'A'}[phase],{size,method});assert.ok(validatePlan(p).ok);let min=Infinity;for(const st of p.stages)for(const m of st.motions)for(const list of motionBoxes(m.id,m.from,m.to))for(const b of list)min=Math.min(min,b.min[0]);assert.ok(min>=-1e-6);rows.push({size,method,phase,minMoverX:min,extensionMaxX:-.34,clearance:.34});}fs.writeFileSync('docs/evidence/stage22-clearance.json',JSON.stringify(rows,null,2));
});
test('unmanned base-to-entrance call traverses both junctions; all stations can summon without teleport',()=>{
 const host=new Simulation(),s=new IntegratedSession('rail',host);tick(s,100);assert.equal(s.cart.node,'base');assert.ok(s.call('entry'));let frames=0;const trace=[];while((s.cart.moving||s.callQueue.length)&&frames++<6000){const p={...s.cart.pose};s.tick(1/60);assert.ok(Math.hypot(s.cart.pose.x-p.x,s.cart.pose.y-p.y,s.cart.pose.z-p.z)<.076);if(frames%20===0)trace.push({...s.cart.pose});}assert.equal(s.cart.node,'entry');assert.deepEqual(s.cart.arrivals.slice(-3),['j2','j1','entry']);
 for(const station of ['observe','parasite','base','entry']){assert.ok(s.call(station));let n=0;while((s.cart.moving||s.callQueue.length)&&n++<7000)s.tick(1/60);assert.equal(s.cart.node,station);}fs.writeFileSync('docs/evidence/stage22-call.json',JSON.stringify({trace,arrivals:s.cart.arrivals},null,2));s.dispose();
});
test('one-click trips rotate seat while stationary and keep free view/body lock on all return routes',()=>{
 const s=new IntegratedSession('rail',new Simulation());tick(s,100);s.call('entry');for(let i=0;i<6000&&s.cart.moving;i++)s.tick(1/60);go(s,0,2);assert.ok(s.interact('board'));const rows=[];
 for(const to of ['j1','observe','j1','j2','parasite','j2','base','j2','j1','entry']){trip(s,to);rows.push({node:to,seatAngle:s.seatAngle,yaw:s.player.yaw,heading:s.cart.pose.heading});}
 assert.ok(rows.some(r=>Math.abs(Math.abs(r.seatAngle)-Math.PI)<.001));s.player.yaw+=.4;s.player.pitch=.3;s.tick(1/60);assert.equal(s.player.pitch,.3);fs.writeFileSync('docs/evidence/stage22-seat.json',JSON.stringify(rows,null,2));s.dispose();
});
test('shared pickup, cart and event state survives reentry and existing save/load, without duplicating samples',()=>{
 const h=new Simulation();h.startTransfer();for(let i=0;i<2000&&h.mode!=='idle';i++)h.tick(.1);assert.equal(h.phase,'B');const original=JSON.stringify(h.positions),clock=h.clock;
 const s=new IntegratedSession('canal',h);tick(s,60);go(s,10.3,2.5);s.player.pitch=1.1;assert.ok(s.climb('up'));for(let i=0;i<600&&s.motion.climbMove;i++)s.tick(1/60);go(s,21,2.5);assert.ok(s.interact('canister'));go(s,29.5,2.5);tick(s,160);assert.equal(h.items.counts.scrap,1);assert.equal(s.eventFired,true);s.persist();s.dispose();assert.equal(JSON.stringify(h.positions),original);assert.equal(h.clock,clock);
 const data=snapshot(h),r=new Simulation();restore(r,data);assert.equal(r.items.counts.scrap,1);assert.equal(state22(r).eventFired,true);const again=new IntegratedSession('canal',r);tick(again,60);assert.ok(again.collected.has('canister'));assert.equal(again.map.objects.find(o=>o.id==='canister').mesh.visible,false);assert.equal(again.interact('canister'),false);again.dispose();
});
test('actual W0 bank supplies a proximity-gated entry and upper dive returns instead of creating an independent home map',()=>{
 const h=new Simulation();h.player={x:ACCESS22.dive.x,y:-12.8,z:ACCESS22.dive.z,yaw:0,pitch:0};assert.equal(h.owner,'W0');assert.ok(h.isFree(h.player.x,h.player.z,-12.8));assert.equal(operateGround(h),'inspect');state22(h).diveEnhanced=true;assert.equal(operateGround(h),'canal');const s=new IntegratedSession('canal',h);tick(s,60);assert.ok(s.interact('dive'));tick(s,90);assert.equal(s.returnRequested,true);assert.equal(s.mapId,'canal-upper');s.dispose();
});
