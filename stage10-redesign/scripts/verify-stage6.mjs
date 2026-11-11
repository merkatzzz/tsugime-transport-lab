// Reproducible Stage 6 CPU verification; GPU and audible output are separate.
import fs from 'node:fs';import {spawnSync} from 'node:child_process';
fs.mkdirSync('docs/evidence',{recursive:true});const rows=[];
for(const [name,args] of [['stage6',['test']],...['stage1','stage2','stage3','stage4','stage5'].map(s=>[s,['run','test:'+s]])]){
 const result=spawnSync('npm',args,{encoding:'utf8',maxBuffer:16*1024*1024}),output=(result.stdout??'')+(result.stderr??'');
 fs.writeFileSync('docs/evidence/tests-'+name+'.txt',output);
 const count=k=>Number(output.match(new RegExp('(?:ℹ|#) '+k+'\\s+(\\d+)'))?.[1]??0);
 const row={stage:name,exit:result.status,tests:count('tests'),passed:count('pass'),failed:count('fail')};rows.push(row);console.log(JSON.stringify(row));
 if(result.status!==0||row.tests===0){fs.writeFileSync('docs/evidence/test-summary.json',JSON.stringify({ok:false,rows},null,2));process.exit(1);}
}
const seams=spawnSync(process.execPath,['scripts/check-seams.mjs'],{encoding:'utf8',maxBuffer:16*1024*1024});
fs.writeFileSync('docs/evidence/seam-check.txt',(seams.stdout??'')+(seams.stderr??''));
const walks=spawnSync(process.execPath,['scripts/check-stage6-walks.mjs'],{encoding:'utf8',maxBuffer:16*1024*1024});fs.writeFileSync('docs/evidence/supply-walk-check.txt',(walks.stdout??'')+(walks.stderr??''));
const result={ok:seams.status===0&&walks.status===0,walksExit:walks.status,rows,total:rows.reduce((n,r)=>n+r.tests,0),seamsExit:seams.status,browserQA:{verified:false,reason:'Managed preview relay port 4173 readiness timeout',audioHeard:false}};
fs.writeFileSync('docs/evidence/test-summary.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(!result.ok)process.exit(1);
