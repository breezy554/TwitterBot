require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function getLocalChromePath() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const path = chrome.chromePath;
  await chrome.kill();
  return path;
}

async function postToTwitter(tweetContent) {
  const executablePath = await getLocalChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache'
  });

  const page = await browser.newPage();

  try {
    // Go to Twitter homepage
    await page.goto('https://twitter.com/home', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Check if user is logged in
    const loggedIn = await page.evaluate(() =>
      !!document.querySelector('[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]')
    );

    if (!loggedIn) {
      console.log('🔐 Logging in...');
      await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

      // Enter email
      await page.waitForSelector('input[name="text"]', { timeout: 10000 });
      await page.type('input[name="text"]', process.env.TWITTER_EMAIL);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Optionally enter username (if prompted)
      try {
        await page.waitForSelector('input[name="text"]', { timeout: 5000 });
        await page.type('input[name="text"]', process.env.TWITTER_USERNAME);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      } catch {
        console.log('➡️ Username not requested.');
      }

      // Enter password
      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Reload home after login
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });

    // Find the tweet box
    const tweetBox = await page.waitForSelector(
      '[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]',
      { timeout: 10000 }
    );

    await tweetBox.click();
    await tweetBox.type(tweetContent);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);

    // Attempt to post
    let postSuccess = false;
    const postButtons = await page.$$('button[role="button"], div[data-testid="tweetButtonInline"]');

    for (const btn of postButtons) {
      const label = await page.evaluate(el => el.textContent || '', btn);
      const isTweetButton = label.trim().toLowerCase() === 'post' || label.trim().toLowerCase() === 'tweet';
      const isInline = (await page.evaluate(el => el.getAttribute('data-testid') || '', btn)).includes('tweetButtonInline');

      if (isTweetButton || isInline) {
        await btn.click();
        postSuccess = true;
        break;
      }
    }

    if (postSuccess) {
      console.log('✅ Tweet posted:', tweetContent);
      await page.waitForTimeout(3000);
    } else {
      console.error('❌ Could not find post button.');
      await page.screenshot({ path: 'post_button_error.png' });
    }

  } catch (err) {
    console.error('❌ Posting failed:', err.message);
    await page.screenshot({ path: 'post_failure.png' });
  } finally {
    await browser.close();
  }
}

module.exports = { postToTwitter };
