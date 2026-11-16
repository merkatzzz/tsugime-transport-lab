import * as THREE from '../vendor/three.module.js';
export const ORGAN_START={x:14.9,y:6.4,z:12.666666666666666,yaw:Math.PI/2,pitch:0,owner:'R2'};
// Local, deliberately authored prototypes. Coordinates are the stopped Stage16 poses.
export const FIBRE_SITES=[
 {id:'fibre-L1-V3',from:[17.25,6,20.4],to:[16.15,5.9,20.4],width:1.6,gap:.4,role:'walkable'},
 {id:'fibre-V1-V3',from:[12.4,-.6,27.4],to:[12.4,.06,24.65],width:1.5,gap:.4,role:'walkable'},
 {id:'fibre-thin',from:[9.8,-.6,25.3],to:[9.8,.06,24.7],width:.035,gap:.4,role:'visual-only'}
];
const point=a=>new THREE.Vector3(...a);
function branch(g,points,r,material,physical=true,radials=6){const curve=new THREE.CatmullRomCurve3(points.map(point)),m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(4,points.length*3),r,radials,false),material);m.userData.nonPhysical=!physical;g.add(m);return m;}
function tissue(g,s,mat){
 const a=point(s.from),b=point(s.to),side=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3(0,1,0)).normalize(),vertices=[],indices=[];
 // A coalesced bundle with a visible load-bearing skin; never an invisible rectangular floor.
 for(let i=0;i<=6;i++){const t=i/6,c=a.clone().lerp(b,t),w=s.width/2*(.92+.08*Math.sin(i*1.8));for(const[d,y]of[[-w,0],[w,0],[-w,-.24],[w,-.24]]){const p=c.clone().addScaledVector(side,d);vertices.push(p.x,p.y+y,p.z);}}
 for(let i=0;i<6;i++){const n=i*4,k=n+4;indices.push(n,n+1,k,n+1,k+1,k,n+2,k+2,n+3,n+3,k+2,k+3,n,k,n+2,n+2,k,k+2,n+1,n+3,k+1,n+3,k+3,k+1);}
 indices.push(0,2,1,1,2,3,24,25,26,25,27,26);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,mat));
 for(let j=-2;j<=2;j++){const off=j*s.width/6,aa=a.clone().addScaledVector(side,off),bb=b.clone().addScaledVector(side,off),mid=aa.clone().lerp(bb,.5);mid.addScaledVector(side,.025*Math.sin(j));for(const p of[aa,mid,bb])p.y-=.018;branch(g,[aa.toArray(),mid.toArray(),bb.toArray()],.035+(j+2)*.005,mat,false);}
}
function wovenTissue(g,s,mat){
 const a=point(s.from),b=point(s.to),side=b.clone().sub(a).cross(new THREE.Vector3(0,1,0)).normalize();
 for(let i=0;i<14;i++){const off=(i-6.5)*s.width/14,r=.095+.012*(.5+.5*Math.sin(i*2.1)),points=[];for(let j=0;j<5;j++){const t=j/4,p=a.clone().lerp(b,t).addScaledVector(side,off+.012*Math.sin(i+j*2));p.y-=r-.004+.004*Math.sin(j+i);points.push(p.toArray());}branch(g,points,r,mat,true,12);}
}
export function buildFaultOrgans({woven=false}={}){
 const root=new THREE.Group();root.name='fault-organs';const red=new THREE.MeshStandardMaterial({color:0x672e36,roughness:.92}),thin=new THREE.MeshStandardMaterial({color:0x943943,roughness:.8}),bone=new THREE.MeshStandardMaterial({color:0xded6b9,roughness:.9}),shell=new THREE.MeshStandardMaterial({color:0x66514f,roughness:1,side:THREE.DoubleSide});
 const part=id=>{const g=new THREE.Group();g.userData.diagnosticId='organ:'+id;root.add(g);return g;};
 for(const s of FIBRE_SITES){const g=part(s.id);if(s.role==='walkable')(woven?wovenTissue:tissue)(g,s,red);else branch(g,[s.from,[9.72,-.2,25],s.to],.025,thin,false);}
 branch(part('fine-branch'),[[17.1,5.9,20.8],[17.4,5.9,21.1],[18,5.98,21.5]],.025,thin,false);
 const branches=[[[22.6,6,10],[22.4,8,10.2],[21.6,10,10.7]],[[22.4,8,10.2],[24,9.4,11.2],[25.8,9.7,12.1]],[[21.6,10,10.7],[20.5,11,9.9]],[[9.5,-.6,30.6],[9.1,1,30.4],[9.5,3.2,30.6]],[[9.1,1,30.4],[10.3,2,31.2],[11.2,2.6,32]],[[9.4,.2,30.6],[7.9,.5,31.5],[7.5,1.2,33]]];
 if(woven)branches.push([[21.6,10,10.7],[21.2,11.4,11.5],[21,12.8,12.2]],[[9.5,3.2,30.6],[10.5,7.5,30.7],[10.3,12.8,31]]);
 for(let i=0;i<branches.length;i++)branch(part('bone-'+i),branches[i],i===0?.28:.16+(i%2)*.04,bone);
 if(woven){const veins=part('surface-network');for(let i=0;i<9;i++){const x=17.3+i*.76;branch(veins,[[x,6.035,9.2],[x+.3,6.04,13],[x-.1,6.03,17],[x+.1,6.035,22.5]],.018+(i%3)*.007,thin,false);if(i%2===0)branch(veins,[[x,6.04,17],[x+.5,6.04,18],[x+.8,6.035,18.5]],.012,thin,false);}for(let i=0;i<4;i++){const z=17.4+i*1.5;branch(veins,[[17.5,6.035,z],[16.72,5.6,z+.1],[16.72,2.6,z+.3],[16.72,.1,z+.4]],.022,red,false);branch(veins,[[17.3,-.05,z],[20,-.05,z+.3],[23.6,-.05,z+.1]],.02,thin,false);}}
 const membrane=part('membrane');const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([9.5,0,30.6,9.5,3.2,30.6,11.2,2.6,32,10.2,0,32],3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();membrane.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xbb918a,transparent:true,opacity:.32,depthWrite:false,roughness:.9,side:THREE.DoubleSide})));
 const skin=part('partial-shell');for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(5.6,.16,7.5),shell);m.position.set(2+i*5.5,19.4+.08*Math.sin(i),4.5);m.rotation.z=.012*Math.cos(i);skin.add(m);}return root;
}
export function updateFaultOrgans(v){const woven=!!v.sim.fault?.climbEnabled;if(v.sim.fault?.organic&&(!v.faultOrgans||v.faultOrganVariant!==woven)){if(v.faultOrgans){v.scene.remove(v.faultOrgans);const gs=new Set(),ms=new Set();v.faultOrgans.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}v.faultOrgans=buildFaultOrgans({woven});v.faultOrganVariant=woven;v.scene.add(v.faultOrgans);}if(v.faultOrgans)v.faultOrgans.visible=!!v.sim.fault?.organic;}
