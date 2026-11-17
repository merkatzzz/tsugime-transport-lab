"""Source-driven geometry drawings. These are not game screenshots."""
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET

root=Path(__file__).resolve().parent.parent
out=root/'docs/evidence'
def read(n):
    return json.loads((out/n).read_text())
def write_svg(name,body):
    text='<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="680" viewBox="0 0 1100 680"><style>text{font:16px sans-serif;fill:#d5dfcf}path,line,polyline{vector-effect:non-scaling-stroke}</style><rect width="1100" height="680" fill="#26372f"/>'+body+'</svg>'
    ET.fromstring(text)
    (out/name).write_text(text)

data=read('stage21-rail-geometry.json')
def point(x,z):
    return 70+x*8,235+z*7
body='<text x="35" y="35">STAGE 21 / Fixed underground rail / CPU geometry diagram, not a screenshot</text><text x="35" y="65">2 binary turnouts / grey: curves used in both directions / Y varies from -22 to -18m</text>'
for e in data['edges']:
    pts=' '.join('%s,%s'%point(p[0],p[2]) for p in e['samples'])
    body+='<polyline points="'+pts+'" fill="none" stroke="#a2b79a" stroke-width="3"/>'
    p=e['samples'][20];x,z=point(p[0],p[2]);body+='<text x="%s" y="%s" font-size="12">%.1fm</text>'%(x,z-8,e['length'])
names={'entry':'Entrance / old lift','j1':'J1 / 2 outgoing routes','j2':'J2 / 2 outgoing routes','observe':'Observation spur','parasite':'3-room parasite spur','base':'Mainline end / activity base'}
for id,n in data['nodes'].items():
    x,z=point(n['p'][0],n['p'][2]);body+='<circle cx="%s" cy="%s" r="6" fill="#d9ac85"/><text x="%s" y="%s">%s</text>'%(x,z,x-20 if id=='base' else x+10,z+25,names[id])
body+='<text x="35" y="640">Passenger stays seated. Stations permit dismount; junctions permit route selection only.</text>'
write_svg('stage21-rail-plan.svg',body)

arm=read('stage21-arm.json')['trace'];waste=read('stage21-waste.json')['trace']
def section(x,y):
    return 55+x*25,580-y*27
body='<text x="35" y="35">STAGE 21 / Fixed canal section / CPU geometry and swept arm path</text><text x="35" y="65">0m lower bank -> 6m upper walkway -> 16m top (10m rise, unreachable at 6/8m)</text>'
points=' '.join('%s,%s'%section(x,y) for x,y in [(0,0),(11,0),(11,6),(32,6),(32,16),(39,16)])
body+='<polyline points="'+points+'" fill="none" stroke="#9bae94" stroke-width="5"/>'
body+='<polyline points="'+' '.join('%s,%s'%section(p['x'],p['y']+.16) for p in arm)+'" fill="none" stroke="#d3b076" stroke-width="2"/>'
for index in range(2):
    body+='<polyline points="'+' '.join('%s,%s'%section(row[index]['x'],row[index]['y']) for row in waste)+'" fill="none" stroke="#bf7b72" stroke-width="2"/>'
for x,y,text in [(2,1,'Dive return'),(12,8,'6m / Q up, C down'),(20,4,'Samples / walking'),(28,12,'10m / no intermediate anchor')]:
    a,b=section(x,y);body+='<text x="%s" y="%s">%s</text>'%(a,b,text)
body+='<text x="35" y="630">Gold: actual arm trajectory / red: gravity drop / above the high wall remains open.</text>'
write_svg('stage21-canal-section.svg',body)

checks=[]
for name,key in [('stage15-normal-preserved.json','preserved'),('stage14-preserved-archives.json','preservedArchives')]:
    rows=read(name)[key]
    for row in rows:
        assert hashlib.sha256((root/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
    checks.append({'manifest':name,'matched':len(rows)})
for path,digest in read('stage20-walk-verification.json')['sourceSha256'].items():
    assert hashlib.sha256((root/path).read_bytes()).hexdigest()==digest,path
checks.append({'stage20GroundAndAirController':'unchanged'})
(out/'stage21-preservation.json').write_text(json.dumps({'ok':True,'baseline':'73743d69c5ef50edf342c6fcb3a44d68a88cbed6','checks':checks},indent=2))
print(json.dumps({'drawingsXml':2,'preserved':checks,'webgl':False}))
