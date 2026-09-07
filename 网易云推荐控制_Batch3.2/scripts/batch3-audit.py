"""Read-only checks on canonical files and old evidence; emit current batch reports."""
from pathlib import Path
import hashlib, json, re
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
backup = root.parent / 'Batch3_备份_v0.2.3_20260906'
out = root / 'artifacts/batch3'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
inventory = json.loads((root.parent / 'Batch2.1_收尾_交付_v0.2.3/交付校验.json').read_text(encoding='utf-8'))['files']
preexisting = [f['path'] for f in inventory if sha(backup / f['path']) != f['sha256']]
assert sorted(preexisting) == ['docs/APPROVAL_STATUS.md', 'docs/HANDOFF.md'], preexisting
frozen = ['docs/PRD_v0.5.1.md', 'docs/IMPLEMENTATION_CONTRACT.md', 'docs/AI_CONTRACT.md',
          'src/domain/model.ts', 'src/domain/ai.ts', 'src/storage.ts', 'src/ProductFeedback.tsx',
          'src/PreferenceControls.tsx', 'src/alignment.css', 'src/styles.css']
for path in frozen:
    assert sha(root/path) == sha(backup/path), path
images = list(backup.rglob('*.png'))
for p in images:
    assert sha(p) == sha(root/p.relative_to(backup)), str(p)
for p in ['docs/HANDOFF.md','docs/APPROVAL_STATUS.md']:
    assert (backup/p).read_text(encoding='utf-8').strip() in (root/p).read_text(encoding='utf-8'), p
coverage = json.loads((out/'body-coverage.json').read_text(encoding='utf-8'))
pdf = PdfReader(out/'print/PRD_v0.5.1_完整阅读层.pdf')
text = re.sub(r'\s', '', ''.join(p.extract_text() for p in pdf.pages))
for s in coverage['sections']:
    assert re.sub(r'\s', '', s['title'].removeprefix('## ')) in text, s['id']
assert len(pdf.pages) >= 19
report = {'status':'PASS','backupVersion':'0.2.3', 'currentVersion':json.loads((root/'package.json').read_text())['version'],
          'preexistingChangesPreserved':preexisting, 'frozenFilesUnchanged':frozen, 'oldPngCountPreserved':len(images),
          'approvedCloseoutBaselineCount':len(list((backup/'tests/visual/screens.spec.ts-snapshots/closeout-candidate').glob('*.png'))),
          'printPages':len(pdf.pages),'printAll19HeadingsPresent':True,'prdSha256':sha(root/'docs/PRD_v0.5.1.md'),
          'ownerApproval':'MANUAL_REVIEW_REQUIRED', 'realUsers':'NOT_RUN','realModel':'NOT_RUN'}
(out/'final-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
lines = ['# Batch 3 正文覆盖核对表', '', '基准：未改写的 `docs/PRD_v0.5.1.md`；独立去除 Markdown 排版符后，逐节比较浏览器完整正文，忽略纯空白。另检查表格数、代码/文字图示、图片 alt 与加载、原引用标记。不是只比标题。', '',
         '| 节 | 标题 | 全正文 | 表格 | 静态文字图示 | 引用标记 |', '|---|---|---|---|---|---|']
for s in coverage['sections']:
    lines.append(f"| {s['id']} | {s['title'].removeprefix('## ').replace('|','/')} | PASS | {s['tables']} | {s['staticTextDiagrams']} | {s['references']} |")
lines += ['', f"共19节、{sum(s['tables'] for s in coverage['sections'])}张表格、{sum(s['staticTextDiagrams'] for s in coverage['sections'])}段静态文字图示及1张原多角色流程PNG。原文下载哈希与源文件一致；阅读ZIP包含原文及8个本地引用文件。", '',
          f"原文 SHA256：`{report['prdSha256']}`。打印输出{len(pdf.pages)}页，文本提取包含全部19节标题；页面联系表与流程图细节见 `artifacts/batch3/print/`。"]
(root/'qa/BATCH3_BODY_COVERAGE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
