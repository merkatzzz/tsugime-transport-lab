"""CRC + canonical source parity check. Does not claim a browser playtest."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
archive = root/'dist/downloads/tsugime-lab-source.zip'
prefix = 'tsugime-transport-lab/'
own_report = Path('docs/evidence/stage13-source-integrity.json')

def canonical(rel):
    return not (rel == own_report or rel.suffix == '.zip'
        or any(p in {'.git','node_modules','__pycache__'} for p in rel.parts)
        or ('.openai' in rel.parts and rel.name != 'hosting.json')
        or (len(rel.parts)>1 and rel.parts[0]=='dist' and (rel.parts[1].startswith('stage') or rel.parts[1]=='downloads')))

expected = {p.relative_to(root) for p in root.rglob('*') if p.is_file() and canonical(p.relative_to(root))}
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    actual = {Path(n[len(prefix):]) for n in z.namelist() if n.startswith(prefix) and canonical(Path(n[len(prefix):]))}
    assert actual == expected, {'missing':sorted(map(str,expected-actual)), 'extra':sorted(map(str,actual-expected))}
    for rel in sorted(expected):
        assert hashlib.sha256((root/rel).read_bytes()).digest() == hashlib.sha256(z.read(prefix+str(rel))).digest(), str(rel)
result = {'ok':True,'canonicalFilesMatched':len(expected),'zipCrcPassed':True,'method':'SHA256 of every canonical file; reproducible dist comparison/download copies, archives and this output report excluded. Not a GPU test.'}
(root/own_report).write_text(json.dumps(result,indent=2))
print(json.dumps(result))
