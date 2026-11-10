// Dedicated fixed reservoirs, never walkable and never movable docking cells.
export const SPRINGS=[
 {id:'P1',x:25.2,y:-12.8,z:10.9,w:3,d:3,face:'W',mouth:{x:25.2,z:12.4}},
 {id:'P2',x:67.2,y:0,z:19.3,w:3,d:3,face:'W',mouth:{x:67.2,z:20.8}},
 {id:'P3',x:58.8,y:12.8,z:19.3,w:3,d:3,face:'W',mouth:{x:58.8,z:20.8}},
 {id:'PA',x:67.2,y:12.8,z:2.5,w:3,d:3,face:'W',mouth:{x:67.2,z:4}},
 {id:'PB',x:61.3,y:0,z:8.4,w:3,d:3,face:'N',mouth:{x:62.8,z:8.4}}
];
export const springBoxes=()=>SPRINGS.map(p=>({id:p.id,min:[p.x,p.y,p.z],max:[p.x+p.w,p.y+6,p.z+p.d]}));
export const ROTATION_BAY={x:75.6,y:6.4,z:25.2,radius:Math.SQRT2*4,clearance:.2};
export const REMOTE_IDS=['D1','D2','D3','D4'];
export const BIOS=[1,2,3,4].map(n=>({id:'BN'+n,body:'N'+n,face:'E',port:'bio',anchor:{x:7.25,y:.9,z:4},supply:{x:6.35,y:1,z:4},maxLength:12}));
