export const ATRIUM_IDS=['AT0','AT1','AT2'];
export const ATRIUM_PURPOSE={AT0:'吹き抜け住宅の第二層基壇。外部通路と閉じた底床を保持して待機',AT1:'四連結の中間住宅。Bで上下段の間に集合し、A/Cでは東の専用ベイへ独立退避',AT2:'吹き抜け住宅の第三層。閉じた最上屋根と上階住戸を保持して待機',AC1:'既存生活棟から吹き抜け基壇へ至る入口廊下。Bは西入口を閉鎖して待機'};
export {HOLE,HOLES,FLOOR_PANELS,GLASS,GLASS_BAYS} from './atrium-shape.js';
export const SHAFT={x:12,z:2.8,w:2.4,d:5.7},BASE=.48;
export const ENTRY_RAMP={x:0,z:6,w:5.4,d:1.8,landing:.6};
const port=(id,face,a,b)=>({id,face,a,b,height:2.5,role:'boundary-connector'});
export function addAtrium(bodies){
 bodies.find(b=>b.id==='P9').ports.push(port('atrium','E',5.6,7.6));
 const common={generation:12,use:'residential',zone:'housing',ceiling:5.6,roofAreas:[],solids:[],walls:[],doors:[],furniture:[],privateRooms:[],labels:[]};
 bodies.push({...structuredClone(common),id:'AC1',name:'吹き抜け住宅・導入廊下',color:'#99b2a7',ceiling:2.8,cells:[[0,0],[1,0]],ports:[port('west','W',5.6,7.6),port('east','E',6,7.8)],roofAreas:[{x:0,z:0,w:16,d:8,height:2.8}]});
 for(let tier=0;tier<3;tier++){const b={...structuredClone(common),id:ATRIUM_IDS[tier],name:['吹き抜け住宅・第二層','吹き抜け住宅・中間段','吹き抜け住宅・第三層'][tier],color:'#a6b7a0',atrium:tier,cells:[[0,0],[1,0],[0,1],[1,1]],ports:tier===0?[port('entry','W',6,7.8)]:[]};
  for(const z of[.8,11]){b.walls.push({a:[4.6,z],b:[4.6,z+1.1],role:'room-fixed'},{a:[4.6,z+2.3],b:[4.6,z+4.1],role:'room-fixed'},{a:[.2,z],b:[4.6,z],role:'room-fixed'},{a:[.2,z+4.1],b:[4.6,z+4.1],role:'room-fixed'});b.doors.push({id:b.id+'-'+z,a:[4.6,z+1.1],b:[4.6,z+2.3],kind:'hinge',hinge:'a',swing:90,open:false,label:'共用住戸',floor:BASE});b.furniture.push({x:.7,z:z+.6,w:1.2,d:2,h:.45,floor:BASE,color:'wood'});}
  b.walls=b.walls.map(w=>({...w,floor:BASE,height:3.4}));b.labels=[{name:b.name,x:3,z:8}];bodies.push(b);
 }
}
export function atriumPlacements(phase,p){return Object.assign(p,{AC1:{x:75.6,y:0,z:25.2},AT0:{x:92.4,y:0,z:25.2},AT1:{x:phase==='B'?92.4:117.6,y:6.4,z:25.2},AT2:{x:92.4,y:12.8,z:25.2}});}
export const inside=(r,x,z,margin=0)=>x>r.x-margin&&x<r.x+r.w+margin&&z>r.z-margin&&z<r.z+r.d+margin;
export function subtractRects(rect,holes){let rows=[rect];for(const h of holes)rows=rows.flatMap(r=>{const x=Math.max(r.x,h.x),z=Math.max(r.z,h.z),xx=Math.min(r.x+r.w,h.x+h.w),zz=Math.min(r.z+r.d,h.z+h.d);if(x>=xx||z>=zz)return[r];return[{x:r.x,z:r.z,w:x-r.x,d:r.d},{x:xx,z:r.z,w:r.x+r.w-xx,d:r.d},{x,z:r.z,w:xx-x,d:z-r.z},{x,z:zz,w:xx-x,d:r.z+r.d-zz}].filter(r=>r.w>1e-7&&r.d>1e-7);});return rows;}
