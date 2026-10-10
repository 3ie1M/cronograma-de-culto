const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/cronograma-de-culto/');
  
  // Wait for load
  await new Promise(r => setTimeout(r, 2000));
  
  // Click export PDF button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const title = await btn.evaluate(el => el.title);
    if (title === 'Exportar como PDF') {
      console.log('Clicking PDF export button...');
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
  process.exit(0);
})();
