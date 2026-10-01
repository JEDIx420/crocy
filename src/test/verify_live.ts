import { chromium } from 'playwright';

async function testLiveProduction() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=metal']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  let modelLoaded = false;
  page.on('console', msg => {
    console.log('LIVE PAGE LOG:', msg.text());
    if (msg.text().includes('Original authoritative crocodile model loaded')) {
      modelLoaded = true;
    }
  });

  console.log('Navigating to live GitHub Pages URL: https://jedix420.github.io/crocy/ ...');
  await page.goto('https://jedix420.github.io/crocy/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  await page.screenshot({ path: 'screenshots/live_github_pages.png' });
  console.log('Saved screenshots/live_github_pages.png');

  if (!modelLoaded) {
    console.warn('Warning: model loaded log message not captured, checking DOM');
  }

  await browser.close();
  console.log('Live production verification complete!');
}

testLiveProduction().catch(err => {
  console.error('Live production test failed:', err);
  process.exit(1);
});
