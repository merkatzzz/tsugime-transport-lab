import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Real application event wiring with unavailable WebGL. This is not browser QA.
test('both independent experiments freeze normal simulation/save state and restore it through real UI handlers',async()=>{
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
    await import('../dist/src/main.js');const lab=window.lab;lab.sim.automation.enabled=true;
    const before=JSON.stringify({snapshot:lab.snapshot(),clock:lab.sim.clock,life:lab.sim.life.time,items:lab.sim.items.counts,auto:lab.sim.automation.idle});
    ids.get('#side-start-canal').onclick();assert.ok(lab.side);assert.equal(lab.side.kind,'canal');assert.equal(inertNode.inert,true);assert.ok(classes.has('stage21-active'));
    const first=performance.now();for(let i=0;i<20;i++)frame(first+i*16.67);
    assert.equal(JSON.stringify({snapshot:{...lab.snapshot(),webgl:false},clock:lab.sim.clock,life:lab.sim.life.time,items:lab.sim.items.counts,auto:lab.sim.automation.idle}),before);
    const side=lab.side;ids.get('#side-climb-height').onchange({target:{value:'8'}});assert.equal(side.model.fault.climbHeight,8);
    ids.get('#side-flash').onclick();assert.equal(side.model.fault.flashlight,false);
    const event={code:'KeyL',target:{tagName:'DIV'},preventDefault(){}};for(const fn of listeners.get('keydown'))fn(event);assert.equal(side.model.fault.flashlight,true);
    ids.get('#side-end').onclick();assert.equal(lab.side,null);assert.equal(inertNode.inert,false);assert.equal(classes.has('stage21-active'),false);assert.equal(lab.sim.items.counts.scrap,undefined);
    ids.get('#side-start-rail').onclick();assert.equal(lab.side.kind,'rail');assert.equal(lab.side.cart.node,'entry');ids.get('#side-end').onclick();
    assert.equal(JSON.stringify({snapshot:lab.snapshot(),clock:lab.sim.clock,life:lab.sim.life.time,items:lab.sim.items.counts,auto:lab.sim.automation.idle}),before);
    lab.sim.startTransfer();ids.get('#side-start-rail').onclick();assert.equal(lab.side,null,'cannot interrupt a transfer to enter an independent scene');
  }finally{console.error=oldError;}
});
