/** JSON-RPC transport with bounded waits and explicit disconnect handling. */
export class RavenRpc {
  private socket?: WebSocket
  private nextId = 0
  private pending = new Map<number, {resolve: (data: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout>}>()
  onDisconnect = () => {}
  private listeners = new Set<(method: string, params: unknown) => void>()
  onNotification(listener: (method: string, params: unknown) => void) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  async connect(): Promise<void> {
    const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/rpc`)
    this.socket = socket
    socket.onmessage = event => {
      let frame
      try { frame = JSON.parse(String(event.data)) } catch { return }
      if (!frame || typeof frame !== 'object') return
      if (typeof frame.method === 'string' && frame.id == null) {
        for (const listener of this.listeners) listener(frame.method, frame.params)
        return
      }
      const request = this.pending.get(frame.id)
      if (!request) return
      clearTimeout(request.timer)
      this.pending.delete(frame.id)
      if (frame.error) request.reject(new Error(frame.error.data?.detail || frame.error.message || 'Raven rejected the request.'))
      else request.resolve(frame.result)
    }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { socket.close(); reject(new Error('Raven did not respond within 8 seconds.')) }, 8000)
      socket.onopen = () => { clearTimeout(timer); resolve() }
      socket.onerror = () => { clearTimeout(timer); reject(new Error('Could not connect. Start Raven and sign in on this browser first.')) }
      socket.onclose = () => {
        clearTimeout(timer)
        reject(new Error('Raven closed the connection. Sign in again, then reconnect.'))
        for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Connection lost.')) }
        this.pending.clear()
        this.onDisconnect()
      }
    })
    await this.call('system.hello', {client_version: '0.1.0', client_capabilities: [], surface: 'page'})
  }
  call<T>(method: string, params: object): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState !== WebSocket.OPEN) { reject(new Error('Raven is disconnected.')); return }
      const id = ++this.nextId
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`${method} timed out. Try refreshing.`)) }, 12000)
      this.pending.set(id, {resolve: value => resolve(value as T), reject, timer})
      this.socket.send(JSON.stringify({jsonrpc: '2.0', id, method, params}))
    })
  }
  close() { this.onDisconnect = () => {}; this.socket?.close() }
}
