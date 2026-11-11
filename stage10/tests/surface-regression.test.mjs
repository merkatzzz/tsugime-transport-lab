import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {exposeBoxSurfaces} from '../dist/src/surfaces.js';
test('world-level union handles perpendicular walls across groups and remains stable on rebuild',()=>{const scene=new THREE.Scene();for(let i=0;i<2;i++){const group=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1));group.position.x=i*.5;m.rotation.y=i*Math.PI/2;group.add(m);scene.add(group);}for(let repeat=0;repeat<3;repeat++){exposeBoxSurfaces(scene);let area=0;scene.traverse(m=>{if(!m.isMesh||!m.visible)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);area+=b.sub(a).cross(c.sub(a)).length()/2;}});assert.ok(Math.abs(area-8)<1e-5,area);}});
