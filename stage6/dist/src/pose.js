// A single-cell pose rotates clockwise in the X/Z plan about its centre (4,4).
export const radians=p=>(p.angle??0)*Math.PI/180;
export function toWorld(p,q){if(!(p.angle??0))return{x:p.x+q.x,y:p.y+(q.y??0),z:p.z+q.z};const a=radians(p),c=Math.cos(a),s=Math.sin(a);return{x:p.x+4+c*(q.x-4)-s*(q.z-4),y:p.y+(q.y??0),z:p.z+4+s*(q.x-4)+c*(q.z-4)};}
export function toLocal(p,q){if(!(p.angle??0))return{x:q.x-p.x,y:(q.y??p.y)-p.y,z:q.z-p.z};const a=radians(p),c=Math.cos(a),s=Math.sin(a),x=q.x-p.x-4,z=q.z-p.z-4;return{x:4+c*x+s*z,y:(q.y??p.y)-p.y,z:4-s*x+c*z};}
export function worldLine(p,l){const a=toWorld(p,{x:l.a[0],z:l.a[1]}),b=toWorld(p,{x:l.b[0],z:l.b[1]});return{...l,a:[a.x,a.z],b:[b.x,b.z]};}
export function worldRect(p,r){if(!(p.angle??0))return{...r,x:p.x+r.x,z:p.z+r.z};const points=[[r.x,r.z],[r.x+r.w,r.z],[r.x,r.z+r.d],[r.x+r.w,r.z+r.d]].map(([x,z])=>toWorld(p,{x,z})),xs=points.map(q=>q.x),zs=points.map(q=>q.z);return{...r,x:Math.min(...xs),z:Math.min(...zs),w:Math.max(...xs)-Math.min(...xs),d:Math.max(...zs)-Math.min(...zs)};}
export const rotateFace=(face,angle)=>['N','E','S','W'][((['N','E','S','W'].indexOf(face)+Math.round((angle??0)/90))%4+4)%4];
export function groupPose(g,p){const a=radians(p),c=Math.cos(a),s=Math.sin(a);g.rotation.y=-a;g.position.set(p.x+4-4*c+4*s,p.y,p.z+4-4*s-4*c);}
