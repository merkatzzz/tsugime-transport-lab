"""Parse the downloadable Stage 13 diagrams as standalone XML, not HTML fragments."""
from pathlib import Path
from xml.etree import ElementTree
import json
root=Path(__file__).resolve().parent.parent
paths=sorted((root/'docs/evidence').glob('stage13-*.svg'))
assert len(paths)>=9
for p in paths:
    source=p.read_text()
    ElementTree.fromstring(source)
    assert 'NaN' not in source and 'undefined' not in source,p
result={'ok':True,'standaloneSvgFiles':len(paths),'xmlParser':'Python ElementTree','gpuVerified':False}
(root/'docs/evidence/stage13-drawing-check.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
