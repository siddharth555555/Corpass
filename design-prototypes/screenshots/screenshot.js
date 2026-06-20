
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const shots = [
    ["/Users/siddharth/Github/Corpass/design-prototypes/corpass-midnight-glass.html", "/Users/siddharth/Github/Corpass/design-prototypes/screenshots/midnight-glass.png"],
    ["/Users/siddharth/Github/Corpass/design-prototypes/corpass-nordic-minimal.html", "/Users/siddharth/Github/Corpass/design-prototypes/screenshots/nordic-minimal.png"],
    ["/Users/siddharth/Github/Corpass/design-prototypes/corpass-command-center.html", "/Users/siddharth/Github/Corpass/design-prototypes/screenshots/command-center.png"],
  ];
  
  for (const [file, out] of shots) {
    await page.goto('file://' + file);
    await page.waitForTimeout(800);
    await page.screenshot({ path: out, fullPage: false });
    console.log('Saved: ' + out);
  }
  
  // Also take dashboard screenshots by clicking Sign In
  for (const [file, out] of shots) {
    const dashOut = out.replace('.png', '-dashboard.png');
    await page.goto('file://' + file);
    await page.waitForTimeout(500);
    await page.click('button');
    await page.waitForTimeout(800);
    await page.screenshot({ path: dashOut, fullPage: false });
    console.log('Saved: ' + dashOut);
  }
  
  await browser.close();
})();
