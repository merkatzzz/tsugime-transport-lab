import {PEOPLE} from './life.js';
// Local furnishings move with the owning shop body; circulation outside each stall remains clear.
export function furnishShops(bodies){for(const n of PEOPLE){const b=bodies.find(b=>b.id===n.work.body),r=n.shop;b.furniture.push({x:r.x+.15,z:r.z+r.d-.65,w:r.w-.3,d:.45,h:.9,color:'wood'},{x:r.x+.2,z:r.z+.15,w:r.w-.4,d:.25,h:.75,color:'wood'});}}
