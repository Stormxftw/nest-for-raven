"""Use the existing Codex access token in this isolated Raven home; never rotate it."""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ['RAVEN_HOME'] = str(ROOT / '.raven-local')

def main():
    from raven.config.paths import restrict_to_owner
    from raven.providers.chatgpt_token import auth_file
    from raven.providers.codex_catalog import account_models

    source = Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'auth.json'
    tokens = json.loads(source.read_text(encoding='utf-8')).get('tokens', {})
    if not tokens.get('access_token'):
        raise RuntimeError('No existing Codex OAuth access token is available.')
    destination = auth_file()
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Only a short-lived access snapshot: sharing a rotating refresh token could
    # invalidate the original CLI's sign-in. The source is never written.
    snapshot = {key: tokens[key] for key in ('access_token', 'id_token', 'account_id') if tokens.get(key)}
    destination.write_text(json.dumps(snapshot), encoding='utf-8')
    restrict_to_owner(destination)
    models = account_models(strict=True, timeout=15)
    if not models:
        raise RuntimeError('This sign-in returned no available models.')
    model = 'gpt-6.1-sol' if 'gpt-6.1-sol' in models else models[0]
    config_file = ROOT / '.raven-local' / 'config.json'
    config = json.loads(config_file.read_text()) if config_file.exists() else {}
    defaults = config.setdefault('agents', {}).setdefault('defaults', {})
    defaults['model'] = f'openai-codex/{model}'
    defaults['provider'] = 'openai_codex'
    config.setdefault('providers', {}).setdefault('openai_codex', {})
    config_file.write_text(json.dumps(config, indent=2), encoding='utf-8')
    restrict_to_owner(config_file)
    print(f'Configured isolated Raven with existing Codex sign-in: {model}. Restart Raven. Re-run when the access snapshot expires.')

try:
    main()
except Exception as exc:
    print(f'Codex setup failed ({type(exc).__name__}). Check that Codex is signed in and online; no source credential was changed.', file=sys.stderr)
    sys.exit(1)
