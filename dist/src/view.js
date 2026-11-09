import * as THREE from '../vendor/three.module.js';
import {BODIES,BY_ID,HEIGHT,CELL,LEVELS,EYE,footprint,boundaryWalls,portSegment,perimeter,SLOTS,SPINE_PORTS,connections} from './architecture.js';
import {spineWalls} from './simulation.js';
export class View{
 constructor(container,sim){
  this.sim=sim;this.container=container;this.mode='overview';this.floor='all';this.envelopes=true;this.routes=true;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#dde3df');this.scene.fog=new THREE.Fog('#dde3df',135,250);
  this.camera=new THREE.PerspectiveCamera(54,1,.07,360);
  this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  container.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','建築と搬送体を観察する3D画面');this.renderer.domElement.tabIndex=0;
  this.scene.add(new THREE.HemisphereLight(0xf3f4df,0x697c7e,2.5));const sun=new THREE.DirectionalLight(0xfff4d6,2.6);sun.position.set(-20,60,-30);this.scene.add(sun);const fill=new THREE.DirectionalLight(0xd4e5ed,1.1);fill.position.set(40,20,55);this.scene.add(fill);
  this.mats={};this.groups={};this.roofs=[];this.shutters=[];this.doorMeshes=[];this.bounds=[];this.labels=[];this.fixedFloors=[];
  this.material('wall','#c8c9bb');this.material('concrete','#949c95');this.material('metal','#435c5b');this.material('wood','#877052');this.material('lamp','#e7dd9c',.8);this.material('dark','#2d4142');
  this.buildFacility();BODIES.forEach(b=>this.buildBody(b));this.buildPaths();
  this.orbit={yaw:.62,pitch:.66,distance:88,target:new THREE.Vector3(22,14,17)};this.resize();new ResizeObserver(()=>this.resize()).observe(container);
  this.marker=new THREE.Mesh(new THREE.ConeGeometry(.38,1,12),new THREE.MeshBasicMaterial({color:'#dc4b32'}));this.scene.add(this.marker);
 }
 material(name,color,emissive=0){if(!this.mats[name])this.mats[name]=new THREE.MeshStandardMaterial({color,roughness:.88,metalness:name==='metal'?.45:.06,emissive:color,emissiveIntensity:emissive});return this.mats[name];}
 cube(group,x,y,z,w,h,d,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof mat==='string'?this.mats[mat]??this.material(mat,mat):mat);m.position.set(x+w/2,y+h/2,z+d/2);group.add(m);return m;}
 wall(group,l,height=3.2,mat='wall',thick=.12){const dx=l.b[0]-l.a[0],dz=l.b[1]-l.a[1],len=Math.hypot(dx,dz);if(!len)return;const m=new THREE.Mesh(new THREE.BoxGeometry(len,height,thick),this.mats[mat]);m.position.set((l.a[0]+l.b[0])/2,height/2+.16,(l.a[1]+l.b[1])/2);m.rotation.y=-Math.atan2(dz,dx);group.add(m);return m;}
 text(group,text,x,y,z,{size=1,color='#e6e8dd',background='#344b49',rotation=0}={}){
  const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,768,160);ctx.fillStyle=color;ctx.font='500 52px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,83,728);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(size*4.8,size),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rotation;group.add(m);return m;
 }
 floorTile(group,x,z,color){this.cube(group,x,0,z,8,.16,8,this.material(`floor${color}`,color));
  // Fine joints remain within a permanently joined carrier; no furniture crosses detachable seams.
  for(let n=1;n<8;n++){this.cube(group,x+n,.161,z,.012,.004,8,'#83918a');this.cube(group,x,.161,z+n,8,.004,.012,'#83918a');}
 }
 buildBody(b){
  const g=new THREE.Group();this.scene.add(g);this.groups[b.id]=g;
  for(const [cx,cz] of b.cells){this.floorTile(g,cx*8,cz*8,b.color);const roof=this.cube(g,cx*8,b.ceiling+.16,cz*8,8,.16,8,'#cccdbf');this.roofs.push(roof);
   this.cube(g,cx*8+1.3,b.ceiling-.035,cz*8+3.7,5.4,.045,.22,'lamp');
   const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(8,5,8)),new THREE.LineBasicMaterial({color:b.color,transparent:true,opacity:.75}));edge.position.set(cx*8+4,2.5,cz*8+4);g.add(edge);this.bounds.push(edge);
  }
  for(const l of [...boundaryWalls(b),...b.walls]){this.wall(g,l,b.ceiling);const trim=this.wall(g,l,.12,'metal',.15);}
  for(const s of b.solids)this.cube(g,s.x,.16,s.z,s.w,s.h,s.d,s.color);
  for(const s of b.furniture){this.cube(g,s.x,.16,s.z,s.w,s.h,s.d,'wood');if(b.use==='residential'&&s.h<.6){this.cube(g,s.x+.07,s.h+.16,s.z+.07,s.w-.14,.12,s.d-.14,'#c1c2a8');this.cube(g,s.x+.13,s.h+.29,s.z+.15,s.w-.26,.08,.4,'#d9d9c8');}else this.cube(g,s.x,s.h+.16,s.z,s.w,.06,s.d,'#bba67d');}
  for(const d of b.doors){const mesh=this.wall(g,d,2.4,d.glass?'dark':'wood',.1);const lintel=this.wall(g,d,b.ceiling-2.4);lintel.position.y+=2.4;if(d.glass){mesh.material=new THREE.MeshStandardMaterial({color:'#91bab7',transparent:true,opacity:.36,roughness:.15});this.wall(g,d,.9,'wood',.1);}
   this.doorMeshes.push({mesh,id:d.id,glass:d.glass});const mx=(d.a[0]+d.b[0])/2,mz=(d.a[1]+d.b[1])/2;this.text(g,d.label,mx+.075,2.77,mz,{size:.24,rotation:Math.PI/2});
  }
  for(const p of b.ports){const l=portSegment(b,p),dx=l.b[0]-l.a[0],dz=l.b[1]-l.a[1],len=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
   const portal=new THREE.Group();portal.position.set((l.a[0]+l.b[0])/2,0,(l.a[1]+l.b[1])/2);portal.rotation.y=angle;g.add(portal);
   this.cube(portal,-len/2,2.96,-.06,len,b.ceiling-2.8,.12,'wall');this.cube(portal,-len/2-.11,.16,-.16,.16,2.9,.32,'metal');this.cube(portal,len/2-.05,.16,-.16,.16,2.9,.32,'metal');this.cube(portal,-len/2-.12,2.96,-.2,len+.24,.25,.4,'metal');
   const shutter=new THREE.Group();portal.add(shutter);this.cube(shutter,-len/2,.16,-.045,len,2.8,.09,'metal');for(let n=0;n<9;n++)this.cube(shutter,-len/2,.3+n*.3,-.055,len,.024,.11,'#9d9d75');
   this.shutters.push({group:shutter,id:b.id,port:p});this.cube(portal,-len/2,.17,-.11,len,.015,.22,'#d1b765');
  }
  const n=b.ports.find(p=>p.face==='N');this.text(g,`${b.id}  ${b.name}`,(n.a+n.b)/2,2.8,.12,{size:.43});
  const f=footprint(b);const label=this.text(g,`${b.id} · ${b.cells.length} CHUNKS`,f.w/2,.18,f.d/2,{size:.7,color:'#34443f',background:b.color});label.rotation.x=-Math.PI/2;this.labels.push(label);
 }
 buildFacility(){
  this.fixed=new THREE.Group();this.scene.add(this.fixed);
  // Closed outer building. Its north wall and roof are removed only in developer cutaway views.
  this.shell=new THREE.Group();this.scene.add(this.shell);
  this.cube(this.shell,-10,-.6,-7,64,.4,94,'#8d9792');this.cube(this.shell,-10,33,-7,64,.5,94,'#9ba59f');this.cube(this.shell,-10,0,-7,64,33,.3,'#a3ada5');this.cube(this.shell,53.7,0,-7,.3,33,94,'#9fa9a2');this.cube(this.shell,-10,0,86.7,64,33,.3,'#9fa9a2');this.cube(this.shell,-10,0,-7,.3,33,94,'#9fa9a2');
  for(const [level,y] of LEVELS.entries()){
   const g=new THREE.Group();g.position.y=y;this.fixed.add(g);this.fixedFloors.push({g,y});this.cube(g,-2,0,-4,50,.16,4,'#bcc5b7');for(const l of spineWalls())this.wall(g,l,3.2);
   const roof=this.cube(g,-2,3.36,-4,50,.16,4,'#d2d3c5');this.roofs.push(roof);
   for(let x=0;x<48;x+=8){this.cube(g,x+1,3.25,-2.3,5,.06,.3,'lamp');this.text(g,`${level===1?'第三層':'第二層'}  ← 固定EV`,x+3,2.3,-3.9,{size:.4});}
   for(let slot=0;slot<4;slot++){const [a,b]=SPINE_PORTS[slot],len=b-a;const portal=new THREE.Group();portal.position.x=SLOTS[slot]+a;g.add(portal);const shutter=this.cube(portal,0,.16,-.06,len,2.8,.12,'metal');this.shutters.push({mesh:shutter,fixed:true});}
   const gate=this.cube(g,-2.06,.16,-3.6,.12,2.8,3.2,'metal');this.shutters.push({mesh:gate,lift:true,y});
  }
  // Fixed guide columns stay outside every carrier sweep.
  for(const x of [-6.4,-1.9])for(const z of [-4.4,.4])this.cube(this.fixed,x,0,z,.25,30,.25,'metal');
  this.cabin=new THREE.Group();this.scene.add(this.cabin);this.cube(this.cabin,-6,0,-4,4,.16,4,'#b7ad82');for(const l of [{a:[-6,-4],b:[-2,-4]},{a:[-6,0],b:[-2,0]},{a:[-6,-4],b:[-6,0]}])this.wall(this.cabin,l,3.2,'metal');const cr=this.cube(this.cabin,-6,3.36,-4,4,.15,4,'#adb9aa');this.roofs.push(cr);this.text(this.cabin,'固定 EV  /  E',-4,2.3,-3.9,{size:.5});
  // Gantry guide rails: no permanent hardware intrudes into the swept volume.
  for(const x of [-8,51]){this.cube(this.fixed,x,10.6,-.2,.2,.25,83,'metal');for(const z of [0,20,40,64,82])this.cube(this.fixed,x,-.1,z,.4,32,.4,'metal');}
  this.deck=new THREE.Group();this.scene.add(this.deck);
  for(let z=0;z<=80;z+=8){const points=[new THREE.Vector3(-.2,10.9,z),new THREE.Vector3(48,10.9,z)];this.deck.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#7b928b',transparent:true,opacity:.3})));}
  for(let x=0;x<=48;x+=8){this.deck.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,10.9,0),new THREE.Vector3(x,10.9,82)]),new THREE.LineBasicMaterial({color:'#7b928b',transparent:true,opacity:.3})));}
  this.text(this.deck,'専用搬送空間  +11m',25,11.1,23,{size:1.4}).rotation.x=-Math.PI/2;
  this.text(this.deck,'近方退避ベイ  z40',25,11.1,49,{size:1.3}).rotation.x=-Math.PI/2;
  this.text(this.deck,'遠方退避ベイ  z64',25,11.1,74,{size:1.3}).rotation.x=-Math.PI/2;
 }
 buildPaths(){this.pathGroup=new THREE.Group();this.scene.add(this.pathGroup);this.pathKey='';}
 updatePaths(){
  const plan=this.sim.plan;if(!plan||this.pathKey===plan.from+plan.to)return;
  for(const c of [...this.pathGroup.children]){c.geometry?.dispose();c.material?.dispose();this.pathGroup.remove(c);}this.pathKey=plan.from+plan.to;
  for(const s of plan.stages)for(const m of s.motions){const f=footprint(BY_ID[m.id]),points=[m.from,m.to].map(p=>new THREE.Vector3(p.x+f.w/2,p.y+2.5,p.z+f.d/2));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:BY_ID[m.id].color,dashSize:.6,gapSize:.5,transparent:true,opacity:.65}));line.computeLineDistances();this.pathGroup.add(line);}
 }
 resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);}
 setMode(mode){this.mode=mode;if(mode==='overview'){this.orbit.target.set(22,14,22);this.orbit.distance=96;}this.resize();}
 render(){
  const sim=this.sim,overview=this.mode==='overview';this.shell.visible=!overview;
  for(const b of BODIES){const g=this.groups[b.id],p=sim.positions[b.id];g.position.set(p.x,p.y,p.z);g.visible=!overview||this.floor==='all'||Math.abs(p.y-Number(this.floor))<.1||sim.mode==='moving';}
  for(const {g,y} of this.fixedFloors)g.visible=!overview||this.floor==='all'||y===Number(this.floor);
  this.roofs.forEach(m=>m.visible=!overview);this.bounds.forEach(m=>m.visible=overview&&this.envelopes);this.labels.forEach(m=>m.visible=overview);this.cabin.position.y=sim.liftY;
  const links=connections(sim.phase);
  for(const s of this.shutters){if(s.fixed){s.mesh.visible=sim.shutter>0;s.mesh.scale.y=Math.max(.001,sim.shutter);s.mesh.position.y=.16+2.8-1.4*sim.shutter;}else if(s.lift){s.mesh.visible=sim.liftActive||Math.abs(sim.liftY-s.y)>.01;}else{const connected=links.some(c=>(c.a===s.id&&c.face===s.port.face||c.b===s.id&&c.face==='E'&&s.port.face==='W')&&c.status!=='blocked');const amount=connected?sim.shutter:1;s.group.position.y=2.8*(1-amount);}}
  for(const d of this.doorMeshes)d.mesh.visible=!sim.doors[d.id];
  this.deck.visible=overview&&this.floor==='all';this.pathGroup.visible=overview&&this.routes;this.updatePaths();
  const p=sim.player;this.marker.visible=overview;this.marker.position.set(p.x,p.y+2,p.z);this.marker.rotation.z=Math.PI;
  if(!overview){this.camera.position.set(p.x,p.y+EYE,p.z);this.camera.rotation.order='YXZ';this.camera.rotation.set(p.pitch,p.yaw+Math.PI,0);}else{
   const o=this.orbit,d=o.distance;this.camera.position.set(o.target.x+Math.sin(o.yaw)*Math.cos(o.pitch)*d,o.target.y+Math.sin(o.pitch)*d,o.target.z+Math.cos(o.yaw)*Math.cos(o.pitch)*d);this.camera.lookAt(o.target);
  }
  this.renderer.render(this.scene,this.camera);
 }
}
