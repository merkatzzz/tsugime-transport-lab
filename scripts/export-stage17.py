from pathlib import Path
import json,math
root=Path(__file__).resolve().parent.parent
r=json.loads((root/'docs/evidence/stage17-route.json').read_text())
for iso in [False,True]:
 def xy(x,y,z):return (50+(x-6)*24-(z-10)*(9 if iso else 0)+230,(225 if iso else 60)+(z-8)*(18 if iso else 23)-y*(13 if iso else 0))
 rows=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="920" viewBox="0 0 1000 920"><rect width="1000" height="920" fill="#e9eee7"/><text x="20" y="28" font-size="20">Stage17 '+('Spatial coordinate diagram' if iso else 'XZ route and organ sites')+' (not WebGL)</text>']
 frompos=r['positions']
 bodies={'R2':[[0,0]],'L1':[[0,0],[1,0],[0,1]],'V3':[[0,0]],'V1':[[0,0],[0,1],[1,1]],'U5':[[0,0]]}
 for id,cells in bodies.items():
  p=frompos[id]
  for cx,cz in cells:
   corners=[xy(p['x']+cx*8+dx,p['y']+6,p['z']+cz*8+dz) for dx,dz in [(0,0),(8,0),(8,8),(0,8)]]
   rows.append('<polygon points="'+' '.join(f'{a:.2f},{b:.2f}' for a,b in corners)+'" fill="#c5d0bf" fill-opacity=".5" stroke="#55715c"/>')
  x,z=xy(p['x']+1,p['y']+6,p['z']+2);rows.append(f'<text x="{x}" y="{z}" font-size="16">{id} Y{p["y"]:.2f}</text>')
 def line(points,color,width,dash=''):
  pairs=[xy(*p) for p in points];rows.append('<polyline points="'+' '.join(f'{a:.2f},{b:.2f}' for a,b in pairs)+f'" fill="none" stroke="{color}" stroke-width="{width}" '+('stroke-dasharray="4 5"' if dash else '')+'/>')
 for s in r['sites']:line([s['from'],s['to']],'#8d273d',10 if s['role']=='walkable' else 2)
 for points in [[[22.6,6,10],[22.4,8,10.2],[21.6,10,10.7]],[[22.4,8,10.2],[24,9.4,11.2],[25.8,9.7,12.1]],[[9.5,-.6,30.6],[9.1,1,30.4],[9.5,3.2,30.6]],[[9.1,1,30.4],[10.3,2,31.2],[11.2,2.6,32]]]:line(points,'#978c68',5)
  # Membrane is vertical; plan line / 3D quad is a coordinate depiction only.
 membrane=[xy(*p) for p in [[9.5,0,30.6],[9.5,3.2,30.6],[11.2,2.6,32],[10.2,0,32]]]
 rows.append('<polygon points="'+' '.join(f'{x:.2f},{z:.2f}' for x,z in membrane)+'" fill="#bc7d87" fill-opacity=".4" stroke="#a86b78"/>')
 path=[r['start'],*r['legs']];line([[p['x'],p['y'],p['z']] for p in path],'#253f9a',3)
 for i,p in enumerate(path):
  x,z=xy(p['x'],p['y'],p['z']);rows.append(f'<circle cx="{x}" cy="{z}" r="4" fill="#253f9a"/><text x="{x+7}" y="{z-5}" font-size="13">{i}</text>')
 rows.append('<text x="20" y="855" font-size="16">R2 indoor → L1 roof → fibre → V3 roof → V1 roof → fibre ramp → V3 indoor → U5 roof</text><text x="20" y="885" font-size="14">Red: walkable fibre / thin fibre. Ivory: selected bones. Pink: membrane. Blue: real input replay.</text><text x="20" y="910" font-size="13">Green polygons: outer roofs; labels: floor pose Y. Player datum = visible sole - 0.16m.</text></svg>')
 (root/('docs/evidence/stage17-'+('spatial' if iso else 'plan')+'.svg')).write_text(''.join(rows))
print('Two source-derived route diagrams generated')
