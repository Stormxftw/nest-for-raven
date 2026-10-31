"""Audit page ownership for the pinned Raven RPC catalog. --write refreshes the appendix."""
import argparse
import ast
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / 'upstream-raven'
OUTPUT = ROOT / 'docs' / 'RAVEN_API_COVERAGE.md'
OWNERS = {
    'approval':'P03', 'browser':'P14', 'bugreport':'P15', 'channels':'P13',
    'clarify':'P03', 'cli':'P17', 'clipboard':'P03', 'command':'P17',
    'commands':'P17', 'complete':'P03', 'config':'P16', 'confirm':'P03',
    'credential':'P03', 'cron':'P12', 'dag':'P04', 'deck':'P05',
    'delegation':'P04', 'deliverables':'P05', 'ext':'P08', 'fs':'P05',
    'image':'P03', 'import':'P15', 'imported':'P15', 'input':'P03',
    'knowledge':'P09', 'machines':'P18', 'mcp':'P08', 'memory':'P10',
    'model':'P07', 'playbooks':'P11', 'plug':'P08', 'plughub':'P08',
    'process':'P17', 'prompt':'P03', 'reload':'P16', 'rollback':'P17',
    'secret':'P03', 'session':'P03', 'settings':'P16', 'setup':'P01',
    'shell':'P17', 'skill':'P08', 'skillhub':'P08', 'skills':'P08',
    'slash':'P03', 'spawn_tree':'P04', 'subagent':'P04', 'subagents':'P06',
    'sudo':'P03', 'system':'P16', 'tasks':'P04', 'terminal':'P17',
    'tools':'P08', 'trajectory':'P15', 'turn':'P03', 'voice':'P03',
}

def literal(path, name):
    for node in ast.parse(path.read_text(encoding='utf-8')).body:
        target = node.target if isinstance(node, ast.AnnAssign) else node.targets[0] if isinstance(node, ast.Assign) else None
        if isinstance(target, ast.Name) and target.id == name:
            return ast.literal_eval(node.value)
    raise ValueError(f'Missing upstream audit table: {name}')

def owner(name):
    if name in {'session.list','session.create','session.delete','session.most_recent','session.title','session.pin','session.archive','session.close'}:
        return 'P02'
    if name.startswith('settings.everos'):
        return 'P10'
    if name in {'system.hello','system.ping','system.version'}:
        return 'P01'
    if name in {'subagents.instances','subagents.instance.history','subagents.instance.steer','subagents.instance.set_mode','subagents.instance.set_model'}:
        return 'P03'
    return OWNERS[name.split('.')[0]]

def render():
    schema = json.loads((UPSTREAM / 'rpc-schema/openrpc.json').read_text(encoding='utf-8'))
    methods = sorted(schema['methods'], key=lambda item:item['name'])
    stubs = {item[0] for item in literal(UPSTREAM / 'raven/rpc/methods/_stubs.py', '_STUB_DEFINITIONS')}
    missing = literal(UPSTREAM / 'tests/test_rpc_registration.py', 'KNOWN_UNREGISTERED')
    revision = subprocess.check_output(['git','-C',str(UPSTREAM),'rev-parse','HEAD'], text=True).strip()
    source = '\n'.join(path.read_text(encoding='utf-8') for path in (ROOT / 'src').glob('*') if path.suffix in {'.ts','.tsx'} and '.test.' not in path.name)
    references = set(re.findall(r"['\"]([a-z_]+\.[a-zA-Z_.]+)['\"]", source))
    plan = (ROOT / 'RAVEN_FEATURE_PLAN.md').read_text(encoding='utf-8')
    page_ids = set(re.findall(r'^## (P\d\d) ', plan, flags=re.M))
    assert len({method['name'] for method in methods}) == len(methods), 'Duplicate RPC name'
    assert stubs | missing <= {method['name'] for method in methods}, 'Gap list no longer matches catalog'
    rows = []
    for method in methods:
        name = method['name']
        page = owner(name)
        assert page in page_ids, f'Page {page} absent from plan'
        backend = 'Unsupported stub (-32012)' if name in stubs else 'Missing handler (-32601)' if name in missing else 'Not in upstream gap lists; verify runtime'
        ui = 'Referenced in current UI source' if name in references else 'Planned / no current UI reference'
        summary = method.get('summary', '').replace('|','\\|').replace('\n',' ')
        rows.append(f'| `{name}` | {page} | {backend} | {ui} | {summary} |')
    header = f'''# Raven API coverage appendix

Generated from the local upstream contract at `{revision}`. See [the page plan](../RAVEN_FEATURE_PLAN.md) for user workflows, sequencing, and acceptance criteria.

**{len(methods)} catalog methods, each assigned one owning page.** {len(stubs)} are explicitly unsupported stubs and {len(missing)} have no registered handler in upstream's audit. The remaining methods still require the relevant runtime capabilities, configuration, and a real end-to-end check; this inventory is not a claim of {len(methods)} working UI features.

"Referenced" only means a method name occurs in current production UI source. It is not a completion verdict. Shared controls may appear on several pages; the owner below is responsible for the contract. Tool-only and standalone capabilities (Oncall, Sentinel, Heartbeat, ACP/A2A, sandbox, Evolver) are mapped separately in P12/P17 of the plan.

Sources: [OpenRPC](https://github.com/evermind-ai/raven/blob/{revision}/rpc-schema/openrpc.json), [unsupported stubs](https://github.com/evermind-ai/raven/blob/{revision}/raven/rpc/methods/_stubs.py), [registration gaps](https://github.com/evermind-ai/raven/blob/{revision}/tests/test_rpc_registration.py).

Reproduce with `python scripts/check-raven-coverage.py --write`; verify with `python scripts/check-raven-coverage.py --check`. Regenerate after auditing changes to the pinned Raven revision or page ownership.

| RPC method | Owner | Backend evidence | Our UI | Upstream purpose |
| --- | --- | --- | --- | --- |
'''
    return header + '\n'.join(rows) + '\n'

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--write', action='store_true')
    group.add_argument('--check', action='store_true')
    args = parser.parse_args()
    content = render()
    if args.write:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(content, encoding='utf-8')
    else:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != content:
            raise SystemExit('Coverage appendix is stale; audit the change, then regenerate with --write.')
    print('PASS: every catalog method has a page owner; gap tables, page IDs, and generated appendix agree.')
