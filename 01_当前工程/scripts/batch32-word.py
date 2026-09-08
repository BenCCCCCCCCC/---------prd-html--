"""Local edits on the supplied Word, retaining its untouched paragraphs, tables and figure."""
from pathlib import Path
from copy import deepcopy
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
r=Path(__file__).resolve().parents[1]
edit=json.loads((r/'artifacts/batch3-2/text-edits.json').read_text(encoding='utf-8'))
d=Document(r/'docs/history/batch3-1/PRD_v0.6_提交候选.docx')
def find(text):return next(p for p in d.paragraphs if p.text==text)
find('产品需求文档 · v0.6 提交候选 · 2026-09-06').text='产品需求文档与交互原型'
first=find('01｜目标与范围');first.text='01｜项目背景、目标与范围'
first.insert_paragraph_before('PRD v0.6 · 原型 v0.3.2 · 2026-09-06')
first.insert_paragraph_before('状态：需求评审稿')
intro=find('在现有推荐与播放链路中整合偏好控制，让用户明确设置“想听什么、少听什么、影响多久”，并能取消、撤销和恢复。[S01]')
intro.insert_paragraph_before('项目背景',style='Heading 2')
for paragraph in edit['background'].split('\n\n'):intro.insert_paragraph_before(paragraph)
t=next(t for t in d.tables if t.cell(0,0).text=='产品 / 来源')
t.cell(0,2).paragraphs[0].text='主要支持需求 / 设计决策'
for row in t.rows[1:]:
 c=row.cells[2];c.paragraphs[0].text=edit['replacements'][c.text]
p=next(p for p in d.paragraphs if p.text.startswith('本期选择播放链路内的控制弹层。'))
p.insert_paragraph_before('以上能力仅为方案借鉴与设计决策参照，不代表用户需求已经被证明。')
p=find('原型排序参数');p.text='原型验证参数（非生产规则）';p.style=d.styles['Normal'];p.paragraph_format.keep_with_next=True
for run in p.runs:run.font.size=Pt(10);run.font.color.rgb=RGBColor.from_string('555555')
p=next(p for p in d.paragraphs if p.text.startswith('上述权重仅用于'));p.text=edit['parameters']
anchor=find('13｜R07：自然语言候选')
anchor.insert_paragraph_before('待确认事项 / Open Questions',style='Heading 2')
questions=edit['questions'];q=d.add_table(rows=len(questions),cols=4);q.style=t.style
widths=[0.42,3.58,1.03,1.0];q.autofit=False
for i,row in enumerate(q.rows):
 for j,cell in enumerate(row.cells):
  cell.width=Inches(widths[j]);cell.text=questions[i][j]
  # Preserve the supplied table's local paragraph and cell formatting.
  sample=t.rows[0 if i==0 else 1].cells[min(j,2)]
  props=sample._tc.find(qn('w:tcPr'))
  if props is not None:
   original=cell._tc.find(qn('w:tcPr'))
   if original is not None:cell._tc.remove(original)
   cell._tc.insert(0,deepcopy(props));cell.width=Inches(widths[j])
  for run in cell.paragraphs[0].runs:
   run.font.size=Pt(10);run.bold=i==0
  borders=OxmlElement('w:tcBorders')
  for edge in ['top','left','bottom','right']:
   e=OxmlElement('w:'+edge);e.set(qn('w:val'),'single');e.set(qn('w:sz'),'4');e.set(qn('w:color'),'D9D9D9');borders.append(e)
  cell._tc.get_or_add_tcPr().append(borders)
 repeat=OxmlElement('w:tblHeader')
 if i==0:row._tr.get_or_add_trPr().append(repeat)
for col,w in zip(q.columns,widths):col.width=Inches(w)
anchor._p.addprevious(q._tbl)
# Clean the superseded status in the running footer without destroying page fields.
for section in d.sections:
 for paragraph in section.footer.paragraphs:
  for run in paragraph.runs:run.text=run.text.replace('提交候选','需求评审稿')
for element in [d.styles['Title']._element,d.paragraphs[0]._p]:
 for border in element.findall('.//'+qn('w:pBdr')):border.getparent().remove(border)
# Match the Markdown link's displayed words while keeping its source target usable.
source=next(p for p in d.paragraphs if '来源记录（随附SOURCES.md）' in p.text)
before,after=source.text.split('来源记录（随附SOURCES.md）')
source.clear();source.add_run(before)
link=OxmlElement('w:hyperlink');link.set(qn('r:id'),d.part.relate_to('SOURCES.md',RT.HYPERLINK,is_external=True))
run=OxmlElement('w:r');text=OxmlElement('w:t');text.text='来源记录';run.append(text);link.append(run);source._p.append(link)
source.add_run(after)
# Existing code-block notation and figure remain native/source-identical.
destination=r/'public/documents/PRD_v0.6_需求评审稿.docx'
d.save(destination)
print('Saved updated Word with',len(d.tables),'tables and',len(d.inline_shapes),'figure.')
