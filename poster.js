require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runTweetBot(tweetContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache'
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://twitter.com/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Login
    await page.waitForSelector('input[name="text"]', { timeout: 10000 });
    await page.type('input[name="text"]', process.env.TWITTER_EMAIL);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    try {
      await page.waitForSelector('input[name="text"]', { timeout: 5000 });
      await page.type('input[name="text"]', process.env.TWITTER_USERNAME);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('➡️ Username step skipped.');
    }

    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Go to tweet box
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });
    await page.waitForSelector('[aria-label="Tweet text"]', { timeout: 10000 });

    // Type and post tweet
    await page.type('[aria-label="Tweet text"]', tweetContent);
    await page.waitForTimeout(1000);

    const tweetButton = await page.$('div[data-testid="tweetButtonInline"]');
    if (tweetButton) {
      await tweetButton.click();
      console.log('✅ Tweet posted:', tweetContent);
    } else {
      console.error('❌ Tweet button not found.');
      await page.screenshot({ path: 'tweet_button_missing.png' });
    }

  } catch (err) {
    console.error('❌ Tweet bot failed:', err.message);
    await page.screenshot({ path: 'tweet_error.png' });
  } finally {
    await browser.close();
  }
}

module.exports = { runTweetBot };
