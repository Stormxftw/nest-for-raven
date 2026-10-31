/* Simulated RPC only. Verifies the real UI's polling and mission boundaries without agent execution. */
async (page) => {
  let updated = false;
  const errors = [], unexpected = [];
  page.on('pageerror', error => errors.push(error.message));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const sessions = ['a','b'].map(id => ({id, title:`Layout fixture ${id}`, preview:'Browser test', message_count:0, started_at:0, updated_at:0}));
  await page.routeWebSocket('**/rpc', socket => socket.onMessage(message => {
    const {id, method, params} = JSON.parse(String(message));
    let result = {};
    if (method === 'setup.status') result = {provider_configured:true};
    else if (method === 'session.list') result = {sessions};
    else if (method === 'session.resume') result = {session_id:params.session_id, messages:[], info:{model:'test fixture',running:false}};
    else if (method === 'turn.subscribe') result = {subscription_id:`sub-${params.session_key}`,running:false};
    else if (method === 'subagents.instances') result = {instances:[], pending_handoff_count:0};
    else if (method === 'approval.pending') result = {requests:[]};
    else if (method === 'tasks.list') result = {tasks:[{id:'shared-run',kind:'dag',task_summary:'Polling fixture',status:updated ? 'completed' : 'running', nodes:[
      {node_id:'work',node_summary:'Fixture work',agent:'Raven-Code',status:updated ? 'completed' : 'running',depends_on:[],files:[]},
      ...(updated ? [{node_id:'new',node_summary:'Newly reported task',agent:'Raven-Code',status:'pending',depends_on:['work'],files:[]}] : []),
    ]}]};
    else if (method === 'dag.node') result = {node:{prompt:'Fixture prompt',output:'<script>window.fixtureExecuted = true</script> Fixture output'}};
    else if (!['system.hello','turn.unsubscribe'].includes(method)) unexpected.push(method);
    socket.send(JSON.stringify({jsonrpc:'2.0',id,result}));
  }));
  await page.reload();
  await page.setViewportSize({width:1440,height:960});
  await page.getByRole('button', {name:'Connect your Raven',exact:true}).click();
  await page.getByRole('dialog').getByRole('button', {name:'Connect to Raven',exact:true}).click();
  const work = page.getByRole('group', {name:/^Fixture work,/});
  await work.waitFor();
  await page.getByRole('button', {name:'Scroll to mission host',exact:true}).click();
  const position = () => work.evaluate(el => el.style.transform);
  assert(await page.locator('.activity-flare').count() === 1, 'Connected running task has no activity flare');
  const original = await position();
  const box = await work.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 45, box.y + 55, {steps:10});
  await page.mouse.up();
  const moved = await position();
  assert(moved === original, 'Live task moved during a drag');
  const viewport = await page.locator('.react-flow__viewport').evaluate(el => el.style.transform);
  updated = true;
  await page.getByRole('group', {name:'Fixture work, Complete',exact:true}).waitFor();
  await page.getByRole('group', {name:'Newly reported task, Queued',exact:true}).waitFor();
  assert(await work.locator('.orbit-node').evaluate(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'), 'Status change animated the card body');
  assert(await position() === moved, 'Task poll reset node position');
  assert(await page.locator('.react-flow__viewport').evaluate(el => el.style.transform) === viewport, 'New task reset pan/zoom');
  assert(await page.locator('.activity-flare').count() === 0, 'Connected completion left the flare running');
  const progress = page.getByRole('progressbar', {name:'Completed tasks',exact:true});
  assert(await progress.getAttribute('aria-valuenow') === '1' && await progress.getAttribute('aria-valuemax') === '2', 'Connected task count is incorrect');
  const unchanged = await page.locator('.react-flow__node').evaluateAll(nodes => nodes.map(el => el.style.transform));
  await page.waitForTimeout(4300);
  assert(JSON.stringify(await page.locator('.react-flow__node').evaluateAll(nodes => nodes.map(el => el.style.transform))) === JSON.stringify(unchanged), 'Repeated poll changed the hierarchy');
  assert(await page.locator('.orbit-node').evaluateAll(nodes => nodes.every(el => el.getAnimations().length === 0)), 'Repeated poll animated a card');
  await page.getByRole('button', {name:'Layout fixture b',exact:true}).click();
  await work.waitFor();
  assert(await position() === original, 'Layout leaked into another mission with matching task/node IDs');
  await page.getByRole('button', {name:'Layout fixture a',exact:true}).click();
  await work.waitFor();
  assert(await position() === moved, 'Mission hierarchy changed after switching back');
  await work.click();
  await page.getByRole('tab', {name:'Output',exact:true}).click();
  await page.getByRole('tabpanel').getByText('Fixture output', {exact:false}).waitFor();
  assert(!(await page.evaluate(() => window.fixtureExecuted)), 'Task content was executed');
  assert(errors.length === 0, errors.join('; '));
  assert(unexpected.length === 0, `Unexpected RPC: ${unexpected.join(', ')}`);
  await page.reload();
  return 'PASS: simulated RPC completion/new task/repeated polling retain fixed positions and viewport, cards do not animate, mission switches remain consistent, output is inert, no mutation RPCs or browser errors.';
}
