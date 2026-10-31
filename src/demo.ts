/** Explicit example data, replayed locally without a provider or agent execution. */
import type { Detail, Session, Task, TaskNode } from './types'

export const demoSession: Session = {
  id: 'example:field-notes', title: 'Build Fieldnotes',
  preview: 'A quiet place to collect ideas. Research the audience, build a working prototype, and review the result.',
  last_message_preview: 'Review the prototype before sharing.', message_count: 8,
  started_at: 0, updated_at: 0,
}
const nodes: TaskNode[] = [
  {node_id: 'research', node_summary: 'Understand the audience', agent: 'Raven-Research', status: 'completed', depends_on: [], tokens_in: 3100, tokens_out: 1200, tool_call_count: 6, files: [{path: 'research/audience.md'}]},
  {node_id: 'design', node_summary: 'Define the visual language', agent: 'Raven-Design', status: 'completed', depends_on: ['research'], tokens_in: 4200, tokens_out: 2100, tool_call_count: 8, files: [{path: 'design/direction.md'}]},
  {node_id: 'build', node_summary: 'Build the first experience', agent: 'Raven-Code', status: 'running', depends_on: ['design'], tokens_in: 8200, tokens_out: 3400, tool_call_count: 12, files: [{path: 'src/App.tsx'}, {path: 'src/styles.css'}]},
  {node_id: 'review', node_summary: 'Check the finished flow', agent: 'Raven-Code', status: 'pending', depends_on: ['build'], files: []},
  {node_id: 'brief', node_summary: 'Write the launch story', agent: 'Raven-Research', status: 'running', depends_on: ['research'], tokens_in: 2400, tokens_out: 800, tool_call_count: 3, files: [{path: 'launch/story.md'}]},
]
export function exampleTasks(step: number): Task[] {
  const replay = structuredClone(nodes)
  if (step >= 1) replay[2].status = 'completed'
  if (step >= 2) { replay[3].status = 'running'; replay[4].status = 'completed' }
  if (step >= 3) { replay[3].status = 'exception'; replay[3].error = 'The mobile capture shows a clipped save button. A human review is needed before sharing.' }
  return [{id: 'fieldnotes-01', kind: 'dag', task_summary: 'From idea to first usable prototype', status: step >= 3 ? 'exception' : 'running', nodes: replay}]
}

export const motionStages = [
  'Ready to build', 'Build task arrives', 'Code is working', 'Build complete',
  'Review task arrives', 'Review is working', 'Review needs your attention',
] as const

/** A finite, explicit demo. It never drives RPC or invents connected progress. */
export function motionExampleTasks(step: number): Task[] {
  const replay = structuredClone(nodes.slice(0, step === 0 ? 2 : step < 4 ? 3 : 4))
  if (replay[2]) replay[2].status = step === 1 ? 'pending' : step === 2 ? 'running' : 'completed'
  if (replay[3]) {
    replay[3].status = step === 4 ? 'pending' : step === 5 ? 'running' : 'exception'
    if (step === 6) replay[3].error = 'The mobile save button needs a human review before sharing.'
  }
  return [{id:'fieldnotes-01',kind:'dag',task_summary:'From idea to first usable prototype',status:step === 6 ? 'exception' : 'running',nodes:replay}]
}
export const exampleDetail: Record<string, Detail> = {
  research: {prompt: 'Identify the primary user and the smallest useful workflow for a personal idea notebook.', output: 'Primary user: someone collecting fragments while working.\n\nFirst workflow: write a note → save it → find it again.\n\nKeep capture immediate. Use a plain list and a small search field. Accounts and collaboration can wait.'},
  design: {prompt: 'Define a calm, readable visual direction using the audience findings.', output: 'Warm paper, dark ink, and a single green accent.\n\nA generous writing surface. Titles use a serif; controls use a practical sans serif. Saving should feel quiet and dependable.'},
  build: {prompt: 'Build the note capture and retrieval workflow from the agreed visual direction.', output: 'Example work log\n\n✓ Note editor and saved-note list\n✓ Browser-local persistence\n✓ Search by title and content\n\nThe responsive layout is ready for review. These are illustrative results, not files generated on your machine.'},
  brief: {prompt: 'Write a short product introduction grounded in the audience research.', output: 'A place for the thought you almost lost.\n\nFieldnotes keeps your fragments close: quick to capture, easy to find, and ready when an idea starts becoming something.'},
  review: {prompt: 'Check the save → reload → search workflow at desktop and phone widths.', output: 'Example review\n\nThe desktop flow passes. At phone width the save button is clipped. Request a human review before sharing the prototype.'},
}
