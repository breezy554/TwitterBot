require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

async function runRetweetBot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache'
  });

  const page = await browser.newPage();
  try {
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2' });

    if (!(await isLoggedIn(page))) await login(page);

    await page.goto('https://twitter.com/explore', { waitUntil: 'networkidle2' });
    await page.waitForSelector('article');

    const link = await page.evaluate(() => {
      return document.querySelector('article a[href*="/status/"]')?.href || '';
    });

    if (!link) throw new Error('No tweet to retweet');

    await page.goto(link, { waitUntil: 'networkidle2' });

    const retweetBtn = await page.$('div[data-testid="retweet"]');
    if (retweetBtn) {
      await retweetBtn.click();
      await new Promise(r => setTimeout(r, 1000));

      const confirmBtn = await page.$('div[data-testid="retweetConfirm"]');
      if (confirmBtn) {
        await confirmBtn.click();
        console.log('🔁 Retweeted:', link);
      } else {
        await page.screenshot({ path: 'retweet_confirm_missing.png' });
        throw new Error('Retweet confirm missing');
      }
    } else {
      await page.screenshot({ path: 'retweet_button_missing.png' });
      throw new Error('Retweet button not found');
    }
  } catch (e) {
    await page.screenshot({ path: 'retweet_error.png' });
    console.error('❌ Retweet bot failed:', e.message);
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

module.exports = { runRetweetBot };
