/* On the connected live UI; creates a fresh mission and exercises human input/stop. */
async (page) => {
  if (await page.getByRole('button', {name:'Connect your Raven'}).isVisible()) {
    await page.getByRole('button', {name:'Connect your Raven'}).click();
    await page.getByRole('dialog').getByRole('button', {name:'Connect to Raven',exact:true}).click();
    await page.getByText('Local Raven connected', {exact:true}).waitFor();
  }
  await page.getByRole('button', {name:'New mission ↗',exact:true}).click();
  await page.locator('.breadcrumb strong').filter({hasText:'New mission'}).waitFor();
  const input = page.getByRole('textbox', {name:'Message to Raven'});
  await input.fill('UI clarification test. Use the ask_user tool to ask me one question: Which scope? Choices: Small first, Big later. Do not use any other tools. After I answer, reply with exactly RAVEN_DECISION_OK.');
  await page.getByRole('button', {name:'Send message',exact:true}).click();
  const decision = page.getByRole('region', {name:'Raven needs your input'});
  await decision.waitFor({timeout:90000});
  await decision.getByRole('textbox').first().fill('Small first');
  await decision.getByRole('button', {name:'Send answer'}).click();
  await decision.waitFor({state:'hidden'});
  await page.waitForFunction(() => [...document.querySelectorAll('.message:not(.user-message) .message-text')].some(e => e.textContent.includes('RAVEN_DECISION_OK')), undefined, {timeout:90000});
  await page.getByRole('button', {name:'Stop current turn'}).waitFor({state:'hidden',timeout:90000});
  await input.fill('Cancellation test. Do not use tools. Write 500 numbered sentences about colors.');
  await page.getByRole('button', {name:'Send message',exact:true}).click();
  await page.getByRole('button', {name:'Stop current turn'}).click();
  await page.getByRole('button', {name:'Stop current turn'}).waitFor({state:'hidden',timeout:30000});
  await input.fill('After cancellation, do not use tools. Reply exactly RAVEN_RECOVERED_OK.');
  await page.getByRole('button', {name:'Send message',exact:true}).click();
  await page.waitForFunction(() => [...document.querySelectorAll('.message:not(.user-message) .message-text')].some(e => e.textContent.includes('RAVEN_RECOVERED_OK')), undefined, {timeout:90000});
  await page.getByRole('button', {name:'Stop current turn'}).waitFor({state:'hidden',timeout:90000});
  return 'PASS: new mission, real ask_user clarification, answer accepted, completion, cancellation and next-message recovery.';
}
