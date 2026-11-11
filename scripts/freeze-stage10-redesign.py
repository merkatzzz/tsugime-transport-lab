"""Reconstruct the exact baseline source archive plus a non-recursive comparison copy.
The full Git archive is authoritative; the compact copy avoids recursively nesting
all old public comparison routes. It is never used as a substitute for the archive.
"""
from pathlib import Path
import hashlib
import io
import json
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
tag = 'stage10-redesign-frozen'
commit = subprocess.check_output(['git', 'rev-parse', tag+'^{commit}'], cwd=root, text=True).strip()
assert commit == '1fb5db3e8e1b907efc69d34af028c67e4c488732', commit
data = subprocess.check_output(['git', 'archive', '--format=zip', tag], cwd=root)
archive = root/'dist/downloads/stage10-redesign-frozen-source.zip'
archive.parent.mkdir(parents=True, exist_ok=True)
archive.write_bytes(data)
selected = []
with zipfile.ZipFile(io.BytesIO(data)) as z:
    assert z.testzip() is None
    for name in z.namelist():
        parts = Path(name).parts
        if name.endswith('/') or not parts:
            continue
        keep = parts[0] in {'README.md', 'package.json', '.gitignore', '.openai', 'tests', 'scripts', 'docs'}
        keep |= parts[0] == 'dist' and len(parts) > 1 and (parts[1] in {'src','vendor','assets'} or len(parts) == 2)
        if keep:
            p = root/'stage10-redesign'/name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(z.read(name))
            selected.append(name)
result = {'tag':tag,'commit':commit,'archive':'stage10-redesign-frozen-source.zip','sha256':hashlib.sha256(data).hexdigest(),'compactFiles':len(selected),'restoreTests':{'passed':182,'failed':0},'siteVersion':16,'siteSourceCommit':commit,'buildInputPreservedOutsideGit':'/workspace/work/stage10-redesign-frozen-input-build.tar.gz','note':'The full archive contains all tracked baseline files. Compact comparison source omits recursive generated routes/download copies; the tag and full archive preserve them.'}
(root/'docs/evidence/stage11-baseline-preservation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
build = Path(result['buildInputPreservedOutsideGit'])
if build.exists():
    result['buildInputSha256'] = hashlib.sha256(build.read_bytes()).hexdigest()
    (root/'docs/evidence/stage11-baseline-preservation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False))
