/* Material, text-contrast, and restrained activity checks in the real UI. */
async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const assert = (ok, message) => {if (!ok) throw new Error(message);};
  await page.setViewportSize({width:1440,height:960});
  await page.reload();
  const texture = await page.request.get('http://127.0.0.1:4173/paper-grain.svg');
  assert(texture.ok(), 'Paper texture failed to load');
  const contrast = await page.evaluate(() => {
    const luminance = color => {
      const channels = color.match(/[\d.]+/g).slice(0,3).map(Number).map(v => {v/=255; return v<=.04045 ? v/12.92 : ((v+.055)/1.055)**2.4;});
      return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
    };
    return [['.message-text','.conversation-panel'],['.conversation-heading small','.conversation-panel'],['.node-properties dd','.node-inspector'],['.orbit-node small','.orbit-node'],['.activity-caption>span:first-child','.spatial-panel']].map(([text,background]) => {
      const ink = getComputedStyle(document.querySelector(text)).color;
      const paper = getComputedStyle(document.querySelector(background)).backgroundColor;
      const a=luminance(ink),b=luminance(paper);
      return {text,ink,paper,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    });
  });
  contrast.forEach(pair => assert(pair.ratio>=4.5, `Low text contrast: ${pair.text}: ${pair.ratio}`));
  const flare = page.locator('.activity-flare');
  await flare.waitFor();
  const before = await flare.evaluate(el => getComputedStyle(el).transform);
  const nodes = await page.locator('.react-flow__node').evaluateAll(nodes => nodes.map(el => el.style.transform));
  await page.waitForFunction(value => getComputedStyle(document.querySelector('.activity-flare')).transform !== value, before);
  assert(JSON.stringify(await page.locator('.react-flow__node').evaluateAll(nodes => nodes.map(el => el.style.transform))) === JSON.stringify(nodes), 'Flare movement changed chart placement');
  assert(await flare.evaluate(el => getComputedStyle(el).pointerEvents) === 'none', 'Decorative flare intercepts input');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert(await flare.evaluate(el => getComputedStyle(el).display === 'none' && el.getAnimations().length === 0), 'Reduced motion leaves an animated flare');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1366,height:768});
  const laptop = await page.evaluate(() => ({height:innerHeight,pageHeight:document.documentElement.scrollHeight,topbar:document.querySelector('.mission-topbar').getBoundingClientRect().toJSON(),footer:document.querySelector('.map-footer').getBoundingClientRect().toJSON()}));
  assert(laptop.footer.bottom <= laptop.height+1, 'Laptop footer clipped below the viewport');
  await page.screenshot({path:'output/playwright/parchment-laptop-conversation.png'});
  assert(errors.length === 0, errors.join('; '));
  return {result:'PASS: local paper texture, text contrast, actual moving flare without node motion, reduced motion, laptop fit.',contrast,laptop,errors};
}
