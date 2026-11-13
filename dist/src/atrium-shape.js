// Metres in a body's local coordinates. The west alcove opens between the homes.
export const HOLE={x:5.8,z:5,w:5.2,d:6};
export const HOLES=[HOLE,{x:2.8,z:6.2,w:3,d:3.2}];
export const OUTLINE=[[5.8,5],[11,5],[11,11],[5.8,11],[5.8,9.4],[2.8,9.4],[2.8,6.2],[5.8,6.2]];
export const OPEN_AREA=HOLES.reduce((n,r)=>n+r.w*r.d,0);
export const OFFSET=.48;
export function offsetOutline(d){return OUTLINE.map((p,i)=>{const prev=OUTLINE[(i+OUTLINE.length-1)%OUTLINE.length],next=OUTLINE[(i+1)%OUTLINE.length],a=[Math.sign(p[1]-prev[1]),-Math.sign(p[0]-prev[0])],b=[Math.sign(next[1]-p[1]),-Math.sign(next[0]-p[0])];return[p[0]+(a[0]+b[0])*d,p[1]+(a[1]+b[1])*d];});}
export function expandedHoles(d){return[{x:5.8-d,z:5-d,w:5.2+2*d,d:6+2*d},{x:2.8-d,z:6.2-d,w:3,d:3.2+2*d}];}
export const holeContains=(x,z,margin=0)=>HOLES.some(r=>x>r.x-margin&&x<r.x+r.w+margin&&z>r.z-margin&&z<r.z+r.d+margin);
export function contourLines(d=0){const p=offsetOutline(d);return p.map((a,i)=>({a,b:p[(i+1)%p.length]}));}
// Twelve real floor leaves. The west pair shares a pocket at separate heights.
export const FLOOR_PANELS=[];
for(let row=0;row<4;row++)for(let col=0;col<2;col++)FLOOR_PANELS.push({x:5.8+col*2.6,z:5+row*1.5,w:2.6,d:1.5,dx:0,dz:row<2?-3.6:3.6,storedY:.32,h:.06});
for(let row=0;row<2;row++)for(let col=0;col<2;col++)FLOOR_PANELS.push({x:2.8+col*1.5,z:6.2+row*1.6,w:1.5,d:1.6,dx:col?-3.5:-2.0,dz:0,storedY:col?.42:.32,h:.06});
FLOOR_PANELS.forEach((p,id)=>p.id=id);
export const CEILING_PANELS=[];
const outer=expandedHoles(OFFSET);
for(let row=0;row<4;row++)for(let col=0;col<2;col++)CEILING_PANELS.push({x:outer[0].x+col*outer[0].w/2,z:outer[0].z+row*outer[0].d/4,w:outer[0].w/2,d:outer[0].d/4,dx:0,dz:row<2?-4:4,storedY:5.62,h:.06});
for(let row=0;row<2;row++)for(let col=0;col<2;col++)CEILING_PANELS.push({x:outer[1].x+col*1.5,z:outer[1].z+row*outer[1].d/2,w:1.5,d:outer[1].d/2,dx:col?-3.4:-1.9,dz:0,storedY:col?5.69:5.60,h:.06});
CEILING_PANELS.forEach((p,id)=>p.id=id);
export const GLASS=Array.from({length:4},(_,i)=>({i,offset:.014+i*.022,height:.325,storedY:.20,deployedY:.64+i*.3125}));
export const GLASS_BAYS=contourLines(.05).map(l=>({x:Math.min(l.a[0],l.b[0])-.05,z:Math.min(l.a[1],l.b[1])-.05,w:Math.abs(l.b[0]-l.a[0])+.1,d:Math.abs(l.b[1]-l.a[1])+.1}));
export const incomingStairPose=open=>({x:0,y:1.1*(1-Math.max(0,Math.min(1,(open-.5)/.5))),z:7.9*(1-Math.max(0,Math.min(1,open/.5)))});
export function leafPose(p,open,closedY){const down=Math.max(0,Math.min(1,open/.3)),slide=Math.max(0,Math.min(1,(open-.3)/.7));return{x:p.dx*slide,y:closedY+(p.storedY-closedY)*down,z:p.dz*slide};}
export function stairHatchPose(i,open,roof=false){const clamp=x=>Math.max(0,Math.min(1,x)),down=roof?(i?clamp((open-.3)/.2):clamp((open-.8)/.2)):clamp(open/.3),slide=roof?(i?clamp(open/.3):clamp((open-.5)/.3)):clamp((open-.3)/.7),closed=roof?5.94:.615,stored=roof?(i?5.85:5.91):(i?.42:.34);return{x:(i?1.4:2.6)*slide,y:closed+(stored-closed)*down,z:0};}

export const STAIR_CASE=[{x:11.93,z:10.62,w:.04,d:1.96,h:.30},{x:14.43,z:10.62,w:.04,d:1.96,h:.30},{x:11.93,z:12.56,w:2.54,d:.04,h:.12}];

export const INCOMING_RAIL_X=[12.03,14.37];
