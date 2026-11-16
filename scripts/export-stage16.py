from pathlib import Path
import json,html
root=Path(__file__).resolve().parent.parent
r=json.loads((root/'docs/evidence/stage16-route.json').read_text())
for iso in [False,True]:
 def xy(x,y,z):return ((x-38)*27+(z-50)*(-12 if iso else 0)+230, (z-50)*22-y*(18 if iso else 0)+65)
 rows=['<svg xmlns="http://www.w3.org/2000/svg" width="900" height="850" viewBox="0 0 900 850"><rect width="900" height="850" fill="#eef1ed"/><text x="20" y="30" font-size="20">Stage16 '+('3D coordinate diagram' if iso else 'XZ route plan')+' (not WebGL)</text>']
 for id in ['SM0','SM1','BR3','SM3','SM2']:
  p=r['positions'][id]; roof=p['y']+6
  points=[xy(p['x']+dx,roof,p['z']+dz) for dx,dz in [(0,0),(8,0),(8,8),(0,8)]]
  rows.append('<polygon points="'+' '.join(f'{x:.2f},{z:.2f}' for x,z in points)+'" fill="#bdcbbf" stroke="#50685e"/>')
  x,z=xy(p['x']+1,roof,p['z']+2);rows.append(f'<text x="{x}" y="{z}" font-size="15">{id} floor Y{p["y"]:.2f}</text>')
 path=[dict(x=46,y=0,z=62.4),*r['legs']];coords=[xy(p['x'],p['y'],p['z']) for p in path]
 rows.append('<polyline points="'+' '.join(f'{x:.2f},{z:.2f}' for x,z in coords)+'" fill="none" stroke="#b14427" stroke-width="3"/>')
 for i,(x,z) in enumerate(coords):rows.append(f'<circle cx="{x}" cy="{z}" r="4" fill="#b14427"/><text x="{x+5}" y="{z-6}" font-size="13">{i}</text>')
 rows.append('<text x="20" y="790" font-size="16">SM0 E → SM1 roof → BR3 roof → SM1 N → SM1 W (E) → existing bottom floor</text><text x="20" y="820" font-size="14">Roof top = floor pose + 6m. Route coordinates = player datum (sole - 0.16m).</text></svg>')
 (root/('docs/evidence/stage16-'+('spatial' if iso else 'plan')+'.svg')).write_text(''.join(rows))
print('Two coordinate diagrams generated from ordinary traversal records')
