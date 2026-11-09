import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {View} from '../dist/src/view.js';
import {Simulation} from '../dist/src/simulation.js';
import {BODIES,placements,insideBody} from '../dist/src/architecture.js';
// Real Three.js mesh construction and transforms, with only text annotations and GPU rendering replaced.
function cpuView(sim){
 const v=Object.create(View.prototype);Object.assign(v,{sim,mode:'overview',floor:'all',envelopes:true,routes:true,scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),renderer:{render(){}},mats:{},groups:{},roofs:[],shutters:[],doorMeshes:[],bounds:[],labels:[],fixedFloors:[],orbit:{yaw:.6,pitch:.6,distance:88,target:new THREE.Vector3(22,14,17)}});
 v.text=(group)=>{const o=new THREE.Object3D();group.add(o);return o;};for(const [name,color]of Object.entries({wall:'#c8c9bb',concrete:'#949c95',metal:'#435c5b',wood:'#877052',lamp:'#e7dd9c',dark:'#2d4142'}))v.material(name,color);
 v.buildFacility();BODIES.forEach(b=>v.buildBody(b));v.buildPaths();v.marker=new THREE.Object3D();v.scene.add(v.marker);return v;
}
test('real meshes, including wall thickness and rolled shutters, remain inside every rigid transport envelope',()=>{
 const s=new Simulation(),v=cpuView(s);
 for(const phase of ['A','B','C'])for(const shutter of [0,.5,1]){
  s.phase=phase;s.positions=placements(phase);s.shutter=shutter;s.invalidate();v.render();v.scene.updateMatrixWorld(true);
  for(const b of BODIES){const p=s.positions[b.id];v.groups[b.id].traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
   assert.ok(bb.min.y>=p.y-1e-6&&bb.max.y<=p.y+5+1e-6,`${phase} ${b.id} y=${bb.min.y}..${bb.max.y}`);
   for(const x of [bb.min.x,bb.max.x])for(const z of [bb.min.z,bb.max.z])assert.ok(insideBody(b,Math.max(0,x-p.x+Math.sign(p.x+4-x)*1e-6),Math.max(0,z-p.z+Math.sign(p.z+4-z)*1e-6)),`${phase} ${b.id} mesh protrudes x=${x-p.x},z=${z-p.z}`);
  });}
 }
});
test('real built meshes expose the B slit to an eye-height ray while the same position rejects a body',()=>{
 const s=new Simulation();s.phase='B';s.positions=placements('B');s.invalidate();const v=cpuView(s);v.mode='explore';v.render();v.scene.updateMatrixWorld(true);
 const meshes=[];v.scene.traverse(m=>{if(!m.isMesh)return;for(let q=m;q;q=q.parent)if(!q.visible)return;meshes.push(m);});
 const ray=new THREE.Raycaster(new THREE.Vector3(5.2,1.81,-.8),new THREE.Vector3(0,0,1),0,1.9);assert.equal(ray.intersectObjects(meshes,false).length,0,'actual eye ray crosses slit');
 ray.set(new THREE.Vector3(4.5,1.81,-.8),new THREE.Vector3(0,0,1));assert.ok(ray.intersectObjects(meshes,false).length>0,'adjacent opaque wall blocks');assert.equal(s.isFree(5.2,0,0),false);
});
test('real fixed gallery walls, lintels and landing shutters stay on their own side of the detachable boundary',()=>{
 const s=new Simulation(),v=cpuView(s);for(const amount of [0,.5,1]){s.shutter=amount;v.render();v.scene.updateMatrixWorld(true);for(const {g}of v.fixedFloors)g.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);assert.ok(bb.max.z<1e-6,`fixed mesh protrudes z=${bb.max.z}`);});v.annex.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);assert.ok(bb.min.x>=48-1e-6,`fixed annex intrudes into transport x=${bb.min.x}`);});}
});
