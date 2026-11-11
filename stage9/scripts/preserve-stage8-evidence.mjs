import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const base='835c2efe63ad0645324236a5274bbfb588d2068f',source='/workspace/work/stage7-frozen-source.zip',build='/workspace/work/stage7-frozen-build.tar.gz',tag=execFileSync('git',['rev-parse','stage7-frozen'],{encoding:'utf8'}).trim();if(tag!==base)throw Error('Stage 7 tag mismatch');
const verify=`import subprocess,zipfile,hashlib,json
records=subprocess.check_output(['git','ls-tree','-rz','--full-tree','stage7-frozen']).split(b'\\0')
with zipfile.ZipFile(${JSON.stringify(source)}) as z:
 assert z.testzip() is None
 count=0
 for record in records:
  if not record: continue
  header,name=record.split(b'\\t',1);mode,kind,oid=header.split()
  assert kind==b'blob'
  data=z.read(name.decode())
  assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\\0'+data).hexdigest()==oid.decode(),name
  count+=1
 assert count==len([n for n in z.namelist() if not n.endswith('/')])
 print(json.dumps({'matchedFiles':count,'zipCRC':True,'gitBlobHashes':True}))
`;
const exact=JSON.parse(execFileSync('python3',['-c',verify],{encoding:'utf8'})),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),restore=fs.readFileSync('/workspace/work/stage8-baseline-tests.txt','utf8');if(!/(?:ℹ|#) pass\s+121/.test(restore)||!/(?:ℹ|#) fail\s+0/.test(restore))throw Error('Stage 7 restore test evidence missing');
execFileSync('git',['diff','--exit-code','stage7-frozen','--',...['stage1','stage2','stage3','stage4','stage5','stage6','dist/stage1','dist/stage2','dist/stage3','dist/stage4','dist/stage5','dist/stage6']],{encoding:'utf8'});
const result={base,tag:'stage7-frozen',github:'https://github.com/merkatzzz/tsugime-transport-lab',branch:'stage8-development',frozenSiteVersion:12,source:{url:'downloads/stage7-frozen-source.zip',sha256:sha(source),bytes:fs.statSync(source).size,...exact,contains:'Every tracked file: assets, source, prior snapshots, docs, experiment evidence, tests, hosting config'},build:{path:build,sha256:sha(build),bytes:fs.statSync(build).size,publicAsset:false,reason:'40 MiB build TAR exceeds per-asset hosting limit; preserved separately in workspace, Site version 12 also remains'},restore:{checkout:'/workspace/work/stage7-restore-check',tests:121,passed:121,failed:0,gpuVerified:false,preview:'relay could not open browser port 4173: timed out waiting for relay readiness'},comparison:{route:'stage7/',compact:true,canonical:'Use fixed tag/full ZIP, not the comparison copy, for exact reconstruction'},unchanged:'stage6-frozen and all original stage1..6 source and served files unchanged'};
fs.writeFileSync('docs/evidence/stage8-preservation.json',JSON.stringify(result,null,2));fs.copyFileSync(source,'dist/downloads/stage7-frozen-source.zip');fs.copyFileSync('/workspace/work/stage8-baseline-tests.txt','docs/evidence/restore-stage7-tests.txt');console.log(JSON.stringify(result));
