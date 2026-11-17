import {drawDrain23} from './stage23-remake.js';
// A fixed north extension of F0, wholly west of the moving construction.
export const ACCESS22={y:-12.8,x:-2.4,w:2,z:-5.6,doorZ:-2.2,dive:{x:47.5,y:-12.8,z:-2.9,id:'W0'}};
export function state22(s){return s.exploration22??= {version:1,gate:1,ev:'closed',collected:[],eventFired:false,eventCount:0,climbHeight:6,diveEnhanced:false,cart:null};}
export function validateState22(f){
  if(f==null)return;if(f.diveEnhanced!==undefined&&typeof f.diveEnhanced!=='boolean')throw Error('潜水切替が不正');const nodes=['entry','j1','j2','observe','parasite','base'],edges=['entry-j1','j1-j2','j1-observe','j2-base','j2-parasite'];
  if(f.version!==1||!Number.isFinite(f.gate)||f.gate<0||f.gate>1||!['closed','open','opening','closing'].includes(f.ev)||![6,8].includes(f.climbHeight)||!Array.isArray(f.collected)||f.collected.some(id=>!['base-scrap','canister','memo'].includes(id)))throw Error('地下・用水路の保存状態が不正');
  if(f.cart){const c=f.cart;if(!Array.isArray(c.arrivals)||c.arrivals.some(n=>!nodes.includes(n))||!c.switches||!['j2','observe'].includes(c.switches.j1)||!['base','parasite'].includes(c.switches.j2)||!nodes.includes(c.node)||!nodes.includes(c.selected)||!Array.isArray(c.visited)||c.visited.some(n=>!nodes.includes(n))||!['x','y','z','heading','grade'].every(k=>Number.isFinite(c.pose?.[k]))||!Number.isFinite(c.speed)||c.speed<0||c.speed>5||(c.route&&(!edges.includes(c.route.edge)||!Number.isFinite(c.route.distance)||c.route.distance<0||c.route.distance>({ 'entry-j1':30.709,'j1-j2':35.123,'j1-observe':39.88,'j2-base':39.82,'j2-parasite':40.164 }[c.route.edge])||![1,-1].includes(c.route.direction)||!nodes.includes(c.route.from)||!nodes.includes(c.route.to))))throw Error('車両の保存状態が不正');}
  if(f.callQueue&&(!Array.isArray(f.callQueue)||f.callQueue.some(n=>!nodes.includes(n))))throw Error('呼出経路の保存状態が不正');
}
export function accessOwner(x,z,y){return Math.abs(y-ACCESS22.y)<.01&&x>=-2.4&&x<=-.4&&z>=-5.6&&z<=2.2?'underground-lobby':null;}
export function accessLines(s){const a=ACCESS22,lines=[{a:[-2.4,-5.6],b:[-2.4,2]},{a:[-.4,-5.6],b:[-.4,2]},{a:[-2.4,-5.6],b:[-.4,-5.6]}];if((s.exploration22?.gate??1)>.001)lines.push({a:[-2.4,a.doorZ],b:[-.4,a.doorZ]});return lines.map(l=>({...l,owner:'underground-lobby',y:a.y}));}
export function groundPortal(s){
  if(s.fault||s.mode!=='idle'||s.anyLiftActive||s.experience.blocking)return null;
  const p=s.player,a=ACCESS22;
  if(Math.abs(p.y-a.y)<.03&&Math.abs(p.x+1.4)<.75&&p.z<-.8&&p.z>-5.1)return p.z<-2.6?'地下へ（専用EV）':'地下専用EVの扉を開く';
  if(s.owner==='W0'&&Math.abs(p.y-a.dive.y)<.1&&Math.abs(p.x-a.dive.x)<=2&&p.z>=-3.8&&p.z<=-2.15)return '水面下の開口を調べる / 潜水';
  return null;
}
export function operateGround(s){
  const prompt=groundPortal(s);if(!prompt)return null;const f=state22(s);
  if(s.owner==='W0'){if(!f.diveEnhanced){s.message='潜水には身体強化が必要です（開発用切替）';return 'inspect';}return 'canal';}
  if(s.player.z<-2.6&&f.ev==='open'){f.ev='closing';return 'closing';}
  if(f.ev==='closed'){f.ev='opening';return 'opening';}return 'wait';
}
export function tickAccess(s,dt){
  const f=state22(s);if(!['opening','closing'].includes(f.ev))return false;
  f.gate=Math.max(0,Math.min(1,f.gate+dt/.55*(f.ev==='opening'?-1:1)));s.invalidate();
  if(f.gate===0)f.ev='open';
  if(f.gate===1&&f.ev==='closing'){f.ev='closed';return true;}return false;
}
export function drawAccess(v){
  if(v.sim.fault)return;
  const g=v.access22=new (v.fixed.constructor)();v.fixed.add(g);const y=ACCESS22.y;
  // Recess the edge slot; never overlay the trough with a full floor slab.
  v.cube(g,-2.4,y,-5.6,.11,.16,7.6,'concrete');
  v.cube(g,-2.11,y,-5.6,1.71,.16,7.6,'concrete');
  for(const [z,d] of [[-5.6,3.9],[-.5,2.5]])v.cube(g,-2.29,y,z,.18,.16,d,'concrete');
  drawDrain23(v);
  for(const l of accessLines({exploration22:{gate:0}}))v.wall(g,l,2.8,'wall',.12,y+.16);
  v.cube(g,-2.4,y+2.96,-5.6,2,.16,7.6,'concrete');
  v.accessGate22=v.cube(g,-2.4,y+.16,-2.26,2,2.6,.12,'metal');
  v.text(g,'地下専用EV / E',-1.4,y+2.4,-2.12,{size:.2});

}
export function renderAccess(v){if(v.accessGate22){const g=v.sim.exploration22?.gate??1;v.accessGate22.scale.x=Math.max(.001,g);v.accessGate22.position.x=-2.4+g;}}
