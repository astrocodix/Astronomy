"""Build a source-only delivery archive; never include learner databases or credentials.
Run from any working directory: python3 scripts/package-source.py.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / 'deliverables'
DESTINATION.mkdir(exist_ok=True)
ARCHIVE = DESTINATION / 'astroverse-academy-source.zip'
TOP = [
    'README.md', 'package.json', 'package-lock.json', 'tsconfig.json',
    'next.config.ts', 'next-env.d.ts', 'playwright.config.ts', '.env.example',
    '.gitignore', '.prettierrc.json', '.prettierignore',
]
DIRECTORIES = ['src', 'scripts', 'prisma', 'public', 'docs']
TEST_FILES = [
    'tests/core.test.ts', 'tests/integration.test.ts', 'tests/postgres-smoke.ts',
    'tests/test.log', 'tests/build.log', 'tests/typecheck.log', 'tests/format.log',
    'tests/content-validation.log', 'tests/browser.log', 'tests/browser-report.json',
    'tests/browser-findings.json', 'tests/postgres.log', 'tests/postgres-report.json',
    'tests/backup-report.json', 'tests/verification-report.json',
    'tests/fresh-install.log', 'tests/fresh-install-report.json',
]
EXCLUDED_PARTS = {
    'node_modules', '.next', '.cache', '__pycache__', 'backups', 'storage',
    '.git', '.arena', 'test-results', 'playwright-report', 'deliverables',
}

def permitted(path):
    rel = path.relative_to(ROOT)
    name = path.name
    if any(part in EXCLUDED_PARTS for part in rel.parts):
        return False
    if name.startswith('.env') and name != '.env.example':
        return False
    if re.search(r'\.db(?:[-.].*)?$', name) or name.endswith(('.receipt.json', '.pgdump', '.tsbuildinfo')):
        return False
    return path.is_file() and not path.is_symlink()

files = {ROOT / name for name in TOP + TEST_FILES if (ROOT / name).is_file()}
for directory in DIRECTORIES + ['tests/browser', 'tests/screenshots']:
    for path in (ROOT / directory).rglob('*'):
        if permitted(path):
            files.add(path)
files = sorted(path for path in files if permitted(path))

# Scan exact configured secret values without printing them. This complements the
# strict source allowlist; it is not a replacement for an independent secret scan.
secrets = dict(os.environ)
if (ROOT / '.env').exists():
    for line in (ROOT / '.env').read_text().splitlines():
        if line.strip().startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        secrets[key.strip()] = value.strip().strip('"').strip("'")
secret_values = [(key, value.encode()) for key, value in secrets.items()
                 if re.search(r'PASSWORD|SECRET|TOKEN|API_KEY', key)
                 and len(value) >= 12]
manifest = []
for path in files:
    payload = path.read_bytes()
    for key, value in secret_values:
        if value in payload:
            raise RuntimeError(f'Refusing to package a configured secret ({key}) in {path.relative_to(ROOT)}')
    manifest.append({'path': path.relative_to(ROOT).as_posix(),
                     'bytes': len(payload), 'sha256': hashlib.sha256(payload).hexdigest()})

metadata = {
    'project': 'ASTROVERSE ACADEMY',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'scope': 'Source, authored pilot, cached media/fonts, docs and scoped verification evidence. No credentials, learner database, backups, runtime uploads, dependencies or build output.',
    'files': manifest,
}
with zipfile.ZipFile(ARCHIVE, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for path in files:
        z.write(path, 'astroverse-academy/' + path.relative_to(ROOT).as_posix())
    z.writestr('astroverse-academy/SOURCE-MANIFEST.json', json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
with zipfile.ZipFile(ARCHIVE) as z:
    assert z.testzip() is None
    for item in manifest:
        assert hashlib.sha256(z.read('astroverse-academy/' + item['path'])).hexdigest() == item['sha256']
(DESTINATION / 'source-manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
print(f'Source archive: {ARCHIVE.relative_to(ROOT)}; {len(files)} files; {ARCHIVE.stat().st_size:,} bytes.')
print('Archive integrity and per-file SHA-256 checks passed. Private/generated data was excluded.')
