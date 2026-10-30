"""Exercise the real local gateway using a labeled on-disk fixture, without a model."""
import asyncio
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / '.raven-local'
os.environ['RAVEN_HOME'] = str(HOME)
os.chdir(ROOT / 'work')

import aiohttp
from raven.config.loader import load_config
from raven.session.resolve import build_manager
from raven.agent.subagent.dag_store import DagRunStore, index_guard
from raven.agent.subagent.history import dag_root, nodes_root, session_history_root
from raven.agent.subagent.prompt_backend import LocalFileBackend


async def main():
    manager = build_manager(load_config())
    session_id = 'tui:spatial-smoke-fixture'
    directory = manager.session_dir(session_id)
    if not directory.resolve().is_relative_to(HOME.resolve()):
        raise RuntimeError('Fixture destination escaped isolated Raven home.')
    session = manager.get_or_create(session_id)
    session.set_title('[Test fixture] Spatial observer')
    if not session.messages:
        session.add_message('user', 'Validate the custom observer against stored Raven records. No model execution.')
    manager.save(session)
    run_id = '20261030T000000000000Z-aaaaaaaa'
    graph = {'task_summary': 'Observer integration fixture', 'nodes': [
        {'id': 'inspect', 'subagent': 'Raven-Code', 'node_summary': 'Inspect a stored result', 'prompt_template': 'Read this test fixture.', 'depends_on': [], 'inputs': {}},
        {'id': 'verify', 'subagent': 'Raven-Code', 'node_summary': 'Verify the dependency', 'prompt_template': 'Check the preceding result.', 'depends_on': ['inspect'], 'inputs': {}},
    ]}
    node_dir = nodes_root(directory)
    node_dir.mkdir(parents=True, exist_ok=True)
    store = DagRunStore(LocalFileBackend(), str(dag_root(directory)), run_id,
                        nodes_root=str(node_dir), registry_root=str(session_history_root(directory)))
    async with index_guard(store.registry_root):
        await store.init(json.dumps(graph), node_ids=['inspect', 'verify'])
    manifest = {}
    for node in graph['nodes']:
        name = node['id']
        output = node_dir / f'{name}.out.md'
        prompt = node_dir / f'{name}.prompt.md'
        output.write_text('Stored Raven fixture output. No agent ran.\n<script>window.fixtureExecuted=true</script>', encoding='utf-8')
        prompt.write_text(node['prompt_template'], encoding='utf-8')
        manifest[name] = {'status': 'completed', 'subagent': 'Raven-Code', 'depends_on': node['depends_on'],
                          'started_at': 1793380000000, 'ended_at': 1793380001000,
                          'prompt_file': str(prompt), 'output_file': str(output), 'tokens_in': None, 'tokens_out': None}
    await store.write_manifest(manifest)
    async with index_guard(store.registry_root):
        await store.record_outcome({'inspect': 'completed', 'verify': 'completed'}, summary='Integration fixture')

    state = json.loads((HOME / 'serve.json').read_text())
    async with aiohttp.ClientSession() as http:
        async with http.post('http://127.0.0.1:4173/auth/exchange', json={'token': state['token']}, headers={'Origin': 'http://127.0.0.1:4173'}) as response:
            assert response.status == 200, f'Cookie exchange failed: {response.status}'
            cookies = [{'name': name, 'value': item.value, 'domain': '127.0.0.1', 'path': '/', 'expires': -1, 'httpOnly': True, 'secure': False, 'sameSite': 'Strict'} for name, item in response.cookies.items()]
            (HOME / 'test-auth.json').write_text(json.dumps({'cookies': cookies, 'origins': []}), encoding='utf-8')
        async with http.ws_connect('http://127.0.0.1:4173/rpc', headers={'X-Raven-Token': state['token'], 'Origin': 'http://127.0.0.1:4173'}) as ws:
            async def call(method, params):
                await ws.send_json({'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params})
                while True:
                    frame = await ws.receive_json(timeout=15)
                    if frame.get('id') == 1:
                        assert 'error' not in frame, f'{method}: {frame.get("error")}'
                        return frame['result']
            await call('system.hello', {'client_version': '0.1.0', 'client_capabilities': []})
            sessions = await call('session.list', {'limit': 100})
            assert any(s['id'] == session_id for s in sessions['sessions'])
            tasks = await call('tasks.list', {'session_key': session_id})
            assert len(tasks['tasks'][0]['nodes']) == 2
            result = await call('dag.node', {'session_key': session_id, 'run_id': run_id, 'node': 'inspect'})
            assert 'Stored Raven fixture output' in result['node']['output']
    print('PASS: real gateway auth, handshake, session.list, tasks.list, dag.node; 2 stored fixture nodes; no model invoked.')

asyncio.run(main())
