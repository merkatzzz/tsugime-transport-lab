const towards=(a,b,amount)=>a+Math.sign(b-a)*Math.min(Math.abs(b-a),amount);
export function tickStage20Motion(m,dt){const s=m.sim,p=s.player,w=m.world,input=m.walkDesired??{x:0,z:0};let left=Math.min(.1,Math.max(0,dt));while(left>1e-8){const h=Math.min(1/120,left);left-=h;if(m.control==='free'){m.move(input.x*h,input.z*h);m.vertical(m.axis*2*h);m.vy=0;m.vx=0;m.vz=0;m.grounded=false;continue;}
 const standing=!!w.support(p,.03)&&m.vy<=0;m.grounded=standing;
 if(standing){m.vx=towards(m.vx,input.x,12*h);m.vz=towards(m.vz,input.z,12*h);}else if(s.fault.airStyle==='legacy'){m.vx=input.x;m.vz=input.z;}else if(Math.hypot(input.x,input.z)>.001){const ax=input.x-m.vx,az=input.z-m.vz,len=Math.hypot(ax,az),change=Math.min(len,12*(s.fault.airControl??.35)*h);if(len){m.vx+=ax/len*change;m.vz+=az/len*change;}}
 const speed=Math.hypot(m.vx,m.vz);if(speed>5.2){m.vx*=5.2/speed;m.vz*=5.2/speed;}const x=p.x,z=p.z;m.move(m.vx*h,m.vz*h);if(Math.abs(p.x-x-m.vx*h)>.00001||Math.abs(p.z-z-m.vz*h)>.00001){m.vx=(p.x-x)/h;m.vz=(p.z-z)/h;}
 if(m.gapHold){m.vy=0;m.grounded=false;}else{m.vy=Math.max(-55,m.vy-9.81*h);if(!m.vertical(m.vy*h)){m.vy=0;const support=w.support(p,.03);m.grounded=!!support;if(support)m.lastLanding=support;}else m.grounded=false;}}
 p.owner=m.ownerAt(p.x,p.z,p.y);m.gapHold=false;m.walkDesired={x:0,z:0};if(s.fault.stage19&&w.support(p,.03)?.owner==='organ:bottom'){m.recover();s.message='生体底部に接触／試験用復帰（地下には進入しません）';}
 const delta=p.y-m.eyeY,smooth=Math.abs(delta)<.5?m.eyeY+delta*(1-Math.exp(-Math.min(dt,.1)*18)):p.y;m.eyeY=Math.max(p.y-.36,Math.min(p.y+.04,smooth));
}
