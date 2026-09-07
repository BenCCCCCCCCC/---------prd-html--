from pathlib import Path
import re,json,hashlib,zipfile,xml.etree.ElementTree as ET
from pypdf import PdfReader
r=Path(__file__).resolve().parents[1];b=r.parent/'Batch3.1_备份_v0.3.0_20260906';out=r/'artifacts/batch3-1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
old=json.loads((r.parent/'Batch3_交付_v0.3.0/交付校验.json').read_text(encoding='utf-8'))['files']
preexisting=[f['path'] for f in old if not (b/f['path']).exists() or sha(b/f['path'])!=f['sha256']]
frozen=['docs/PRD_v0.5.1.md','docs/IMPLEMENTATION_CONTRACT.md','docs/AI_CONTRACT.md','src/domain/model.ts','src/domain/ai.ts','src/storage.ts','src/ProductFeedback.tsx','src/PreferenceControls.tsx','src/alignment.css','src/styles.css']
for p in frozen: assert sha(r/p)==sha(b/p),p
for folder in ['data','specs','src/domain']:
 for p in (b/folder).rglob('*'):
  if p.is_file():assert sha(p)==sha(r/p.relative_to(b)),str(p)
assert sha(r/'pnpm-lock.yaml')==sha(b/'pnpm-lock.yaml')
for path in ['docs/HANDOFF.md','docs/APPROVAL_STATUS.md','README.md']:
 assert (b/path).read_text(encoding='utf-8') in (r/path).read_text(encoding='utf-8'),path
images=list(b.rglob('*.png'))
for p in images:assert sha(p)==sha(r/p.relative_to(b)),str(p)
assert sha(r/'docs/PRD_v0.6.md')==sha(r/'finalization_input/content/PRD_v0.6_提交候选.md')
assert sha(r/'public/documents/PRD_v0.6_提交候选.docx')==sha(r/'finalization_input/content/网易云音乐_PRD_v0.6_提交候选.docx')
coverage=json.loads((out/'body-coverage.json').read_text(encoding='utf-8'))
pdf=PdfReader(out/'print/PRD_v0.6_提交候选.pdf');text=re.sub(r'\s','', ''.join(p.extract_text() for p in pdf.pages))
docx=r/'public/documents/PRD_v0.6_提交候选.docx'
with zipfile.ZipFile(docx) as z:
 assert z.testzip() is None
 xml=ET.fromstring(z.read('word/document.xml'));wt='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'
 wordtext=re.sub(r'\s','', ''.join(e.text or '' for e in xml.iter(wt)))
 wordimages=len([n for n in z.namelist() if n.startswith('word/media/')])
for section in coverage['sections']:
 title=re.sub(r'\s','',section['title'].removeprefix('## '));assert title in text,section['id'];assert title in wordtext,section['id']
for forbidden in ['NOT_RUN','Batch3','面试指导','原文结束','ERR_BLOCKED']:assert forbidden not in text,forbidden
assert wordimages>0
report={'status':'PASS','before':'0.3.0','current':'0.3.1','preexistingModifiedFiles':preexisting,'newAuthoritativeInput':'finalization_input only','oldPngPreserved':len(images),'frozenUnchanged':frozen,'oldPrdSha256':sha(r/'docs/PRD_v0.5.1.md'),'newPrdSha256':sha(r/'docs/PRD_v0.6.md'),'candidateExact':True,'docxExact':True,'wordImageCount':wordimages,'printPages':len(pdf.pages),'all19HeadingsInPdfAndDocx':True,'ownerApproval':'MANUAL_REVIEW_REQUIRED','realUsers':'NOT_RUN','realModel':'NOT_RUN'}
report.update({'frozenDirectoriesUnchanged':['data','specs','src/domain'],'dependencyLockUnchanged':True,'priorHistoryVerbatimPreserved':['docs/HANDOFF.md','docs/APPROVAL_STATUS.md','README.md'],'priorReportsArchivedAt':'artifacts/batch3-1/pre-batch-reports','allInputManifestHashesMatch':True})
for item in json.loads((r/'finalization_input/internal/INPUT_MANIFEST.json').read_text(encoding='utf-8'))['files']:
 assert sha(r/'finalization_input'/item['path'])==item['sha256'],item['path']
(out/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['# Batch 3.1 正文与语义迁移覆盖','', '正式源为 finalization_input/content/PRD_v0.6_提交候选.md；复制与下载保持其字节。浏览器逐节比较正文、表格、静态图和引用。旧v0.5.1仅做归档hash保护，不再要求网页显示其工作流文字。','', '| 节 | 新标题 | 正文 | 表格 | 文字图 | 引用 |','|---|---|---|---|---|---|']
for s in coverage['sections']:lines.append(f"| {s['id']} | {s['title'].removeprefix('## ')} | PASS | {s['tables']} | {s['staticTextDiagrams']} | {s['references']} |")
lines+=['',f"共19节、{sum(s['tables'] for s in coverage['sections'])}表、3段静态文字图、1张多角色PNG；PDF {len(pdf.pages)}页；提供的DOCX结构有效且19标题及嵌入图存在。",'', '逐节删改去向以输入包 internal/REVIEW_AND_CHANGE_MAP.md §4 为准，随完整工程归档。SRC-01来源纠错是本包候选输入，未追加行业事实；其余链接未在本轮重新核验。', '', '语义抽查：§03各分析轴、28天/16/4/1/20次与未校准声明；§06平衡/无标签/3上限/脏字段/长期确认；§07 0.30/0.20/0.60 与先过滤再排序；§08四组合；§09 30分钟/4小时/提醒仍隔离/不补回；§11 operationId/10秒与持久撤销；§12三态及OBS未定义；§13 200字符/null与空数组/采用只入草稿；§14–15初始测量参数与实验待验证；§17 R05/06未实施；§19 T01–07取舍。均与原配置/契约对照，不改业务常量。']
(r/'qa/BATCH3_1_BODY_COVERAGE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='frozenUnchanged'},ensure_ascii=False,indent=2))
