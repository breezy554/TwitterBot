require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const { generateTweetPrompt } = require('./tweetGenerator');

async function runTweetBot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache'
  });

  const page = await browser.newPage();
  try {
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });

    // Check login
    if (!(await isLoggedIn(page))) await login(page);

    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });

    const tweetContent = generateTweetPrompt();

    const tweetBox = await page.waitForSelector('[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]', { timeout: 10000 });
    await tweetBox.click();
    await tweetBox.type(tweetContent);

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000)); // delay

    const tweetBtn = await page.$('div[data-testid="tweetButtonInline"]');
    if (tweetBtn) {
      await tweetBtn.click();
      console.log('✅ Tweet posted:', tweetContent);
    } else {
      await page.screenshot({ path: 'post_button_error.png' });
      throw new Error('Tweet button not found');
    }
  } catch (err) {
    await page.screenshot({ path: 'tweet_failure.png' });
    console.error('❌ Tweet bot failed:', err.message);
  } finally {
    await browser.close();
  }
}

async function isLoggedIn(page) {
  return await page.evaluate(() => !!document.querySelector('[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]'));
}

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto('https://twitter.com/login');
  await page.type('input[name="text"]', process.env.TWITTER_EMAIL);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  try {
    await page.type('input[name="text"]', process.env.TWITTER_USERNAME);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
  } catch {}

  await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

module.exports = { runTweetBot };
