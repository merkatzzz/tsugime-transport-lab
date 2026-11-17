import * as THREE from '../vendor/three.module.js';

// Two successive binary turnouts. Reverse travel uses these very same curves.
export const RAIL_NODES = {
  entry: {name:'地下入口駅',p:[0,-20,0],station:true},
  j1: {name:'第一分岐',p:[30,-20,6],children:['j2','observe']},
  j2: {name:'第二分岐',p:[62,-18,18],children:['base','parasite']},
  observe: {name:'観察区域',p:[32,-22,-26],station:true},
  parasite: {name:'駆除試験区域',p:[65,-20,48],station:true},
  base: {name:'活動拠点・回収区域（仮）',p:[100,-19,28],station:true}
};
const v = p => new THREE.Vector3(...p);
function curve(points,common=false) {
  const path=new THREE.CurvePath();
  if(common)path.add(new THREE.LineCurve3(v(points[0]),v(points[1])));
  path.add(new THREE.CubicBezierCurve3(...points.slice(common?1:0).map(v)));
  for(const c of path.curves){c.arcLengthDivisions=512;c.updateArcLengths();}
  path.arcLengthDivisions=1024;path.updateArcLengths();
  return path;
}
const specs=[
  ['entry','j1',[[0,-20,0],[10,-20,0],[20,-20,6],[30,-20,6]]],
  ['j1','j2',[[30,-20,6],[34,-20,6],[42,-20,6],[48,-18,18],[62,-18,18]]],
  ['j1','observe',[[30,-20,6],[34,-20,6],[41,-20,6],[41,-22,-17],[32,-22,-26]]],
  ['j2','base',[[62,-18,18],[66,-18,18],[78,-18,18],[85,-19,28],[100,-19,28]]],
  ['j2','parasite',[[62,-18,18],[66,-18,18],[74,-18,18],[78,-20,39],[65,-20,48]]]
];
export const RAIL_EDGES=specs.map(([a,b,points])=>{
  const c=curve(points,points.length===5);
  return {id:a+'-'+b,a,b,curve:c,length:c.getLength(),branch:b==='observe'||b==='parasite'};
});
export function edgeBetween(a,b){return RAIL_EDGES.find(e=>e.a===a&&e.b===b||e.a===b&&e.b===a);}
export function railPose(edge,distance){
  const u=Math.max(0,Math.min(1,distance/edge.length)),p=edge.curve.getPointAt(u),t=edge.curve.getTangentAt(u);
  return {x:p.x,y:p.y,z:p.z,heading:Math.atan2(t.x,t.z),grade:t.y};
}
export class RailVehicle {
  constructor(){this.node='entry';this.selected='j1';this.switches={j1:'j2',j2:'base'};this.speed=0;this.route=null;this.pose=railPose(RAIL_EDGES[0],0);this.visited=new Set(['entry']);this.arrivals=['entry'];}
  get moving(){return !!this.route;}
  get choices(){return RAIL_EDGES.filter(e=>e.a===this.node||e.b===this.node).map(e=>e.a===this.node?e.b:e.a);}
  select(node){if(this.moving||!this.choices.includes(node))return false;this.selected=node;if(RAIL_NODES[this.node].children?.includes(node))this.switches[this.node]=node;return true;}
  depart(){
    if(this.moving)return false;
    if(this.approach){const a=this.approach,e=RAIL_EDGES.find(e=>e.id===a.edge);if(this.selected!==e.b){this.route={edge:e,from:this.node,to:this.node,direction:-1,distance:a.distance,prefix:true,next:this.selected};this.speed=0;return true;}}
    const edge=edgeBetween(this.node,this.selected);if(!edge)return false;
    const direction=edge.a===this.node?1:-1;
    if(RAIL_NODES[edge.a].children?.includes(edge.b))this.switches[edge.a]=edge.b;
    this.route={edge,from:this.node,to:this.selected,direction,distance:this.approach?.distance??(direction===1?0:edge.length)};
    this.approach=null;this.speed=0;return true;
  }
  tick(dt){
    const r=this.route;if(!r)return;
    let left=Math.min(.1,Math.max(0,dt));
    while(left>1e-8&&this.route){
      const h=Math.min(1/120,left);left-=h;
      const end=r.direction===1?r.edge.length:(this.directionalStops&&!r.prefix&&RAIL_NODES[r.to].children?7:0),remaining=Math.abs(end-r.distance);
      this.speed=Math.min(4.5,this.speed+2*h,Math.sqrt(4*remaining));
      const travel=Math.min(remaining,this.speed*h);
      r.distance+=r.direction*travel;
      this.pose=railPose(r.edge,r.distance);
      if(remaining-travel<.0001){
        // Stop at the common point, four metres before the turnout diverges.
        this.pose=railPose(r.edge,end);
        if(r.prefix){this.route=null;this.speed=0;this.approach=null;this.selected=r.next;if(this.deferPrefixTurn)this.prefixTurn=r.next;else this.depart();return;}
        this.approach=end===7?{edge:r.edge.id,distance:7}:null;
        this.node=r.to;this.speed=0;this.route=null;this.visited.add(this.node);this.arrivals.push(this.node);
        this.selected=RAIL_NODES[this.node].children?.[0]??r.from;
        if(RAIL_NODES[this.node].children)this.switches[this.node]=this.selected;
      }
    }
  }
}
