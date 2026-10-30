/* Load .raven-local/test-auth.json first. Uses the most recent smoke-conversation mission. */
async (page) => {
  await page.getByRole('button', {name:'Connect your Raven'}).click();
  await page.getByRole('dialog').getByRole('button', {name:'Connect to Raven',exact:true}).click();
  await page.getByText('Local Raven connected', {exact:true}).waitFor();
  await page.locator('.message-text').filter({hasText:'RAVEN_HOST_OK'}).last().waitFor();
  const recipient = page.getByRole('combobox', {name:'Message recipient'});
  const option = recipient.getByRole('option').filter({hasText:/Raven-(General|Code)/}).first();
  await option.waitFor({state:'attached'});
  const value = await option.getAttribute('value');
  await recipient.selectOption(value);
  await page.locator('.message-text').filter({hasText:'RAVEN_SPECIALIST_OK'}).last().waitFor();
  await page.getByRole('textbox', {name:'Message to Raven'}).fill('UI draft survives recipient switch');
  await page.getByRole('button', {name:'Back to host'}).click();
  await recipient.selectOption(value);
  if (await page.getByRole('textbox', {name:'Message to Raven'}).inputValue() !== 'UI draft survives recipient switch') throw new Error('Draft lost');
  await page.getByRole('textbox', {name:'Message to Raven'}).fill('');
  await page.getByRole('button', {name:'Back to host'}).click();
  await page.getByRole('textbox', {name:'Message to Raven'}).fill('UI send test. Do not use tools or delegate. Reply exactly RAVEN_BROWSER_OK.');
  await page.getByRole('button', {name:'Send message',exact:true}).click();
  await page.waitForFunction(() => [...document.querySelectorAll('.message:not(.user-message) .message-text')].some(e => e.textContent.includes('RAVEN_BROWSER_OK')), undefined, {timeout:150000});
  await page.getByRole('button', {name:'Stop current turn'}).waitFor({state:'hidden',timeout:150000});
  if (await page.getByRole('textbox', {name:'Message to Raven'}).inputValue()) throw new Error('Accepted draft not cleared');
  await page.screenshot({path:'output/playwright/v2-live.png'});
  return 'PASS: authenticated UI, persisted host and specialist history, separate drafts, browser send, streamed response, idle completion.';
}
