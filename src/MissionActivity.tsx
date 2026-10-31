import {Check, Flame, Pause, Sparkles} from 'lucide-react'
import {attention, type TaskNode} from './types'

/** Task-count progress is factual; the travelling spark only signals activity. */
export function MissionActivity({nodes, hostRunning, paused = false}: {nodes: TaskNode[]; hostRunning: boolean; paused?: boolean}) {
  const complete = nodes.filter(node => node.status === 'completed').length
  const working = nodes.filter(node => node.status === 'running').length
  const needsYou = nodes.filter(node => attention(node.status)).length
  const active = !paused && (working > 0 || hostRunning)
  const state = needsYou ? 'attention' : active ? 'working' : nodes.length && complete === nodes.length ? 'complete' : 'idle'
  const Icon = paused ? Pause : state === 'complete' ? Check : active ? Flame : Sparkles
  const label = paused ? 'Preview paused' : needsYou ? 'Needs your attention' : active ? 'Work in progress' : state === 'complete' ? 'Tasks complete' : 'Ready for work'
  return <div className="map-meta mission-activity" data-state={state} data-active={active}>
    <div className="activity-caption"><span><Icon size={14}/>{label}</span><span>{complete} / {nodes.length} tasks complete</span></div>
    <div className="activity-track" role={nodes.length ? 'progressbar' : undefined} aria-label={nodes.length ? 'Completed tasks' : undefined} aria-valuemin={nodes.length ? 0 : undefined} aria-valuemax={nodes.length || undefined} aria-valuenow={nodes.length ? complete : undefined} aria-valuetext={nodes.length ? `${complete} of ${nodes.length} reported tasks complete; tasks may take different amounts of time` : undefined}>
      <span className="activity-fill" style={{width:`${nodes.length ? complete / nodes.length * 100 : 0}%`}}/>
      {active && <span className="activity-flare" aria-hidden="true"><i/><i/><i/></span>}
    </div>
    <div className="activity-counts"><span><i className="status-dot running"/>{working} working</span><span><i className="status-dot completed"/>{complete} complete</span><span><i className="status-dot exception"/>{needsYou} need you</span></div>
  </div>
}
