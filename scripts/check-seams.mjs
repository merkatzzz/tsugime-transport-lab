import fs from 'node:fs';
import {cpuView} from '../tests/mesh-fixture.mjs';
import {Simulation} from '../dist/src/simulation.js';
import {placements,LEVELS} from '../dist/src/architecture.js';
import {auditCoplanar} from './mesh-audit.mjs';
const rows=[];for(const phase of ['A','B','C'])for(const open of[false,true]){const s=new Simulation();for(const id of Object.keys(s.doors)){s.doors[id]=open;s.experience.doorProgress[id]=open?1:0;s.experience.doorTargets[id]=open;}s.phase=phase;s.positions=placements(phase);s.invalidate();const v=cpuView(s);v.render();const a=auditCoplanar(v.scene),same=a.pairs.filter(p=>p.sameNormal),floorContacts=same.filter(p=>p.axis===1&&p.sign===-1&&LEVELS.some(y=>Math.abs(p.plane-y-.16)<1e-5)),exposed=same.filter(p=>!floorContacts.includes(p));rows.push({phase,doors:open?'open':'closed',meshes:a.meshCount,sameNormal:same.length,floorContacts,exposed});}fs.writeFileSync('docs/evidence/seam-audit-after.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.map(r=>({phase:r.phase,doors:r.doors,same:r.sameNormal,contacts:r.floorContacts.length,exposed:r.exposed})),null,2));if(rows.some(r=>r.exposed.length))process.exitCode=1;
