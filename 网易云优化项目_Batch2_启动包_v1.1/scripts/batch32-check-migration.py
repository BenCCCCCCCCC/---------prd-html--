from pathlib import Path
r=Path(__file__).resolve().parents[1]
for p in (r/'tests/e2e').glob('*.ts'):
 text=p.read_text(encoding='utf-8')
 text=text.replace('artifacts/batch3-1/','artifacts/batch3-2/')
 if p.name=='reader.spec.ts':
  text=text.replace('const coverage = [];','await page.locator(".prototype-parameters > summary").click();\n  const coverage = [];')
  text=text.replace('public/documents/PRD_v0.6_提交候选.docx','public/documents/PRD_v0.6_需求评审稿.docx')
  text=text.replace('["下载正文（Word）", "public/documents/PRD_v0.6_需求评审稿.docx"],','["下载正文（Word）", "public/documents/PRD_v0.6_需求评审稿.docx"],\n    ["下载正文（PDF）", "public/documents/PRD_v0.6_需求评审稿.pdf"],')
  text=text.replace('PRD_v0.6_提交候选.pdf','PRD_v0.6_需求评审稿.pdf')
 if p.name=='submission.spec.ts':
  text=text.replace('sha(await readFile("docs/PRD_v0.6.md"))','sha(await readFile("docs/history/batch3-1/PRD_v0.6_提交候选.md"))')
  text=text.replace('PRD v0.6 · 原型 v0.3.1','PRD v0.6 · 原型 v0.3.2')
 p.write_text(text,encoding='utf-8')
p=r/'tests/visual/screens.spec.ts';text=p.read_text(encoding='utf-8').replace('artifacts/batch3-1/','artifacts/batch3-2/')
text=text.replace('["batch3-1-candidate", name]','[name.startsWith("reader-") ? "batch3-2-document" : "batch3-1-candidate", name]')
p.write_text(text,encoding='utf-8')
print('Preserved behavior assertions; archived source check retained; only document metadata/download locators and new evidence paths changed.')
