/** Verify failure behavior at the connection boundary without a running provider. */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {RavenRpc} from './rpc'
class Socket {
  static OPEN = 1
  static latest: Socket
  readyState = 1
  onopen?: () => void
  onclose?: () => void
  onerror?: () => void
  onmessage?: (event: {data: string}) => void
  sent: {id: number; method: string}[] = []
  constructor() { Socket.latest = this }
  send(text: string) { this.sent.push(JSON.parse(text)) }
  close() { this.readyState = 3; this.onclose?.() }
  reply(id: number, result: unknown) { this.onmessage?.({data: JSON.stringify({jsonrpc: '2.0', id, result})}) }
}
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('WebSocket', Socket); vi.stubGlobal('location', {protocol: 'http:', host: '127.0.0.1:4173'}) })
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
async function connected() {
  const client = new RavenRpc()
  const connecting = client.connect()
  Socket.latest.onopen?.()
  await Promise.resolve()
  Socket.latest.reply(Socket.latest.sent[0].id, {server_version: 'test'})
  await connecting
  return client
}
describe('Raven transport', () => {
  it('correlates out-of-order responses and ignores notifications', async () => {
    const client = await connected()
    const a = client.call('session.list', {})
    const b = client.call('tasks.list', {})
    Socket.latest.onmessage?.({data: JSON.stringify({method: 'turn.delta', params: {}})})
    Socket.latest.reply(3, {tasks: []}); Socket.latest.reply(2, {sessions: []})
    await expect(a).resolves.toEqual({sessions: []})
    await expect(b).resolves.toEqual({tasks: []})
    client.close()
  })
  it('rejects pending calls and reports a dropped connection', async () => {
    const client = await connected(); const changed = vi.fn(); client.onDisconnect = changed
    const result = expect(client.call('tasks.list', {})).rejects.toThrow('Connection lost')
    Socket.latest.close(); await result
    expect(changed).toHaveBeenCalledOnce()
  })
  it('expires requests instead of leaving a permanent loading state', async () => {
    const client = await connected()
    const result = expect(client.call('tasks.list', {})).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(12000); await result; client.close()
  })
  it('shows server error detail and ignores malformed frames', async () => {
    const client = await connected()
    const result = expect(client.call('dag.node', {})).rejects.toThrow('Node not found')
    Socket.latest.onmessage?.({data: 'not json'})
    Socket.latest.onmessage?.({data: JSON.stringify({id: 2, error: {message: 'internal_error', data: {detail: 'Node not found'}}})})
    await result; client.close()
  })
})
