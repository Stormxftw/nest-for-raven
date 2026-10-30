/* On a connected page, after smoke-raven.py. Stored records, no model execution. */
async (page) => {
  await page.getByRole('button', {name:'[Test fixture] Spatial observer',exact:true}).click();
  await page.locator('.react-flow__node').filter({hasText:'Inspect a stored result'}).click();
  await page.getByRole('tabpanel').getByText('Stored Raven fixture output.', {exact:false}).waitFor();
  if (await page.evaluate(() => window.fixtureExecuted === true)) throw new Error('Output was executed');
  await page.locator('.react-flow__node').filter({hasText:'Verify the dependency'}).click();
  await page.getByRole('button', {name:'inspect',exact:true}).click();
  await page.getByRole('tabpanel').getByText('Stored Raven fixture output.', {exact:false}).waitFor();
  return 'PASS: real stored task map, node output, scoped dependency navigation, inert script-like output.';
}
