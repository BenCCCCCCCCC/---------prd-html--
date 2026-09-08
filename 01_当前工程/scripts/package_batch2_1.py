"""Package the local Batch 2.1 review deliverables with an auditable inventory."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
delivery = root.parent / 'Batch2.1_交付'
delivery.mkdir(exist_ok=True)
excluded = {'node_modules', '.cache', '.git', 'test-results', 'playwright-report', '__pycache__'}
font_extensions = {'.ttf', '.otf', '.woff', '.woff2', '.eot'}
files = []
for base, directories, names in os.walk(root):
    directories[:] = sorted(d for d in directories if d not in excluded)
    for name in sorted(names):
        item = Path(base) / name
        if name.startswith('.env') and name != '.env.example':
            continue
        if item.suffix.lower() in font_extensions:
            continue
        files.append(item)
files.sort()
prefix = '网易云推荐控制_Batch2.1/'
archive = delivery / '网易云推荐控制_Batch2.1_视觉对齐_v0.2.2.zip'
inventory = [{'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
              'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
    for item in files:
        output.write(item, prefix + item.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None
    paths = [name.removeprefix(prefix) for name in check.namelist()]
    for required in ['dist/index.html', 'src/Demo.tsx', 'src/PreferenceControls.tsx',
                     'docs/HANDOFF.md', 'docs/FIGMA_ALIGNMENT_ADDENDUM.md',
                     'qa/FIGMA_ALIGNMENT_REVIEW.md', 'pnpm-lock.yaml',
                     'artifacts/batch2.1/change-audit.json',
                     'artifacts/reports/quality-batch2.1.log']:
        assert required in paths, required
    candidates = sum(p.startswith('tests/visual/screens.spec.ts-snapshots/batch2.1-candidate/') and p.endswith('.png') for p in paths)
    legacy = sum(p.startswith('tests/visual/screens.spec.ts-snapshots/') and 'batch2.1-candidate/' not in p and p.endswith('.png') for p in paths)
    comparisons = sum(p.startswith('artifacts/batch2.1/comparisons/') and p.endswith('.png') for p in paths)
    figma = sum(p.startswith('artifacts/batch2.1/figma/') and p.endswith('.png') for p in paths)
    assert (candidates, legacy, comparisons, figma) == (64, 64, 15, 11)
    assert not any(Path(p).suffix.lower() in font_extensions for p in paths)
    assert not any(excluded.intersection(Path(p).parts) for p in paths)
shutil.copy2(root / 'docs/HANDOFF.md', delivery / 'Batch2.1完整Handback.md')
shutil.copy2(root / 'qa/FIGMA_ALIGNMENT_REVIEW.md', delivery / 'Batch2.1视觉对齐审查.md')
result = {'archive': archive.name, 'bytes': archive.stat().st_size,
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
          'zipIntegrity': 'PASS', 'fileCount': len(files),
          'legacyScreenshots': legacy, 'candidateScreenshots': candidates,
          'ownerBaselineApproval': 'PENDING', 'comparisons': comparisons,
          'figmaReferencePngs': figma, 'excluded': sorted(excluded | font_extensions),
          'files': inventory}
(delivery / '交付校验.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in result.items() if k != 'files'}, ensure_ascii=False, indent=2))
