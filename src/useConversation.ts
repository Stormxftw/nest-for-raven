/** Session subscriptions, targeted turns, and human decisions for the active mission. */
import {useEffect, useRef, useState} from 'react'
import type {RavenRpc} from './rpc'
import {emptyLane, reduceEvent, type Lanes} from './session'
import {laneKey, type Instance, type Message, type RequestCard, type Target, type TurnEvent} from './types'

export function useConversation(client: RavenRpc | null, sessionId: string, target?: Target | null) {
  const [lanes, setLanes] = useState<Lanes>({})
  const [instances, setInstances] = useState<Instance[]>([])
  const [handoffs, setHandoffs] = useState(0)
  const [requests, setRequests] = useState<RequestCard[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [model, setModel] = useState('')
  const generation = useRef(0)
  const sending = useRef(new Set<string>())
  const revisions = useRef<Record<string, number>>({})
  const state = useRef(lanes); state.current = lanes

  useEffect(() => {
    const epoch = ++generation.current
    let active = true, subscription = ''
    const early: {subscription_id: string; event: TurnEvent}[] = []
    setLanes({}); setInstances([]); setRequests([]); setReady(false); setError(''); setModel(''); setHandoffs(0)
    sending.current.clear()
    revisions.current = {}
    if (!client || !sessionId) return
    const current = () => active && generation.current === epoch
    const onEvent = (event: TurnEvent) => {
      if (['message.start', 'turn.started', 'message.complete', 'error'].includes(event.type)) {
        const key = laneKey(event.payload.target)
        revisions.current[key] = (revisions.current[key] || 0) + 1
      }
      setLanes(s => reduceEvent(s, event))
    }
    const addRequest = (method: string, p: Record<string, unknown>) => {
      const conversation = String(p.conversation_id || p.session_id || '')
      if (conversation !== sessionId && !conversation.startsWith(`${sessionId}#`)) return
      const id = String(p.approval_id || p.request_id || '')
      if (!id) return
      if (method.endsWith('.closed')) { setRequests(r => r.filter(x => x.id !== id)); return }
      const kind = method.split('.')[0] as RequestCard['kind']
      const request: RequestCard = {kind, id, conversation, title: String(p.description || p.question || p.prompt || p.label || 'Raven needs your input'), command: typeof p.command === 'string' ? p.command : undefined, choices: p.choices as string[] | undefined, batch: p.batch as RequestCard['batch'], origin: (p.origin as {name?: string} | undefined)?.name}
      setRequests(r => [...r.filter(x => x.id !== id), request])
    }
    const off = client.onNotification((method, params) => {
      if (!current() || !params || typeof params !== 'object') return
      if (method === 'event') {
        const envelope = params as {subscription_id: string; event: TurnEvent}
        if (!subscription) { if (early.length < 512) early.push(envelope); return }
        if (envelope.subscription_id === subscription) onEvent(envelope.event)
      } else if (/^(approval|clarify|confirm|credential)\.(request|closed)$/.test(method)) addRequest(method, params as Record<string, unknown>)
    })
    const roster = async () => {
      const result = await client.call<{instances: Instance[]; pending_handoff_count: number}>('subagents.instances', {session_key: sessionId})
      if (current()) { setInstances(result.instances); setHandoffs(result.pending_handoff_count) }
    }
    const start = async () => {
      try {
        const resumed = await client.call<{session_id: string; messages: Message[]; info: {model: string; running?: boolean}}>('session.resume', {session_id: sessionId})
        if (!current()) return
        if (resumed.session_id !== sessionId) throw new Error('This session is no longer available. Choose another mission.')
        setModel(resumed.info.model)
        setLanes({host: {...emptyLane(), running: !!resumed.info.running, messages: resumed.messages.map(m => ({...m, text: m.text || ''}))}})
        const sub = await client.call<{subscription_id: string; running?: boolean}>('turn.subscribe', {session_key: sessionId})
        subscription = sub.subscription_id
        if (!current()) { await client.call('turn.unsubscribe', {subscription_id: subscription}); return }
        for (const e of early) if (e.subscription_id === subscription) onEvent(e.event)
        early.length = 0
        // subscribe.running is session-wide, including specialists. Close the
        // resume/subscribe gap with a host-specific read, unless a newer host
        // boundary arrives while that read is in flight.
        const hostRevision = revisions.current.host || 0
        const after = await client.call<{messages: Message[]; info: {running?: boolean}}>('session.resume', {session_id: sessionId})
        if (current()) setLanes(s => (revisions.current.host || 0) !== hostRevision ? s : {
          ...s, host: after.info.running
            ? {...(s.host || emptyLane()), running: true}
            : {...emptyLane(), messages: after.messages.map(m => ({...m, text: m.text || ''}))},
        })
        const pending = await client.call<{requests: Record<string, unknown>[]}>('approval.pending', {})
        if (!current()) return
        for (const p of pending.requests) addRequest('approval.request', p)
        await roster()
        if (current()) setReady(true)
      } catch (e) { if (current()) setError((e as Error).message) }
    }
    void start()
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => { try { await roster() } catch { /* Connection state is reported by the transport. */ } if (current()) timer = setTimeout(poll, 4000) }
    timer = setTimeout(poll, 4000)
    return () => { active = false; off(); clearTimeout(timer); if (subscription) void client.call('turn.unsubscribe', {subscription_id: subscription}).catch(() => {}) }
  }, [client, sessionId])

  useEffect(() => {
    if (!client || !sessionId || !target || !ready) return
    let active = true, timer: ReturnType<typeof setTimeout>
    const key = laneKey(target), epoch = generation.current
    const current = () => active && generation.current === epoch
    const read = async () => {
      const revision = revisions.current[key] || 0
      try {
        const result = await client.call<{turns: {role: string; content: string; live?: boolean}[]}>('subagents.instance.history', {session_key: sessionId, ...target})
        if (current()) setLanes(s => {
          if ((revisions.current[key] || 0) !== revision) return s
          const lane = s[key] || emptyLane(), live = result.turns.some(t => t.live)
          // A live direct answer already arrives as deltas. Keep its stream,
          // hydrate the saved past and live prompt, and omit duplicated answer
          // rows. A snapshot outside this direct turn waits for its boundary.
          if (lane.streaming && !live) return s
          const messages = result.turns.filter(t => !(lane.streaming && t.live && t.role === 'assistant')).map(t => ({role: t.role, text: t.content}))
          return {...s, [key]: lane.streaming ? {...lane, messages} : {...lane, messages, text: '', running: live, turnId: undefined}}
        })
      } catch (e) { if (current()) setError((e as Error).message) }
      if (current()) timer = setTimeout(read, 4000)
    }
    void read()
    return () => {active = false; clearTimeout(timer)}
  }, [client, sessionId, target?.agent, target?.handle, ready])

  async function send(text: string, target?: Target | null) {
    if (!client || !ready || !text.trim()) return false
    const key = laneKey(target), epoch = generation.current
    if (sending.current.has(key)) return false
    sending.current.add(key)
    const wasRunning = state.current[key]?.running
    const wasStreaming = state.current[key]?.streaming
    revisions.current[key] = (revisions.current[key] || 0) + 1
    const id = crypto.randomUUID()
    setLanes(s => ({...s, [key]: {...(s[key] || emptyLane()), text: wasRunning ? s[key]?.text || '' : '', turnId: wasRunning ? s[key]?.turnId : undefined, running: true, streaming: true, error: '', messages: [...(s[key]?.messages || []), ...(!wasRunning && s[key]?.text ? [{role:'assistant', text:s[key].text}] : []), {id, role: 'user', text}]}}))
    try {
      const result = await client.call<{accepted: boolean; turn_id: string}>('turn.send', {session_key: sessionId, content: text, ...(target ? {target} : {}), ...(wasRunning ? {busy: 'inject'} : {})})
      if (!result.accepted) throw new Error('Raven did not accept this message.')
      return true
    } catch (e) {
      if (epoch === generation.current) setLanes(s => ({...s, [key]: {...(s[key] || emptyLane()), running: !!wasRunning, streaming: !!wasStreaming, messages: (s[key]?.messages || []).filter(m => m.id !== id), error: (e as Error).message}}))
      return false
    } finally { if (epoch === generation.current) sending.current.delete(key) }
  }
  async function cancel(target?: Target | null) {
    if (!client) return
    const epoch = generation.current, key = laneKey(target), turnId = state.current[key]?.turnId
    try {
      await client.call('turn.cancel', {session_key: sessionId, ...(target ? {target} : {}), ...(turnId ? {turn_id: turnId} : {})})
    } catch (e) { if (epoch === generation.current) setError((e as Error).message) }
  }
  async function respond(request: RequestCard, answer: string, answers?: string[]) {
    if (!client) return
    const epoch = generation.current
    try {
      let result: {ok: boolean}
      if (request.kind === 'approval') result = await client.call('approval.respond', {approval_id: request.id, session_id: request.conversation, choice: answer})
      else if (request.kind === 'clarify') result = await client.call('clarify.respond', {request_id: request.id, answer, ...(answers ? {answers} : {})})
      else if (request.kind === 'confirm') result = await client.call('confirm.respond', {request_id: request.id, answer: answer === 'yes'})
      else throw new Error('Use Raven’s native interface for credential requests.')
      if (!result.ok) throw new Error('This request has expired or was already answered. Raven did not accept this response.')
      if (epoch === generation.current) setRequests(r => r.filter(x => x.id !== request.id))
    } catch (e) { if (epoch === generation.current) setError((e as Error).message) }
  }
  return {lanes, instances, handoffs, requests, ready, error, model, send, cancel, respond}
}
