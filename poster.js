require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

async function postToTwitter(tweetContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache'
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://twitter.com/home', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const loggedIn = await page.evaluate(() =>
      !!document.querySelector('[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]')
    );

    if (!loggedIn) {
      console.log('🔐 Logging in...');
      await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

      await page.waitForSelector('input[name="text"]', { timeout: 10000 });
      await page.type('input[name="text"]', process.env.TWITTER_EMAIL);
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 2000));

      try {
        await page.waitForSelector('input[name="text"]', { timeout: 5000 });
        await page.type('input[name="text"]', process.env.TWITTER_USERNAME);
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.log('➡️ Username step skipped.');
      }

      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });

    const tweetBox = await page.waitForSelector('[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]', {
      timeout: 10000
    });

    await tweetBox.click();
    await tweetBox.type(tweetContent);
    await page.keyboard.press('Tab');
    await new Promise(r => setTimeout(r, 1000));

    let postSuccess = false;

    const buttons = await page.$$('button[role="button"], div[data-testid="tweetButtonInline"]');
    for (const btn of buttons) {
      const label = await page.evaluate(el => el.textContent || '', btn);
      if (label.trim().toLowerCase() === 'post' || btn.toString().includes('tweetButtonInline')) {
        await btn.click();
        postSuccess = true;
        break;
      }
    }

    if (postSuccess) {
      console.log('✅ Tweet posted:', tweetContent);
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.error('❌ Failed to find or click Post button.');
      await page.screenshot({ path: 'post_button_error.png' });
    }

  } catch (error) {
    console.error('❌ Posting failed:', error.message);
    await page.screenshot({ path: 'post_failure.png' });
  } finally {
    await browser.close();
  }
}

module.exports = { postToTwitter };
