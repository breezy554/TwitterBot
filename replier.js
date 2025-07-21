require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');

async function getLocalChromePath() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const path = chrome.chromePath;
  await chrome.kill();
  return path;
}

async function runReplyBot() {
  const executablePath = await getLocalChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    userDataDir: './.puppeteer-cache',
    executablePath
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://twitter.com/home', { waitUntil: 'networkidle2', timeout: 60000 });

    const loggedIn = await page.evaluate(() =>
      !!document.querySelector('[aria-label="Tweet text"], [data-testid="tweetTextarea_0"]')
    );

    if (!loggedIn) {
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
      } catch (_) {}

      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.type('input[name="password"]', process.env.TWITTER_PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    await page.goto('https://twitter.com/explore', { waitUntil: 'networkidle2' });
    await page.waitForSelector('article');

    const tweet = await page.evaluate(() => {
      const article = document.querySelector('article');
      const link = article?.querySelector('a[href*="/status/"]')?.href;
      return link;
    });

    if (!tweet) return console.log('⚠️ No tweet to reply to.');

    await page.goto(tweet, { waitUntil: 'networkidle2' });
    const replyBox = await page.waitForSelector('[aria-label="Tweet your reply"]', { timeout: 10000 });

    const replyText = `😂 LETSMANGA just destabilized my neural net.`;
    await replyBox.type(replyText);
    await page.waitForTimeout(1000);

    const replyButton = await page.$('div[data-testid="tweetButtonInline"]');
    if (replyButton) {
      await replyButton.click();
      console.log('✅ Replied:', replyText);
    } else {
      console.log('❌ Reply button not found');
    }
  } catch (err) {
    console.error('❌ Reply failed:', err.message);
  } finally {
    await browser.close();
  }
}

module.exports = { runReplyBot };
