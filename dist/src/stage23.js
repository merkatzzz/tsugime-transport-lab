import {toWorld} from './pose.js';
import {RAIL_EDGES,railPose} from './stage21-rail.js';
export const DRAINS=[{id:'fixed',x:76.7,y:0,z:35},{id:'mobile',body:'R3',x:4,z:.8,phases:['A','C']}];
export function state23(s){return s.research23??={enhanced:false,drains:{},salvage:null};}
export function drainPoint(s,d){return d.body?toWorld(s.positions[d.body],d):d;}
export function advanceDrains(s,dt){const f=state23(s);for(const d of DRAINS){const r=f.drains[d.id];if(!r||r.count>=3||s.mode!=='idle'||d.phases&&!d.phases.includes(s.phase))continue;r.time+=dt;while(r.time>=20&&r.count<3){r.time-=20;r.count++;}if(r.count===3)r.time=0;}}
export function nearDrain(s){return DRAINS.find(d=>{const p=drainPoint(s,d);return Math.abs(p.y-s.player.y)<.1&&Math.hypot(p.x-s.player.x,p.z-s.player.z)<1.3;});}
export function fieldAction(s){if(s.fault||s.mode!=='idle')return false;
 const d=nearDrain(s);if(d){const f=state23(s),r=f.drains[d.id];if(!r){f.drains[d.id]={time:0,count:0};s.message='側溝に試験網を設置しました。流水有効時20秒ごと、容量3。';}else{const n=r.count;r.count=0;s.items.counts.scrap=(s.items.counts.scrap??0)+n;s.message='側溝の回収部品 '+n+'点を取り出しました。';}return true;}
 if(['W0','W2','W3'].includes(s.owner)){state23(s).salvage={cursor:0,time:0,attempts:0};s.message='漂着物回収：F/Kで水流に対して網を調整、Eで回収。';return true;}return false;
}
export function salvageKey(s,code){const r=state23(s).salvage;if(!r)return false;if(code==='KeyF')r.cursor=Math.max(-1,r.cursor-.2);else if(code==='KeyK')r.cursor=Math.min(1,r.cursor+.2);else if(code==='KeyE'){const ok=Math.abs(r.cursor-Math.sin(r.time)*.7)<.25;r.attempts++;if(ok)s.items.counts.scrap=(s.items.counts.scrap??0)+1;s.message=ok?'回収成功：回収部品を獲得':'回収失敗：漂着物は流れ去りました';state23(s).salvage=null;}else return false;return true;}
export function tickSalvage(s,dt){const r=state23(s).salvage;if(r){r.time+=dt;r.cursor=Math.max(-1,Math.min(1,r.cursor+dt*.12));if(r.time>12){state23(s).salvage=null;s.message='回収時間終了。再調査できます。';}}}
export function shortenCall(session,station){
 // Only initial, unseen approach to entrance: put the same vehicle behind an opaque bend.
 const f=state23(session.host);if(station!=='entry'||f.shortCallUsed||session.cart.moving||session.aboard||session.cart.node!=='base')return;
 const e=RAIL_EDGES[0];session.cart.node='j1';session.cart.selected='entry';session.cart.pose=railPose(e,22);session.cart.route={edge:e,from:'j1',to:'entry',direction:-1,distance:22};session.cart.speed=4.5;session.callQueue=[];f.shortCallUsed=true;session.message='呼出受信：奥の遮蔽区間から到着します。';
}
export function draw23(v){
 const g=v.gutters23=new v.fixed.constructor();v.fixed.add(g);
 for(const d of DRAINS){const parent=d.body?v.groups[d.body]:g;if(!parent)continue;const y=d.body?0:d.y;v.cube(parent,d.x-.2,y+.17,d.z-.25,.4,.04,.8,'metal');const net=v.cube(parent,d.x-.18,y+.24,d.z-.2,.36,.06,.5,'wood');net.userData.drain23=d.id;}
 // An inlet throat behind the W0 bank: dark aperture and lintel, no changes to the transport shell.
 v.cube(g,46,-13.65,-6.5,3,.12,2.5,'dark');v.text(g,'水面下の開口を調べる E',47.5,-11.1,-3.7,{size:.2});
}
export function render23(v){v.scene.traverse(o=>{if(o.userData.drain23)o.visible=!!v.sim.research23?.drains[o.userData.drain23];});}
export function physicalLedges(s){
 const edges=new Map();for(const t of s.fault?.motion?.world.triangles??[]){if(t.normal.y<.98||t.kind==='roof')continue;for(const[a,b]of[[t.a,t.b],[t.b,t.c],[t.c,t.a]]){if(Math.abs(a.y-b.y)>.001||Math.hypot(a.x-b.x,a.z-b.z)<.8)continue;const coords=p=>[p.x,p.y,p.z].map(n=>n.toFixed(3)).join(','),key=t.owner+':'+[coords(a),coords(b)].sort().join('/');if(edges.has(key)){edges.get(key).count++;continue;}const len=Math.hypot(b.x-a.x,b.z-a.z);edges.set(key,{count:1,body:t.owner,kind:'frame',key:'physical:'+key,y:a.y,a:{x:a.x,z:a.z},b:{x:b.x,z:b.z},n:{x:-(b.z-a.z)/len,z:(b.x-a.x)/len}});}}
 return [...edges.values()].filter(e=>e.count===1);
}
