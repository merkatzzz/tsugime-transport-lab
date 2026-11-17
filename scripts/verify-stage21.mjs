import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=[['tests',['--test','--test-concurrency=2',...fs.readdirSync('tests').filter(p=>p.endsWith('.test.mjs')).sort().map(p=>'tests/'+p)]],['normal-surfaces',['scripts/check-stage8-surface-equivalence.mjs']],['seams',['scripts/check-seams.mjs']],['model',['scripts/export-stage21-model.mjs']],['evidence',['scripts/export-stage21.py'],'python3']];
const rows=[];let testCounts=null;
const historical=['stage16-route.json','stage17-route.json'],saved=new Map(historical.map(p=>[p,fs.readFileSync('docs/evidence/'+p)]));
for(const[name,args,engine=process.execPath]of commands){
  const r=spawnSync(engine,args,{encoding:'utf8',maxBuffer:64*1024*1024}),log=(r.stdout??'')+(r.stderr??'');fs.writeFileSync('docs/evidence/stage21-'+name+'.txt',log);
  if(name==='tests'){const count=key=>Number(log.split('\n').find(l=>l.startsWith('ℹ '+key+' ')||l.startsWith('# '+key+' '))?.trim().split(' ').at(-1)??0);testCounts={total:count('tests'),passed:count('pass'),failed:count('fail')};}
  rows.push({name,exit:r.status});console.log(JSON.stringify(rows.at(-1)));if(r.status!==0)break;
}
const cpuChecksPassed=rows.length===commands.length&&rows.every(r=>r.exit===0);
fs.writeFileSync('docs/evidence/stage21-legacy-route-checks.json',JSON.stringify(Object.fromEntries(historical.map(p=>[p,JSON.parse(fs.readFileSync('docs/evidence/'+p))])),null,2));
for(const[p,contents]of saved)fs.writeFileSync('docs/evidence/'+p,contents);
fs.writeFileSync('docs/evidence/stage21-verification.json',JSON.stringify({cpuChecksPassed,testCounts,rows,webglRendered:false,humanPcOrTouchInputVerified:false,gpuFpsMeasured:false,completion:'CPU rail trajectories, physical scene geometry, actual controller inputs and existing transport regression; no WebGL completion claim.'},null,2));
if(!cpuChecksPassed)process.exitCode=1;
