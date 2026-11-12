// Local shop plans are mirrored; docking poses remain offset to clear fixed springs.
export function marketPlan(right=false){const mirror=p=>[right?8-p[0]:p[0],p[1]],walls=[[[1.8,.6],[5.8,.6]],[[1.8,5.6],[5.8,5.6]],[[1.8,.6],[1.8,5.6]],[[5.8,.6],[5.8,1.8]],[[5.8,4.8],[5.8,5.6]]].map(([a,b])=>({a:mirror(a),b:mirror(b),height:2.35,role:'room-fixed'}));
 const furniture=[{x:5,z:2,w:.65,d:2.2,h:.9},{x:2,z:1.2,w:.4,d:3.6,h:1.4}].map(r=>({...r,x:right?8-r.x-r.w:r.x,color:'wood'}));return{walls,furniture,shop:{x:right?2.2:1.8,z:.6,w:4,d:5},half:{x:right?0:5.8,z:.4,w:2.2,d:7.2},approach:{x:right?6.2:0,z:2,w:1.8,d:5.8},cross:{x:0,z:5.8,w:8,d:2}};
}
