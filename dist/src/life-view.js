import {exposeBoxSurfaces} from './surfaces.js';
import * as THREE from '../vendor/three.module.js';import {PEOPLE} from './life.js';import {toWorld} from './pose.js';
export function installLifeView(View){
 View.prototype.buildLifeBody=function(b,g){for(const n of PEOPLE.filter(n=>n.work.body===b.id)){const r=n.shop;this.cube(g,r.x-.06,r.h+.16,r.z-.06,r.w+.12,.12,r.d+.12,'metal');const panel=new THREE.Group();panel.userData.target='cover:'+n.id;panel.position.set(r.x,.16,r.z+r.d);g.add(panel);this.cube(panel,0,0,-.035,r.w,r.h,.07,r.kind==='metal'?'#6b7973':'#685d62');for(let i=1;i<8;i++)this.cube(panel,r.kind==='metal'?0:i*r.w/8,r.kind==='metal'?i*r.h/8:0,-.05,r.kind==='metal'?r.w:.035,r.kind==='metal'?.025:r.h,.02,'#85806f');exposeBoxSurfaces(panel);(this.lifeCovers??=[]).push({id:n.id,g:panel,h:r.h});this.text(g,n.name+' / 営業時間 15–60',r.x+r.w/2,r.h+.37,r.z+r.d+.1,{size:.22});}
  if(b.id==='R3'){const panel=this.cube(g,2.76,.16,5.9,.08,2.3,.5,'#685d62');panel.userData.target='home-privacy';this.homePrivacy=panel;}
 };
 View.prototype.buildLifePerson=function(n,g){const root=new THREE.Group();root.userData.target=n.id;g.add(root);const add=(geometry,color,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geometry,this.material('npc:'+color,color));m.userData.target=n.id;m.position.set(x,y,z);m.scale.set(sx,sy,sz);root.add(m);return m;},sphere=()=>new THREE.SphereGeometry(1,12,8),metal=n.id==='shopkeeper'?'#697b75':'#91705f';
  add(sphere(),metal,0,.68,0,.3,.5,.25);const head=add(sphere(),n.id==='shopkeeper'?'#9baca1':'#c2a287',0,1.37,.03,.27,.25,.22);head.userData.target=n.id;
  add(new THREE.TorusGeometry(.27,.04,6,14),'#455951',0,1.32,.02).rotation.x=Math.PI/2;
  for(const x of[-.13,.13]){add(sphere(),'#d6c98f',x,1.42,.23,.07,.07,.04);add(sphere(),'#263e39',x,1.42,.26,.025,.035,.02);add(new THREE.CylinderGeometry(.035,.055,.54,7),metal,x*2.1,.76,.12).rotation.z=x<0?.5:-.5;add(new THREE.CylinderGeometry(.06,.09,.45,7),'#43594e',x,.27,.06).rotation.x=.15;}
  if(n.id==='shopkeeper'){add(new THREE.CylinderGeometry(.28,.31,.15,12),'#43594e',0,1.64,.02);add(new THREE.BoxGeometry(.34,.42,.06),'#bba77f',0,.64,.25);}else{for(const x of[-.24,.24])add(new THREE.CylinderGeometry(.025,.05,.35,7),'#826d53',x,1.63,0).rotation.z=x<0?-.4:.4;add(sphere(),'#6c7561',0,.75,-.2,.28,.33,.12);}
  (this.people??=[]).push({g:root,n,head});
 };
 View.prototype.renderLife=function(){const s=this.sim;s.life.overview=this.mode==='overview';for(const p of this.people??[]){const loc=s.life.location(p.n.id),parent=this.groups[loc.body];if(p.g.parent!==parent)parent.add(p.g);p.g.position.set(loc.x,.16,loc.z);const talking=s.experience.dialogue?.npc.id===p.n.id||s.experience.visit?.npc===p.n.id,w=toWorld(s.positions[loc.body],loc);const eye=s.experience.visit?.npc===p.n.id?toWorld(s.positions[loc.body],s.life.person(p.n.id).home.camera):s.player;p.g.rotation.y=talking?Math.atan2(eye.x-w.x,eye.z-w.z)+(s.positions[loc.body].angle??0)*Math.PI/180:Math.PI;const a=Math.sin(s.clock*(p.n.id==='shopkeeper'?1.4:.9));p.head.rotation.z=a*.035;p.head.position.y=1.37+a*.015;}
 for(const c of this.lifeCovers??[]){const amount=s.life.states[c.id].cover;c.g.visible=amount>.001;c.g.scale.y=Math.max(.001,amount);c.g.position.y=.16+c.h*(1-amount);}if(this.homePrivacy)this.homePrivacy.visible=s.experience.visit?.npc!=='resident';
 };
}
