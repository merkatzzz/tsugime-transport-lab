from pathlib import Path
from xml.etree import ElementTree as E
for p in sorted(Path('docs/evidence').glob('stage18-*.svg')):
 E.parse(p)
 s=p.read_text()
 assert all(t not in s for t in ['NaN','undefined','{h'])
 print(p,'valid XML')
