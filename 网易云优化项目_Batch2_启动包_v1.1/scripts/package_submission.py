"""Create full engineering handback and a separate clean, local reading candidate."""
from pathlib import Path
import os,json,hashlib,zipfile,shutil
r=Path(__file__).resolve().parents[1];delivery=r.parent/'Batch3.1_交付_v0.3.1'
delivery.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
excluded={'node_modules','.cache','.git','test-results','playwright-report','__pycache__','netease_submission_prepare'}
files=[]
for folder,dirs,names in os.walk(r):
 dirs[:]=sorted(d for d in dirs if d not in excluded)
 for name in sorted(names):
  p=Path(folder)/name
  if (name.startswith('.env') and name!='.env.example') or p.suffix.lower() in {'.ttf','.otf','.woff','.woff2','.eot'}:continue
  files.append(p)
def archive(name,entries):
 path=delivery/name
 if path.exists():raise RuntimeError('Preserve existing delivery: '+str(path))
 inventory=[]
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for name,body in entries:
   z.writestr(name,body);inventory.append({'path':name,'bytes':len(body),'sha256':sha(body)})
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  for item in inventory:assert sha(z.read(item['path']))==item['sha256'],item['path']
 return {'archive':path.name,'bytes':path.stat().st_size,'sha256':sha(path.read_bytes()),'fileCount':len(inventory),'crc':'PASS','allFileHashes':'PASS','files':inventory}
full=archive('网易云推荐控制_Batch3.1_v0.3.1_完整项目.zip',(('网易云推荐控制_Batch3.1/'+p.relative_to(r).as_posix(),p.read_bytes()) for p in sorted(files)))
entries=[]
for p in sorted((r/'dist').rglob('*')):
 if p.is_file() and 'v0.5.1' not in p.name:entries.append(('dist/'+p.relative_to(r/'dist').as_posix(),p.read_bytes()))
for dest,source in {
 'docs/PRD_v0.6.md':'docs/PRD_v0.6.md','docs/PRD_v0.6_提交候选.docx':'public/documents/PRD_v0.6_提交候选.docx',
 'docs/PRD_v0.6_提交候选.pdf':'artifacts/batch3-1/print/PRD_v0.6_提交候选.pdf',
 'docs/SOURCES.md':'docs/SOURCES_v0.6.md','design/flow_roles.png':'design/flow_roles.png',
 'docs/product-config.json':'specs/product-config.json','docs/events.spec.json':'specs/events.spec.json','docs/acceptance_cases.json':'data/acceptance_cases.json',
 'server.mjs':'scripts/serve-dist.mjs'}.items():entries.append((dest,(r/source).read_bytes()))
readme='''# 网易云音乐｜推荐控制链路优化

产品需求文档与交互原型。PRD v0.6 提交候选，原型 v0.3.1，2026-09-06。

阅读：docs/ 内提供 Markdown、Word、PDF与来源；design/ 保留流程图。网页首页为完整正文，章节可进入同一原型并返回。

本地运行：安装 Node.js（本工程使用24），在此文件所在目录执行 `node server.mjs`，打开 http://127.0.0.1:4173/ 。若端口已被占用，先停止占用该端口的本地预览。不要直接双击 dist/index.html。

页面支持目录、搜索、下载、打印；原型“显示标注”可关闭，测试工具默认折叠。进入流程保留当前草稿和设置；重置需主动操作。

这是非官方、本地交互原型；未连接真实账号、模型或音频。参考图素材只用于本地研发评审；公开发布需另行确认。
'''
entries.append(('阅读说明.md',readme.encode('utf-8')))
for name,_ in entries:
 assert not any(s in name for s in ['HANDOFF','finalization_input','Prompt','history','artifacts','v0.5.1']),name
reading=archive('网易云推荐控制_PRD_v0.6_提交阅读包_候选.zip',entries)
shutil.copy2(r/'docs/HANDOFF.md',delivery/'Batch3.1_完整HANDOFF.md')
shutil.copy2(r/'qa/BATCH3_1_REVIEW.md',delivery/'Batch3.1_审查报告.md')
(delivery/'交付校验.json').write_text(json.dumps({'engineering':full,'reading':reading,'approval':'MANUAL_REVIEW_REQUIRED'},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({key:{k:v for k,v in value.items() if k!='files'} for key,value in [('engineering',full),('reading',reading)]},ensure_ascii=False,indent=2))
