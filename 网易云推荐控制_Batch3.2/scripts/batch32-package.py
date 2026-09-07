"""Create a complete engineering archive and a clean review reading archive."""
from pathlib import Path
import os,json,hashlib,zipfile,shutil
r=Path(__file__).resolve().parents[1];d=r.parent/'Batch3.2_交付_v0.3.2';d.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
required=['docs/HANDOFF.md','qa/BATCH3_2_REVIEW.md','docs/PRD_v0.6.md','public/documents/PRD_v0.6_需求评审稿.docx','public/documents/PRD_v0.6_需求评审稿.pdf','dist/index.html','artifacts/batch3-2/final-audit.json']
for f in required:assert (r/f).is_file(),f
assert json.loads((r/'artifacts/batch3-2/final-audit.json').read_text(encoding='utf-8'))['status']=='PASS'
excluded={'node_modules','.cache','.git','test-results','playwright-report','__pycache__','netease_submission_prepare'}
files=[]
for folder,dirs,names in os.walk(r):
 dirs[:]=sorted(n for n in dirs if n not in excluded)
 for name in sorted(names):
  p=Path(folder)/name
  if (name.startswith('.env') and name!='.env.example') or name.startswith('~$') or p.suffix.lower() in {'.tmp','.ttf','.otf','.woff','.woff2','.eot'}:continue
  files.append(p)
def pack(name,entries):
 path=d/name;assert not path.exists(),str(path)
 inventory=[]
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for filename,data in entries:
   z.writestr(filename,data);inventory.append({'path':filename,'bytes':len(data),'sha256':sha(data)})
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  for item in inventory:assert sha(z.read(item['path']))==item['sha256']
 return {'archive':name,'bytes':path.stat().st_size,'sha256':sha(path.read_bytes()),'fileCount':len(inventory),'crc':'PASS','allFileHashes':'PASS','files':inventory}
engineering=pack('网易云推荐控制_Batch3.2_v0.3.2_完整工程.zip',(('网易云推荐控制_Batch3.2/'+p.relative_to(r).as_posix(),p.read_bytes()) for p in files))
entries=[]
for p in sorted((r/'dist').rglob('*')):
 if p.is_file() and not any(x in p.name for x in ['v0.5.1','提交候选']):entries.append(('dist/'+p.relative_to(r/'dist').as_posix(),p.read_bytes()))
for dest,src in {'docs/PRD_v0.6.md':'docs/PRD_v0.6.md','docs/PRD_v0.6_需求评审稿.docx':'public/documents/PRD_v0.6_需求评审稿.docx','docs/PRD_v0.6_需求评审稿.pdf':'public/documents/PRD_v0.6_需求评审稿.pdf','docs/SOURCES.md':'docs/SOURCES_v0.6.md','docs/product-config.json':'specs/product-config.json','docs/events.spec.json':'specs/events.spec.json','docs/acceptance_cases.json':'data/acceptance_cases.json','design/flow_roles.png':'design/flow_roles.png','server.mjs':'scripts/serve-dist.mjs'}.items():entries.append((dest,(r/src).read_bytes()))
readme='''# 网易云音乐｜推荐控制链路优化

产品需求文档与交互原型

PRD v0.6 · 原型 v0.3.2 · 2026-09-06

状态：需求评审稿

本地阅读：安装Node.js（本工程使用24），在此目录执行 `node server.mjs`，打开 http://127.0.0.1:4173/ 。不要直接双击dist/index.html；若端口占用，先停止占用该端口的本地预览。

网页支持完整目录、搜索、章节进入原型与返回、MD/Word/PDF真实下载及打印。§07原型参数默认折叠，打印完整保留。docs/提供同正文的MD、Word、PDF、来源及规则附件；design/保留静态流程图。参考资料从提供的来源索引查看。

非官方本地交互原型，未连接真实账号、音频或模型。研发标注可关闭；文档阅读不提交设置，重置需主动操作。参考视觉素材仅用于本地评审；需求评审稿不表示用户、模型或生产效果已经验证。
'''
entries.append(('阅读说明.md',readme.encode('utf-8')))
for name,_ in entries:assert not any(x in name for x in ['HANDOFF','finalization_input','artifacts','提交候选','v0.5.1','history'])
reading=pack('网易云推荐控制_PRD_v0.6_最终提交阅读包.zip',entries)
shutil.copy2(r/'docs/HANDOFF.md',d/'Batch3.2_完整HANDOFF.md');shutil.copy2(r/'qa/BATCH3_2_REVIEW.md',d/'Batch3.2_自审报告.md')
result={'engineering':engineering,'reading':reading,'documentStatus':'需求评审稿','newProductApproval':False}
(d/'交付校验.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:{x:v for x,v in obj.items() if x!='files'} for k,obj in [('engineering',engineering),('reading',reading)]},ensure_ascii=False,indent=2))
