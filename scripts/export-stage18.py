from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
r=json.loads((root/'docs/evidence/stage18-route.json').read_text())
baseline=root/'docs/evidence/stage18-walk-only.json'
walking=json.loads(baseline.read_text())['trace'] if baseline.exists() else []
for iso in [False,True]:
 h=1400 if iso else 1050
 def xy(p):return (90+(p['x']-8)*28, (340 if iso else 55)+(p['z']-8)*26-p['y']*(20 if iso else 0))
 rows=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="{h}" viewBox="0 0 1080 {h}"><rect width="1080" height="{h}" fill="#eaf0e8"/><text x="20" y="28" font-size="20">Stage18 '+('height diagram' if iso else 'local exploration comparison')+' (not WebGL)</text>']
 cells={'R2':[[0,0]],'L1':[[0,0],[1,0],[0,1]],'V3':[[0,0]],'V1':[[0,0],[0,1],[1,1]]}
 for id,parts in cells.items():
  p=r['positions'][id]
  for cx,cz in parts:
   points=[xy({'x':p['x']+cx*8+x,'y':p['y']+6,'z':p['z']+cz*8+z}) for x,z in [(0,0),(8,0),(8,8),(0,8)]]
   rows.append('<polygon points="'+' '.join(f'{x:.1f},{z:.1f}' for x,z in points)+'" fill="#c6d4c3" fill-opacity=".6" stroke="#55755c"/>')
  x,z=xy({'x':p['x']+1,'y':p['y']+6,'z':p['z']+2});rows.append(f'<text x="{x}" y="{z}" font-size="16">{id} floor Y{p["y"]:.2f}</text>')
 def path(ps,color,label,mark=True):
  points=[xy(p) for p in ps]
  rows.append('<polyline points="'+' '.join(f'{x:.1f},{z:.1f}' for x,z in points)+f'" fill="none" stroke="{color}" stroke-width="3"/>')
  for i,(x,z)in enumerate(points):
   if not mark:continue
   rows.append(f'<circle cx="{x}" cy="{z}" r="4" fill="{color}"/><text x="{x+5}" y="{z-6}" font-size="12">{label}{i}</text>')
 if walking:path([{'x':14.9,'y':6.4,'z':12.6667},*walking],'#3275a3','W')
 for command in r['commands']:
  assert 'path' in command
  path(command['path'],'#b55321','',False)
 rows.append(f'<text x="20" y="{h-65}" font-size="16">Blue: actual walk/fall route via fibre. Orange: actual Q/C paths; walking between commands is omitted.</text><text x="20" y="{h-35}" font-size="14">Local observations only; not an exhaustive reachability map of all 66 buildings. Green: roof planes.</text></svg>')
 (root/('docs/evidence/stage18-'+('spatial' if iso else 'comparison')+'.svg')).write_text(''.join(rows))
print('Two local comparison diagrams generated from actual test traces')

paths=json.loads((root/'docs/evidence/stage18-climb-paths.json').read_text())
def section(p):return(70+(p['z']-49)*46,60+(-p['y'])*28)
rows=['<svg xmlns="http://www.w3.org/2000/svg" width="990" height="590" viewBox="0 0 990 590"><rect width="990" height="590" fill="#edf1e8"/><text x="20" y="28" font-size="20">SM1 / BR3 six-metre command paths (not WebGL)</text>']
for id,z,y in [('SM1',58.4,-6.8),('BR3',50,-12.8)]:
 x,top=section({'z':z,'y':y+6-.16});rows.append(f'<rect x="{x}" y="{top}" width="368" height="168" fill="#becdb8" fill-opacity=".5" stroke="#55715c"/><text x="{x+15}" y="{top+55}" font-size="18">{id}</text>')
for kind,color in [('down','#bd692d'),('up','#246aa0')]:
 points=[section(p) for p in paths[kind]['path']];rows.append('<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="4" '+('stroke-dasharray="5 6"' if kind=='up' else '')+'/>')
rows.append('<text x="20" y="510" font-size="16">Height difference: 6m. Edge gap: 0.4m. Orange: down / dashed blue: up.</text><text x="20" y="540" font-size="14">Body envelopes shown for context. Lines follow capsule-verified paths outside the upper wall.</text><text x="20" y="568" font-size="14">Vertical coordinates use player datum; visible soles are 0.16m above it.</text></svg>')
(root/'docs/evidence/stage18-six-metre.svg').write_text(''.join(rows))
