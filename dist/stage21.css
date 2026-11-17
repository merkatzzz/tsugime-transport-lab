import * as THREE from '../vendor/three.module.js';
import {updateFaultLighting} from './fault-lighting.js';
import {RAIL_NODES,RAIL_EDGES} from './stage21-rail.js';

function cube(g,x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);g.add(m);return m;}
export function makeCart(){
  const g=new THREE.Group();g.userData.nonPhysical=true;
  cube(g,0,.3,0,1.05,.18,1.65,0x59675c);const seat=new THREE.Group();g.add(seat);g.userData.seat=seat;cube(seat,0,.65,-.2,.65,.15,.6,0x958b6d);cube(seat,0,.9,-.48,.65,.6,.1,0x958b6d);
  for(const x of[-.48,.48])for(const z of[-.55,.55]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.12,10),new THREE.MeshStandardMaterial({color:0x353f3d,metalness:.6,roughness:.5}));w.rotation.z=Math.PI/2;w.position.set(x,.12,z);g.add(w);}
  for(const x of[-.5,.5])cube(g,x,.65,.68,.07,.65,.07,0x9c9c83);
  cube(g,0,.98,.68,1.05,.06,.06,0x9c9c83);return g;
}
export class Stage21View {
  constructor(container,experiment){
    this.side=experiment;this.sim=experiment.model;this.container=container;this.mode='explore';this.mats={};this.camera=new THREE.PerspectiveCamera(54,1,.05,220);
    this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.domElement.tabIndex=0;this.renderer.domElement.className='stage21-canvas';container.appendChild(this.renderer.domElement);
    this.cart=makeCart();this.wasteMeshes=new Map();this.blades={};this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(container);
  }
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  setMode(){this.mode='explore';}
  pick(x,y){const r=this.renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),this.camera);const hit=ray.intersectObjects(this.side.map.scene.children,true).find(h=>h.object.userData.call23&&h.distance<3);if(hit)this.side.call(hit.object.userData.call23);else this.side.interact();}
  render(){
    const s=this.side,map=s.map;this.scene=map.scene;this.sim=s.model;
    if(this.cart.userData.seat)this.cart.userData.seat.rotation.y=s.seatAngle??0;
    if(s.map.evGate){s.map.evGate.scale.z=Math.max(.001,s.gate??1);s.map.evGate.position.z=2.5+(s.gate??1);}
    if(s.mapId==='rail'){
      if(this.cart.parent!==this.scene)this.scene.add(this.cart);
      const p=s.cart.pose;this.cart.position.set(p.x,p.y,p.z);this.cart.rotation.order='YXZ';this.cart.rotation.set(-Math.asin(p.grade),p.heading,0);
      for(const id of['j1','j2']){
        if(!this.blades[id]){const g=new THREE.Group();g.userData.nonPhysical=true;for(const offset of[-.37,.37])cube(g,offset,.09,.8,.065,.08,1.6,0xd8c9a0);this.blades[id]=g;this.scene.add(g);}
        const node=RAIL_NODES[id],edge=RAIL_EDGES.find(e=>e.a===id&&e.b===s.cart.switches[id]),t=edge.curve.getTangentAt(5/edge.length);
        this.blades[id].position.set(node.p[0]+3.2,node.p[1],node.p[2]);this.blades[id].rotation.y=Math.atan2(t.x,t.z);
      }
    }
    if(s.mapId==='canal-upper'){
      const current=new Set(s.waste);
      for(const[o,m]of this.wasteMeshes)if(!current.has(o)){this.scene.remove(m);m.geometry.dispose();m.material.dispose();this.wasteMeshes.delete(o);}
      for(const o of s.waste){
        let m=this.wasteMeshes.get(o);if(!m){m=new THREE.Mesh(o.id==='empty-container'?new THREE.CylinderGeometry(.16,.16,.55,8):new THREE.BoxGeometry(.4,.25,.3),new THREE.MeshStandardMaterial({color:o.id==='empty-container'?0x9caa98:0x877e6d,roughness:.7}));m.userData.nonPhysical=true;this.scene.add(m);this.wasteMeshes.set(o,m);}
        m.position.set(o.x,o.y,o.z);m.rotation.z=o.landed?.6:s.clock*1.3;
      }
    }
    const p=s.player;this.camera.position.set(p.x,s.motion.eyeY+1.81,p.z);this.camera.rotation.order='YXZ';this.camera.rotation.set(p.pitch,p.yaw+Math.PI,0);
    this.flash=map.flash;updateFaultLighting(this);map.flash=this.flash;
    if(s.integrated){this.scene.fog.near=10;this.scene.fog.far=18;}
    if(globalThis.document&&s.aboard&&!s.cart.moving){this.camera.updateMatrixWorld(true);const buttons=document.querySelectorAll('[data-side-route]');buttons.forEach((b,i)=>{const id=b.dataset.sideRoute,e=RAIL_EDGES.find(e=>e.a===s.cart.node&&e.b===id||e.b===s.cart.node&&e.a===id);if(!e)return;const u=e.a===s.cart.node?.22:.78,p=e.curve.getPointAt(u);p.y+=1.3;const cameraPoint=p.clone().applyMatrix4(this.camera.matrixWorldInverse),q=p.project(this.camera);b.style.left=(cameraPoint.z<0?Math.max(12,Math.min(80,50+q.x*38)):12+i*28)+'%';b.style.top=(cameraPoint.z<0?Math.max(20,Math.min(65,50-q.y*35)):60)+'%';});}
    this.scene.traverse(o=>{if(o.userData.call23)o.material.emissive.setHex(s.cart.moving?0x665000:s.cart.node===o.userData.call23?0x226633:0x331100);});
    this.renderer.render(this.scene,this.camera);
  }
  dispose(){this.observer?.disconnect();this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();}
}

export function stage21MapSVG(s){
  if(s.kind==='rail'){
    const paths=RAIL_EDGES.map(e=>'<polyline points="'+Array.from({length:41},(_,i)=>{const p=e.curve.getPointAt(i/40);return p.x+','+p.z;}).join(' ')+'" fill="none" stroke="#8a9e88" stroke-width=".8"/>').join('');
    const nodes=Object.entries(RAIL_NODES).map(([id,n])=>'<circle cx="'+n.p[0]+'" cy="'+n.p[2]+'" r="1.3" fill="#deb88a"/><text x="'+(id==='base'?n.p[0]-1:n.p[0]+2)+'" y="'+(n.p[2]-2)+'" text-anchor="'+(id==='base'?'end':'start')+'" font-size="2.7" fill="#d9dfce">'+(n.children?n.name:s.cart.visited.has(id)?n.name:'未訪問')+'</text>').join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -35 130 105" role="img" aria-label="二回の二方向分岐と車両位置"><rect x="-8" y="-35" width="130" height="105" fill="#24372f"/>'+paths+nodes+'<circle cx="'+s.cart.pose.x+'" cy="'+s.cart.pose.z+'" r="1.4" fill="#ef876d"/></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -2 41 11" role="img" aria-label="固定水路の試験断面"><path d="M0 0 H11 V6 H32 V16" fill="none" stroke="#839d87" stroke-width=".3" transform="translate(0 7) scale(1 -.5)"/><text x="1" y="3" font-size="1.4" fill="#344c40">潜水↔帰還</text><text x="12" y="3" font-size="1.4" fill="#344c40">6m昇降 → 上流探索</text><text x="29" y="-.2" font-size="1.4" fill="#344c40">10m高壁</text></svg>';
}
