"""Open a one-time sign-in on the UI's origin without printing credentials."""
import json
import sys
import urllib.request
import webbrowser
from pathlib import Path

try:
    root = Path(__file__).resolve().parents[1]
    state = json.loads((root / '.raven-local' / 'serve.json').read_text())
    request = urllib.request.Request('http://127.0.0.1:18792/auth/nonce', method='POST',
                                     headers={'X-Raven-Token': state['token']})
    with urllib.request.urlopen(request, timeout=5) as response:
        nonce = json.load(response)['nonce']
    webbrowser.open(f'http://127.0.0.1:4173/auth#{nonce}')
    print('Opened Raven sign-in in your browser. Return to the UI and select Connect to Raven.')
except Exception:
    print('Sign-in could not open. Start npm run dev and npm run raven, then retry.', file=sys.stderr)
    sys.exit(1)
