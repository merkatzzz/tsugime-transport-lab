import fs from 'node:fs';
import {buildStage21Map,disposeStage21Map} from '../dist/src/stage21-world.js';
import {RAIL_EDGES} from '../dist/src/stage21-rail.js';
import {makeCart} from '../dist/src/stage21-view.js';
const maps=[];
for(const id of['rail-ground','rail','canal-home','canal-upper']){
  const map=buildStage21Map(id);let meshes=0,triangles=0;
  map.scene.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;});
  maps.push({id,spawn:map.spawn,meshes,triangles,collisionTriangles:map.world.triangles.length,anchors:map.anchors,objects:map.objects.map(({mesh,...o})=>o),observation:map.observation,parasiteRooms:map.parasiteRooms,baseZones:map.baseZones});
  disposeStage21Map(map);
}
const edges=RAIL_EDGES.map(e=>({id:e.id,length:e.length,maxGrade:Math.max(...Array.from({length:101},(_,i)=>Math.abs(e.curve.getTangentAt(i/100).y)))}));
let cartMeshes=0;const cart=makeCart();cart.traverse(m=>{if(m.isMesh){cartMeshes++;m.geometry.dispose();m.material.dispose();}});
fs.writeFileSync('docs/evidence/stage21-model.json',JSON.stringify({maps,edges,cartMeshes,textLabelsOmittedInCpuExport:true,webglVerified:false},null,2));
console.log(JSON.stringify({maps:maps.map(m=>({id:m.id,meshes:m.meshes,triangles:m.triangles,collisionTriangles:m.collisionTriangles})),edges,cartMeshes}));
