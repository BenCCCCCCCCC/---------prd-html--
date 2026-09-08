"""Create the local review archive, excluding dependencies and temporary caches."""
from pathlib import Path
import hashlib
import json
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
delivery = root.parent / 'Batch2_交付'
delivery.mkdir(exist_ok=True)
screens = sorted((root / 'artifacts/screenshots').glob('*.png'))
index = '# 截图索引\n\n64张核心比较图，另附对照、拼图与专项；共76张。\n\n'
index += '\n'.join(f'- [{p.stem}](../artifacts/screenshots/{p.name})' for p in screens) + '\n'
(root / 'qa/SCREENSHOT_INDEX.md').write_text(index, encoding='utf-8')
excluded = {'node_modules', '.cache', '.git', 'test-results', 'playwright-report', '__pycache__'}
files = sorted(p for p in root.rglob('*') if p.is_file()
               and not excluded.intersection(p.relative_to(root).parts)
               and (not p.name.startswith('.env') or p.name == '.env.example'))
inventory = [{'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
              'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
archive = delivery / '网易云推荐控制_Batch2_Beta_v0.2.1.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
    for p in files:
        output.write(p, '网易云推荐控制_Batch2_Beta/' + p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as check:
    assert check.testzip() is None
    for required in ['dist/index.html', 'src/Demo.tsx', 'docs/HANDOFF.md',
                     'qa/TEST_RESULTS.md', 'pnpm-lock.yaml', 'artifacts/screenshots/ai-ready-390.png']:
        assert '网易云推荐控制_Batch2_Beta/' + required in check.namelist()
shutil.copy2(root / 'docs/HANDOFF.md', delivery / 'Batch2完整Handback.md')
result = {'archive': archive.name, 'bytes': archive.stat().st_size,
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
          'zipIntegrity': 'PASS', 'fileCount': len(files), 'screenshots': len(screens),
          'files': inventory}
(delivery / '交付校验.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in result.items() if k != 'files'}, ensure_ascii=False, indent=2))
