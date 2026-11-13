from pathlib import Path
import xml.etree.ElementTree as ET
import json
files=list(Path('docs/evidence').glob('stage14-*.svg'))
for p in files:
 ET.parse(p)
 assert 'NaN' not in p.read_text() and 'undefined' not in p.read_text(),str(p)
assert len(files)==8,len(files)
result={'ok':True,'drawings':len(files),'method':'Standalone SVG XML and finite-coordinate validation; not WebGL.'}
Path('docs/evidence/stage14-drawing-check.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
