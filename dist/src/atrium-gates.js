import {BASE} from './atrium-layout.js';
export const gateDefinitions=tier=>[...(tier<2?[{id:'outgoing',z:8.4,bottom:3.2,height:2}]:[]),...(tier>0?[{id:'incoming',z:2.6,bottom:BASE+.16,height:1.3}]:[])];
// Six leaves fold toward the UPSTAIRS side, into a 0.21 × 0.4m pocket.
// Renderer, body collision and occupied swept volume all consume these segments.
export function gateLeaves(d,open){const a=Math.acos(Math.max(0,Math.min(1,1-open))),span=.4*Math.cos(a),depth=.4*Math.sin(a);return Array.from({length:6},(_,i)=>{const x=14.4-(6-i)*span+i*.035*open,z=d.z-(i%2?depth:0),rotation=i%2?-a:a;return{x,z,rotation,a:[x,z],b:[x+span,z+(i%2?depth:-depth)],bottom:d.bottom,top:d.bottom+d.height};});}
