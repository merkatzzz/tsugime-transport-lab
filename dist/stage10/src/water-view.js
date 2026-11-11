import * as THREE from '../vendor/three.module.js';
import {WATER,waterWalkRects,waterWalls} from './water.js';
export function buildWater(view){
 view.waterRows=[];view.waterSurfaces=[];
 for(const q of WATER){const g=new THREE.Group();g.position.y=q.y;view.fixed.add(g);view.fixedFloors.push({g,y:q.y});
  const floorRects=waterWalkRects(q); // Union, with no coplanar overlap at the entrance.
  for(const [i,r]of floorRects.entries()){const a=q.tunnel&&i===1?{...r,z:-2.15,d:1.75}:r;view.cube(g,a.x,0,a.z,a.w,.16,a.d,'#a4a598');}
  for(const l of waterWalls(q,true))view.wall(g,l,q.tunnel?.9:(Math.abs(l.a[0]-(q.x+2.4))<.01&&Math.abs(l.b[0]-(q.x+2.4))<.01?1:5.64),'#798e89',.12,.16);
  if(q.tunnel){
   // Circular barrel, axis X. Omit only the exact entry aperture; no whole missing bay.
   const xs=[q.x,q.x+3,q.x+5,q.x+q.w],angles=Array.from(new Set([...Array.from({length:73},(_,i)=>-180+i*5),-40,20])).sort((a,b)=>a-b),vertices=[];
   const point=(x,a)=>{const t=a*Math.PI/180;return[x,1.8+3*Math.sin(t),-4.4+3*Math.cos(t)];};
   for(let k=0;k<xs.length-1;k++)for(let j=0;j<angles.length-1;j++){const a=angles[j],b=angles[j+1];if(k===1&&a>=-40&&b<=20)continue;const p=[point(xs[k],a),point(xs[k+1],a),point(xs[k+1],b),point(xs[k],b)];for(const n of[0,1,2,0,2,3])vertices.push(...p[n]);}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();g.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#6f8581',roughness:.92,side:THREE.DoubleSide})));
   for(const x of[q.x,q.x+q.w]){const cap=new THREE.Mesh(new THREE.CircleGeometry(3,48),new THREE.MeshStandardMaterial({color:'#445956',side:THREE.DoubleSide}));cap.rotation.y=Math.PI/2;cap.position.set(x,1.8,-4.4);g.add(cap);}
   // Entry reveal extends into barrel: floor, sides and roof close the cut edges.
   for(const x of[q.x+2.9,q.x+5])view.cube(g,x,.16,-2.3,.1,2.8,1.9,'#798e89');
   view.cube(g,q.x+2.9,2.96,-2.3,2.2,.15,1.9,'#798e89');
   for(let x=q.x+2;x<q.x+q.w;x+=8){view.cube(g,x,2.4,-2,.3,.12,.15,'#c9e4cc');}
  }else{
   for(const z of[q.z,q.z+7.85])view.cube(g,q.x+2.7,1.8,z,5.3,4,.15,'#637e76');
   view.cube(g,q.x,2.66,q.z+3,.12,3.14,2,'#637e76');
   view.roofs.push(view.cube(g,q.x,5.8,q.z,8,.16,8,'#a6b3a8'));
   view.cube(g,q.x+7.85,.16,q.z,.15,5.64,8,'#637e76');
   for(const z of[q.z,q.z+7.85])view.cube(g,q.x,.16,z,2.7,5.64,.15,'#637e76');
   view.cube(g,q.x+2.5,-.65,q.z,5.5,.2,8,'#425d59');
   // 4m wide dark culverts, 1.8m clear above the flow; logical pipes continue unseen.
   for(const z of[q.z,q.z+6.8]){view.cube(g,q.x+3,1.5,z,4,.3,1.2,'#667f78');for(const x of[q.x+2.7,q.x+7])view.cube(g,x,-.5,z,.3,2.3,1.2,'#667f78');view.cube(g,q.x+3,-.5,z===q.z?z:z+1.15,4,2,.05,'#182e2c');}
  }
  const r=q.tunnel?{x:q.x+.2,z:-6.5,w:q.w-.4,d:2.6}:{x:q.x+2.6,z:q.z,w:5.2,d:8};
  const material=new THREE.MeshStandardMaterial({color:'#438f99',roughness:.32,metalness:.2,side:THREE.DoubleSide});
  material.onBeforeCompile=shader=>{shader.uniforms.waterTime={value:0};material.userData.shader=shader;shader.vertexShader='uniform float waterTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += .035*sin(position.x*3.0+waterTime*2.0)+.015*cos(position.y*5.0-waterTime*3.0);');};
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(r.w,r.d,48,8),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(r.x+r.w/2,-.3,r.z+r.d/2);g.add(mesh);view.waterSurfaces.push(material);
  const streaks=new THREE.Group();g.add(streaks);for(let i=0;i<18;i++)view.cube(streaks,r.x+.6+(i*.173%1)*(r.w-2),-.275,r.z+.6+(i*.317%1)*Math.max(.2,r.d-2),q.tunnel?.65:.035,.006,q.tunnel?.035:.65,'#8bbab4');
  const gate=new THREE.Group();g.add(gate);view.waterRows.push({q,g,gate,streaks});view.text(g,q.name,q.x+1,1.8,q.tunnel?-2.4:q.z+1,{size:.3});
 }
}
export function renderWater(view){for(const m of view.waterSurfaces??[])if(m.userData.shader)m.userData.shader.uniforms.waterTime.value=view.sim.clock;for(const r of view.waterRows??[]){r.streaks.position[r.q.tunnel?'x':'z']=(view.sim.clock*.22)%.4-.2;const s=view.sim.livePorts.find(p=>p.body===r.q.id),key=JSON.stringify([s.status,s.masked]);if(r.key===key)continue;r.key=key;view.clearGroup(r.gate);const ranges=s.status==='blocked'?[{a:r.q.a,b:r.q.b}]:s.masked;for(const m of ranges){const q=r.q,l=q.tunnel?{a:[q.x+m.a,-.46],b:[q.x+m.b,-.46]}:{a:[q.x+.06,q.z+m.a],b:[q.x+.06,q.z+m.b]};view.wall(r.gate,l,q.height,'metal',.12,.16);}}}
