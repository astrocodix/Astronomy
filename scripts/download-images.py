"""Download the canonical scientific media registry. Never overwrite its attribution metadata.
Requires Pillow: python -m pip install Pillow. Existing images are skipped unless --force.
"""
import argparse
import io
import json
import sys
import urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--force', action='store_true', help='Refresh already-cached image files')
args = parser.parse_args()
registry = json.loads((ROOT / 'public/images/attributions.json').read_text())
errors = []
for name, asset in registry.items():
    destination = ROOT / 'public/images' / f'{name}.webp'
    if destination.exists() and not args.force:
        print(f'{name}: cached; preserving verified local image')
        continue
    try:
        if not asset['download'].startswith('https://'):
            raise ValueError('HTTPS required')
        request = urllib.request.Request(asset['download'], headers={'User-Agent': 'AstroverseAcademy/1.0 scientific-image-cache'})
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read(30_000_001)
        if len(raw) > 30_000_000:
            raise ValueError('Download exceeds 30 MB')
        Image.MAX_IMAGE_PIXELS = 40_000_000
        with Image.open(io.BytesIO(raw)) as image:
            image = image.convert('RGB')
            image.thumbnail((2000, 1600))
            temporary = destination.with_suffix('.pending.webp')
            image.save(temporary, 'WEBP', quality=88)
            temporary.replace(destination)
            print(f'{name}: {image.size}; {asset["credit"]}')
    except Exception as error:
        errors.append(name)
        print(f'{name}: {error}; existing file, if any, was preserved', file=sys.stderr)
if errors:
    sys.exit(1)
