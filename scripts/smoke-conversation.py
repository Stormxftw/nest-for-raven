"""Exercise real host/specialist turns through isolated Raven using existing sign-in."""
import asyncio
import argparse
import json
from pathlib import Path
import aiohttp

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--agent', default='Raven-General')
AGENT = parser.parse_args().agent

async def main():
    home = ROOT / '.raven-local'
    state = json.loads((home / 'serve.json').read_text())
    async with aiohttp.ClientSession() as http:
        async with http.post('http://127.0.0.1:4173/auth/exchange', json={'token':state['token']},headers={'Origin':'http://127.0.0.1:4173'}) as response:
            assert response.status == 200
            cookies = [{'name':name,'value':item.value,'domain':'127.0.0.1','path':'/','expires':-1,'httpOnly':True,'secure':False,'sameSite':'Strict'} for name,item in response.cookies.items()]
            (home/'test-auth.json').write_text(json.dumps({'cookies':cookies,'origins':[]}),encoding='utf-8')
        async with http.ws_connect('http://127.0.0.1:4173/rpc',headers={'X-Raven-Token':state['token'],'Origin':'http://127.0.0.1:4173'}) as ws:
            sequence = 0
            buffered = []
            async def call(method, params):
                nonlocal sequence
                sequence += 1
                await ws.send_json({'jsonrpc':'2.0','id':sequence,'method':method,'params':params})
                while True:
                    frame = await ws.receive_json(timeout=40)
                    if frame.get('id') == sequence:
                        if 'error' in frame: raise RuntimeError(f'{method}: {frame["error"].get("data", {}).get("detail", frame["error"].get("message"))}')
                        return frame['result']
                    buffered.append(frame)
            async def run_turn(session, text, target=None):
                await call('turn.send',{'session_key':session,'content':text,**({'target':target} if target else {})})
                answer = ''
                async with asyncio.timeout(150):
                    while True:
                        frame = buffered.pop(0) if buffered else await ws.receive_json()
                        if frame.get('method') != 'event': continue
                        event = frame['params']['event']; payload = event.get('payload',{})
                        if payload.get('target') != target: continue
                        if event['type'] == 'token.delta': answer += payload.get('text','')
                        if event['type'] == 'error': raise RuntimeError(f'Turn failed: {payload.get("message")}')
                        if event['type'] == 'message.complete': return answer
            await call('system.hello',{'client_version':'0.1.0','client_capabilities':[]})
            setup = await call('setup.status',{})
            assert setup['provider_configured']
            session = (await call('session.create',{}))['session_id']
            await call('turn.subscribe',{'session_key':session})
            answer = await run_turn(session,'This is a UI connection test. Do not use tools or delegate. Reply with exactly RAVEN_HOST_OK.')
            assert 'RAVEN_HOST_OK' in answer
            print('PASS: real host turn accepted, streamed, and completed.',flush=True)
            instance = (await call('subagents.instance.create',{'session_key':session,'agent':AGENT}))['instance']
            target = {'agent':instance['agent'],'handle':instance['handle']}
            answer = await run_turn(session,'This is a direct conversation test. Do not use tools. Reply with exactly RAVEN_SPECIALIST_OK.',target)
            assert 'RAVEN_SPECIALIST_OK' in answer
            roster = await call('subagents.instances',{'session_key':session})
            assert roster['pending_handoff_count'] > 0
            history = await call('subagents.instance.history',{'session_key':session,**target})
            assert any('RAVEN_SPECIALIST_OK' in t['content'] for t in history['turns'])
            print(f'PASS: real {AGENT} direct turn, separate history, and pending host handoff.',flush=True)
            (ROOT/'output/conversation-smoke.json').write_text(json.dumps({'session_id':session,'target':target,'host':True,'specialist':True,'handoff':True},indent=2))

asyncio.run(main())
