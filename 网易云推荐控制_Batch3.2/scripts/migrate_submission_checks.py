from pathlib import Path
r=Path(__file__).resolve().parents[1]
files=list((r/'tests').rglob('*.ts'))
for p in files:
 s=p.read_text(encoding='utf-8')
 s=s.replace('name: "调整推荐",','name: "调整本次推荐偏好",').replace('button(page, "调整推荐")','button(page, "调整本次推荐偏好")')
 s=s.replace('"AI 实验"','"AI 实验 · 本地解析"').replace('/Product Notes/','/测试工具/').replace('"batch3-candidate"','"batch3-1-candidate"').replace('artifacts/batch3/','artifacts/batch3-1/')
 if p.name=='flows.spec.ts':
  s=s.replace('  await page.getByRole("button", { name: "Demo 2", exact: true }).click();','  await expect(page.getByRole("checkbox", { name: "显示标注" })).toBeChecked();')
  s=s.replace('  await page.getByRole("button", { name: "Demo 3", exact: true }).click();','  await notes(page);')
  s=s.replace('  await expect(page.locator(".mini-player")).toContainText("保护持续");','  await page.getByRole("button", { name: "推荐队列", exact: true }).click();\n  await expect(page.locator(".mini-player")).toContainText("保护持续");\n  await page.getByRole("button", { name: "返回播放器", exact: true }).click();')
  s=s.replace('  await page.getByRole("button", { name: "重置演示", exact: true }).click();','  await notes(page);\n  await page.getByRole("button", { name: "重置演示", exact: true }).click();')
 if p.name=='reader.spec.ts':
  s=s.replace('docs/PRD_v0.5.1.md','docs/PRD_v0.6.md').replace('PRD_v0.5.1_完整阅读层.pdf','PRD_v0.6_提交候选.pdf')
  s=s.replace('"下载 PRD 原文（Markdown）"','"下载正文（MD）"').replace('"下载原文与图示（ZIP）", "public/documents/PRD_v0.5.1_阅读资料.zip"','"下载正文（Word）", "public/documents/PRD_v0.6_提交候选.docx"')
  s=s.replace('图｜多角色正向、取消、失败与撤销流程。为目标集成方案，并非已部署服务。','多角色正向、取消、失败与撤销流程')
  s=s.replace('.replace(/`|\\|/g, "")','.replace(/`|\\||\\*\\*/g, "").replace(/\\[([^\\]]+)\\]\\([^)]*\\)/g, "$1")')
  s=s.replace('  await page.locator(".review-guide > summary").click();','  await page.getByRole("checkbox", { name: "显示标注" }).uncheck();')
  s=s.replace('  await page.getByRole("link", { name: "项目概览", exact: true }).click();','  await expect(page.getByRole("link", { name: "项目概览", exact: true })).toHaveCount(0);\n  await page.evaluate(() => { location.hash = "#/overview"; });')
 p.write_text(s,encoding='utf-8')
