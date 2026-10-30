/** Conversation-first workspace for Raven's host and persistent specialist agents. */
import {useEffect, useMemo, useRef, useState} from 'react'
import {Background, BackgroundVariant, Controls, Handle, Position, ReactFlow, type NodeProps, type Node, type Edge} from '@xyflow/react'
import {ArrowRight, ArrowUp, Bird, Braces, ChevronDown, Compass, FileText, GitBranch, MessageSquare, Network, Plus, Radio, Search, Settings2, Sparkles, Square, Terminal, X} from 'lucide-react'
import {demoSession, exampleDetail, exampleTasks} from './demo'
import {RavenRpc} from './rpc'
import {useConversation} from './useConversation'
import {Decision} from './Decision'
import {emptyLane} from './session'
import {attention, laneKey, statusLabel, type Detail, type Instance, type Session, type Target, type Task} from './types'
import '@xyflow/react/dist/style.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './styles.css'

const tone = (agent: string) => agent.includes('Research') ? 'cyan' : agent.includes('Design') ? 'pink' : agent.includes('Code') ? 'violet' : agent.includes('Oncall') ? 'amber' : 'mint'
const AgentIcon = ({agent, size = 18}: {agent: string; size?: number}) => {
  const Icon = agent.includes('Research') ? Compass : agent.includes('Design') ? Sparkles : agent.includes('Code') ? Braces : Bird
  return <Icon size={size}/>
}
type NodeData = {agent: string; title: string; status: string; selected: boolean; [key: string]: unknown}
function AgentNode({data}: NodeProps<Node<NodeData>>) {
  return <div className={`orbit-node ${tone(data.agent)} ${data.selected ? 'selected' : ''}`}><Handle type="target" position={Position.Top}/><span className="orbit-avatar"><AgentIcon agent={data.agent} size={22}/><i className={`status-dot ${data.status}`}/></span><strong>{data.title}</strong><small>{data.agent.replace('Raven-', '')}</small><Handle type="source" position={Position.Bottom}/></div>
}
const nodeTypes = {agent: AgentNode}
const sampleInstances: Instance[] = [
  {agent: 'Raven-Research', handle: 'research', title: 'Understand the audience', resumable: true},
  {agent: 'Raven-Design', handle: 'design', title: 'Define the visual language', resumable: true},
  {agent: 'Raven-Code', handle: 'build', title: 'Build the first experience', resumable: true},
]

export default function App() {
  const [mode, setMode] = useState<'example' | 'live'>('example')
  const [connection, setConnection] = useState<'offline' | 'connecting' | 'connected'>('offline')
  const [client, setClient] = useState<RavenRpc | null>(null)
  const clientRef = useRef<RavenRpc | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [target, setTarget] = useState<Target | null>(null)
  const [selectedNode, setSelectedNode] = useState('build')
  const [query, setQuery] = useState('')
  const [drafts, setDrafts] = useState<Record<string,string>>({})
  const [error, setError] = useState('')
  const [providerReady, setProviderReady] = useState(false)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [detailError, setDetailError] = useState('')
  const [detailTab, setDetailTab] = useState<'output' | 'prompt' | 'files'>('output')
  const [mobileView, setMobileView] = useState('conversation')
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const [tick, setTick] = useState(0)
  const [exampleStep, setExampleStep] = useState(0)
  const [showTools, setShowTools] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const transcript = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const example = mode === 'example'
  const conversation = useConversation(connection === 'connected' && !example ? client : null, !example ? sessionId : '', target)
  const activeTasks = useMemo(() => example ? exampleTasks(exampleStep) : tasks, [example, exampleStep, tasks])
  const allNodes = activeTasks.flatMap(task => task.nodes.map(node => ({task, node})))
  const nodeKey = (task: Task, id: string) => example ? id : JSON.stringify([task.kind, task.id, id])
  const selected = allNodes.find(n => nodeKey(n.task, n.node.node_id) === selectedNode)
  const instances = example ? sampleInstances : conversation.instances
  const activeSession = example ? demoSession : sessions.find(s => s.id === sessionId)
  const targetName = target?.agent || 'Raven'
  const lane = conversation.lanes[laneKey(target)] || emptyLane()
  const draftKey = `${mode}:${sessionId}:${laneKey(target)}`
  const draft = drafts[draftKey] || ''
  const setDraft = (value: string) => setDrafts(d => ({...d, [draftKey]: value}))
  const live = connection === 'connected' && !example
  const sendEnabled = live && providerReady && conversation.ready && !!draft.trim() && !sending && !creating

  useEffect(() => () => clientRef.current?.close(), [])
  useEffect(() => {setTarget(null); setSelectedNode(example ? 'build' : ''); setDetail(null); pinned.current = true}, [sessionId, example])
  useEffect(() => {if (pinned.current && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight}, [lane.text, lane.messages.length, target])
  useEffect(() => {
    if (!live || !client) return
    let active = true, timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        const result = await client.call<{sessions: Session[]}>('session.list', {limit: 100})
        if (!active) return
        setSessions(previous => [...result.sessions, ...previous.filter(s => s.id === sessionId && !result.sessions.some(n => n.id === s.id))])
        if (sessionId) {const result = await client.call<{tasks: Task[]}>('tasks.list', {session_key: sessionId}); if (active) setTasks(result.tasks)}
      } catch (e) {if (active) setError((e as Error).message)}
      if (active) timer = setTimeout(poll, 4000)
    }
    void poll(); return () => {active = false; clearTimeout(timer)}
  }, [live, client, sessionId, tick])
  useEffect(() => {
    setDetail(null); setDetailError('')
    if (!selected) return
    if (example) {setDetail(exampleDetail[selected.node.node_id]); return}
    if (!client || !live) {setDetailError('Reconnect to load this step.'); return}
    let active = true
    const read = async () => {
      try {
        const detail = selected.task.kind === 'dag'
          ? (await client.call<{node: Detail}>('dag.node', {run_id: selected.task.id, node: selected.node.node_id, session_key: sessionId, max_output_chars: 20000})).node
          : await client.call<Detail>('subagent.context', {id: selected.task.id, session_id: sessionId})
        if (active) setDetail(detail)
      } catch (e) {if (active) setDetailError((e as Error).message)}
    }
    void read(); return () => {active = false}
  }, [selectedNode, sessionId, example, client, live, selected?.node.status, tick])

  async function connect() {
    clientRef.current?.close()
    const next = new RavenRpc(); clientRef.current = next
    setConnection('connecting'); setError('')
    next.onDisconnect = () => {if (clientRef.current === next) {setConnection('offline'); setError('Raven disconnected. Reconnect before sending; your draft is still here.')}}
    try {
      await next.connect()
      const [setup, list] = await Promise.all([next.call<{provider_configured: boolean}>('setup.status', {}), next.call<{sessions: Session[]}>('session.list', {limit: 100})])
      if (clientRef.current !== next) return
      setClient(next); setProviderReady(setup.provider_configured); setSessions(list.sessions); setTasks([]); setTarget(null)
      setSessionId(id => list.sessions.some(s => s.id === id) ? id : list.sessions[0]?.id || '')
      setMode('live'); setConnection('connected'); dialog.current?.close()
    } catch (e) {if (clientRef.current === next) {next.close(); setConnection('offline'); setError((e as Error).message)}}
  }
  async function newMission() {
    if (!live || !client) {dialog.current?.showModal(); return}
    if (creating) return
    setCreating(true); setError('')
    try {
      const result = await client.call<{session_id: string}>('session.create', {})
      if (clientRef.current !== client) return
      const id = result.session_id
      setSessions(s => [{id, title: 'New mission', preview: '', last_message_preview: '', message_count: 0, started_at: Date.now()/1000, updated_at: Date.now()/1000}, ...s])
      setTasks([]); setSessionId(id); setTarget(null)
    } catch(e) {if (clientRef.current === client) setError((e as Error).message)} finally {setCreating(false)}
  }
  function openExample() {clientRef.current?.close(); clientRef.current = null; setClient(null); setConnection('offline'); setMode('example'); setError(''); setTarget(null); setSelectedNode('build'); dialog.current?.close()}
  function chooseTarget(instance?: Instance) {setTarget(instance ? {agent: instance.agent, handle: instance.handle} : null); pinned.current = true}
  async function submit() {
    if (!sendEnabled) return
    const original = draft, originalKey = draftKey
    setSending(true)
    try {if (await conversation.send(original, target)) {setDrafts(d => d[originalKey] === original ? {...d, [originalKey]: ''} : d); setTick(v => v + 1)}} finally {setSending(false)}
  }
  const messages = example ? target ? [{role:'user', text: exampleDetail[target.handle]?.prompt || 'Work on this part of the mission.'}, {role:'assistant',text:exampleDetail[target.handle]?.output || 'Example specialist conversation.'}] : [
    {role:'user', text:'Build a small idea notebook. Research who it is for, give it a distinctive visual direction, then build and review the first experience.'},
    {role:'assistant', text:'I’ve split the mission between Research, Design, and Code. Research is informing the visual direction, while Code is building the first usable flow.\n\nYou can open a specialist’s conversation at any point. When you return to me, Raven includes those side conversations in the handoff.'},
  ] : lane.messages
  const nodes: Node<NodeData>[] = [{id:'host',type:'agent',position:{x:140,y:0},data:{agent:'Raven',title:'Mission host',status:example || activeSession?.running ? 'running':'unknown',selected:!selectedNode}}, ...allNodes.map(({task,node},i) => ({id:nodeKey(task,node.node_id),type:'agent',position:{x:(i%3)*145,y:150+Math.floor(i/3)*170},data:{agent:node.agent,title:node.node_summary || node.node_id,status:node.status,selected:nodeKey(task,node.node_id) === selectedNode}}))]
  const edges: Edge[] = allNodes.flatMap(({task,node}) => (node.depends_on.length ? node.depends_on.filter(id => task.nodes.some(n => n.node_id === id)).map(id => nodeKey(task,id)) : ['host']).map(source => ({id:JSON.stringify([source,nodeKey(task,node.node_id)]),source,target:nodeKey(task,node.node_id),type:'default',animated:node.status === 'running',style:{stroke:({cyan:'#4dd8ea',pink:'#f781bd',violet:'#aa92ff',mint:'#58ddbe',amber:'#ffbe73'})[tone(node.agent)],strokeWidth:1.3,opacity:.6}})))
  const selectedInstance = selected && instances.find(i => i.resumable && (i.nodeId === selected.node.node_id || (i.agent === selected.node.agent && i.handle === selected.node.instance) || (example && i.handle === selected.node.node_id)))
  const nodeOutput = detail?.output || detail?.messages?.filter(m => m.role !== 'user').map(m => m.text).filter(Boolean).join('\n\n')
  const nodePrompt = detail?.prompt || selected?.node.prompt_template || detail?.messages?.find(m => m.role === 'user')?.text

  return <div className={`workspace-shell view-${mobileView}`}>
    <nav className="icon-rail" aria-label="Workspace"><a href="/" className="logo" aria-label="Raven workspace"><Bird size={24}/></a><button className="rail-selected" title="Conversation" aria-label="Show conversation" onClick={() => setMobileView('conversation')}><MessageSquare size={19}/></button><button title="Team map" aria-label="Show team map" onClick={() => setMobileView('map')}><Network size={20}/></button><span className="rail-spacer"/><button title="Connection settings" aria-label="Connection settings" onClick={() => dialog.current?.showModal()}><Settings2 size={19}/></button><span className="user-avatar">J</span></nav>
    <aside className="session-rail"><div className="space-label">raven <span>SPACE / 01</span></div><button className="new-mission" onClick={() => void newMission()} disabled={creating}><Plus size={15}/>{creating ? 'Creating…' : 'New mission'}<span>↗</span></button><label className="search"><Search size={13}/><input aria-label="Search missions" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a mission"/></label><div className="rail-caption">MISSIONS</div><div className="session-list">{(example ? [demoSession] : sessions).filter(s => `${s.title} ${s.preview}`.toLowerCase().includes(query.toLowerCase())).map(s => <button key={s.id} className={activeSession?.id === s.id ? 'active' : ''} onClick={() => {setSessionId(s.id); setTasks([])}}><span className={`status-dot ${s.running ? 'running' : 'unknown'}`}/><span>{s.title || s.preview || 'Untitled mission'}</span></button>)}</div><div className="rail-caption team-caption">IN THIS MISSION <span>{instances.length + 1}</span></div><button className={`team-member mint ${!target ? 'active' : ''}`} onClick={() => chooseTarget()}><span className="avatar"><Bird size={16}/></span><span>Raven<small>Host · orchestration</small></span><i className={`status-dot ${conversation.lanes.host?.running ? 'running' : 'unknown'}`}/></button>{instances.map(i => <button key={laneKey(i)} disabled={!i.resumable} className={`team-member ${tone(i.agent)} ${laneKey(target) === laneKey(i) ? 'active' : ''}`} onClick={() => chooseTarget(i)} title={i.resumable ? i.title || i.handle : 'This agent does not support a persistent conversation'}><span className="avatar"><AgentIcon agent={i.agent} size={16}/></span><span>{i.agent.replace('Raven-','')}<small>{i.handle}</small></span><i className={`status-dot ${i.turnStartedAtMs ? 'running' : 'unknown'}`}/></button>)}<div className="rail-bottom"><div className="connection-line"><i className={`status-dot ${live ? 'running' : 'unknown'}`}/>{example ? 'Example workspace' : live ? 'Local Raven connected' : 'Disconnected'}</div><button onClick={() => dialog.current?.showModal()}>{live ? 'Connection settings' : 'Connect your Raven'}<ArrowRight size={12}/></button></div></aside>
    <main className="mission-workspace"><header className="mission-topbar"><div className="breadcrumb"><span>Personal</span><span>/</span><strong>{activeSession?.title || 'New mission'}</strong></div><div className="header-actions"><span className="mode-badge">{example ? 'EXAMPLE' : live ? 'LIVE' : 'OFFLINE'}</span><button className="mobile-new" title="New mission" aria-label="New mission" onClick={() => void newMission()}><Plus size={16}/></button><button aria-label="Connection and help" onClick={() => dialog.current?.showModal()}><Settings2 size={16}/></button></div></header>
      <div className="mobile-tabs"><button onClick={() => setMobileView('conversation')}>Conversation</button><button onClick={() => setMobileView('map')}>Team map</button><select aria-label="Active mission" value={example ? demoSession.id : sessionId} onChange={e => {setSessionId(e.target.value); setTasks([])}}>{(example ? [demoSession] : sessions).map(s => <option key={s.id} value={s.id}>{s.title || 'Untitled'}</option>)}</select></div>
      {(error || conversation.error) && <div className="error-banner" role="alert"><span>{error || conversation.error}</span><button onClick={() => {setError(''); dialog.current?.showModal()}}>Connection</button></div>}
      <div className="work-columns"><section className="conversation-panel" aria-label="Conversation"><div className={`conversation-heading ${tone(targetName)}`}><span className="avatar"><AgentIcon agent={targetName}/></span><div><strong>{target ? target.agent : 'Raven'} <span>{target ? 'DIRECT CONVERSATION' : 'MISSION HOST'}</span></strong><small>{target ? `Speaking to ${target.handle}. Side conversations are handed back to the host.` : 'One conversation. A team of specialists behind it.'}</small></div>{target && <button onClick={() => chooseTarget()} className="back-host">Back to host <ArrowRight size={12}/></button>}</div>
        {conversation.handoffs > 0 && !target && !example && <div className="handoff"><GitBranch size={14}/>{conversation.handoffs} specialist updates ready for your next message to Raven.</div>}
        <div className="transcript" ref={transcript} onScroll={() => {const el = transcript.current; if(el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90}}>
          {!messages.length && !lane.text && <div className="welcome"><span className="welcome-symbol"><Bird size={28}/></span><span className="eyebrow">THINK BIG. WORK TOGETHER.</span><h1>What are we<br/>making happen?</h1><p>Give Raven the outcome. Follow the work, talk to a specialist, and bring it all back together.</p><button onClick={() => setDraft('Research the audience for a personal idea notebook. Then ask a coding specialist to propose the smallest useful prototype. Do not write files yet.')}><Compass size={16}/> Explore an idea <ArrowRight size={14}/></button><button onClick={() => setDraft('Review the current project and recommend one small, testable improvement. Do not change any files yet.')}><Braces size={16}/> Find the next useful change <ArrowRight size={14}/></button></div>}
          {messages.filter(m => m.text || ('tool_calls' in m && m.tool_calls?.length)).map((m,i) => <article className={`message ${m.role === 'user' ? 'user-message' : tone(targetName)}`} key={`${i}-${'id' in m ? m.id : ''}`}><div className="message-avatar">{m.role === 'user' ? 'J' : m.role === 'tool' ? <Terminal size={15}/> : <AgentIcon agent={targetName} size={16}/>}</div><div className="message-body"><div className="message-label">{m.role === 'user' ? 'You' : m.role === 'tool' ? 'Tool result' : targetName}{example && <span>EXAMPLE</span>}</div>{m.role === 'tool' ? <details><summary>View tool result</summary><pre>{m.text}</pre></details> : <div className="message-text">{m.text}</div>}{'tool_calls' in m && m.tool_calls?.map((tool,j) => <details key={j}><summary>{tool.name}</summary><pre>{tool.arguments}</pre></details>)}</div></article>)}
          {example && !target && <div className="delegation-strip"><div><GitBranch size={14}/><span>Three specialists. One connected mission.</span></div>{sampleInstances.map(i => <button key={i.handle} className={tone(i.agent)} onClick={() => chooseTarget(i)}><AgentIcon agent={i.agent} size={14}/>{i.agent.replace('Raven-','')}<ArrowRight size={12}/></button>)}</div>}
          {lane.text && !example && <article className={`message ${tone(targetName)}`}><div className="message-avatar"><AgentIcon agent={targetName} size={16}/></div><div className="message-body"><div className="message-label">{targetName}<span>LIVE</span></div><div className="message-text streaming">{lane.text}</div></div></article>}
          {lane.running && !example && !lane.text && <div className="thinking"><span/><span/><span/> {targetName} is working</div>}
          {!example && lane.activity.length > 0 && <div className="tool-activity"><button onClick={() => setShowTools(s => !s)}><Terminal size={13}/>{lane.activity.length} recent tool events <ChevronDown size={13}/></button>{showTools && lane.activity.map((line,i) => <pre key={i}>{line}</pre>)}</div>}
          {!example && conversation.requests.map(r => <Decision key={r.id} request={r} respond={conversation.respond}/>)}
          {lane.error && !example && <div className="turn-error" role="alert">{lane.error}</div>}
        </div>
        <div className={`composer-area ${tone(targetName)}`}><div className="composer-target"><span className="status-dot running"/>TO <select aria-label="Message recipient" value={laneKey(target)} onChange={e => chooseTarget(instances.find(i => laneKey(i) === e.target.value))}><option value="host">Raven · mission host</option>{instances.filter(i => i.resumable).map(i => <option key={laneKey(i)} value={laneKey(i)}>{i.agent} · {i.handle}</option>)}</select>{lane.running && !example && <span className="steer-label">Steer the running turn</span>}</div><div className="composer"><textarea disabled={creating} aria-label="Message to Raven" placeholder={target ? `Message ${target.agent}…` : 'Describe the outcome. Raven will assemble the work.'} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing){e.preventDefault(); void submit()}}}/><div className="composer-footer"><span><Sparkles size={13}/>{example ? 'Example · connect to send' : conversation.model || (providerReady ? 'Raven’s configured model' : 'No model configured')}</span><div>{!example && lane.running && <button className="stop-button" aria-label="Stop current turn" onClick={() => void conversation.cancel(target)}><Square size={12}/> Stop</button>}<button className="send-button" aria-label={lane.running ? 'Steer current turn' : 'Send message'} disabled={!sendEnabled} onClick={() => void submit()}><ArrowUp size={17}/></button></div></div></div><div className="composer-hint"><span>{example ? <button onClick={() => dialog.current?.showModal()}>Connect to make this a real conversation <ArrowRight size={11}/></button> : !providerReady ? 'Configure a provider in Raven, then reconnect.' : !sessionId ? 'Create a new mission to start.' : 'Enter to send · Shift + Enter for a new line'}</span><span>Raven Spatial / 0.2</span></div></div>
      </section>
      <aside className="spatial-panel" aria-label="Team and task map"><div className="map-heading"><div><Network size={15}/><strong>The work, connected</strong></div><span>{allNodes.length} STEPS</span></div><div className="map-meta"><span><i className="status-dot running"/>{allNodes.filter(n => n.node.status === 'running').length} working</span><span><i className="status-dot completed"/>{allNodes.filter(n => n.node.status === 'completed').length} complete</span><span><i className="status-dot exception"/>{allNodes.filter(n => attention(n.node.status)).length} need you</span></div><div className="mission-map"><ReactFlow key={`${mode}:${sessionId}:${allNodes.length}`} nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_, n) => {setSelectedNode(n.id === 'host' ? '' : n.id); setDetailTab('output')}} nodesDraggable={false} nodesConnectable={false} fitView fitViewOptions={{padding:.15,maxZoom:1}} minZoom={.3} maxZoom={1.6} colorMode="dark"><Background variant={BackgroundVariant.Dots} gap={20} color="#353745" size={.7}/><Controls showInteractive={false}/></ReactFlow>{!allNodes.length && <div className="map-empty">Delegated work appears here as Raven assembles the mission.</div>}</div>
        <section className="node-inspector" aria-label="Node inspector">{selected ? <><div className={`node-heading ${tone(selected.node.agent)}`}><span className="avatar"><AgentIcon agent={selected.node.agent} size={15}/></span><div><strong>{selected.node.node_summary || selected.node.node_id}</strong><small>{selected.node.agent} <span>· {statusLabel(selected.node.status)}</span></small></div>{selectedInstance && <button title="Talk to this agent" aria-label="Talk to selected agent" onClick={() => {chooseTarget(selectedInstance); setMobileView('conversation')}}><MessageSquare size={16}/></button>}</div><div className="node-tabs">{(['output','prompt','files'] as const).map(t => <button role="tab" aria-selected={detailTab === t} key={t} onClick={() => setDetailTab(t)}>{t[0].toUpperCase()+t.slice(1)}{t === 'files' ? ` ${selected.node.files.length}` : ''}</button>)}<button className="refresh-detail" onClick={() => setTick(v => v + 1)} aria-label="Refresh node output">↻</button></div><div className="node-content" role="tabpanel">{selected.node.error && <p className="turn-error">{selected.node.error}</p>}{detailTab === 'files' ? <>{selected.node.files.map(f => <div className="file-row" key={f.path}><FileText size={13}/>{f.path}</div>)}<small>{example ? 'Illustrative paths.' : 'Paths reported by Raven; file opening is not available yet.'}</small></> : detailError ? <p role="alert">{detailError}</p> : <pre>{detail ? (detailTab === 'output' ? nodeOutput || 'No output recorded yet.' : nodePrompt || 'No prompt reported.') : 'Reading this step…'}</pre>}{detail?.output_truncated && detailTab === 'output' && <small>Output truncated to 20,000 characters.</small>}</div>{selected.node.depends_on.length > 0 && <div className="dependency-links"><GitBranch size={12}/>After {selected.node.depends_on.map(dep => <button key={dep} onClick={() => setSelectedNode(nodeKey(selected.task,dep))}>{dep}</button>)}</div>}</> : <div className="map-explainer"><GitBranch size={20}/><h3>Follow a thread. Join a conversation.</h3><p>Select a task to inspect its output. Use the message icon to talk to a resumable specialist directly.</p></div>}</section>
        <footer className="map-footer"><span>{example ? 'Illustrative mission · no agents running' : 'Task snapshots every 4s · live conversation stream'}</span>{example ? <button onClick={() => setExampleStep(s => (s+1)%4)}>Replay step {exampleStep+1}/4 <ArrowRight size={11}/></button> : <button onClick={openExample}>Example <ArrowRight size={11}/></button>}</footer>
      </aside></div>
    </main>
    <dialog ref={dialog}><form method="dialog"><button className="close-dialog" aria-label="Close connection dialog"><X size={18}/></button></form><span className="dialog-icon"><Radio size={24}/></span><span className="eyebrow">YOUR HARNESS. YOUR WORKSPACE.</span><h2>Connect to Raven</h2><p>The local gateway stays in charge of your models, tools, and permissions.</p><ol><li>Start the gateway: <code>npm run raven</code></li><li>Sign in on this browser: <code>npm run sign-in</code></li><li>Connect, then open or create a mission.</li></ol><div className="gateway-address"><span>LOCAL GATEWAY</span><code>127.0.0.1:18792</code></div>{error && <p className="turn-error" role="alert">{error}</p>}<button className="connect-button" disabled={connection === 'connecting'} onClick={() => void connect()}>{connection === 'connecting' ? 'Connecting…' : 'Connect to Raven'}<ArrowRight size={15}/></button><button className="example-button" onClick={openExample}>Explore the example workspace</button></dialog>
  </div>
}
