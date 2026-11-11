import {toWorld,toLocal} from './pose.js';
export const LIFE_CONFIG={period:60,homeSeconds:15,coverSeconds:.8};
export const PEOPLE=[
 {id:'shopkeeper',name:'生活用品店の店主',offset:0,home:{body:'P9',x:3,y:0,z:2,door:'P9-home',camera:{x:4,y:1.7,z:4.1},look:{x:3,y:1.3,z:2}},work:{body:'T1',x:12,y:0,z:1.9},shop:{x:10,z:.8,w:4,d:2.2,h:2.4,kind:'curtain'},lines:['生活用品の店です。営業中はここで作業しています。','届け物なら、宛名を確かめて渡してください。']},
 {id:'resident',name:'簡易個室の住人',offset:8,home:{body:'R3',x:1.55,y:0,z:6.25,door:'R3-door',camera:{x:3.55,y:1.7,z:6.15},look:{x:1.5,y:1.35,z:6.25}},work:{body:'T2',x:3,y:0,z:1.9},shop:{x:1,z:.8,w:4,d:2.2,h:2.4,kind:'metal'},lines:['部品の整理を手伝っています。','部屋にいない間はこちらで働いています。']}
];
export const scheduleAt=(time,n,config=LIFE_CONFIG)=>((time+n.offset)%config.period+config.period)%config.period<config.homeSeconds?'home':'work';
export class Life{
 constructor(sim){this.sim=sim;this.time=0;this.config={...LIFE_CONFIG};this.states=Object.fromEntries(PEOPLE.map(n=>[n.id,{location:'home',cover:1,stage:'closed',event:null,changes:0}]));this.events=[];}
 person(id){return PEOPLE.find(n=>n.id===id);}
 desired(id){const n=this.person(id),state=this.states[id];return state.event==='stay-home'?'home':scheduleAt(this.time,n,this.config);}
 location(id){const n=this.person(id);return n[this.states[id].location];}
 nextHome(id){const n=this.person(id),q=((this.time+n.offset)%this.config.period+this.config.period)%this.config.period;return this.time+(q<this.config.homeSeconds?0:this.config.period-q);}
 pinned(id){const e=this.sim.experience;return e.visit?.npc===id||e.dialogue?.npc.id===id||e.trade===id;}
 insideShop(id){const n=this.person(id),s=this.sim,p=s.positions[n.work.body],q=toLocal(p,s.player),r=n.shop;return Math.abs(s.player.y-p.y)<.01&&q.x>r.x-.5&&q.x<r.x+r.w+.5&&q.z>r.z-.5&&q.z<r.z+r.d+.5;}
 canTrade(id){const r=this.states[id];return this.sim.mode==='idle'&&this.desired(id)==='work'&&r.location==='work'&&r.stage==='open'&&r.cover===0;}
 activeNPCs(){return PEOPLE.map(n=>({...n,...this.location(n.id),radius:.32,anchor:{x:this.location(n.id).x,y:0,z:this.location(n.id).z+1.8}}));}
 switch(id,location){const r=this.states[id];if(r.cover!==1)throw Error('Visible NPC warp refused');r.location=location;r.changes++;this.sim.invalidate();this.events.push({id,location,time:this.time,cover:r.cover});if(this.events.length>32)this.events.shift();}
 tick(dt){this.time+=dt;for(const n of PEOPLE){const r=this.states[n.id],before=r.cover,desired=this.desired(n.id),safe=this.sim.mode==='idle'&&!this.sim.anyLiftActive,held=this.pinned(n.id)||this.insideShop(n.id)||this.overview;
   if(!safe){if(!held&&r.cover<1){r.cover=Math.min(1,r.cover+dt/this.config.coverSeconds);this.sim.invalidate();}r.stage=r.cover===1?'transport-closed':'suspended';continue;}
   if(desired===r.location&&r.location==='home'){r.stage='closed';continue;}
   if(desired!==r.location){if(held){r.stage='pending';continue;}if(r.location==='home'&&(this.sim.experience.doorProgress[n.home.door]??0)>0){this.sim.experience.doorTargets[n.home.door]=false;r.stage='pending';continue;}if(r.cover<1){r.stage='closing';r.cover=Math.min(1,r.cover+dt/this.config.coverSeconds);this.sim.invalidate();if(r.cover<1)continue;}this.switch(n.id,desired);r.stage=desired==='home'?'closed':'opening';}
   if(r.location==='work'&&desired==='work'){if(r.cover>0){r.stage='opening';r.cover=Math.max(0,r.cover-dt/this.config.coverSeconds);}if(r.cover!==before)this.sim.invalidate();if(r.cover===0)r.stage='open';}
 }}
 info(id){const r=this.states[id];return{...r,desired:this.desired(id),nextHome:this.nextHome(id),position:toWorld(this.sim.positions[this.location(id).body],this.location(id))};}
}
