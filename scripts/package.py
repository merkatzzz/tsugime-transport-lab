"""Build a readable report and a self-contained source ZIP with only Python stdlib.
Run npm test and node scripts/export-evidence.mjs first.
"""
from pathlib import Path
import html
import re
import shutil
import zipfile

root = Path(__file__).resolve().parent.parent
downloads = root / 'dist/downloads'
downloads.mkdir(parents=True, exist_ok=True)
shutil.copy2(root/'README.md', downloads/'README.md')
shutil.copy2(root/'docs/REPORT.md', downloads/'REPORT.md')
shutil.copy2(root/'docs/SEAM-AUDIT.md', downloads/'SEAM-AUDIT.md')
if (downloads/'evidence').exists():
    shutil.rmtree(downloads/'evidence')
shutil.copytree(root/'docs/evidence', downloads/'evidence')
# Frozen prior stages are published and packaged independently.
for stage in ['stage1', 'stage2', 'stage3']:
    shutil.copytree(root/stage/'dist', root/'dist'/stage, dirs_exist_ok=True)
    if stage == 'stage2':
        shutil.copytree(root/'stage1/dist', root/'dist/stage2/stage1', dirs_exist_ok=True)
    archive = root/'dist'/stage/'downloads/tsugime-lab-source.zip'
    archive.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in sorted((root/stage).rglob('*')):
            if p.is_file() and p.suffix != '.zip':
                z.write(p, Path('tsugime-'+stage)/p.relative_to(root/stage))
# The Stage 2 comparison route's own Stage 1 link also serves its source archive.
shutil.copy2(root/'dist/stage1/downloads/tsugime-lab-source.zip', root/'dist/stage2/stage1/downloads/tsugime-lab-source.zip')

def inline(text):
    s = html.escape(text)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: '<a href="'+m[2].replace('evidence/', 'downloads/evidence/')+'">'+m[1]+'</a>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    return s

lines = (root/'docs/REPORT.md').read_text().splitlines()
parts = []
i = 0
while i < len(lines):
    line = lines[i]
    if not line.strip():
        i += 1
        continue
    if line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'):
            cells = [c.strip() for c in lines[i].strip('|').split('|')]
            if not all(re.fullmatch(r'[:\- ]+', c) for c in cells):
                rows.append(cells)
            i += 1
        parts.append('<div class="table"><table>'+''.join('<tr>'+''.join(('<th>' if n==0 else '<td>')+inline(c)+('</th>' if n==0 else '</td>') for c in row)+'</tr>' for n,row in enumerate(rows))+'</table></div>')
        continue
    m = re.match(r'^(#{1,4}) (.+)$', line)
    if m:
        level = len(m[1])
        parts.append(f'<h{level}>'+inline(m[2])+f'</h{level}>')
    elif line.startswith('- '):
        parts.append('<p class="bullet">• '+inline(line[2:])+'</p>')
    else:
        parts.append('<p>'+inline(line)+'</p>')
    i += 1

drawings = '<h2>搬送範囲・方式の比較図</h2><img src="downloads/evidence/comparison.svg" alt="2方式と3搬送範囲の面積・高さ・循環時間比較"><h2>各周期の平面図</h2>'
for phase in 'ABC':
    drawings += f'<h3>周期 {phase}</h3><div class="drawings">'
    for level in [3,2]:
        drawings += f'<figure><figcaption>第{level}層</figcaption><img src="downloads/evidence/{phase}-level-{level}.svg" alt="周期{phase} 第{level}層の平面図"></figure>'
    drawings += '</div><div class="drawings">'+''.join(f'<figure><figcaption>第{level}層の通路成分グラフ</figcaption><img src="downloads/evidence/{phase}-graph-{level}.svg" alt="周期{phase} 通路接続図"></figure>' for level in [3,2])+'</div>'
drawings += '<h2>各遷移の搬送経路・保管と一時退避</h2>'+''.join(f'<h3>{phase}→'+{'A':'B','B':'C','C':'A'}[phase]+f'</h3><img class="route" src="downloads/evidence/{phase}-transport.svg" alt="{phase}からの搬送経路">' for phase in 'ABC')
page = '''<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>検証報告｜継ぎ目の部屋 建築・搬送実験</title><style>
body{background:#f1f2e9;color:#334d40;font:14px/1.9 sans-serif;margin:0}article{max-width:1030px;margin:auto;padding:45px 28px}nav{display:flex;flex-wrap:wrap;gap:25px;border-bottom:1px solid #ccd5c3;padding-bottom:20px;font-size:12px}a{color:#557c57;text-underline-offset:3px}h1{font:28px/1.5 serif;margin-top:40px}h2{font-size:19px;margin-top:45px;border-top:1px solid #ccd5c3;padding-top:25px}h3{font-size:15px;margin-top:30px}p{color:#61715b}.bullet{margin:10px 0}strong{color:#3b5641}code{background:#e0e6d7;padding:2px 5px;border-radius:3px}.table{overflow:auto}table{border-collapse:collapse;font-size:12px;width:100%;margin:20px 0}th,td{padding:10px;border:1px solid #d4dccb;text-align:left}th{background:#e1e7d8}.drawings{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{width:100%;border:1px solid #ccd5c3;background:#e4eadc}figcaption{font-size:12px;margin-bottom:7px}.route{max-width:470px}footer{margin-top:40px;font-size:11px;color:#88937d}@media(max-width:650px){.drawings{grid-template-columns:1fr}article{padding:25px 18px}h1{font-size:24px}}
</style><article><nav><a href="index.html">← 第四段階の3D実験</a><a href="stage2/index.html">第二段階を比較</a><a href="stage1/index.html">第一段階を比較</a><a data-hosted-source href="downloads/tsugime-lab-source.zip" download>第四段階ソース一式 ZIP</a><a href="downloads/REPORT.md" download>検証報告 Markdown</a><a href="downloads/README.md" download>起動・操作 README</a></nav>'''+''.join(parts)+drawings+'''<footer>検証済みの範囲はこの小規模計画です。ブラウザ描画の確認制約は本文に明記しています。</footer></article><script>if(['localhost','127.0.0.1'].includes(location.hostname))document.querySelectorAll('[data-hosted-source]').forEach(a=>a.hidden=true)</script></html>'''
(root/'dist/report.html').write_text(page)

archive = downloads/'tsugime-lab-source.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if not p.is_file() or any(part in {'.git','node_modules','.openai'} for part in rel.parts) or p.suffix == '.zip':
            continue
        z.write(p, Path('tsugime-transport-lab')/rel)
print(f'Packaged {archive.name}: {archive.stat().st_size} bytes')
