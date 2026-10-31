/* playwright-cli run-code --filename=scripts/check-example.cjs, on a fresh example. */
async (page) => {
  await page.getByRole('textbox', {name:'Message to Raven'}).fill('Keep this host draft');
  if (await page.getByRole('button', {name:'Send message', exact:true}).isEnabled()) throw new Error('Example can send');
  await page.getByRole('button', {name:'Talk to selected agent'}).click();
  await page.getByRole('textbox', {name:'Message to Raven'}).fill('Separate specialist draft');
  await page.getByRole('button', {name:'Back to host'}).click();
  if (await page.getByRole('textbox', {name:'Message to Raven'}).inputValue() !== 'Keep this host draft') throw new Error('Draft isolation failed');
  await page.getByRole('textbox', {name:'Message to Raven'}).fill('');
  await page.getByRole('tab', {name:'Prompt',exact:true}).click();
  await page.getByRole('tab', {name:'Files 2',exact:true}).click();
  await page.getByRole('tab', {name:'Output',exact:true}).click();
  await page.screenshot({path:'output/playwright/v2-example.png'});
  await page.setViewportSize({width:390,height:844});
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile horizontal overflow');
  await page.screenshot({path:'output/playwright/v2-mobile.png'});
  await page.getByRole('button', {name:'Show team map',exact:true}).click();
  await page.getByRole('button', {name:'Scroll to mission host',exact:true}).click();
  await page.getByRole('region', {name:'Node inspector'}).waitFor();
  await page.screenshot({path:'output/playwright/v2-mobile-map.png'});
  await page.getByRole('button', {name:'Show conversation',exact:true}).click();
  await page.setViewportSize({width:1440,height:960});
  return 'PASS: example send disabled, separate drafts, node tabs, 390px conversation and map without overflow.';
}
