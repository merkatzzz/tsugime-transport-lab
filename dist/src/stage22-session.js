import {Stage21Experiment} from './stage21-experiment.js';
import {RailVehicle,RAIL_EDGES,RAIL_NODES,edgeBetween,railPose} from './stage21-rail.js';
import {state22} from './stage22-access.js';
import {FaultMotion} from './fault-physics.js';
import {worldFromScene} from './stage21-world.js';
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function stationPath(from,to,seen=new Set()){
  if(from===to)return[from];seen.add(from);
  for(const e of RAIL_EDGES){const n=e.a===from?e.b:e.b===from?e.a:null;if(!n||seen.has(n))continue;const p=stationPath(n,to,seen);if(p)return[from,...p];}return null;
}
export class IntegratedSession extends Stage21Experiment {
  constructor(kind,sim){
    super(kind);this.integrated=true;this.host=sim;const f=state22(sim);this.state=f;this.returnRequested=false;
    this.model.items=sim.items;this.model.fault.climbHeight=f.climbHeight;
    this.collected=new Set(f.collected);this.eventFired=f.eventFired;this.eventCount=f.eventCount;this.seatAngle=f.seatAngle??0;this.callQueue=[...(f.callQueue??[])];
    if(f.cart){Object.assign(this.cart,f.cart,{visited:new Set(f.cart.visited),route:f.cart.route?{...f.cart.route,edge:RAIL_EDGES.find(e=>e.id===f.cart.route.edge)}:null});}
    else{this.cart=new RailVehicle();this.cart.node='base';this.cart.selected='j2';const e=edgeBetween('j2','base');this.cart.pose=railPose(e,e.length);this.cart.arrivals=['base'];this.cart.visited=new Set(['entry']);}
    this.setMap(kind==='rail'?'rail':'canal-upper',kind==='rail'?{x:-6,y:-20.04,z:3.5,yaw:Math.PI/2,pitch:0}:undefined);
    this.gate=kind==='rail'?1:0;this.evPhase=kind==='rail'?'opening':'open';this.arrivalFade={time:0,y:this.player.y};this.syncGate();
    this.message=kind==='rail'?'地下に着床。扉が開いたら徒歩で入口駅へ。呼出装置で車両を呼べます。':'W2の上流へ浮上。Q/Cで6mの堰を往復できます。';
  }
  setMap(id,spawn){super.setMap(id,spawn);if(this.integrated)for(const o of this.map.objects)if(this.collected.has(o.id))o.mesh.visible=false;}
  nearby(){
    if(!this.integrated)return super.nearby();
    let rows=super.nearby().filter(o=>o.id!=='lift');
    const p=this.player;
    if(!this.aboard&&this.mapId==='rail'&&!this.transition){
      if(Math.hypot(p.x+5.6,p.z-3.5)<1.3)rows.push({id:'home-ev',name:'第一層へ（専用EV） E',distance:0});
      const station=Object.entries(this.map.stations).find(([,q])=>Math.hypot(p.x-q.x,p.z-q.z)<1.8&&Math.abs(p.y-q.y)<.3)?.[0];
      this.callStation=station;
      if(station&&(this.cart.node!==station||this.cart.moving))rows.push({id:'call',name:this.cart.moving?'車両は走行中':'無人トロッコを呼ぶ E',distance:1});
    }return rows;
  }
  interact(id=this.nearby()[0]?.id){
    if(id==='home-ev'&&this.nearby().some(o=>o.id===id)){if(this.evPhase==='open')this.evPhase='closing';return true;}
    if(id==='call')return this.call(this.callStation);
    if(id==='dive'&&this.integrated&&this.mapId==='canal-upper'){
      if(!this.nearby().some(o=>o.id===id))return false;this.returnDive={time:0,from:{...this.player}};return true;
    }
    if(this.seatTurn||this.returnDive)return false;
    const ok=super.interact(id);this.persist();return ok;
  }
  call(station){
    if(!RAIL_NODES[station]?.station||this.aboard||this.cart.moving||this.callQueue.length||this.cart.node===station)return false;
    this.callQueue=stationPath(this.cart.node,station).slice(1);this.advanceCall();this.message='無人呼出：線路と分岐を順に走行します。';return true;
  }
  advanceCall(){if(!this.cart.moving&&this.callQueue.length){this.cart.select(this.callQueue.shift());this.cart.depart();}}
  chooseAndGo(node){
    if(!this.aboard||this.cart.moving||this.seatTurn||!this.cart.select(node))return false;
    const e=edgeBetween(this.cart.node,node),angle=e.a===this.cart.node?0:Math.PI;
    this.seatTurn={time:0,from:this.seatAngle,delta:wrap(angle-this.seatAngle),yaw:wrap(this.cart.pose.heading+angle-this.player.yaw)};
    return true;
  }
  syncGate(){
    const m=this.map.evGate;if(!m)return;
    m.scale.z=Math.max(.001,this.gate);m.position.z=2.5+this.gate;
    const blocked=this.gate>.001;if(m.userData.nonPhysical===!blocked)return;
    m.userData.nonPhysical=!blocked;const old=this.map.world;this.map.world=worldFromScene(this.map.scene);this.motion.world=this.map.world;old.dispose();
  }
  walk(...args){if(this.evPhase==='closing'||this.returnDive||this.arrivalFade)return false;return super.walk(...args);}
  get fade(){if(this.arrivalFade)return 1-Math.min(1,this.arrivalFade.time/.8);if(this.returnDive)return Math.min(1,this.returnDive.time/.65);if(this.evPhase==='loading')return 1;return super.fade;}
  tick(dt){
    const h=Math.min(.1,dt);if(this.arrivalFade){const t=this.arrivalFade;t.time+=h;this.motion.eyeY=t.y-(1-Math.min(1,t.time/.8))*.6;if(t.time>=.8)this.arrivalFade=null;return;}
    if(this.returnDive){this.returnDive.time+=h;this.player.y=this.returnDive.from.y-Math.min(1,this.returnDive.time)*.8;this.motion.eyeY=this.player.y;if(this.returnDive.time>=1.2)this.returnRequested=true;return;}
    if(this.evPhase==='opening'||this.evPhase==='closing'){
      this.gate=Math.max(0,Math.min(1,this.gate+h/.55*(this.evPhase==='opening'?-1:1)));this.syncGate();
      if(this.gate===0)this.evPhase='open';if(this.gate===1&&this.evPhase==='closing'){this.evPhase='loading';this.evLoad=0;}
    }
    if(this.evPhase==='loading'){this.evLoad+=h;this.motion.eyeY=this.player.y-Math.min(.6,this.evLoad);if(this.evLoad>1.2)this.returnRequested=true;return;}
    if(this.seatTurn){const t=this.seatTurn,old=this.seatAngle;t.time+=h;const k=Math.min(1,t.time/.65),smooth=k*k*(3-2*k);this.seatAngle=t.from+t.delta*smooth;this.player.yaw+=t.yaw*(smooth-(t.last??0));t.last=smooth;this.attachPassenger();if(k===1){this.seatTurn=null;super.depart();}this.persist();return;}
    if(!this.aboard){const moving=this.cart.moving;this.cart.tick(h);if(moving&&!this.cart.moving&&!this.callQueue.length)this.message='無人トロッコが到着しました。近づいて E で乗車できます。';this.advanceCall();}
    super.tick(h);this.persist();
  }
  persist(){
    const f=this.state;if(!f)return;f.collected=[...this.collected];f.eventFired=this.eventFired;f.eventCount=this.eventCount;f.climbHeight=this.model.fault.climbHeight;f.seatAngle=this.seatAngle;
    f.callQueue=[...this.callQueue];const c=this.cart;f.cart={node:c.node,selected:c.selected,switches:{...c.switches},speed:c.speed,pose:{...c.pose},visited:[...c.visited],arrivals:[...c.arrivals],route:c.route?{...c.route,edge:c.route.edge.id}:null};
    f.lastLocation={region:this.kind,map:this.mapId,player:{...this.player}};
  }
  dispose(){this.persist();super.dispose();}
}
