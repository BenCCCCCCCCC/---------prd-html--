"""Build the complete v0.2.3 local review package; never require merging old ZIPs."""
from pathlib import Path
import os
import json
import hashlib
import zipfile
import shutil

root = Path(__file__).resolve().parents[1]
delivery = root.parent / 'Batch2.1_收尾_交付_v0.2.3'
delivery.mkdir(exist_ok=True)
excluded = {'node_modules', '.cache', '.git', 'test-results', 'playwright-report', '__pycache__'}
fonts = {'.ttf', '.otf', '.woff', '.woff2', '.eot'}
files = []
for directory, dirs, names in os.walk(root):
    dirs[:] = sorted(d for d in dirs if d not in excluded)
    for name in sorted(names):
        file = Path(directory) / name
        if (name.startswith('.env') and name != '.env.example') or file.suffix.lower() in fonts:
            continue
        files.append(file)
files.sort()
archive = delivery / '网易云推荐控制_Batch2.1_收尾_v0.2.3.zip'
prefix = '网易云推荐控制_Batch2.1_收尾/'
inventory = [{'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
              'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
    for file in files:
        output.write(file, prefix + file.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None
    names = [n.removeprefix(prefix) for n in check.namelist()]
    for required in ['package.json', 'pnpm-lock.yaml', 'dist/index.html', 'src/ProductFeedback.tsx',
                     'docs/HANDOFF.md', 'docs/BATCH2_1_CLOSEOUT_CODEX.md', 'qa/CLOSEOUT_REVIEW.md',
                     'artifacts/reports/quality-closeout.log', 'artifacts/closeout/final-audit.json',
                     'artifacts/closeout/reproduction/observed.json']:
        assert required in names, required
    old = sum(n.startswith('tests/visual/screens.spec.ts-snapshots/') and 'closeout-candidate/' not in n and n.endswith('.png') for n in names)
    new = sum(n.startswith('tests/visual/screens.spec.ts-snapshots/closeout-candidate/') and n.endswith('.png') for n in names)
    natural = sum(n.startswith('artifacts/closeout/natural/') and n.endswith('.png') for n in names)
    assert (old, new, natural) == (128, 64, 32)
    for entry in inventory:
        assert hashlib.sha256(check.read(prefix + entry['path'])).hexdigest() == entry['sha256']
    assert not any(Path(n).suffix.lower() in fonts or excluded.intersection(Path(n).parts) for n in names)
shutil.copy2(root / 'docs/HANDOFF.md', delivery / 'Batch2.1收尾_完整HANDOFF.md')
shutil.copy2(root / 'qa/CLOSEOUT_REVIEW.md', delivery / 'Batch2.1收尾_审查报告.md')
result = {'archive': archive.name, 'bytes': archive.stat().st_size,
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'zipIntegrity': 'PASS',
          'everyArchivedFileHashVerified': True, 'fileCount': len(files),
          'oldScreenshotsUnchanged': old, 'candidateScreenshots': new,
          'naturalSequenceScreenshots': natural, 'ownerApproval': 'PENDING', 'files': inventory}
(delivery / '交付校验.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in result.items() if k != 'files'}, ensure_ascii=False, indent=2))
