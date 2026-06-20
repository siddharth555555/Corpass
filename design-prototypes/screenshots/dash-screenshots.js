const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const designs = [
    ['corpass-midnight-glass.html', 'midnight-glass-dashboard.png'],
    ['corpass-nordic-minimal.html', 'nordic-minimal-dashboard.png'],
    ['corpass-command-center.html', 'command-center-dashboard.png'],
  ];

  for (const [html, out] of designs) {
    const filePath = 'file:///Users/siddharth/Github/Corpass/design-prototypes/' + html;
    await page.goto(filePath);
    await page.waitForTimeout(500);
    await page.click('button');
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/Users/siddharth/Github/Corpass/design-prototypes/screenshots/' + out, fullPage: false });
    console.log('Saved: ' + out);
  }

  await browser.close();
})();
