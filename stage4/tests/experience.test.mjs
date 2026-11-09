import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../dist/src/simulation.js';
import {placements} from '../dist/src/architecture.js';
import {soundState} from '../dist/src/audio.js';
function at(s,id,x,z){const p=s.positions[id];s.player={...s.player,x:p.x+x,z:p.z+z,y:p.y};}
test('ordinary doors start closed and reset closes them',()=>{const s=new Simulation();assert.ok(Object.values(s.doors).every(v=>!v));s.doors['R1-door']=true;s.reset();assert.ok(Object.values(s.doors).every(v=>!v));});
test('booth image visit separates conversation and exit in all three phases',()=>{for(const phase of ['A','B','C']){const s=new Simulation();s.phase=phase;s.positions=placements(phase);s.invalidate();at(s,'R3',5.2,4);const before={...s.player};s.interact();assert.ok(s.experience.visit);assert.equal(s.experience.dialogue,null);assert.equal(s.experience.camera(),null);assert.equal(s.move(0,3),false);assert.equal(s.startTransfer(),false);s.interact();assert.equal(s.experience.dialogue.npc.id,'resident');s.interact();s.interact();assert.equal(s.experience.dialogue,null);assert.ok(s.experience.visit);s.walk(-1,0,.1);assert.equal(s.experience.visit,null);assert.deepEqual(s.player,before);assert.equal(s.doors['R3-door'],false);assert.ok(s.isFree(s.player.x,s.player.z));}});
test('normal room door opens into 3D space',()=>{const s=new Simulation();at(s,'R1',4,4.3);s.interact();for(let i=0;i<8;i++)s.tick(.1);assert.equal(s.doors['R1-door'],true);assert.equal(s.experience.visit,null);s.move(0,-2);assert.ok(s.player.z<3);});
test('shop conversation stays in 3D',()=>{const s=new Simulation();at(s,'T1',11,3.5);const p={...s.player};s.interact();assert.equal(s.experience.dialogue.npc.id,'shopkeeper');assert.equal(s.experience.visit,null);s.interact();s.interact();assert.equal(s.experience.dialogue,null);assert.deepEqual(s.player,p);});
test('mechanical audio retains transfer and pause synchronization',()=>{const s=new Simulation();s.mode='moving';assert.ok(soundState(s).transport>0);s.paused=true;assert.equal(soundState(s).transport,0);});
