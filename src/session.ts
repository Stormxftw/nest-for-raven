/** Turn state stays separated by addressee, including simultaneous host/agent turns. */
import {laneKey, type Message, type TurnEvent} from './types'
export interface Lane {messages: Message[]; text: string; running: boolean; streaming: boolean; turnId?: string; error: string; activity: string[]}
export const emptyLane = (): Lane => ({messages: [], text: '', running: false, streaming: false, error: '', activity: []})
export type Lanes = Record<string, Lane>
export function reduceEvent(state: Lanes, event: TurnEvent): Lanes {
  const key = laneKey(event.payload.target)
  const lane = state[key] || emptyLane()
  const p = event.payload
  if (p.turn_id && lane.turnId && p.turn_id !== lane.turnId && !['message.start','turn.started'].includes(event.type)) return state
  let next = {...lane}
  switch (event.type) {
    case 'turn.started':
    case 'message.start':
      next = {...lane, running: true, streaming: true, error: '', turnId: p.turn_id || lane.turnId}
      break
    case 'token.delta': next.text += p.text || ''; next.running = true; next.streaming = true; break
    case 'tool.start':
      next.activity = [...lane.activity, `${p.name || 'Tool'} · running`].slice(-8)
      break
    case 'tool.complete':
      next.activity = [...lane.activity, String(p.result_preview || 'Tool completed').slice(0, 300)].slice(-8)
      break
    case 'message.complete':
      next = {...lane, messages: lane.text ? [...lane.messages, {role: 'assistant', text: lane.text}] : lane.messages, text: '', running: false, streaming: false, turnId: undefined}
      break
    case 'error':
      next = {...lane, running: false, streaming: false, turnId: undefined, error: p.message || 'Raven could not complete this turn.'}
      break
    default: return state
  }
  return {...state, [key]: next}
}
