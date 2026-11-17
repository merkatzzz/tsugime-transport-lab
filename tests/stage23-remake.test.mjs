import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {Simulation} from '../dist/src/simulation.js';import {IntegratedSession} from '../dist/src/stage22-session.js';import {state22,ACCESS22,operateGround} from '../dist/src/stage22-access.js';import {DRAINS23,inspectDrain23} from '../dist/src/stage23-remake.js';import {snapshot,restore} from '../dist/src/save-life.js';import {edgeBetween,railPose} from '../dist/src/stage21-rail.js';
const tick=(s,n)=>{for(let i=0;i<n;i++)s.tick(1/60);};
test('W0 long bank is walkable; no W2 dive; ability switch and unchanged item state survive save',()=>{
 const h=new Simulation(),before=JSON.stringify(h.items.counts);for(let x=9.3;x<55.6;x+=.3){assert.ok(h.isFree(x,-2.9,-12.8));}
 h.player={x:9.3,y:-12.8,z:-2.9,yaw:Math.PI/2,pitch:0};for(let i=0;i<760;i++)h.move(.06,0);assert.ok(h.player.x>54);h.player={...ACCESS22.dive,yaw:0,pitch:0};assert.equal(operateGround(h),'inspect');state22(h).diveEnhanced=true;assert.equal(operateGround(h),'canal');h.player={x:76.8,y:0,z:39.9};assert.equal(operateGround(h),null);
 for(const q of DRAINS23){h.player={...q,yaw:0,pitch:0};assert.ok(inspectDrain23(h));}assert.equal(JSON.stringify(h.items.counts),before);const n=new Simulation();restore(n,snapshot(h));assert.equal(state22(n).diveEnhanced,true);
});
test('hidden approach arrives quickly, visible cart is never relocated and moving calls are rejected',()=>{
 const s=new IntegratedSession('rail',new Simulation());tick(s,60);s.canStageCart=()=>true;assert.ok(s.call('entry'));let frames=0;while(s.cart.moving&&frames++<1000)s.tick(1/60);assert.equal(s.cart.node,'entry');assert.ok(frames/60<8);s.dispose();
 const v=new IntegratedSession('rail',new Simulation());tick(v,60);v.canStageCart=()=>false;const p={...v.cart.pose};assert.ok(v.call('entry'));assert.deepEqual(v.cart.pose,p);assert.equal(v.call('observe'),false);v.dispose();
});
test('observation rails physically prevent falling while leaving station boarding accessible; sump has no collection',()=>{
 const s=new IntegratedSession('rail',new Simulation());tick(s,60);const p=s.map.stations.observe;Object.assign(s.player,p);s.model.fault.motion.eyeY=p.y;
 // Try every outward heading from the guarded station spawn.
 for(let j=0;j<16;j++){Object.assign(s.player,p);s.motion.vx=s.motion.vz=s.motion.vy=0;for(let i=0;i<150;i++){s.player.yaw=j*Math.PI/8;s.walk(1,0,1/60);s.tick(1/60);}assert.ok(s.player.y>p.y-.1);}
 assert.ok(!s.map.objects.some(o=>o.id==='base-scrap'));assert.ok(s.map.callButtons.every(m=>m.parent));s.dispose();
});
test('new source contains no old stage23 collection or migration dependency',()=>{for(const p of ['main.js','stage23-remake.js','stage22-access.js','stage22-session.js']){const s=fs.readFileSync('dist/src/'+p,'utf8');assert.ok(!/from ['"].*stage23\.js|salvageKey|tickSalvage|state23/.test(s));}});
test('direction markers track real rail projections for free yaw; only stationary reachable routes appear',async()=>{
 const {Stage21View}=await import('../dist/src/stage21-view.js');const THREE=await import('../dist/vendor/three.module.js');const {RAIL_NODES}=await import('../dist/src/stage21-rail.js');
 const old=globalThis.document;try{for(const node of ['entry','j1','j2','observe','parasite','base'])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 const choices=['entry','j1','j2','observe','parasite','base'].filter(id=>edgeBetween(node,id)),buttons=choices.map(id=>({dataset:{sideRoute:id},style:{},setAttribute(){}}));globalThis.document={querySelector:()=>({querySelectorAll:()=>buttons})};
 const camera=new THREE.PerspectiveCamera(54,16/9,.05,220),p=RAIL_NODES[node].p;camera.position.set(p[0],p[1]+2.1,p[2]);camera.rotation.order='YXZ';camera.rotation.set(0,yaw+Math.PI,0);camera.updateMatrixWorld();
 Stage21View.prototype.routeMarkers.call({side:{cart:{node}},camera});for(const b of buttons){assert.ok(parseFloat(b.style.left)>=4&&parseFloat(b.style.left)<=96);assert.ok(parseFloat(b.style.top)>0&&parseFloat(b.style.top)<100);assert.ok(b.title.includes(RAIL_NODES[b.dataset.sideRoute].name));}
 }}finally{globalThis.document=old;}
});
test('base station connects to the sump footbridge through real wall openings',()=>{
 const s=new IntegratedSession('rail',new Simulation());tick(s,60);Object.assign(s.player,s.map.stations.base);s.motion.eyeY=s.player.y;
 for(const [x,z] of [[100,38.4],[118,38.4]]){let n=0;while(Math.hypot(s.player.x-x,s.player.z-z)>.08&&n++<1000){s.player.yaw=Math.atan2(x-s.player.x,z-s.player.z);s.walk(1,0,1/60);s.tick(1/60);}assert.ok(n<1000,JSON.stringify(s.player));assert.ok(s.map.world.clear(s.player));assert.ok(s.map.world.support(s.player,.04));}s.dispose();
});

test('dive is reachable from the dry bank on both approaches without entering water',()=>{const h=new Simulation();for(const x of [45.6,47.5,49.4])for(const z of [-3.3,-2.9,-2.65]){h.player={x,y:-12.8,z,yaw:0,pitch:0};assert.ok(h.isFree(x,z,-12.8));state22(h).diveEnhanced=false;assert.equal(operateGround(h),'inspect');state22(h).diveEnhanced=true;assert.equal(operateGround(h),'canal');}h.player={x:47.5,y:0,z:-2.9};assert.equal(operateGround(h),null);});
test('stop focus turns in 250ms, holds a stable selection view, then restores moving free look',()=>{
 const s=new IntegratedSession('rail',new Simulation());tick(s,60);s.cart.node='j1';s.cart.pose=railPose(edgeBetween('entry','j1'),edgeBetween('entry','j1').length);s.aboard=true;s.player.yaw=s.cart.pose.heading+Math.PI;s.player.pitch=.7;tick(s,16);assert.equal(s.stopFocus.turning,false);const yaw=s.player.yaw,pitch=s.player.pitch;tick(s,30);assert.equal(s.player.yaw,yaw);assert.equal(s.player.pitch,pitch);assert.equal(s.lookLocked,true);assert.ok(s.chooseAndGo('observe'));while(s.seatTurn)s.tick(1/60);assert.equal(s.lookLocked,false);s.player.pitch=.4;s.tick(1/60);assert.equal(s.player.pitch,.4);s.dispose();
});
test('observation gate opens only for a docked cart and supports a physical round trip between cart and platform',()=>{
 const s=new IntegratedSession('rail',new Simulation());tick(s,60);assert.equal(s.observationGateOpen,false);const edge=edgeBetween('j1','observe');s.cart.node='observe';s.cart.route=null;s.cart.pose=railPose(edge,edge.length);s.tick(1/60);assert.equal(s.observationGateOpen,true);
 const spawn=s.map.stations.observe,target=s.cart.pose;Object.assign(s.player,spawn);
 for(const q of [target,spawn]){let n=0;while(Math.hypot(q.x-s.player.x,q.z-s.player.z)>.07&&n++<300){s.player.yaw=Math.atan2(q.x-s.player.x,q.z-s.player.z);s.walk(1,0,1/60);s.tick(1/60);}assert.ok(n<300,JSON.stringify(s.player));assert.ok(s.player.y>spawn.y-.05);}
 s.cart.node='entry';s.tick(1/60);assert.equal(s.observationGateOpen,false);s.dispose();
});
