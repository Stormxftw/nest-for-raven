/** Explicit, per-request decisions; no automatic or persistent permission grants. */
import {useState} from 'react'
import {ArrowUp, Check} from 'lucide-react'
import type {RequestCard} from './types'
export function Decision({request, respond}: {request: RequestCard; respond: (request: RequestCard, answer: string, answers?: string[]) => Promise<void>}) {
  const [answers, setAnswers] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const submit = async (answer: string, batch?: string[]) => {if (busy) return; setBusy(true); try {await respond(request, answer, batch)} finally {setBusy(false)}}
  return <section className="decision" aria-label="Raven needs your input"><div className="decision-label"><span className="status-dot exception"/>{request.origin || 'Raven'} needs your input</div><strong>{request.title}</strong>{request.command && <pre>{request.command}</pre>}
    {request.kind === 'approval' ? <div className="decision-actions"><button disabled={busy} onClick={() => void submit('deny')}>Deny</button><button className="allow" disabled={busy} onClick={() => void submit('allow')}>Allow once <Check size={13}/></button></div>
    : request.kind === 'confirm' ? <div className="decision-actions"><button disabled={busy} onClick={() => void submit('no')}>No</button><button className="allow" disabled={busy} onClick={() => void submit('yes')}>Yes</button></div>
    : request.kind === 'credential' ? <p>Complete this credential request in Raven’s native interface, or stop the turn. Secrets are not entered in this conversation.</p>
    : <form onSubmit={e => {e.preventDefault(); void submit(answers[0] || '', request.batch?.length ? answers : undefined)}}>{(request.batch?.length ? request.batch : [{question: request.title, choices: request.choices}]).map((q, i) => <label key={i}>{request.batch?.length ? q.question : 'Your answer'}{q.choices?.length ? <span className="choices">{q.choices.map(choice => <button type="button" key={choice} onClick={() => setAnswers(a => {const next = [...a]; next[i] = choice; return next})}>{choice}</button>)}</span> : null}<input required value={answers[i] || ''} onChange={e => setAnswers(a => {const next = [...a]; next[i] = e.target.value; return next})}/></label>)}<button className="allow" disabled={busy}>Send answer <ArrowUp size={13}/></button></form>}
  </section>
}
