/** Conversation-first workspace for Raven's host and persistent specialist agents. */
import {useEffect, useMemo, useRef, useState} from 'react'
import {Handle, MarkerType, Position, ReactFlow, type NodeChange, type NodeProps, type Node, type Edge} from '@xyflow/react'
import {ArrowRight, ArrowUp, ArrowUpToLine, Feather, SquareCode, ChevronDown, Compass, FileText, PenTool, GitBranch, Maximize2, MessageSquare, Minimize2, Network, Play, Plus, Radio, Search, Settings2, Sparkles, Square, Terminal, X} from 'lucide-react'
import {demoSession, exampleDetail, exampleTasks, motionExampleTasks, motionStages} from './demo'
import {TaskStatus} from './TaskStatus'
import {MissionActivity} from './MissionActivity'
import {CARD_HEIGHT, placeTaskNodes} from './mapLayout'
import {RavenRpc} from './rpc'
import {useConversation} from './useConversation'
import {Decision} from './Decision'
import {emptyLane} from './session'
import {laneKey, statusLabel, type Detail, type Instance, type Session, type Status, type Target, type Task} from './types'
import '@xyflow/react/dist/style.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './styles.css'

const tone = (agent: string) => agent.includes('Research') ? 'cyan' : agent.includes('Design') ? 'pink' : agent.includes('Code') ? 'violet' : agent.includes('Oncall') ? 'amber' : 'mint'
const AgentIcon = ({agent, size = 18}: {agent: string; size?: number}) => {
  const Icon = agent.includes('Research') ? Compass : agent.includes('Design') ? PenTool : agent.includes('Code') ? SquareCode : Feather
  return <Icon size={size} strokeWidth={1.7}/>
}
type NodeData = {agent: string; title: string; status: Status; selected: boolean; [key: string]: unknown}
function AgentNode({data}: NodeProps<Node<NodeData>>) {
  return <div className={`orbit-node ${tone(data.agent)} ${data.selected ? 'selected' : ''}`} data-status={data.status}><Handle type="target" position={Position.Top}/><div className="node-agent"><span className="orbit-avatar"><AgentIcon agent={data.agent} size={15}/></span><small>{data.agent.replace('Raven-', '')}</small></div><strong title={data.title}>{data.title}</strong><TaskStatus status={data.status}/><Handle type="source" position={Position.Bottom}/></div>
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
  const [detailTab, setDetailTab] = useState<'properties' | 'output' | 'prompt' | 'files'>('properties')
  const [mapExpanded, setMapExpanded] = useState(false)
  const [compactChart, setCompactChart] = useState(() => window.matchMedia('(max-width:740px)').matches)
  const [mobileView, setMobileView] = useState('conversation')
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const [tick, setTick] = useState(0)
  const [exampleStep, setExampleStep] = useState(0)
  const [motionStep, setMotionStep] = useState<number | null>(null)
  const [motionPlaying, setMotionPlaying] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const transcript = useRef<HTMLDivElement>(null)
  const chartScroll = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const example = mode === 'example'
  const mapScope = example ? 'example' : `live:${sessionId}`
  function changeNodes(changes: NodeChange[]) {
    const selection = changes.filter(change => change.type === 'select').find(change => change.selected)
    if (selection) {setSelectedNode(selection.id === 'host' ? '' : selection.id); setDetailTab('properties')}
  }
  const conversation = useConversation(connection === 'connected' && !example ? client : null, !example ? sessionId : '', target)
  const activeTasks = useMemo(() => example ? motionStep === null ? exampleTasks(exampleStep) : motionExampleTasks(motionStep) : tasks, [example, exampleStep, motionStep, tasks])
  const allNodes = useMemo(() => activeTasks.flatMap(task => task.nodes.map(node => ({task, node}))), [activeTasks])
  const nodeKey = (task: Task, id: string) => example ? id : JSON.stringify([task.kind, task.id, id])
  const layout = placeTaskNodes(allNodes.map(({task,node}) => ({id:nodeKey(task,node.node_id), parents:node.depends_on.map(id => nodeKey(task,id))})), compactChart)
  const positions = layout.positions
  useEffect(() => {
    const media = window.matchMedia('(max-width:740px)')
    const change = () => setCompactChart(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {chartScroll.current?.scrollTo({top:0,left:0})}, [mapScope])
  useEffect(() => {
    if (!example || !motionPlaying || motionStep === null) return
    if (motionStep === motionStages.length-1) {setMotionPlaying(false); return}
    const timer = setTimeout(() => setMotionStep(step => step === null ? null : step+1), 1800)
    return () => clearTimeout(timer)
  }, [example, motionPlaying, motionStep])
  useEffect(() => {
    if (!example) {setMotionPlaying(false); setMotionStep(null); return}
    if (motionStep !== null) setSelectedNode(motionStep === 0 ? 'design' : motionStep < 4 ? 'build' : 'review')
  }, [example, motionStep])
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
  function chooseTarget(instance?: Instance) {setMapExpanded(false); setMobileView('conversation'); setTarget(instance ? {agent: instance.agent, handle: instance.handle} : null); pinned.current = true}
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
  const nodes: Node<NodeData>[] = [{id:'host',type:'agent',position:positions.host,selected:!selectedNode,ariaLabel:'Mission host',width:layout.nodeWidth,height:CARD_HEIGHT,data:{agent:'Raven',title:'Mission host',status:example || activeSession?.running ? 'running':'unknown',selected:!selectedNode}}, ...allNodes.map(({task,node}) => ({id:nodeKey(task,node.node_id),type:'agent',position:positions[nodeKey(task,node.node_id)],selected:nodeKey(task,node.node_id) === selectedNode,ariaLabel:`${node.node_summary || node.node_id}, ${statusLabel(node.status)}`,width:layout.nodeWidth,height:CARD_HEIGHT,data:{agent:node.agent,title:node.node_summary || node.node_id,status:node.status,selected:nodeKey(task,node.node_id) === selectedNode}}))]
  const edges: Edge[] = allNodes.flatMap(({task,node}) => {
    const parents = node.depends_on.filter(id => task.nodes.some(n => n.node_id === id)).map(id => nodeKey(task,id))
    return (parents.length ? parents : ['host']).map(source => ({id:JSON.stringify([source,nodeKey(task,node.node_id)]),source,target:nodeKey(task,node.node_id),type:'smoothstep',pathOptions:{borderRadius:5,offset:16},markerEnd:{type:MarkerType.ArrowClosed,color:'#a79572'},style:{stroke:'#a79572',strokeWidth:1.3,strokeDasharray:source === 'host' ? '4 4' : undefined}}))
  })
  const selectedInstance = selected && instances.find(i => i.resumable && (i.nodeId === selected.node.node_id || (i.agent === selected.node.agent && i.handle === selected.node.instance) || (example && i.handle === selected.node.node_id)))
  const nodeOutput = detail?.output || detail?.messages?.filter(m => m.role !== 'user').map(m => m.text).filter(Boolean).join('\n\n')
  const nodePrompt = detail?.prompt || selected?.node.prompt_template || detail?.messages?.find(m => m.role === 'user')?.text

  return <div className={`workspace-shell view-${mobileView} ${mapExpanded ? 'map-expanded' : ''}`}>
    <nav className="icon-rail" aria-label="Workspace"><a href="/" className="logo" aria-label="Nest for Raven workspace"><Feather size={24}/></a><button className={!mapExpanded && mobileView !== 'map' ? 'rail-selected' : ''} title="Conversation" aria-label="Show conversation" onClick={() => {setMobileView('conversation'); setMapExpanded(false)}}><MessageSquare size={19}/></button><button className={mapExpanded || mobileView === 'map' ? 'rail-selected' : ''} title="Team map" aria-label="Show team map" onClick={() => {setMobileView('map'); setMapExpanded(true)}}><Network size={20}/></button><span className="rail-spacer"/><button title="Connection settings" aria-label="Connection settings" onClick={() => dialog.current?.showModal()}><Settings2 size={19}/></button><span className="user-avatar">J</span></nav>
    <aside className="session-rail"><div className="space-label">nest <span>FOR RAVEN</span></div><button className="new-mission" onClick={() => void newMission()} disabled={creating}><Plus size={15}/>{creating ? 'Creating…' : 'New mission'}<span>↗</span></button><label className="search"><Search size={13}/><input aria-label="Search missions" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a mission"/></label><div className="rail-caption">MISSIONS</div><div className="session-list">{(example ? [demoSession] : sessions).filter(s => `${s.title} ${s.preview}`.toLowerCase().includes(query.toLowerCase())).map(s => <button key={s.id} className={activeSession?.id === s.id ? 'active' : ''} onClick={() => {setSessionId(s.id); setTasks([])}}><span className={`status-dot ${s.running ? 'running' : 'unknown'}`}/><span>{s.title || s.preview || 'Untitled mission'}</span></button>)}</div><div className="rail-caption team-caption">IN THIS MISSION <span>{instances.length + 1}</span></div><button className={`team-member mint ${!target ? 'active' : ''}`} onClick={() => chooseTarget()}><span className="avatar"><Feather size={16}/></span><span>Raven<small>Host · orchestration</small></span><i className={`status-dot ${conversation.lanes.host?.running ? 'running' : 'unknown'}`}/></button>{instances.map(i => <button key={laneKey(i)} disabled={!i.resumable} className={`team-member ${tone(i.agent)} ${laneKey(target) === laneKey(i) ? 'active' : ''}`} onClick={() => chooseTarget(i)} title={i.resumable ? i.title || i.handle : 'This agent does not support a persistent conversation'}><span className="avatar"><AgentIcon agent={i.agent} size={16}/></span><span>{i.agent.replace('Raven-','')}<small>{i.handle}</small></span><i className={`status-dot ${i.turnStartedAtMs ? 'running' : 'unknown'}`}/></button>)}<div className="rail-bottom"><div className="connection-line"><i className={`status-dot ${live ? 'running' : 'unknown'}`}/>{example ? 'Example workspace' : live ? 'Local Raven connected' : 'Disconnected'}</div><button onClick={() => dialog.current?.showModal()}>{live ? 'Connection settings' : 'Connect your Raven'}<ArrowRight size={12}/></button></div></aside>
    <main className="mission-workspace"><header className="mission-topbar"><div className="breadcrumb"><span>Personal</span><span>/</span><strong>{activeSession?.title || 'New mission'}</strong></div><div className="header-actions"><span className="mode-badge">{example ? 'EXAMPLE' : live ? 'LIVE' : 'OFFLINE'}</span><button className="mobile-new" title="New mission" aria-label="New mission" onClick={() => void newMission()}><Plus size={16}/></button><button aria-label="Connection and help" onClick={() => dialog.current?.showModal()}><Settings2 size={16}/></button></div></header>
      <div className="mobile-tabs"><button onClick={() => {setMobileView('conversation'); setMapExpanded(false)}}>Conversation</button><button onClick={() => setMobileView('map')}>Team map</button><select aria-label="Active mission" value={example ? demoSession.id : sessionId} onChange={e => {setSessionId(e.target.value); setTasks([])}}>{(example ? [demoSession] : sessions).map(s => <option key={s.id} value={s.id}>{s.title || 'Untitled'}</option>)}</select></div>
      {(error || conversation.error) && <div className="error-banner" role="alert"><span>{error || conversation.error}</span><button onClick={() => {setError(''); dialog.current?.showModal()}}>Connection</button></div>}
      <div className="work-columns"><section className="conversation-panel" aria-label="Conversation"><div className={`conversation-heading ${tone(targetName)}`}><span className="avatar"><AgentIcon agent={targetName}/></span><div><strong>{target ? target.agent : 'Raven'} <span>{target ? 'DIRECT CONVERSATION' : 'MISSION HOST'}</span></strong><small>{target ? `Speaking to ${target.handle}. Side conversations are handed back to the host.` : 'One conversation. A team of specialists behind it.'}</small></div>{target && <button onClick={() => chooseTarget()} className="back-host">Back to host <ArrowRight size={12}/></button>}</div>
        {conversation.handoffs > 0 && !target && !example && <div className="handoff"><GitBranch size={14}/>{conversation.handoffs} specialist updates ready for your next message to Raven.</div>}
        <div className="transcript" ref={transcript} onScroll={() => {const el = transcript.current; if(el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90}}>
          {!messages.length && !lane.text && <div className="welcome"><span className="welcome-symbol"><Feather size={28}/></span><span className="eyebrow">THINK BIG. WORK TOGETHER.</span><h1>What are we<br/>making happen?</h1><p>Give Raven the outcome. Follow the work, talk to a specialist, and bring it all back together.</p><button onClick={() => setDraft('Research the audience for a personal idea notebook. Then ask a coding specialist to propose the smallest useful prototype. Do not write files yet.')}><Compass size={16}/> Explore an idea <ArrowRight size={14}/></button><button onClick={() => setDraft('Review the current project and recommend one small, testable improvement. Do not change any files yet.')}><SquareCode size={16}/> Find the next useful change <ArrowRight size={14}/></button></div>}
          {messages.filter(m => m.text || ('tool_calls' in m && m.tool_calls?.length)).map((m,i) => <article className={`message ${m.role === 'user' ? 'user-message' : tone(targetName)}`} key={`${i}-${'id' in m ? m.id : ''}`}><div className="message-avatar">{m.role === 'user' ? 'J' : m.role === 'tool' ? <Terminal size={15}/> : <AgentIcon agent={targetName} size={16}/>}</div><div className="message-body"><div className="message-label">{m.role === 'user' ? 'You' : m.role === 'tool' ? 'Tool result' : targetName}{example && <span>EXAMPLE</span>}</div>{m.role === 'tool' ? <details><summary>View tool result</summary><pre>{m.text}</pre></details> : <div className="message-text">{m.text}</div>}{'tool_calls' in m && m.tool_calls?.map((tool,j) => <details key={j}><summary>{tool.name}</summary><pre>{tool.arguments}</pre></details>)}</div></article>)}
          {example && !target && <div className="delegation-strip"><div><GitBranch size={14}/><span>Three specialists. One connected mission.</span></div>{sampleInstances.map(i => <button key={i.handle} className={tone(i.agent)} onClick={() => chooseTarget(i)}><AgentIcon agent={i.agent} size={14}/>{i.agent.replace('Raven-','')}<ArrowRight size={12}/></button>)}</div>}
          {lane.text && !example && <article className={`message ${tone(targetName)}`}><div className="message-avatar"><AgentIcon agent={targetName} size={16}/></div><div className="message-body"><div className="message-label">{targetName}<span>LIVE</span></div><div className="message-text streaming">{lane.text}</div></div></article>}
          {lane.running && !example && !lane.text && <div className="thinking"><span/><span/><span/> {targetName} is working</div>}
          {!example && lane.activity.length > 0 && <div className="tool-activity"><button onClick={() => setShowTools(s => !s)}><Terminal size={13}/>{lane.activity.length} recent tool events <ChevronDown size={13}/></button>{showTools && lane.activity.map((line,i) => <pre key={i}>{line}</pre>)}</div>}
          {!example && conversation.requests.map(r => <Decision key={r.id} request={r} respond={conversation.respond}/>)}
          {lane.error && !example && <div className="turn-error" role="alert">{lane.error}</div>}
        </div>
        <div className={`composer-area ${tone(targetName)}`}><div className="composer-target"><span className="status-dot running"/>TO <select aria-label="Message recipient" value={laneKey(target)} onChange={e => chooseTarget(instances.find(i => laneKey(i) === e.target.value))}><option value="host">Raven · mission host</option>{instances.filter(i => i.resumable).map(i => <option key={laneKey(i)} value={laneKey(i)}>{i.agent} · {i.handle}</option>)}</select>{lane.running && !example && <span className="steer-label">Steer the running turn</span>}</div><div className="composer"><textarea disabled={creating} aria-label="Message to Raven" placeholder={target ? `Message ${target.agent}…` : 'Describe the outcome. Raven will assemble the work.'} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing){e.preventDefault(); void submit()}}}/><div className="composer-footer"><span><Sparkles size={13}/>{example ? 'Example · connect to send' : conversation.model || (providerReady ? 'Raven’s configured model' : 'No model configured')}</span><div>{!example && lane.running && <button className="stop-button" aria-label="Stop current turn" onClick={() => void conversation.cancel(target)}><Square size={12}/> Stop</button>}<button className="send-button" aria-label={lane.running ? 'Steer current turn' : 'Send message'} disabled={!sendEnabled} onClick={() => void submit()}><ArrowUp size={17}/></button></div></div></div><div className="composer-hint"><span>{example ? <button onClick={() => dialog.current?.showModal()}>Connect to make this a real conversation <ArrowRight size={11}/></button> : !providerReady ? 'Configure a provider in Raven, then reconnect.' : !sessionId ? 'Create a new mission to start.' : 'Enter to send · Shift + Enter for a new line'}</span><span>Nest for Raven / 0.2</span></div></div>
      </section>
      <aside className="spatial-panel" aria-label="Team and task map">
        <div className="map-heading"><div><Network size={17}/><strong>Task map</strong><span className="step-count">{allNodes.length} steps</span></div><div className="map-actions">{example && <button aria-label={motionPlaying ? 'Stop task animation' : 'Play task animation'} title={motionPlaying ? 'Stop example playback' : 'Preview task arrival, completion, and attention'} aria-pressed={motionPlaying} onClick={() => {if (motionPlaying) setMotionPlaying(false); else {setMotionStep(0); setMotionPlaying(true)}}}>{motionPlaying ? <Square size={14}/> : <Play size={16}/>}</button>}<button aria-label="Scroll to mission host" title="Scroll to mission host" onClick={() => chartScroll.current?.scrollTo({top:0,left:Math.max(0, positions.host.x + layout.nodeWidth / 2 + 12 - chartScroll.current.clientWidth / 2)})}><ArrowUpToLine size={16}/></button><button className="expand-map" aria-label={mapExpanded ? 'Show conversation beside map' : 'Expand task map'} title={mapExpanded ? 'Show conversation beside map' : 'Expand task map'} onClick={() => setMapExpanded(value => !value)}>{mapExpanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}</button></div></div>
        <p className="map-guide">A fixed hierarchy, from host to finished work.<br/><span>Scroll to explore. Select a task for details.</span></p>
        <MissionActivity nodes={allNodes.map(item => item.node)} hostRunning={!example && !!activeSession?.running} paused={example && motionStep !== null && !motionPlaying && motionStep < motionStages.length - 1}/>
        <div className="mission-map" ref={chartScroll} role="region" aria-label="Task hierarchy" tabIndex={0}><div className="chart-canvas" style={{width:layout.width,height:layout.height}}><ReactFlow key={mapScope} nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={changeNodes} onNodeClick={(_, n) => {setSelectedNode(n.id === 'host' ? '' : n.id); setDetailTab('properties')}} nodesDraggable={false} nodesConnectable={false} edgesFocusable={false} deleteKeyCode={null} multiSelectionKeyCode={null} selectionKeyCode={null} defaultViewport={{x:12,y:16,zoom:1}} minZoom={1} maxZoom={1} panOnDrag={false} panOnScroll={false} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} preventScrolling={false} autoPanOnNodeFocus={false} colorMode="light"/></div>{!allNodes.length && <div className="map-empty">Delegated work appears here as Raven assembles the mission.</div>}</div>
        <section className="node-inspector" aria-label="Node inspector">{selected ? <>
          <div className={`node-heading ${tone(selected.node.agent)}`}><span className="avatar"><AgentIcon agent={selected.node.agent} size={15}/></span><div><strong>{selected.node.node_summary || selected.node.node_id}</strong><small>{selected.node.agent} <span>· {statusLabel(selected.node.status)}</span></small></div>{selectedInstance && <button title="Talk to this agent" aria-label="Talk to selected agent" onClick={() => {chooseTarget(selectedInstance); setMobileView('conversation'); setMapExpanded(false)}}><MessageSquare size={16}/><span>Talk</span></button>}</div>
          <div className="node-tabs" role="tablist" aria-label="Task details">{(['properties','output','prompt','files'] as const).map(t => <button role="tab" id={`task-tab-${t}`} aria-controls="task-panel" aria-selected={detailTab === t} key={t} onClick={() => setDetailTab(t)}>{t[0].toUpperCase()+t.slice(1)}{t === 'files' ? ` ${selected.node.files.length}` : ''}</button>)}<button className="refresh-detail" onClick={() => setTick(v => v + 1)} aria-label="Refresh node output">↻</button></div>
          <div className="node-content" id="task-panel" role="tabpanel" aria-labelledby={`task-tab-${detailTab}`}>
            {selected.node.error && <p className="turn-error">{selected.node.error}</p>}
            {detailTab === 'properties' ? <><dl className="node-properties">
              <dt>Status</dt><dd>{statusLabel(selected.node.status)}</dd>
              <dt>Agent</dt><dd>{selected.node.agent}</dd>
              <dt>Task</dt><dd>{selected.task.task_summary || selected.task.id}</dd>
              <dt>Depends on</dt><dd>{selected.node.depends_on.length ? selected.node.depends_on.map(id => selected.task.nodes.find(node => node.node_id === id)?.node_summary || id).join(', ') : 'No prerequisites · starts from the host'}</dd>
              <dt>Tool calls</dt><dd>{selected.node.tool_call_count ?? 'Not reported'}</dd>
              <dt>Tokens in / out</dt><dd>{selected.node.tokens_in?.toLocaleString() ?? '—'} / {selected.node.tokens_out?.toLocaleString() ?? '—'}</dd>
            </dl><p className="property-note">{example ? 'Example task properties.' : 'Task properties reported by Raven.'} The hierarchy follows task prerequisites. Raven reports each task’s state.</p></> : detailTab === 'files' ? <>{selected.node.files.map(f => <div className="file-row" key={f.path}><FileText size={13}/>{f.path}</div>)}<small>{example ? 'Illustrative paths.' : 'Paths reported by Raven; file opening is not available yet.'}</small></> : detailError ? <p role="alert">{detailError}</p> : <pre>{detail ? (detailTab === 'output' ? nodeOutput || 'No output recorded yet.' : nodePrompt || 'No prompt reported.') : 'Reading this step…'}</pre>}
            {detail?.output_truncated && detailTab === 'output' && <small>Output truncated to 20,000 characters.</small>}
          </div>
          {selected.node.depends_on.length > 0 && <div className="dependency-links"><GitBranch size={12}/>After {selected.node.depends_on.map(dep => <button key={dep} onClick={() => setSelectedNode(nodeKey(selected.task,dep))}>{dep}</button>)}</div>}
        </> : <div className="map-explainer"><GitBranch size={20}/><h3>See what depends on what.</h3><p>The host is at the top. Branches show parallel work, and arrows lead to tasks that depend on it. Select a task for its properties, output, and files, or use Talk to open its specialist conversation.</p><button className="host-conversation" onClick={() => {chooseTarget(); setMobileView('conversation'); setMapExpanded(false)}}>Open host conversation <ArrowRight size={14}/></button></div>}</section>
        <footer className="map-footer"><span role="status" aria-live="polite">{example ? motionStep === null ? 'Illustrative mission · no agents running' : `Example only · ${motionStages[motionStep]}${!motionPlaying && motionStep < motionStages.length-1 ? ' (stopped)' : ''}` : 'Task snapshots every 4s · live conversation stream'}</span>{example ? <button onClick={() => {setMotionPlaying(false); setMotionStep(null); setExampleStep(s => (s+1)%4)}}>Replay step {exampleStep+1}/4 <ArrowRight size={11}/></button> : <button onClick={openExample}>Example <ArrowRight size={11}/></button>}</footer>
      </aside></div>
    </main>
    <dialog ref={dialog}><form method="dialog"><button className="close-dialog" aria-label="Close connection dialog"><X size={18}/></button></form><span className="dialog-icon"><Radio size={24}/></span><span className="eyebrow">YOUR HARNESS. YOUR WORKSPACE.</span><h2>Connect to Raven</h2><p>The local gateway stays in charge of your models, tools, and permissions.</p><ol><li>Start the gateway: <code>npm run raven</code></li><li>Sign in on this browser: <code>npm run sign-in</code></li><li>Connect, then open or create a mission.</li></ol><div className="gateway-address"><span>LOCAL GATEWAY</span><code>127.0.0.1:18792</code></div>{error && <p className="turn-error" role="alert">{error}</p>}<button className="connect-button" disabled={connection === 'connecting'} onClick={() => void connect()}>{connection === 'connecting' ? 'Connecting…' : 'Connect to Raven'}<ArrowRight size={15}/></button><button className="example-button" onClick={openExample}>Explore the example workspace</button></dialog>
  </div>
}
