"""Package immutable PRD and its local references for an actual same-origin download."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json

root = Path(__file__).resolve().parents[1]
destination = root / 'public/documents'
destination.mkdir(parents=True, exist_ok=True)
paths = ['docs/PRD_v0.5.1.md', 'design/flow_roles.png', 'docs/SOURCES.md',
         'docs/TRADEOFFS_AND_REJECTED_ALTERNATIVES.md', 'docs/TEST_PLAN.md',
         'specs/product-config.json', 'specs/events.spec.json', 'specs/portfolio-decisions.json',
         'data/acceptance_cases.json']
with ZipFile(destination / 'PRD_v0.5.1_阅读资料.zip', 'w', ZIP_DEFLATED) as archive:
    for relative in paths:
        archive.write(root / relative, relative)
report = {p: hashlib.sha256((root / p).read_bytes()).hexdigest() for p in paths}
(root / 'artifacts/batch3/document-download-hashes.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('Prepared PRD reading ZIP with', len(paths), 'unchanged source files.')
