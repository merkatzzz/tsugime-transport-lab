import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Stage21Experiment} from '../dist/src/stage21-experiment.js';
import {RAIL_NODES,RAIL_EDGES,edgeBetween,RailVehicle} from '../dist/src/stage21-rail.js';
import {findFaultClimbs,clearClimbPath} from '../dist/src/fault-climb.js';
import {updateFaultLighting} from '../dist/src/fault-lighting.js';
import * as THREE from '../dist/vendor/three.module.js';

const advance=(s,n=180)=>{for(let i=0;i<n;i++)s.tick(1/60);};
function go(s,x,z){
  for(let i=0;i<2400;i++){
    const dx=x-s.player.x,dz=z-s.player.z,d=Math.hypot(dx,dz);
    if(d<.065){s.walk(0,0,1/60);s.tick(1/60);return;}
    s.player.yaw=Math.atan2(dx,dz);s.walk(1,0,1/60);s.tick(1/60);
    assert.ok(s.map.world.clear(s.player),'walking capsule stays clear');
  }
  assert.fail('walking target not reached: '+JSON.stringify({target:[x,z],player:s.player}));
}
function climb(s,kind,trace=[]){
  assert.ok(s.climb(kind),s.diagnosis);assert.ok(clearClimbPath(s.map.world,s.motion.climbMove.path).ok);
  for(let i=0;i<600&&s.motion.climbMove;i++){
    const p={...s.player};s.tick(1/60);assert.ok(Math.hypot(s.player.x-p.x,s.player.y-p.y,s.player.z-p.z)<=2.8/60+1e-5);assert.ok(s.map.world.clear(s.player));
    if(i%5===0)trace.push({...s.player});
  }
  assert.equal(s.motion.climbMove,null);
}
function travel(s,to,trace){
  const before={...s.cart.pose};assert.ok(s.selectRoute(to));assert.deepEqual(s.cart.pose,before,'switching does not move the cart');assert.ok(s.depart());assert.deepEqual(s.cart.pose,before,'departure has no position snap');
  assert.equal(s.interact('leave'),false,'cannot leave a moving vehicle');assert.equal(s.selectRoute(to),false);
  for(let i=0;i<2400&&s.cart.moving;i++){
    const prev={...s.cart.pose};s.walk(1,1,1/60,true);s.tick(1/60);
    assert.ok(Math.hypot(s.cart.pose.x-prev.x,s.cart.pose.y-prev.y,s.cart.pose.z-prev.z)<=4.5/60+.0002,'no between-track teleport');
    assert.equal(s.player.x,s.cart.pose.x);assert.equal(s.player.z,s.cart.pose.z);
    if(i%15===0){assert.ok(s.map.world.clear(s.player),'rider clears the real station structure');trace?.push({node:s.cart.node,...s.cart.pose});}
  }
  assert.equal(s.cart.moving,false);assert.equal(s.cart.node,to);
  const p=RAIL_NODES[to].p;assert.ok(Math.hypot(s.cart.pose.x-p[0],s.cart.pose.y-p[1],s.cart.pose.z-p[2])<1e-6);
}

test('rail graph has exactly two successive binary turnouts and mainline terminal, with curved graded tracks',()=>{
  assert.equal(RAIL_EDGES.length,5);assert.deepEqual(RAIL_NODES.j1.children,['j2','observe']);assert.deepEqual(RAIL_NODES.j2.children,['base','parasite']);
  assert.ok(!RAIL_NODES.base.children);assert.equal(RAIL_EDGES.filter(e=>e.a==='base'||e.b==='base').length,1);
  const data=RAIL_EDGES.map(e=>({id:e.id,length:e.length,samples:Array.from({length:41},(_,i)=>e.curve.getPointAt(i/40).toArray())}));
  assert.ok(data.some(e=>e.samples.some(p=>Math.abs(p[1]-e.samples[0][1])>1)));
  for(const e of RAIL_EDGES){assert.ok(e.length>25);assert.deepEqual(e.curve.getPointAt(0).toArray(),RAIL_NODES[e.a].p);assert.deepEqual(e.curve.getPointAt(1).toArray(),RAIL_NODES[e.b].p);}
  fs.writeFileSync('docs/evidence/stage21-rail-geometry.json',JSON.stringify({nodes:RAIL_NODES,edges:data},null,2));
});
test('temporary elevator is proximity-only and loads underground entrance with a safe return',()=>{
  const s=new Stage21Experiment('rail');assert.equal(s.interact('lift'),false);go(s,0,1.8);assert.ok(s.interact('lift'));assert.equal(s.walk(1,0,1/60),false);
  let maximumFade=0;for(let i=0;i<170;i++){s.tick(1/60);maximumFade=Math.max(maximumFade,s.fade);}assert.ok(maximumFade>.95);assert.equal(s.mapId,'rail');assert.ok(s.map.world.support(s.player,.03));
  go(s,-2,3);assert.ok(s.interact('lift'));advance(s,170);assert.equal(s.mapId,'rail-ground');assert.ok(s.map.world.clear(s.player));s.dispose();
});
test('one rider is locked to the vehicle while view remains free; foot departure and junction dismount are refused',()=>{
  const s=new Stage21Experiment('rail');s.setMap('rail');assert.equal(s.depart(),false);assert.ok(s.interact('board'));assert.equal(s.interact('board'),false);
  const p={...s.player};s.walk(1,1,1/60,true);s.tick(1/60);assert.equal(s.player.x,p.x);assert.equal(s.player.z,p.z);assert.equal(s.climb('up'),false);
  s.player.yaw=.7;s.player.pitch=-.6;s.tick(1/60);assert.equal(s.player.yaw,.7);assert.equal(s.player.pitch,-.6);
  travel(s,'j1');assert.equal(s.interact('leave'),false);s.dispose();
});
test('actual branch A, branch B and mainline terminal round trips stop safely and use continuous reverse curves',()=>{
  const s=new Stage21Experiment('rail');s.setMap('rail');assert.ok(s.interact('board'));const trace=[];
  for(const id of['j1','observe','j1','j2','parasite','j2','base','j2','j1','entry']){
    travel(s,id,trace);
    if(RAIL_NODES[id].station){assert.ok(s.interact('leave'));assert.ok(s.map.world.clear(s.player));assert.ok(s.map.world.support(s.player,.03));assert.ok(s.interact('board'));}
  }
  assert.deepEqual(s.cart.arrivals,['entry','j1','observe','j1','j2','parasite','j2','base','j2','j1','entry']);
  fs.writeFileSync('docs/evidence/stage21-rail-roundtrip.json',JSON.stringify({arrivals:s.cart.arrivals,trace,noVehicleTeleport:true,noWalkingInCab:true},null,2));s.dispose();
});
test('all ordered station pairs are reachable by real edge traversal including changes between both branches',()=>{
  const stations=['entry','observe','parasite','base'],rows=[];
  const path=(from,to,seen=new Set())=>{if(from===to)return[from];seen.add(from);for(const e of RAIL_EDGES){const n=e.a===from?e.b:e.b===from?e.a:null;if(!n||seen.has(n))continue;const next=path(n,to,seen);if(next)return[from,...next];}return null;};
  const vehicle=new RailVehicle();
  function run(to){const route=path(vehicle.node,to);for(const node of route.slice(1)){assert.ok(edgeBetween(vehicle.node,node));assert.ok(vehicle.select(node));assert.ok(vehicle.depart());let frames=0;while(vehicle.moving&&frames++<1200)vehicle.tick(.1);assert.equal(vehicle.node,node);assert.equal(vehicle.moving,false);}return route;}
  for(const from of stations)for(const to of stations)if(from!==to){run(from);rows.push({from,to,path:run(to)});}
  assert.equal(rows.length,12);fs.writeFileSync('docs/evidence/stage21-all-stations.json',JSON.stringify(rows,null,2));
});
test('destinations contain an unidentified organ, three empty parasite rooms and separate base/recovery/hobby/salvage locations',()=>{
  const s=new Stage21Experiment('rail');s.setMap('rail');assert.equal(s.map.observation.identity,'unconfirmed-organ');assert.equal(s.map.parasiteRooms.count,3);assert.equal(s.map.parasiteRooms.combatIntegrated,false);
  assert.deepEqual(s.map.baseZones.map(z=>z.id),['living','recovery-location','hobby-work','salvage']);
  const v={scene:s.map.scene,camera:new THREE.PerspectiveCamera(),sim:s.model};v.camera.position.set(0,-18,0);v.camera.rotation.y=Math.PI/2;updateFaultLighting(v);
  assert.equal(v.flash.visible,true);assert.equal(v.flash.penumbra,1);assert.ok(v.flash.target.position.distanceTo(v.camera.position)>9);s.model.fault.flashlight=false;updateFaultLighting(v);assert.equal(v.flash.visible,false);s.dispose();
});
test('after dismount the player walks through the base partitions, picks one sample, and returns to the waiting cart',()=>{
  const s=new Stage21Experiment('rail');s.setMap('rail');s.interact('board');for(const id of['j1','j2','base'])travel(s,id);
  s.interact('leave');go(s,100,39);go(s,114,39);go(s,114,37);assert.ok(s.interact('base-scrap'));assert.equal(s.model.items.counts.scrap,1);assert.equal(s.interact('base-scrap'),false);
  go(s,114,39);go(s,100,39);go(s,100,30);assert.ok(s.interact('board'));for(const id of['j2','j1','entry'])travel(s,id);assert.equal(s.model.items.counts.scrap,1);s.dispose();
});
test('the observation platform and all three parasite rooms are walkable after dismount and reconnect to the cart',()=>{
  const s=new Stage21Experiment('rail');s.setMap('rail');s.interact('board');travel(s,'j1');travel(s,'observe');s.interact('leave');
  const local=(id,x,z)=>{const n=RAIL_NODES[id].p,t=RAIL_EDGES.find(e=>e.b===id).curve.getTangentAt(1),a=Math.atan2(t.x,t.z)-Math.PI/2;return[n[0]+Math.cos(a)*x+Math.sin(a)*z,n[2]-Math.sin(a)*x+Math.cos(a)*z];};
  for(const p of [[2,4],[-2,4],[0,2]])go(s,...local('observe',...p));
  assert.ok(s.interact('board'));travel(s,'j1');travel(s,'j2');travel(s,'parasite');s.interact('leave');
  for(const p of [[0,10.5],[16,10.5],[0,10.5],[0,2]])go(s,...local('parasite',...p));
  assert.ok(s.interact('board'));travel(s,'j2');travel(s,'j1');travel(s,'entry');s.dispose();
});
test('diving requires a real inlet, sinks/fades/loads/surfaces, blocks swimming input and returns to the correct pose',()=>{
  const s=new Stage21Experiment('canal');assert.equal(s.interact('dive'),false);go(s,8,2.7);assert.ok(s.interact('dive'));assert.equal(s.walk(1,0,1/60),false);
  const trace=[];for(let i=0;i<130;i++){s.tick(1/60);if(i%5===0)trace.push({map:s.mapId,...s.player,fade:s.fade});}
  assert.equal(s.mapId,'canal-upper');assert.equal(s.transition,null);assert.ok(trace.some(p=>p.y<-.5));assert.ok(trace.some(p=>p.fade>.9));assert.equal(s.player.yaw,Math.PI/2);assert.ok(s.map.world.support(s.player,.03));
  assert.ok(s.interact('dive'));advance(s,130);assert.equal(s.mapId,'canal-home');assert.equal(s.player.x,8);assert.equal(s.player.yaw,-Math.PI/2);assert.ok(s.map.world.clear(s.player));
  fs.writeFileSync('docs/evidence/stage21-dive.json',JSON.stringify({trace,returned:s.player,roundTrip:true,freeSwimming:false},null,2));s.dispose();
});
test('real six-metre wall blocks walking, accepts the existing swept arm at six, supports walking and descent',()=>{
  const s=new Stage21Experiment('canal');s.setMap('canal-upper');go(s,10.3,2.5);s.player.yaw=Math.PI/2;
  for(let i=0;i<80;i++){s.walk(1,0,1/60);s.tick(1/60);}assert.ok(s.player.x<11);assert.ok(s.player.y<0);
  s.player.pitch=1.1;const trace=[];climb(s,'up',trace);assert.ok(Math.abs(s.player.y-5.84)<.0001);go(s,14,2.5);go(s,11.65,2.5);
  s.player.yaw=-Math.PI/2;s.player.pitch=-1.1;climb(s,'down',trace);assert.ok(Math.abs(s.player.y+.16)<.0001);go(s,2,2.7);
  fs.writeFileSync('docs/evidence/stage21-arm.json',JSON.stringify({trace,returned:s.player,upMetres:6,teleport:false,collisionSweepMetres:.035},null,2));s.dispose();
});
test('upper traces include two collectible samples and static objects, with no evidence or economy rules added',()=>{
  const s=new Stage21Experiment('canal');s.setMap('canal-upper');go(s,10.3,2.5);s.player.pitch=1.1;climb(s,'up');
  go(s,21,2.5);assert.ok(s.interact('canister'));go(s,26,2.5);assert.ok(s.interact('memo'));assert.equal(s.model.items.counts.scrap,2);assert.equal(s.interact('shell'),false);assert.equal(s.interact('feed'),false);
  assert.equal(s.map.objects.filter(o=>!o.collectible).length,3);s.dispose();
});
test('ten-metre real wall is rejected at six and eight; walking, inertia and both side edges cannot bypass it',()=>{
  const s=new Stage21Experiment('canal');s.setMap('canal-upper');Object.assign(s.player,{x:31.3,y:5.840000095,z:2.5,yaw:Math.PI/2,pitch:1.1});
  const rows=[];for(const limit of[6,8]){s.model.fault.climbHeight=limit;assert.equal(findFaultClimbs(s.model,true).up,undefined);assert.equal(s.climb('up'),false);assert.match(s.diagnosis,/高さ超過/);rows.push({limit,diagnosis:s.diagnosis,accepted:false});}
  for(const yaw of[Math.PI/2,0,Math.PI]){s.player.yaw=yaw;for(let i=0;i<120;i++){s.walk(1,0,1/60,true);s.tick(1/60);}assert.ok(s.player.x<32);assert.ok(s.player.z>.15&&s.player.z<5.85);assert.ok(s.player.y<6.2);}
  fs.writeFileSync('docs/evidence/stage21-high-wall.json',JSON.stringify({topY:16,approachY:6,height:10,rows,final:s.player,noIntermediateAnchor:true},null,2));s.dispose();
});
test('walking into the upper trigger drops real gravity objects once, leaves view/input free, and permits return',()=>{
  const s=new Stage21Experiment('canal');s.setMap('canal-upper');go(s,10.3,2.5);s.player.pitch=1.1;climb(s,'up');go(s,29.5,2.5);
  assert.equal(s.eventFired,true);assert.equal(s.eventCount,1);assert.equal(s.waste.length,2);const trace=[];
  s.player.yaw=-.4;s.player.pitch=.5;const before={...s.player};
  for(let i=0;i<160;i++){if(i<10)s.walk(-1,0,1/60);else s.walk(0,0,1/60);s.tick(1/60);if(i%5===0)trace.push(s.waste.map(o=>({...o})));}
  assert.equal(s.player.yaw,-.4);assert.equal(s.player.pitch,.5);assert.ok(Math.hypot(s.player.x-before.x,s.player.z-before.z)>.2);assert.ok(s.waste.every(o=>o.landed&&o.water));
  assert.ok(s.waste.every(o=>Math.abs(o.y-o.radius-s.map.water.y)<.0001));go(s,29.5,2.5);assert.equal(s.eventCount,1);
  go(s,11.65,2.5);s.player.yaw=-Math.PI/2;s.player.pitch=-1.1;climb(s,'down');go(s,2,2.7);assert.ok(s.interact('dive'));advance(s,130);assert.equal(s.mapId,'canal-home');
  fs.writeFileSync('docs/evidence/stage21-waste.json',JSON.stringify({trace,eventCount:s.eventCount,viewWasFree:true,inputWasFree:true,returned:true,waterY:5.7},null,2));s.dispose();
});
test('a fresh experiment resets temporary cart, samples and event while recovery never teleports the vehicle',()=>{
  const s=new Stage21Experiment('rail');s.setMap('rail');s.interact('board');travel(s,'j1');const p={...s.cart.pose};assert.equal(s.recover(),false);assert.deepEqual(s.cart.pose,p);s.dispose();
  const a=new Stage21Experiment('rail');assert.equal(a.mapId,'rail-ground');assert.equal(a.cart.node,'entry');assert.equal(a.model.items.counts.scrap,undefined);a.dispose();
  const b=new Stage21Experiment('canal');assert.equal(b.eventFired,false);assert.equal(b.waste.length,0);assert.equal(b.recover(),true);assert.ok(b.map.world.support(b.player,.03));b.dispose();
});
