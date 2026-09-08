"""Create a self-contained local Batch 3 review delivery, preserving historical evidence."""
from pathlib import Path
import os, json, hashlib, zipfile, shutil
root = Path(__file__).resolve().parents[1]
delivery = root.parent / 'Batch3_交付_v0.3.0'
delivery.mkdir(exist_ok=True)
excluded = {'node_modules','.cache','.git','test-results','playwright-report','__pycache__'}
fonts = {'.ttf','.otf','.woff','.woff2','.eot'}
files = []
for directory, dirs, names in os.walk(root):
    dirs[:] = sorted(d for d in dirs if d not in excluded)
    for name in sorted(names):
        p = Path(directory)/name
        if (name.startswith('.env') and name != '.env.example') or p.suffix.lower() in fonts:
            continue
        files.append(p)
files.sort()
archive = delivery/'网易云推荐控制_Batch3_v0.3.0_完整项目.zip'
if archive.exists():
    raise SystemExit('Preserve existing delivery; choose a new version before packaging again.')
prefix = '网易云推荐控制_Batch3/'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
inventory = [{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files]
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in files: z.write(p,prefix+p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for f in inventory: assert hashlib.sha256(z.read(prefix+f['path'])).hexdigest() == f['sha256'], f['path']
    names = [n.removeprefix(prefix) for n in z.namelist()]
    for required in ['docs/HANDOFF.md','docs/PRD_v0.5.1.md','qa/BATCH3_REVIEW.md','qa/BATCH3_BODY_COVERAGE.md',
                     'src/Reader.tsx','src/Demo.tsx','dist/index.html','pnpm-lock.yaml',
                     'artifacts/batch3/quality-final.log','artifacts/batch3/final-audit.json',
                     'artifacts/batch3/print/PRD_v0.5.1_完整阅读层.pdf','public/documents/PRD_v0.5.1_阅读资料.zip']:
        assert required in names, required
    assert sum(n.startswith('tests/visual/screens.spec.ts-snapshots/batch3-candidate/') and n.endswith('.png') for n in names) == 72
    assert sum(n.startswith('tests/visual/screens.spec.ts-snapshots/') and 'batch3-candidate/' not in n and n.endswith('.png') for n in names) == 192
    assert not any(excluded.intersection(Path(n).parts) for n in names)
shutil.copy2(root/'docs/HANDOFF.md', delivery/'Batch3_完整HANDOFF.md')
shutil.copy2(root/'qa/BATCH3_REVIEW.md', delivery/'Batch3_审查报告.md')
report = {'archive':archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive),'fileCount':len(files),
          'zipIntegrity':'PASS','allArchivedFilesHashVerified':True,'ownerApproval':'MANUAL_REVIEW_REQUIRED','files':inventory}
(delivery/'交付校验.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False,indent=2))
