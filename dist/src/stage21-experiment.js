import {FaultMotion} from './fault-physics.js';
import {climbDiagnosis} from './fault-climb.js';
import {Items} from './items.js';
import {RailVehicle,RAIL_NODES} from './stage21-rail.js';
import {buildStage21Map,disposeStage21Map} from './stage21-world.js';

const distance=(p,q)=>Math.hypot(p.x-q.x,p.z-q.z,p.y+.16-q.y);
const ease=t=>t*t*(3-2*t);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class Stage21Experiment {
  constructor(kind){
    if(!['rail','canal'].includes(kind))throw Error('Unknown experiment');
    this.kind=kind;this.maps=new Map();this.cart=new RailVehicle();this.aboard=false;this.transition=null;this.clock=0;this.collected=new Set();this.collectedNames=[];this.waste=[];this.eventFired=false;this.eventCount=0;
    this.model={positions:{},player:{},message:'',fault:{stage20:true,stage19:false,stepHeight:.36,climbEnabled:true,climbHeight:6,climbAnchors:[],airStyle:'inertia',airControl:.35,flashlight:true,torchStrength:18,brightness:8,lighting:'B'}};
    this.model.items=new Items(this.model);
    this.setMap(kind==='rail'?'rail-ground':'canal-home');
    this.message=kind==='rail'?'仮の旧EVへ近づき E で地下へ。正式な本編入口ではありません。':'固定用水路の潜水地点へ近づき E。自由水泳ではなく別区域へロードします。';
  }
  get player(){return this.model.player;}
  get motion(){return this.model.fault.motion;}
  get map(){return this.maps.get(this.mapId);}
  get message(){return this.model.message;}
  set message(text){this.model.message=text;}
  setMap(id,spawn){
    if(!this.maps.has(id))this.maps.set(id,buildStage21Map(id));
    this.mapId=id;const map=this.map;
    this.model.player={...(spawn??map.spawn)};this.model.fault.climbAnchors=map.anchors;
    this.model.fault.motion=new FaultMotion(this.model,map.world,this.player);
    this.walkRequested=false;
  }
  walk(forward,side,dt,run=false){
    if(this.aboard||this.transition)return false;
    const n=Math.hypot(forward,side)||1,speed=run?5.2:3.6,yaw=this.player.yaw;
    this.walkRequested=Math.hypot(forward,side)>0;
    return this.motion.requestWalk((Math.sin(yaw)*forward-Math.cos(yaw)*side)/n*speed,(Math.cos(yaw)*forward+Math.sin(yaw)*side)/n*speed);
  }
  climb(kind){if(this.aboard||this.transition)return false;const ok=this.motion.commandClimb(kind);if(!ok)this.message=this.diagnosis;return ok;}
  get diagnosis(){return this.aboard?'乗車中：身体移動・昇降は無効':climbDiagnosis(this.model);}
  nearby(){
    if(this.transition)return [];
    if(this.aboard)return !this.cart.moving&&RAIL_NODES[this.cart.node].station?[{id:'leave',name:'降車する E',distance:0}]:[];
    const options=[];
    if(this.mapId==='rail'){
      if(!this.cart.moving){const d=distance(this.player,this.cart.pose);if(d<2.7)options.push({id:'board',name:'トロッコに乗る E',distance:d});}
      if(this.cart.node==='entry'&&distance(this.player,this.map.entry)<1.7)options.push({id:'lift',name:'仮の旧EVで地上へ E',distance:distance(this.player,this.map.entry)});
    }
    if(this.mapId==='rail-ground'&&distance(this.player,this.map.entry)<1.7)options.push({id:'lift',name:'仮の旧EVで地下へ E',distance:distance(this.player,this.map.entry)});
    if(this.map.dive&&distance(this.player,this.map.dive)<1.6)options.push({id:'dive',name:'潜る / 別の用水路へ E',distance:distance(this.player,this.map.dive)});
    for(const o of this.map.objects)if(o.collectible&&!this.collected.has(o.id)&&distance(this.player,o)<1.5)options.push({id:o.id,name:o.name+'を拾う E',distance:distance(this.player,o)});
    return options.sort((a,b)=>a.distance-b.distance);
  }
  interact(id=this.nearby()[0]?.id){
    if(!id||!this.nearby().some(o=>o.id===id))return false;
    if(id==='board'){
      this.aboard=true;this.motion.climbMove=null;this.motion.vx=this.motion.vz=this.motion.vy=0;this.attachPassenger();
      this.message='一人乗り。視点と懐中電灯は自由、身体のWASD移動は無効。発進を押してください。';return true;
    }
    if(id==='leave'){
      this.aboard=false;this.model.player={...this.map.stations[this.cart.node],yaw:this.player.yaw,pitch:this.player.pitch};
      this.model.fault.motion=new FaultMotion(this.model,this.map.world,this.player);this.message=RAIL_NODES[this.cart.node].name+'：降車しました。車両はここで待ちます。';return true;
    }
    if(id==='lift'){this.beginTransition(this.mapId==='rail-ground'?'rail':'rail-ground','lift');return true;}
    if(id==='dive'){this.beginTransition(this.map.dive.to,'dive');return true;}
    const o=this.map.objects.find(o=>o.id===id);
    if(!o?.collectible)return false;
    this.collected.add(id);this.collectedNames.push(o.name);o.mesh.visible=false;
    const bag=this.model.items;bag.counts.scrap=(bag.counts.scrap??0)+1;
    this.message=o.name+'を回収しました。実験内の回収部品として保持します。';return true;
  }
  attachPassenger(){
    const p=this.cart.pose;Object.assign(this.player,{x:p.x,y:p.y+.29,z:p.z});this.motion.eyeY=this.player.y;
  }
  depart(){
    if(!this.aboard||this.transition||!this.cart.depart())return false;
    this.message='走行中。次の駅または分岐共通部で自動停止します。';return true;
  }
  selectRoute(node){return this.aboard&&this.cart.select(node);}
  beginTransition(to,type){
    if(this.transition||this.aboard||this.motion.climbMove)return false;
    this.transition={to,type,time:0,duration:type==='dive'?2:2.6,loaded:false,from:{...this.player}};
    this.message=type==='dive'?'潜水中 → 暗転して別の固定用水路へ':'仮の旧EVで移動中';return true;
  }
  get fade(){if(!this.transition)return 0;const u=this.transition.time/this.transition.duration;return Math.min(1,Math.max(0,1-Math.abs(u-.5)*4));}
  tickTransition(dt){
    const t=this.transition;t.time+=dt;const u=Math.min(1,t.time/t.duration);
    if(u>=.5&&!t.loaded){
      this.setMap(t.to);if(t.to==='canal-home')Object.assign(this.player,{x:8,z:2.7,yaw:-Math.PI/2});
      t.loaded=true;t.arrival={...this.player};
    }
    if(!t.loaded){
      const k=ease(Math.min(1,u/.5));this.player.y=t.from.y-k*(t.type==='dive'?.9:2.5);
      if(t.type==='dive')this.player.z=t.from.z+(4.4-t.from.z)*k;
    }else this.player.y=t.arrival.y-(1-ease((u-.5)*2))*(t.type==='dive'?.9:2.5);
    this.motion.eyeY=this.player.y;
    if(u>=1){Object.assign(this.player,t.arrival);this.motion.eyeY=this.player.y;this.transition=null;this.message=t.type==='dive'?'浮上しました。通常歩行・Q/Cで探索できます。':'仮の旧EVを降りました。';}
  }
  triggerWaste(){
    if(this.mapId!=='canal-upper'||this.eventFired)return false;
    this.eventFired=true;this.eventCount++;this.waste=[
      {id:'empty-container',x:31.8,y:18.5,z:4.8,vx:-.5,vy:0,radius:.28,landed:false},
      {id:'broken-part',x:31.6,y:19.4,z:4.9,vx:-.6,vy:0,radius:.2,landed:false}
    ];this.message='上方から何かが落ちてきました。視点と歩行は自由です。';return true;
  }
  tickWaste(dt){
    if(this.mapId!=='canal-upper')return;
    for(const o of this.waste){
      if(o.landed)continue;
      const old=o.y;o.vy-=9.81*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;
      const solid=this.map.world.support({x:o.x,y:old-o.radius-.16,z:o.z},old-o.y+.001),w=this.map.water;
      let hit=solid?.y,water=false;
      if(o.x>=w.x&&o.x<=w.x+w.w&&o.z>=w.z&&o.z<=w.z+w.d&&old-o.radius>=w.y&&o.y-o.radius<=w.y&&(hit===undefined||w.y>hit)){hit=w.y;water=true;}
      if(hit!==undefined){o.y=hit+o.radius;o.vy=0;o.landed=true;o.water=water;o.landedAt=this.clock;}
    }
  }
  tick(dt){
    const h=Math.min(.1,Math.max(0,dt));this.clock+=h;
    if(this.transition){this.tickTransition(h);return;}
    if(this.aboard){
      const old=this.cart.pose.heading,wasMoving=this.cart.moving;this.cart.tick(h);
      this.player.yaw+=wrap(this.cart.pose.heading-old);this.attachPassenger();
      if(wasMoving&&!this.cart.moving)this.message=RAIL_NODES[this.cart.node].name+'：停止。進路選択・折返し後に発進。駅では E で降車できます。';
    }else{
      const before={...this.player},wasClimbing=!!this.motion.climbMove;this.motion.tick(h);
      if(this.map.eventZone&&!this.eventFired&&this.walkRequested&&!wasClimbing&&this.map.world.support(this.player,.03)&&Math.hypot(this.player.x-before.x,this.player.z-before.z)>1e-6){
        const e=this.map.eventZone;if(Math.hypot(this.player.x-e.x,this.player.z-e.z)<e.radius)this.triggerWaste();
      }
      if(this.player.y< -45)this.recover();
    }
    this.walkRequested=false;this.tickWaste(h);
  }
  recover(){
    if(this.transition)return false;
    if(this.aboard&&this.cart.moving){this.message='走行中は次の停止点までお待ちください。実験終了はいつでも可能です。';return false;}
    if(this.aboard&&!RAIL_NODES[this.cart.node].station){this.message='分岐では降車できません。駅まで走行してください。';return false;}
    this.aboard=false;
    const spawn=this.mapId==='rail'?this.map.stations[this.cart.node]:this.map.spawn;
    this.model.player={...spawn};this.model.fault.motion=new FaultMotion(this.model,this.map.world,this.player);
    this.message='開発用復帰：現在の試験区域の安全位置へ。車両は移動していません。';return true;
  }
  dispose(){for(const map of this.maps.values())disposeStage21Map(map);this.maps.clear();}
}
