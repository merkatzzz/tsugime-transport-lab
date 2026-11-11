// Current Stage 6 evidence. Earlier evidence stays in the frozen snapshots.
import fs from 'node:fs';
import {toWorld} from '../dist/src/pose.js';
import {SPRINGS,BIOS,ROTATION_BAY} from '../dist/src/infrastructure.js';
import {connectionCheck} from '../dist/src/biology.js';
import {BODIES,LEVELS,NEXT,SIZES,placements,connections,portStates,reachable,localNavigation,emptyDockCells} from '../dist/src/architecture.js';
import {Simulation} from '../dist/src/simulation.js';
import {comparison,planTransfer,validatePlan} from '../dist/src/transport.js';
import {shortcutMeasurements} from '../dist/src/navigation.js';
import {NPCS,worldPoint} from '../dist/src/experience.js';
import {floorSVG,deckSVG} from '../dist/src/maps.js';
fs.mkdirSync('docs/evidence',{recursive:true});const write=(name,data)=>fs.writeFileSync('docs/evidence/'+name,typeof data==='string'?data:JSON.stringify(data,null,2));
const phases=['A','B','C'],walk=shortcutMeasurements(),matrix=comparison();
write('comparisons.json',matrix);write('adopted-plans.json',phases.map(p=>planTransfer(p,NEXT[p])));write('all-plans.json',Object.keys(SIZES).flatMap(size=>['serial','cooperative'].flatMap(method=>phases.map(p=>planTransfer(p,NEXT[p],{size,method})))));
write('phases.json',phases.map(phase=>({phase,placements:placements(phase),connections:connections(phase),ports:portStates(phase),reachable:[...reachable(phase)],emptyDockCells:emptyDockCells(phase)})));
write('shortcut-results.json',walk);write('baseline-preservation.json',{stage1:'2aea792d10900ace9197af41ea0d5f79b642866d',stage2:'88c2c01d49ba34baad9a40936032c8b5f40c87fa',stage3:'40f3202324e983908b4eaa907b3b3d3567c8d0a1',stage4:'dcebd2f0fb94a8df590ecb5ca4e74de697f97b6b',stage5:'6dc2039eb030e6b0a946d3f83141cf1db8e4921c',routes:['stage1/','stage2/','stage3/','stage4/','stage5/']});
write('geometry-results.json',{stage:6,bodies:BODIES.length,cells:BODIES.reduce((n,b)=>n+b.cells.length,0),levels:LEVELS,allProfilesPassed:matrix.every(r=>r.transitions.every(t=>t.ok)),adopted:phases.map(p=>validatePlan(planTransfer(p,NEXT[p]))),browserQA:{verified:false,blocker:'sites-preview: relay could not open browser port 4173: timed out waiting for relay readiness',audioHeard:false},checks:'CPU real meshes, body controller routes, camera head visibility, continuous swept boxes. GPU and audible output unverified.'});
const sim=new Simulation();write('experience.json',phases.map(phase=>{sim.phase=phase;sim.positions=placements(phase);sim.invalidate();return{phase,npcs:NPCS.map(n=>({id:n.id,body:n.body,position:worldPoint(sim,n.body,n),camera:n.camera?worldPoint(sim,n.body,n.camera):null})),doors:BODIES.flatMap(b=>b.doors.map(d=>({body:b.id,...d})))};}));
for(const phase of phases){sim.phase=phase;sim.positions=placements(phase);sim.invalidate();for(const level of [0,1,2])write(`${phase}-level-${[2,3,1][level]}.svg`,floorSVG(sim,level,{phase,path:level===1?walk.rows.find(r=>r.phase===phase).route:null}));sim.plan=planTransfer(phase,NEXT[phase]);write(`${phase}-transport.svg`,deckSVG(sim));}
write('transport-route.svg',deckSVG(sim));
const rows=matrix.map(r=>`${SIZES[r.size].label} / ${r.method}　${r.transitions.reduce((n,t)=>n+t.duration,0).toFixed(2)}秒　最大${Math.max(...r.transitions.map(t=>t.maxConcurrent))}体`);write('comparison.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300"><rect width="1000" height="300" fill="#edf0e5"/>${rows.map((r,i)=>`<text x="24" y="${45+i*40}" font-family="sans-serif" font-size="20" fill="#37513f">${r}</text>`).join('')}</svg>`);
// Retain old component figures only under the frozen prior stage. Current report
// uses the live architecture maps and the connection edges in phases.json.
for(const p of phases)for(const l of [1,2,3])write(`${p}-graph-${l}.svg`,floorSVG(Object.assign(new Simulation(),{phase:p,positions:placements(p)}),[2,0,1][l-1],{phase:p}));
write('browser-results.json',{stage:6,verified:false,reason:'Managed preview relay readiness timed out. No GPU playtest or audio listening claim.'});
console.log(JSON.stringify({profiles:matrix.length,plans:matrix.length*3,shortcut:walk.rows.map(r=>r.route.distance),cycle:matrix.find(r=>r.size==='ring1'&&r.method==='cooperative').transitions.reduce((n,t)=>n+t.duration,0)}));

write('stage6-infrastructure.json',{springs:SPRINGS,organisms:BIOS,rotationBay:ROTATION_BAY,phases:phases.map(phase=>{const s=new Simulation();s.phase=phase;s.positions=placements(phase);s.invalidate();for(let i=0;i<120;i++)s.tick(.1);return{phase,placements:s.positions,available:s.biology.available(),connections:BIOS.map(b=>({bio:b.id,body:b.body,...s.biology.animals[b.id].connection})),checks:BIOS.flatMap(b=>SPRINGS.map(p=>({bio:b.id,spring:p.id,...connectionCheck(s,b,p)})))};})});
for(const phase of phases){const s=new Simulation();s.phase=phase;s.positions=placements(phase);s.invalidate();write(phase+'-remote.svg',floorSVG(s,1,{phase,scope:'remote'}));write(phase+'-main.svg',floorSVG(s,1,{phase,scope:'main'}));}

// Abstract component graph: geometry maps above remain the physical source of truth.
for(const phase of phases)for(const [level,y]of LEVELS.entries()){
 const positions=placements(phase),nodes=[];for(const b of BODIES){const p=positions[b.id];if(p.y!==y)continue;const nav=localNavigation(b);for(const component of nav.components){let x=0,z=0,n=0;for(let k=0;k<nav.labels.length;k++)if(nav.labels[k]===component.id){x+=(k%nav.nx+.5)*nav.step;z+=(Math.floor(k/nav.nx)+.5)*nav.step;n++;}const q=toWorld(p,{x:x/n,z:z/n});nodes.push({id:b.id+'/'+component.id,x:q.x,z:q.z});}}
 nodes.push({id:'F'+level,x:-1.2,z:4});const lookup=new Map(nodes.map(n=>[n.id,n])),edges=connections(phase).filter(c=>c.level===level&&c.status!=='blocked'),seen=reachable(phase);
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7 -1 129 37"><rect x="-7" y="-1" width="129" height="37" fill="#eef1e7"/>'+edges.map(c=>{const a=lookup.get(c.a),b=lookup.get(c.b);return a&&b?'<line x1="'+a.x+'" y1="'+a.z+'" x2="'+b.x+'" y2="'+b.z+'" stroke="'+(c.status==='pass'?'#688e78':'#bd9b53')+'" stroke-width=".14" '+(c.status==='view'?'stroke-dasharray=".4 .3"':'')+'/>':'';}).join('')+nodes.map(n=>'<circle cx="'+n.x+'" cy="'+n.z+'" r=".5" fill="'+(seen.has(n.id)?'#537f67':'#a08b71')+'"/><text x="'+(n.x+.7)+'" y="'+(n.z+.3)+'" font-size=".7" fill="#334c40">'+n.id+'</text>').join('')+'<text x="0" y="35" font-size=".8">周期 '+phase+' / 第'+[2,3,1][level]+'層 / 内部通路成分グラフ・通常扉は初期閉</text></svg>';
 write(phase+'-graph-'+[2,3,1][level]+'.svg',svg);
}
write('stage6-service-routes.json',phases.map(phase=>{const p=planTransfer(phase,NEXT[phase]);return{from:phase,to:NEXT[phase],motions:p.stages.flatMap(st=>st.motions.filter(m=>['S1','N4'].includes(m.id)).map(m=>({...m,duration:st.duration}))),validation:validatePlan(p)};}));
