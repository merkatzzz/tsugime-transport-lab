// Roles are structural data, never inferred from colour or neighbour presence.
export const WALL_ROLE=Object.freeze({ROOM:'room-fixed',SHELL:'shell-fixed',CONNECTOR:'boundary-connector',INFILL:'opening-infill',WINDOW:'view-window'});
export function potentialOpenings(p){const all=(p.profiles??[[p.a,p.b]]).map(([a,b])=>[Math.max(a,p.a),Math.min(b,p.b)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]),out=[];for(const interval of all){const last=out.at(-1);if(last&&interval[0]<=last[1]+1e-7)last[1]=Math.max(last[1],interval[1]);else out.push([...interval]);}return out;}
export const canEverOpen=(p,a,b)=>potentialOpenings(p).some(([x,y])=>a>=x-1e-7&&b<=y+1e-7);
