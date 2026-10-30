// @vitest-environment happy-dom
import {act, cleanup, renderHook, waitFor} from '@testing-library/react'
import {afterEach, expect, it, vi} from 'vitest'
import {useConversation} from './useConversation'
import type {RavenRpc} from './rpc'
import {laneKey, type Target} from './types'

afterEach(() => {cleanup(); vi.useRealTimers()})
function gateway(overrides: Record<string, (params: Record<string, unknown>) => unknown> = {}) {
  let listener: (method: string, params: unknown) => void = () => {}
  const notify = (method: string, params: unknown) => listener(method, params)
  const event = (type: string, payload: Record<string, unknown> = {}, subscription = 'sub-a') => notify('event', {subscription_id: subscription, event: {type, payload}})
  const call = vi.fn(async (method: string, params: Record<string, unknown>): Promise<unknown> => {
    if (overrides[method]) return overrides[method](params)
    if (method === 'session.resume') return {session_id: params.session_id, messages: [], info: {model:'test', running:true}}
    if (method === 'turn.subscribe') {
      // Raven can emit an initial frame before the subscribe response arrives.
      event('message.start', {turn_id:'t1'})
      event('token.delta', {turn_id:'t1', text:'Early text'})
      return {subscription_id:'sub-a', running:true}
    }
    if (method === 'approval.pending') return {requests:[]}
    if (method === 'subagents.instances') return {instances:[], pending_handoff_count:0}
    if (method === 'turn.send') return {accepted:true, turn_id:'t1'}
    return {ok:true}
  })
  const client = {call, onNotification: (fn: typeof listener) => {listener = fn; return () => {listener = () => {}}}} as unknown as RavenRpc
  return {client, call, notify, event}
}
it('buffers early subscription events, ignores other subscriptions, and streams each recipient separately', async () => {
  const g = gateway(), target: Target = {agent:'Raven-Code',handle:'code-1'}
  const {result} = renderHook(() => useConversation(g.client, 'a'))
  await waitFor(() => expect(result.current.ready).toBe(true))
  expect(result.current.lanes.host.text).toBe('Early text')
  act(() => {g.event('token.delta', {text:'Wrong'}, 'other'); g.event('token.delta', {target, text:'Specialist'}); g.event('message.complete', {target})})
  expect(result.current.lanes.host.text).toBe('Early text')
  expect(result.current.lanes[laneKey(target)].messages[0].text).toBe('Specialist')
  expect(result.current.lanes.host.running).toBe(true)
})
it('steers a running host and cancels only the selected turn', async () => {
  const g = gateway()
  const {result} = renderHook(() => useConversation(g.client, 'a'))
  await waitFor(() => expect(result.current.ready).toBe(true))
  await act(async () => {expect(await result.current.send('Focus on the first step')).toBe(true); await result.current.cancel()})
  expect(g.call).toHaveBeenCalledWith('turn.send', {session_key:'a', content:'Focus on the first step', busy:'inject'})
  expect(g.call).toHaveBeenCalledWith('turn.cancel', {session_key:'a', turn_id:'t1'})
})
it('removes rejected optimistic input and permits retry without leaving the lane busy', async () => {
  const g = gateway()
  const {result} = renderHook(() => useConversation(g.client, 'a'))
  await waitFor(() => expect(result.current.ready).toBe(true))
  act(() => g.event('message.complete', {turn_id:'t1'}))
  g.call.mockRejectedValueOnce(new Error('Model unavailable'))
  await act(async () => expect(await result.current.send('Try me')).toBe(false))
  expect(result.current.lanes.host.running).toBe(false)
  expect(result.current.lanes.host.messages.some(m => m.text === 'Try me')).toBe(false)
  expect(result.current.lanes.host.error).toBe('Model unavailable')
  await act(async () => expect(await result.current.send('Try me')).toBe(true))
})
it('filters decisions by mission and responds with the original request identity', async () => {
  const g = gateway()
  const {result} = renderHook(() => useConversation(g.client, 'a'))
  await waitFor(() => expect(result.current.ready).toBe(true))
  act(() => {
    g.notify('approval.request', {session_id:'other',approval_id:'foreign'})
    g.notify('approval.request', {session_id:'a',approval_id:'own',description:'Run a command',command:'echo safe'})
  })
  expect(result.current.requests).toHaveLength(1)
  await act(async () => result.current.respond(result.current.requests[0], 'deny'))
  expect(g.call).toHaveBeenCalledWith('approval.respond', {session_id:'a',approval_id:'own',choice:'deny'})
  expect(result.current.requests).toHaveLength(0)
})
it('unsubscribes when the user changes missions', async () => {
  const g = gateway()
  const {result, rerender} = renderHook(({id}) => useConversation(g.client, id), {initialProps:{id:'a'}})
  await waitFor(() => expect(result.current.ready).toBe(true))
  rerender({id:'b'})
  await waitFor(() => expect(g.call).toHaveBeenCalledWith('session.resume', {session_id:'b'}))
  expect(g.call).toHaveBeenCalledWith('turn.unsubscribe', {subscription_id:'sub-a'})
})
it('answers direct-agent approvals with their lane identity and reports a rejected decision', async () => {
  const g = gateway()
  const {result} = renderHook(() => useConversation(g.client, 'a'))
  await waitFor(() => expect(result.current.ready).toBe(true))
  act(() => g.notify('approval.request', {conversation_id:'a#Raven-Code/code-1',approval_id:'direct',description:'Run a command'}))
  expect(result.current.requests).toHaveLength(1)
  g.call.mockResolvedValueOnce({ok:false})
  await act(async () => result.current.respond(result.current.requests[0], 'allow'))
  expect(g.call).toHaveBeenCalledWith('approval.respond', {session_id:'a#Raven-Code/code-1',approval_id:'direct',choice:'allow'})
  expect(result.current.error).toContain('did not accept')
  expect(result.current.requests).toHaveLength(1)
})

it('refreshes selected delegated history through completion, replacing live rows', async () => {
  vi.useFakeTimers()
  const target = {agent:'Raven-Code',handle:'delegated'}, key = laneKey(target)
  let complete = false
  const g = gateway({'subagents.instance.history': () => ({turns:[
    {role:'user',content:'Delegated task',live:!complete},
    {role:'assistant',content:complete ? 'Finished answer' : 'Partial answer',live:!complete},
  ]})})
  const {result, rerender} = renderHook(({selected}) => useConversation(g.client, 'a', selected), {initialProps:{selected:target as Target | null}})
  await act(async () => {})
  expect(result.current.lanes[key].messages.at(-1)?.text).toBe('Partial answer')
  expect(result.current.lanes[key].running).toBe(true)
  complete = true
  await act(async () => {await vi.advanceTimersByTimeAsync(4000)})
  expect(result.current.lanes[key].messages.at(-1)?.text).toBe('Finished answer')
  expect(result.current.lanes[key].running).toBe(false)
  expect(result.current.lanes[key].messages).toHaveLength(2)
  rerender({selected:null}); rerender({selected:target})
  await act(async () => {})
  expect(g.call.mock.calls.filter(([method]) => method === 'subagents.instance.history')).toHaveLength(3)
})

it('hydrates saved direct history during replay without duplicating the streamed answer', async () => {
  vi.useFakeTimers()
  const target = {agent:'Raven-Code',handle:'direct'}, key = laneKey(target)
  let complete = false
  const g = gateway({
    'session.resume': () => ({session_id:'a',messages:[],info:{model:'test',running:false}}),
    'turn.subscribe': () => {g.event('message.start',{target,turn_id:'direct'}); g.event('token.delta',{target,turn_id:'direct',text:'Partial'}); return {subscription_id:'sub-a',running:true}},
    'subagents.instance.history': () => ({turns:[
      {role:'user',content:'Earlier question'}, {role:'assistant',content:'Earlier answer'},
      {role:'user',content:'Current question',live:!complete}, {role:'assistant',content:'Partial answer',live:!complete},
    ]}),
  })
  const {result} = renderHook(() => useConversation(g.client, 'a', target))
  await act(async () => {})
  expect(result.current.lanes[key].messages.map(m => m.text)).toEqual(['Earlier question','Earlier answer','Current question'])
  expect(result.current.lanes[key].text).toBe('Partial')
  act(() => g.event('token.delta',{target,turn_id:'direct',text:' answer'}))
  await act(async () => {await vi.advanceTimersByTimeAsync(4000)})
  expect(result.current.lanes[key].text).toBe('Partial answer')
  expect(result.current.lanes[key].messages).toHaveLength(3)
  complete = true
  act(() => g.event('message.complete',{target,turn_id:'direct'}))
  await act(async () => {await vi.advanceTimersByTimeAsync(4000)})
  expect(result.current.lanes[key].messages.map(m => m.text)).toEqual(['Earlier question','Earlier answer','Current question','Partial answer'])
  expect(result.current.lanes[key].running).toBe(false)
  expect(result.current.lanes[key].text).toBe('')
})

it.each([false,true])('does not inherit specialist activity, including a host finishing in the subscription gap (initial host running: %s)', async (initiallyRunning) => {
  let resumes = 0
  const target = {agent:'Raven-Code',handle:'direct'}
  const g = gateway({
    'session.resume': () => ({session_id:'a', messages:++resumes === 1 ? [] : [{role:'assistant',text:'Host finished'}], info:{model:'test',running:resumes === 1 && initiallyRunning}}),
    'turn.subscribe': () => {g.event('message.start',{target,turn_id:'direct'}); return {subscription_id:'sub-a',running:true}},
  })
  const {result} = renderHook(() => useConversation(g.client, 'a'))
  await waitFor(() => expect(result.current.ready).toBe(true))
  expect(result.current.lanes.host.running).toBe(false)
  expect(result.current.lanes.host.messages[0].text).toBe('Host finished')
  expect(result.current.lanes[laneKey(target)].running).toBe(true)
  act(() => g.event('message.complete',{target,turn_id:'direct'}))
  expect(result.current.lanes.host.running).toBe(false)
})

it('does not overwrite a completed direct turn with an older in-flight history response', async () => {
  vi.useFakeTimers()
  const target = {agent:'Raven-Code',handle:'direct'}, key = laneKey(target)
  let resolveHistory!: (result: unknown) => void
  const g = gateway({
    'subagents.instance.history': () => new Promise(resolve => {resolveHistory = resolve}),
    'turn.subscribe': () => {g.event('message.start',{target,turn_id:'direct'}); g.event('token.delta',{target,turn_id:'direct',text:'Complete answer'}); return {subscription_id:'sub-a',running:true}},
  })
  const {result} = renderHook(() => useConversation(g.client, 'a', target))
  await act(async () => {})
  act(() => g.event('message.complete',{target,turn_id:'direct'}))
  await act(async () => resolveHistory({turns:[{role:'assistant',content:'Stale partial',live:true}]}))
  expect(result.current.lanes[key].running).toBe(false)
  expect(result.current.lanes[key].messages.at(-1)?.text).toBe('Complete answer')
})
