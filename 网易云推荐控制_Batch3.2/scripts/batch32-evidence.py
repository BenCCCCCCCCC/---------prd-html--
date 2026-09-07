from pathlib import Path
from PIL import Image,ImageChops
import json
r=Path(__file__).resolve().parents[1];out=r/'artifacts/batch3-2'
results=[]
for p in sorted((r/'tests/visual/screens.spec.ts-snapshots/batch3-1-candidate').glob('*.png')):
 if p.name.startswith('reader-'):continue
 actual=out/'regression-screenshots'/p.name.replace('-win32','')
 a=Image.open(p).convert('RGB');b=Image.open(actual).convert('RGB')
 assert a.size==b.size,p.name
 diff=ImageChops.difference(a,b);bbox=diff.getbbox()
 count=sum(1 for pixel in diff.get_flattened_data() if pixel!=(0,0,0))
 results.append({'baseline':p.relative_to(r).as_posix(),'actual':actual.relative_to(r).as_posix(),'pixelIdentical':bbox is None,'rawDifferentPixels':count,'rawDifferenceRatio':count/(a.width*a.height),'differenceBounds':bbox})
assert len(results)==64
(out/'frozen-visual-comparison.json').write_text(json.dumps({'status':'RECORDED','existingBaselineComparisons':64,'pixelIdentical':sum(x['pixelIdentical'] for x in results),'newDesignBaseline':False,'qualification':'Additional raw-pixel audit of separately captured evidence. These are not all pixel-identical. The unchanged Playwright visual assertions remain the regression gate; see artifacts/reports/visual.json. No baseline or threshold changed.','files':results},ensure_ascii=False,indent=2),encoding='utf-8')
e2e=json.loads((r/'artifacts/reports/e2e.json').read_text(encoding='utf-8'));unit=json.loads((r/'artifacts/reports/unit.json').read_text(encoding='utf-8'));visual=json.loads((r/'artifacts/reports/visual.json').read_text(encoding='utf-8'))
assert e2e['stats']['expected']==107 and not any(e2e['stats'][x] for x in ['unexpected','skipped','flaky'])
assert unit['numPassedTests']==87 and unit['numFailedTests']==0
assert visual['stats']['expected']==4 and visual['stats']['unexpected']==0
titles=[]
def visit(s):
 titles.extend(x['title'] for x in s.get('specs',[]))
 for child in s.get('suites',[]):visit(child)
visit(e2e)
for suite in unit['testResults']:
 titles.extend(x['fullName'] for x in suite['assertionResults'] if x['status']=='passed')
mapping=[]
for case in json.loads((r/'data/acceptance_cases.json').read_text(encoding='utf-8')):
 matches=[t for t in titles if case['id'] in t];assert matches,case['id']
 mapping.append({'id':case['id'],'localRegression':'PASS','executedTitles':matches,'newProductApproval':False})
(out/'acceptance-current.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
print('64 prior non-reader screenshots audited (see exact-pixel counts); 87 unit / 107 E2E / 4 visual groups passed; existing AC coverage retained.')
