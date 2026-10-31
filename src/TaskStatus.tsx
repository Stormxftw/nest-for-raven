import {CheckCircle2, CircleAlert, CircleDashed, CircleX, LoaderCircle} from 'lucide-react'
import {attention, statusLabel, type Status} from './types'

/** Keep the chart still; only the small working indicator moves. */
export function TaskStatus({status}: {status: Status}) {
  const Icon = status === 'running' ? LoaderCircle : status === 'completed' ? CheckCircle2
    : attention(status) ? CircleAlert : status === 'cancelled' ? CircleX : CircleDashed
  return <span className="node-status"><Icon size={13} className={status === 'running' ? 'status-spinner' : ''}/>{statusLabel(status)}</span>
}
