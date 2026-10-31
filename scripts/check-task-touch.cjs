/* Chromium touch-input check for native hierarchy scrolling and task selection. */
async (page) => {
  const context = await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try {
    const phone = await context.newPage();
    const errors = [];
    phone.on('pageerror', error => errors.push(error.message));
    await phone.goto('http://127.0.0.1:4173');
    await phone.getByRole('button', {name:'Show team map',exact:true}).tap();
    const chart = phone.getByRole('region', {name:'Task hierarchy',exact:true});
    const box = await chart.boundingBox();
    const cdp = await context.newCDPSession(phone);
    const x = Math.round(box.x+box.width/2), y = Math.round(box.y+box.height-35);
    await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x,y}]});
    for (let step=1;step<=12;step++) {
      await cdp.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x,y:y-step*16}]});
      await phone.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await phone.waitForFunction(() => document.querySelector('.mission-map').scrollTop > 50, undefined, {timeout:3000});
    // Let the touch gesture's native momentum finish before testing a selection tap.
    await phone.evaluate(() => new Promise(resolve => {
      const chart = document.querySelector('.mission-map');
      let previous = chart.scrollTop, stable = 0;
      const sample = () => {
        stable = Math.abs(chart.scrollTop-previous) < .1 ? stable+1 : 0;
        previous = chart.scrollTop;
        if (stable >= 8) resolve(); else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }));
    const scrolled = await chart.evaluate(el => el.scrollTop);
    const design = phone.getByRole('group', {name:'Define the visual language, Complete',exact:true});
    await design.scrollIntoViewIfNeeded();
    await design.tap();
    await phone.getByRole('tabpanel').getByText('Understand the audience', {exact:true}).waitFor();
    await phone.getByRole('button', {name:'Scroll to mission host',exact:true}).tap();
    if (await chart.evaluate(el => el.scrollTop) !== 0) throw new Error('Touch return-to-host failed');
    if (await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Phone page overflow');
    await phone.screenshot({path:'output/playwright/parchment-touch.png'});
    if (errors.length) throw new Error(errors.join('; '));
    return {result:'PASS: native touch swipe scrolls the fixed hierarchy, tap selects properties, return-to-host works.',scrollDistance:scrolled,errors};
  } finally {await context.close();}
}
