const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log("Navigating to http://localhost:5173 ...");
  await page.goto('http://localhost:5173');
  
  // Wait for 2 seconds to let hydration happen and any crash to occur
  await page.waitForTimeout(2000);
  
  // Check if error message is on screen
  const text = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:");
  console.log("------------------------");
  console.log(text);
  console.log("------------------------");
  
  await browser.close();
})();
