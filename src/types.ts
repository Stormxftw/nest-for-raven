/** Raven RPC shapes used by the mission workspace. */
export type Status = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'interrupted' | 'exception' | 'not_executed' | 'unknown'
export interface Session {
  id: string; title: string; preview: string; last_message_preview: string;
  message_count: number; started_at: number; updated_at: number; running?: boolean
}
export interface TaskNode {
  node_id: string; node_summary?: string | null; agent: string; status: Status;
  depends_on: string[]; error?: string | null; tokens_in?: number | null;
  tokens_out?: number | null; tool_call_count?: number | null;
  started_at?: number | null; ended_at?: number | null;
  files: {path: string; [key: string]: unknown}[];
  prompt_template?: string | null
  instance?: string | null
}
export interface Task {
  id: string; kind: 'dag' | 'spawn'; task_summary?: string | null; status: Status;
  nodes: TaskNode[]; started_at?: number | null; ended_at?: number | null
}
export interface Detail {
  prompt?: string; output?: string; error?: string; output_truncated?: boolean;
  messages?: {role: string; text?: string}[]
}
export const statusLabel = (status: Status) => ({
  pending: 'Queued', running: 'Working', completed: 'Complete', failed: 'Failed',
  skipped: 'Skipped', cancelled: 'Cancelled', interrupted: 'Interrupted',
  exception: 'Needs attention', not_executed: 'Not executed', unknown: 'Unknown',
})[status] ?? status
export const attention = (status: Status) => ['failed', 'exception', 'interrupted'].includes(status)

export interface Target {agent: string; handle: string}
export interface Instance extends Target {resumable?: boolean; title?: string; status?: string; nodeId?: string; turnStartedAtMs?: number}
export interface Message {role: string; text: string; id?: string; tool_calls?: {name: string; arguments?: string}[]}
export interface TurnEvent {type: string; payload: {target?: Target; turn_id?: string; text?: string; content?: string; name?: string; message?: string; tool_call_id?: string; result_preview?: string; [key: string]: unknown}}
export interface RequestCard {kind: 'approval' | 'clarify' | 'confirm' | 'credential'; id: string; conversation: string; title: string; command?: string; choices?: string[]; batch?: {question: string; choices?: string[]; multi_select?: boolean}[]; origin?: string}
export const laneKey = (target?: Target | null) => target ? JSON.stringify([target.agent, target.handle]) : 'host'
