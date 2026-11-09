import * as THREE from '../vendor/three.module.js';
const EPS=1e-6;
export function subtractRect(r,b){const x=Math.max(r[0],b[0]),y=Math.max(r[1],b[1]),xx=Math.min(r[2],b[2]),yy=Math.min(r[3],b[3]);if(xx<=x+EPS||yy<=y+EPS)return[r];return[[r[0],r[1],x,r[3]],[xx,r[1],r[2],r[3]],[x,r[1],xx,y],[x,yy,xx,r[3]]].filter(q=>q[2]-q[0]>EPS&&q[3]-q[1]>EPS);}
// Construct exposed box surfaces; overlapping walls, trims and ceilings have one
// surface owner. This removes duplicate faces rather than changing camera depth.
export function exposeBoxSurfaces(root,excluded=new Set()){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),entries=[];
 root.traverse(m=>{if(!m.isMesh||m.geometry.type!=='BoxGeometry')return;for(let q=m;q&&q!==root;q=q.parent)if(excluded.has(q)||q.userData.target)return;const mat=inverse.clone().multiply(m.matrixWorld),e=mat.elements;if([e[1],e[2],e[4],e[6],e[8],e[9]].some(n=>Math.abs(n)>EPS))return;const box=new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position).applyMatrix4(mat);entries.push({m,box,mat});});
 let removed=0;
 entries.forEach(({m,box,mat},i)=>{const min=box.min.toArray(),max=box.max.toArray(),positions=[],normals=[],back=mat.clone().invert();for(let axis=0;axis<3;axis++)for(const sign of[-1,1]){const u=(axis+1)%3,v=(axis+2)%3,plane=sign<0?min[axis]:max[axis];let pieces=[[min[u],min[v],max[u],max[v]]];for(let j=0;j<entries.length&&pieces.length;j++){if(i===j)continue;const b=entries[j].box,lo=b.min.toArray(),hi=b.max.toArray();const inward=sign<0?hi[axis]>plane+EPS:lo[axis]<plane-EPS,outward=sign<0?lo[axis]<plane-EPS:hi[axis]>plane+EPS,coplanar=Math.abs((sign<0?lo[axis]:hi[axis])-plane)<EPS;if(inward&&(outward||(coplanar&&j<i)))pieces=pieces.flatMap(r=>subtractRect(r,[lo[u],lo[v],hi[u],hi[v]]));}
  for(const r of pieces){const corners=[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]],order=sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2];for(const k of order){const p=new THREE.Vector3(),n=new THREE.Vector3();p.setComponent(axis,plane);p.setComponent(u,corners[k][0]);p.setComponent(v,corners[k][1]);p.applyMatrix4(back);n.setComponent(axis,sign);n.transformDirection(back);positions.push(...p.toArray());normals.push(...n.toArray());}}}
  if(!positions.length){m.visible=false;m.userData.internalSurface=true;removed++;return;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));m.geometry.dispose();m.geometry=g;});return{boxes:entries.length,hidden:removed};
}
