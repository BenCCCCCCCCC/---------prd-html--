"""Apply only the owner-authorized Batch 3.2 text edits to the archived baseline."""
from pathlib import Path
import json, shutil
r=Path(__file__).resolve().parents[1]
b=r.parent/'Batch3.2_备份_v0.3.1_20260906'
archive=r/'docs/history/batch3-1';archive.mkdir(parents=True,exist_ok=True)
for source,name in [('docs/PRD_v0.6.md','PRD_v0.6_提交候选.md'),('public/documents/PRD_v0.6_提交候选.docx','PRD_v0.6_提交候选.docx'),('artifacts/batch3-1/print/PRD_v0.6_提交候选.pdf','PRD_v0.6_提交候选.pdf')]:
 if not (archive/name).exists():shutil.copy2(b/source,archive/name)
out=r/'artifacts/batch3-2';out.mkdir(exist_ok=True)
if not (out/'pre-batch-reports').exists():shutil.copytree(b/'artifacts/reports',out/'pre-batch-reports')
old=(b/'docs/PRD_v0.6.md').read_text(encoding='utf-8')
background='''网易云音乐已有每日推荐、风格推荐、歌曲/音乐人负反馈和黑名单等能力，但入口分散，用户对当前想听什么、少推荐什么，以及操作影响本次还是长期的控制关系不够统一。临时替他人播放、短期探索也可能与长期兴趣混淆。

本项目不重做推荐算法，而在既有能力上增加统一控制层：R03承接主动表达与推荐纠偏，R04保护临时场景下的长期画像，R07实验性验证自然语言能否降低多条件设置成本。目标是降低纠偏成本，同时控制交互负担、内容收窄及研发投入。'''
assert 150<=len(background.replace('\n',''))<=250
parameters='这些权重只用于本地原型验证交互和结果变化，不代表网易云正式推荐算法，也不代表真实曝光下降比例。正式融合权重需推荐团队根据候选可用性、离线重排、效果与多样性评估及实验确定。'
questions=[['ID','待确认事项','协作角色','最迟确认节点'],['Q01','平台正式“有效收听”定义与基线口径','数据 / 推荐','实验设计前'],['Q02','R04普通行为到长期画像派生特征的完整隔离链路','推荐 / 数据','开发前'],['Q03','刷新失败后点击“继续”是否应收起详细错误提示','产品 / 客户端','UI冻结前'],['Q04','R07真实模型、成本、时延和隐私约束','AI / 服务端','R07真实实验前'],['Q05','临时收听跨搜索、歌单、手动播放等来源的正式事件覆盖','客户端 / 数据','联调前']]
question_md='### 待确认事项 / Open Questions\n\n'+'\n'.join('| '+' | '.join(row)+' |' for row in [questions[0],['---']*4,*questions[1:]])+'\n'
mapping={
'产品需求文档 · v0.6 提交候选 · 2026-09-06':'产品需求文档与交互原型\n\nPRD v0.6 · 原型 v0.3.2 · 2026-09-06\n\n状态：需求评审稿',
'## 01｜目标与范围':'## 01｜项目背景、目标与范围\n\n### 项目背景\n\n'+background,
'| 产品 / 来源 | 借鉴点 | 本方案的选择 |':'| 产品 / 来源 | 借鉴点 | 主要支持需求 / 设计决策 |',
'先做手动控制；R07只解析条件，不购买或代替推荐排序。':'R07：支持用自然语言表达即时音乐意图。先做手动控制；R07只解析条件，不购买或代替推荐排序。',
'在播放链路提示保护；分别定义显式操作与普通行为，不假定竞品事件粒度相同。':'R04：支持短期行为与长期画像学习隔离。在播放链路提示保护；分别定义显式操作与普通行为，不假定竞品事件粒度相同。',
'R05面向具体历史事件；不将“减少影响”理解为删除数据或模型遗忘。':'R04/R05：支持画像影响控制与事后排除。R05面向具体历史事件；不将“减少影响”理解为删除数据或模型遗忘。',
'在原推荐/播放链路增加控制，不另建推荐中心。':'R03：优先整合既有推荐、负反馈和黑名单能力，而非重建推荐体系；在原推荐/播放链路增加控制，不另建推荐中心。',
'本期选择播放链路内的控制弹层。':'以上能力仅为方案借鉴与设计决策参照，不代表用户需求已经被证明。\n\n本期选择播放链路内的控制弹层。',
'### 原型排序参数':'### 原型验证参数（非生产规则）',
'上述权重仅用于可重复的本地演示，不代表真实曝光下降比例。生产参数需通过候选可用性、离线重排、效果与多样性评估后确定。':parameters,
'## 13｜R07：自然语言候选':question_md+'\n## 13｜R07：自然语言候选',
}
new=old
for src,dst in mapping.items():
 assert new.count(src)==1,src
 new=new.replace(src,dst)
(r/'docs/PRD_v0.6.md').write_text(new,encoding='utf-8',newline='\n')
(out/'text-edits.json').write_text(json.dumps({'backgroundCharacters':len(background.replace('\n','')),'background':background,'parameters':parameters,'questions':questions,'replacements':mapping},ensure_ascii=False,indent=2),encoding='utf-8')
p=r/'package.json';package=json.loads(p.read_text());package['version']='0.3.2';p.write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=r/'index.html';p.write_text(p.read_text(encoding='utf-8').replace('完整 PRD v0.5.1','完整 PRD v0.6'),encoding='utf-8')
print('Updated only requested sections and metadata; background characters:',len(background.replace('\n','')))
