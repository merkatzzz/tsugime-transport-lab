"""Preservation and source-coordinate drawings; not a WebGL screenshot."""
from pathlib import Path
import hashlib,json,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent.parent
out=root/'docs/evidence'
baseline='9030b5fdb34715fda187effe52cc67ce94363059'
expected=json.loads((root/'scripts/stage22-baseline.json').read_text())
checks=[]
for name,key in [('stage15-normal-preserved.json','preserved'),('stage14-preserved-archives.json','preservedArchives')]:
    rows=json.loads((out/name).read_text())[key]
    for row in rows:assert hashlib.sha256((root/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
    checks.append({'manifest':name,'matched':len(rows)})
for path in ['dist/src/stage21-rail.js','dist/src/fault-air.js']:
    assert hashlib.sha256((root/path).read_bytes()).hexdigest()==expected[path]
    checks.append({'unchanged':path})
path='dist/src/stage21-world.js'
new=(root/path).read_text()
def tunnel(s):return s[s.index('function caveShell'):s.index('function railMap')]
assert hashlib.sha256(tunnel(new).encode()).hexdigest()==expected['redTunnelBuilder']
checks.append({'redTunnelBuilder':'byte-identical'})
(out/'stage22-preservation.json').write_text(json.dumps({'ok':True,'baseline':baseline,'checks':checks},indent=2))
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="680" viewBox="0 0 1000 680"><style>text{font:17px sans-serif;fill:#d7dfcf}</style><rect width="1000" height="680" fill="#273a32"/><text x="30" y="35">STAGE 22 / Fixed access coordinates (CPU diagram, not a screenshot)</text><g transform="translate(400 370) scale(40)"><rect x="-6.8" y="1.8" width="4.4" height="4.4" fill="#738174"/><rect x="-2.4" y="2" width="2" height="4" fill="#b8c4a7"/><rect x="-2.4" y="-5.6" width="2" height="7.6" fill="#a0bd9d"/><line x1="-2.4" y1="-2.2" x2="-.4" y2="-2.2" stroke="#d8ab77" stroke-width=".12"/><line x1="0" y1="-6" x2="0" y2="6.5" stroke="#c57e74" stroke-width=".07"/></g><text x="35" y="640">Red: mover boundary X=0 / access wall max X=-0.34m / F0 floor Y=-12.8m</text><text x="40" y="570">Existing three-floor shaft</text><text x="310" y="115">New underground-only cabin</text><text x="440" y="295">Sliding door Z=-2.2</text><text x="440" y="490">F0 landing - walk north</text><text x="590" y="160">Existing W2 inlet: X76.8 Y0 Z39.9</text><text x="590" y="195">Dive / fade / load / upstream</text><text x="590" y="230">Return to the same bank</text></svg>'''
ET.fromstring(svg);(out/'stage22-access.svg').write_text(svg)
print(json.dumps({'ok':True,'checks':checks,'drawingXml':1,'webgl':False}))
