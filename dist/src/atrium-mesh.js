import * as THREE from '../vendor/three.module.js';
import {offsetOutline} from './atrium-shape.js';
// Mitered ring sections meet at edges; no overlapping corner boxes or duplicate glass.
export function ring(v,g,inner,outer,y,h,mat,{top=true}={}){const a=offsetOutline(inner),b=offsetOutline(outer),meshes=[];
 for(let i=0;i<a.length;i++){const j=(i+1)%a.length,q=[a[i],b[i],b[j],a[j]],xyz=[];for(const yy of[y,y+h])for(const[x,z]of q)xyz.push(x,yy,z);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));const idx=[0,2,1,0,3,2,4,5,6,4,6,7,1,2,6,1,6,5,3,0,4,3,4,7];if(!top)idx.splice(6,6);for(let k=0;k<idx.length;k+=3)[idx[k+1],idx[k+2]]=[idx[k+2],idx[k+1]];geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,typeof mat==='string'?v.mats[mat]??v.material(mat,mat):mat);m.userData.prism={polygon:q,bottom:y,top:y+h};g.add(m);meshes.push(m);}
 return meshes;
}
