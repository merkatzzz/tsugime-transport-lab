import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Real application event wiring with unavailable WebGL. This is not browser QA.
test('ordinary facility E connects both regions and returns without using development launch/exit buttons',async()=>{
  const ids=new Map(),listeners=new Map(),classes=new Set(),inertNode={inert:false};
  for(const[,id]of fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8').matchAll(/id="([^"]+)"/g))ids.set('#'+id,{value:id==='speed'?'2':id==='experiment-size'?'ring1':id==='experiment-method'?'cooperative':'',checked:false,style:{},classList:{toggle(){}},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},innerHTML:'',textContent:'',hidden:false});
  ids.set('.touch-controls',{classList:{toggle(){}}});
  globalThis.document={body:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}},querySelector:s=>{assert.ok(ids.has(s),s);return ids.get(s);},querySelectorAll:s=>s.startsWith('header .header-actions')?[inertNode]:[],createElementNS(){throw Error('WebGL explicitly disabled for CPU Stage21 wiring');}};
  globalThis.location={hostname:'test.invalid'};globalThis.matchMedia=()=>({matches:false});
  globalThis.window={addEventListener:(event,fn)=>{if(!listeners.has(event))listeners.set(event,[]);listeners.get(event).push(fn);}};
  let frame;globalThis.requestAnimationFrame=fn=>frame=fn;
  const plans=JSON.parse(fs.readFileSync(new URL('../dist/assets/transport-plans.json',import.meta.url),'utf8'));
  globalThis.fetch=async()=>({ok:true,json:async()=>plans});
  const oldError=console.error;console.error=()=>{};
  try{
    await import('../dist/src/main.js');const lab=window.lab;
    const sim=lab.sim;sim.player={x:-1.4,y:-12.8,z:-1.3,yaw:Math.PI,pitch:0};
    let time=performance.now();const frames=n=>{for(let i=0;i<n;i++){time+=16.67;frame(time);}};
    ids.get('#interact-button').onclick();frames(40);assert.equal(sim.exploration22.gate,0);
    for(let i=0;i<40;i++)sim.move(0,-.06);assert.ok(sim.player.z<-2.6);
    const phase=sim.phase,poses=JSON.stringify(sim.positions),items=sim.items;
    ids.get('#interact-button').onclick();frames(125);assert.ok(lab.side?.integrated);assert.equal(lab.side.cart.node,'base');assert.equal(lab.side.model.items,items);
    frames(100);const underground=lab.side;Object.assign(underground.player,{x:-5.6,y:-20.04,z:3.5});
    ids.get('#interact-button').onclick();frames(150);assert.equal(lab.side,null);assert.equal(sim.phase,phase);assert.equal(JSON.stringify(sim.positions),poses);assert.equal(sim.player.y,-12.8);assert.equal(ids.get('#side-transition').hidden,true);
    sim.research23={enhanced:true,drains:{}};sim.player={x:47.5,y:-12.8,z:-2.9,yaw:0,pitch:0};ids.get('#interact-button').onclick();frames(130);assert.ok(lab.side?.integrated);assert.equal(lab.side.mapId,'canal-upper');
    frames(60);ids.get('#interact-button').onclick();frames(90);assert.equal(lab.side,null);assert.equal(sim.player.x,47.5);assert.equal(sim.player.z,-2.9);assert.equal(sim.items,items);
  }finally{console.error=oldError;}
});
