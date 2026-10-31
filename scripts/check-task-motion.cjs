/* Finite lifecycle playback with a static hierarchy. Example only; no model calls. */
async (page) => {
  page.setDefaultTimeout(20000);
  const errors = [], sockets = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('websocket', socket => sockets.push(socket.url()));
  const assert = (ok, message) => {if (!ok) throw new Error(message);};
  await page.setViewportSize({width:1440,height:960});
  await page.reload();
  await page.getByRole('button', {name:'Expand task map',exact:true}).click();
  await page.getByRole('button', {name:'Play task animation',exact:true}).click();
  const research = page.getByRole('group', {name:/Understand the audience,/});
  await page.getByRole('status').filter({hasText:'Ready to build'}).waitFor();
  const position = await research.evaluate(el => el.style.transform);
  const viewport = await page.locator('.react-flow__viewport').evaluate(el => el.style.transform);
  const states = [];
  for (const [name,status] of [
    ['Build the first experience','Queued'], ['Build the first experience','Working'],
    ['Build the first experience','Complete'], ['Check the finished flow','Queued'],
    ['Check the finished flow','Working'], ['Check the finished flow','Needs attention'],
  ]) {
    const node = page.getByRole('group', {name:`${name}, ${status}`,exact:true});
    await node.waitFor();
    assert(await node.locator('.orbit-node').evaluate(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none' && el.getAnimations().length === 0), 'Lifecycle animated a card body');
    assert(await research.evaluate(el => el.style.transform) === position, 'Lifecycle shifted an existing branch');
    assert(await page.locator('.react-flow__viewport').evaluate(el => el.style.transform) === viewport, 'Lifecycle moved the viewport');
    const progress = page.getByRole('progressbar', {name:'Completed tasks',exact:true});
    const completed = name.startsWith('Check') || status === 'Complete' ? 3 : 2;
    const total = name.startsWith('Check') ? 4 : 3;
    assert(await progress.getAttribute('aria-valuenow') === String(completed) && await progress.getAttribute('aria-valuemax') === String(total), 'Task-count fill does not match the demonstrated tasks');
    assert(await page.locator('.activity-flare').count() === (status === 'Working' ? 1 : 0), 'Activity flare does not match running work');
    states.push(`${name}: ${status}`);
  }
  await page.getByRole('button', {name:'Play task animation',exact:true}).waitFor();
  await page.getByRole('tabpanel').getByText('The mobile save button needs a human review', {exact:false}).waitFor();
  await page.screenshot({path:'output/playwright/parchment-attention.png'});
  await page.getByRole('button', {name:'Play task animation',exact:true}).click();
  await page.getByRole('button', {name:'Stop task animation',exact:true}).click();
  assert(await page.locator('.activity-flare').count() === 0, 'Stopped preview retained an active flare');
  const stopped = await page.getByRole('status').innerText();
  await page.waitForTimeout(2100);
  assert(await page.getByRole('status').innerText() === stopped, 'Stopped demo kept advancing');
  await page.getByRole('button', {name:'Play task animation',exact:true}).click();
  await page.getByRole('group', {name:'Build the first experience, Working',exact:true}).waitFor();
  assert(await page.locator('.status-spinner').first().evaluate(el => el.getAnimations().length) > 0, 'Working indicator absent');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert(await page.locator('.mission-map').evaluate(el => el.getAnimations({subtree:true}).filter(animation => animation.playState === 'running').length) === 0, 'Reduced-motion chart still animates');
  assert(await page.locator('.mission-activity').evaluate(el => el.getAnimations({subtree:true}).filter(animation => animation.playState === 'running').length) === 0, 'Reduced motion did not stop the flare');
  await page.getByRole('button', {name:'Stop task animation',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button', {name:'Show team map',exact:true}).click();
  await page.getByRole('button', {name:'Play task animation',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Review needs your attention'}).waitFor();
  await page.getByRole('group', {name:'Check the finished flow, Needs attention',exact:true}).click();
  assert(await page.locator('.mission-map').evaluate(el => el.getAnimations({subtree:true}).filter(animation => animation.playState === 'running').length) === 0, 'Reduced-motion playback animates');
  assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'Phone overflow');
  await page.screenshot({path:'output/playwright/parchment-mobile-attention.png'});
  assert(sockets.length === 0, 'Example playback opened a gateway connection');
  assert(errors.length === 0, errors.join('; '));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:960});
  await page.reload();
  return {result:'PASS: queued/working/completed/attention, fixed card positions and viewport, no card opacity/transform animations, finite playback, stop/restart, reduced-motion indicators, phone, accurate task-count fill and activity flare, no model connection.', states, errors};
}
