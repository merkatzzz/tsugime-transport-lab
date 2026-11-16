from pathlib import Path
from xml.etree import ElementTree as E
for p in sorted(Path('docs/evidence').glob('stage17-*.svg')):
 E.parse(p)
 assert 'NaN' not in p.read_text() and 'undefined' not in p.read_text()
 print(p,'valid XML')
