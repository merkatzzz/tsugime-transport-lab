"""Offline artifact checks; this is not a browser or WebGL playtest."""
from pathlib import Path
from html.parser import HTMLParser
import json
import re
import zipfile

root = Path(__file__).resolve().parent.parent
dist = root / 'dist'
links = []
class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {'href', 'src'} and value:
                links.append(value)

pages = [dist/'index.html', dist/'report.html']
pages += [dist/s/p for s in ['stage1','stage2','stage3','stage4','stage5','stage6','stage7','stage8'] for p in ['index.html','report.html']]
checked = 0
for page in pages:
    links.clear()
    Links().feed(page.read_text())
    for link in links:
        if re.match(r'^(https?:|data:|#|mailto:)', link):
            continue
        target = page.parent / link.split('#')[0].split('?')[0]
        assert target.exists(), (str(page.relative_to(root)), link)
        checked += 1
modules = 0
for directory in [dist/'src'] + [dist/s/'src' for s in ['stage1','stage2','stage3','stage4','stage5','stage6','stage7','stage8']]:
    for module in directory.glob('*.js'):
        for link in re.findall(r"(?:from\s*|import\s*)['\"]([.][^'\"]+)['\"]", module.read_text()):
            assert (module.parent/link).exists(), (str(module), link)
            modules += 1
archives = [dist/'downloads/tsugime-lab-source.zip', dist/'downloads/stage6-frozen-source.zip', dist/'downloads/stage7-frozen-source.zip', dist/'downloads/stage8-frozen-source.zip']
archives += [dist/s/'downloads/tsugime-lab-source.zip' for s in ['stage1','stage2','stage3','stage4','stage5','stage6','stage7','stage8']]
for archive in archives:
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None, str(archive)
        if archive == archives[0]:
            assert 'tsugime-transport-lab/.openai/hosting.json' in z.namelist()
            assert 'tsugime-transport-lab/dist/src/stage9-layout.js' in z.namelist()
            assert 'tsugime-transport-lab/stage6/dist/assets/resident-room.svg' in z.namelist()
oversized = [str(p.relative_to(dist)) for p in dist.rglob('*') if p.is_file() and p.stat().st_size > 25*1024*1024]
assert not oversized, oversized
result = {'ok':True, 'assetSizeLimitBytes':25*1024*1024, 'oversizedFiles':0, 'htmlPages':len(pages), 'localLinks':checked, 'moduleImports':modules, 'zipArchives':len(archives), 'gpuVerified':False}
print(json.dumps(result))
(root/'docs/evidence/package-check.json').write_text(json.dumps(result, indent=2))
