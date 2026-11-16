from pathlib import Path
from xml.etree import ElementTree
import json
files=sorted(Path('docs/evidence').glob('stage15-*.svg'))
assert len(files)==5,len(files)
for p in files:
 ElementTree.parse(p)
 assert 'NaN' not in p.read_text() and 'undefined' not in p.read_text(),str(p)
print(json.dumps({'ok':True,'drawings':len(files),'scope':'Standalone SVG and finite coordinates; not WebGL screenshots.'}))
