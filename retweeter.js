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

async function runRetweetBot() {
  const executablePath = await getLocalChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache',
    executablePath
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
      await page.waitForTimeout(2000);

      try {
        await page.waitForSelector('input[name="text"]', { timeout: 5000 });
        await page.type('input[name="text"]', process.env.TWITTER_USERNAME);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      } catch {
        console.log('➡️ Username not prompted.');
      }

      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    await page.goto('https://twitter.com/explore', { waitUntil: 'networkidle2' });
    await page.waitForSelector('article', { timeout: 10000 });

    const tweetLink = await page.evaluate(() => {
      const article = document.querySelector('article');
      return article?.querySelector('a[href*="/status/"]')?.href || '';
    });

    if (!tweetLink) {
      console.log('⚠️ No tweet found to retweet.');
      await page.screenshot({ path: 'retweet_none.png' });
      return;
    }

    await page.goto(tweetLink, { waitUntil: 'networkidle2' });

    const retweetButton = await page.$('div[data-testid="retweet"]');
    if (retweetButton) {
      await retweetButton.click();
      await page.waitForTimeout(500);

      const confirm = await page.$('div[data-testid="retweetConfirm"]');
      if (confirm) {
        await confirm.click();
        console.log('🔁 Retweeted:', tweetLink);
      } else {
        console.error('❌ Retweet confirm button missing.');
        await page.screenshot({ path: 'retweet_confirm_missing.png' });
      }
    } else {
      console.error('❌ Retweet button not found.');
      await page.screenshot({ path: 'retweet_button_missing.png' });
    }

  } catch (err) {
    console.error('❌ Retweet bot failed:', err.message);
    await page.screenshot({ path: 'retweet_error.png' });
  } finally {
    await browser.close();
  }
}

module.exports = { runRetweetBot };
