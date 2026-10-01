import { chromium } from 'playwright';

async function runSmokeTests() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=metal']
  });

  console.log('Testing Desktop Viewport (1280x720)...');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const pageDesktop = await contextDesktop.newPage();

  pageDesktop.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  pageDesktop.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await pageDesktop.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await pageDesktop.waitForTimeout(2500); // Allow models to render

  await pageDesktop.screenshot({ path: 'screenshots/smoke_desktop_start.png' });
  console.log('Saved screenshots/smoke_desktop_start.png');

  // Simulate movement input W
  await pageDesktop.keyboard.down('KeyW');
  await pageDesktop.waitForTimeout(2000);
  await pageDesktop.keyboard.up('KeyW');
  await pageDesktop.screenshot({ path: 'screenshots/smoke_desktop_moving.png' });
  console.log('Saved screenshots/smoke_desktop_moving.png');

  // Test Mobile Landscape Viewport (844x390 - iPhone 12 Pro Landscape)
  console.log('Testing Mobile Landscape Viewport (844x390)...');
  const contextMobile = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(2500);

  await pageMobile.screenshot({ path: 'screenshots/smoke_mobile_landscape.png' });
  console.log('Saved screenshots/smoke_mobile_landscape.png');

  await browser.close();
  console.log('Browser smoke tests finished successfully.');
}

runSmokeTests().catch(err => {
  console.error('Smoke tests failed:', err);
  process.exit(1);
});
