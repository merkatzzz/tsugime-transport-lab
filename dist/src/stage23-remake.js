// Architecture-only placeholder; no collection, inventory, currency or timer.
export const DRAINS23=[{id:'lobby-edge',x:-2.2,y:-12.8,z:-1.1},{id:'W0-bank-edge',x:26,y:-12.8,z:-2.3}];
export function nearDrain23(s){if(s.fault||s.mode!=='idle'||s.anyLiftActive)return null;return DRAINS23.find(q=>Math.abs(s.player.y-q.y)<.1&&Math.hypot(s.player.x-q.x,s.player.z-q.z)<1.15);}
export function inspectDrain23(s){const q=nearDrain23(s);if(!q)return false;s.message='側溝：網の設置予定位置（仮表示のみ・回収機能なし）';return true;}
export function drawDrain23(v){for(const q of DRAINS23){const g=new (v.fixed.constructor)();v.fixed.add(g);if(q.id==='W0-bank-edge'){g.position.set(q.x,0,q.z);g.rotation.y=Math.PI/2;g.position.x-=q.z;g.position.z+=q.x;}
 v.cube(g,q.x-.09,q.y-.18,q.z-.6,.18,.08,1.2,'#263f39');
 v.cube(g,q.x-.07,q.y-.08,q.z-.57,.14,.015,1.14,'#438f99');
 for(let z=-.55;z<.6;z+=.15)v.cube(g,q.x-.09,q.y+.015,q.z+z,.18,.025,.025,'metal');
}}
