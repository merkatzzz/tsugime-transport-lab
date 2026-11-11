import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const base='159673a79b1dd6a18b149d2e0bb95d16792c257a',tag=execFileSync('git',['rev-parse','stage8-frozen'],{encoding:'utf8'}).trim();if(base!==tag)throw Error('Frozen Stage 8 mismatch');const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),source='/workspace/work/stage8-frozen-source.zip',build='/workspace/work/stage8-frozen-build.tar.gz';
const code=`import hashlib,subprocess,zipfile,json
with zipfile.ZipFile(${JSON.stringify(source)}) as z:
 assert z.testzip() is None
 count=0
 for record in subprocess.check_output(['git','ls-tree','-rz','--full-tree','stage8-frozen']).split(b'\\0'):
  if not record:continue
  header,name=record.split(b'\\t',1);oid=header.split()[2];data=z.read(name.decode());assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\\0'+data).hexdigest()==oid.decode();count+=1
 print(json.dumps({'matchedTrackedFiles':count,'zipCRC':True,'gitBlobHashes':True}))
`;const exact=JSON.parse(execFileSync('python3',['-c',code],{encoding:'utf8'})),log=fs.readFileSync('/workspace/work/stage9-stage8-restore-tests.txt','utf8');if(!/pass\s+146/.test(log)||!/fail\s+0/.test(log))throw Error('Restore tests not successful');const data={base,tag:'stage8-frozen',branch:'stage9-development',siteVersion:13,source:{bytes:fs.statSync(source).size,sha256:sha(source),...exact,url:'downloads/stage8-frozen-source.zip'},build:{path:build,bytes:fs.statSync(build).size,sha256:sha(build),note:'Retained separately; too large for one hosted static asset'},restore:{checkout:'/workspace/work/stage8-restore-check',passed:146,failed:0,webgl:false,preview:'relay port 4173 readiness timeout'},comparison:{route:'stage8/',compact:true,canonical:'Exact tag or complete source ZIP, not compact comparison copy'}};fs.writeFileSync('docs/evidence/stage9-preservation.json',JSON.stringify(data,null,2));fs.copyFileSync(source,'dist/downloads/stage8-frozen-source.zip');fs.copyFileSync('/workspace/work/stage9-stage8-restore-tests.txt','docs/evidence/restore-stage8-tests.txt');console.log(JSON.stringify(data));
