"""Export CPU test trajectories; these drawings are not WebGL screenshots."""
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parent.parent
out = root/'docs/evidence'
def read(name):
    return json.loads((out/name).read_text())
def svg(name, body):
    text = '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><style>text{font:17px sans-serif;fill:#ddd}path,line,rect{vector-effect:non-scaling-stroke}</style><rect width="960" height="600" fill="#20262a"/>'+body+'</svg>'
    ET.fromstring(text)
    (out/name).write_text(text)

path = read('stage20-wasd-detour.json')['trajectory']
def plan(x,z):
    return (100+(x-16.8)*80, 100+(z-12)*48)
line = ' '.join(('%s,%s'%plan(p['x'],p['z'])) for p in path)
body = '<text x="40" y="35">Stage 20 / L1 roof / CPU WASD trajectory (not a screenshot)</text>'
body += '<rect x="100" y="100" width="640" height="490" fill="#38413e"/>'
for x1,x2,z in [(16.85,20.5,16.3),(16.85,20.9,18.8),(22.4,24.7,18.8)]:
    a,b=plan(x1,z),plan(x2,z)
    body += '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="#d29491" stroke-width="12"/>'%(*a,*b)
body += '<polyline points="'+line+'" fill="none" stroke="#a2dfa9" stroke-width="3"/>'
body += '<text x="745" y="210">E detour</text><text x="490" y="450">1.5m tear</text><text x="40" y="70">Pink: physical sheets / green: tested input path / real roof remains below</text>'
svg('stage20-detour-plan.svg',body)

fall=read('stage20-fall.json')['trace']
def section(p):
    return (80+(63-p['z'])*90,100+(-.8-p['y'])*60)
points=' '.join('%s,%s'%section(p) for p in fall)
svg('stage20-fall-section.svg','<text x="40" y="35">Stage 20 / SM1 to BR3 / CPU fall trajectory (not a screenshot)</text><text x="40" y="70">WASD takeoff, then release / inertia retained / no R-F flight</text><line x1="80" y1="110" x2="465" y2="110" stroke="#aaa" stroke-width="4"/><line x1="465" y1="470" x2="900" y2="470" stroke="#aaa" stroke-width="4"/><text x="90" y="145">SM1 roof</text><text x="650" y="505">BR3 roof / about 6m below</text><polyline points="'+points+'" fill="none" stroke="#a2dfa9" stroke-width="3"/>')

checks=[]
for file,key in [('stage15-normal-preserved.json','preserved'),('stage14-preserved-archives.json','preservedArchives')]:
    rows=read(file)[key]
    for row in rows:
        digest=hashlib.sha256((root/row['path']).read_bytes()).hexdigest()
        assert digest==row['sha256'], row['path']
    checks.append({'manifest':file,'filesMatched':len(rows)})
(out/'stage20-preservation.json').write_text(json.dumps({'ok':True,'checks':checks,'baseline':'828ad0c0a0f7f1c0c86a132daa425803bb29a329','normalArchitectureOrTransportPlanChanged':False},indent=2))
print(json.dumps({'drawingXml':2,'preservation':checks,'webgl':False}))
