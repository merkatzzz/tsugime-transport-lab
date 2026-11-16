import {BODIES,portSegment} from './architecture.js';
import {toWorld} from './pose.js';
import {geometryView,worldFromView} from './fault-geometry.js';
export function faultInteract(s){
 let selected=null,distance=2;
 for(const key of s.fault.manualPorts??[]){const [id,pid]=key.split(':'),b=BODIES.find(b=>b.id===id),p=b.ports.find(p=>p.id===pid),l=portSegment(b,p,0),at=toWorld(s.positions[id],{x:(l.a[0]+l.b[0])/2,z:(l.a[1]+l.b[1])/2});const d=Math.hypot(at.x-s.player.x,at.z-s.player.z);if(d<distance&&Math.abs(at.y-s.player.y)<.3){selected=key;distance=d;}}
 if(!selected){s.message='E：手動シャッターの近くで操作。その他は故障状態で固定。';return false;}
 const f=s.fault,old=[...f.openPorts];f.openPorts=f.openPorts.includes(selected)?f.openPorts.filter(k=>k!==selected):[...f.openPorts,selected];s.invalidate();let v,next;try{v=geometryView(s);next=worldFromView(v);if(!next.clear(s.player)){next.dispose();f.openPorts=old;s.message='身体が開口内にあるため閉鎖できません。';return false;}f.motion.world.dispose();f.motion.world=next;s.message='手動シャッター '+selected+'：'+(f.openPorts.includes(selected)?'開放（足場は別途確認）':'閉鎖');return true;}finally{v?.dispose();}
}
