import fs from 'node:fs';
import {Simulation} from '../dist/src/simulation.js';
import {floorSVG,deckSVG} from '../dist/src/maps.js';
import {planTransfer,validatePlan} from '../dist/src/transport.js';
fs.mkdirSync('docs/evidence',{recursive:true});
const s=new Simulation();for(const phase of ['A','B','C'])for(let level=0;level<2;level++)fs.writeFileSync(`docs/evidence/${phase}-level-${level+2}.svg`,floorSVG(s,level,{phase}));
s.plan=planTransfer('A','B');fs.writeFileSync('docs/evidence/transport-route.svg',deckSVG(s));
fs.writeFileSync('docs/evidence/geometry-results.json',JSON.stringify({date:'2026-11-09',testCount:24,transitions:['A','B','C'].map(from=>{const to={A:'B',B:'C',C:'A'}[from];return {from,to,...validatePlan(planTransfer(from,to))};})},null,2));
