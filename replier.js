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

    // Visit explore/trending
    await page.goto('https://twitter.com/explore', { waitUntil: 'networkidle2' });
    await page.waitForSelector('article', { timeout: 15000 });

    const targetTweet = await page.evaluate(() => {
      const article = document.querySelector('article');
      const content = article?.innerText || '';
      const link = article?.querySelector('a[href*="/status/"]')?.href || '';
      return { content, link };
    });

    if (!targetTweet.link) {
      console.log('⚠️ No valid tweet found to reply to.');
      await page.screenshot({ path: 'no_reply_target.png' });
      return;
    }

    console.log('💬 Replying to tweet:', targetTweet.content);

    // Navigate to tweet
    await page.goto(targetTweet.link, { waitUntil: 'networkidle2' });
    await page.waitForSelector('[aria-label="Tweet your reply"]', { timeout: 10000 });

    const replyText = generateFunnyReply(targetTweet.content);
    await page.type('[aria-label="Tweet your reply"]', replyText);
    await page.waitForTimeout(1000);

    const replyButton = await page.$('div[data-testid="tweetButtonInline"]');
    if (replyButton) {
      await replyButton.click();
      console.log('✅ Replied:', replyText);
    } else {
      console.error('❌ Failed to find reply button.');
      await page.screenshot({ path: 'reply_button_error.png' });
    }

  } catch (error) {
    console.error('❌ Reply failed:', error.message);
    await page.screenshot({ path: 'reply_failure.png' });
  } finally {
    await browser.close();
  }
}

function generateFunnyReply(originalText) {
  return `😂 LETSMANGA just summoned the timeline gods with this one.`;
}

module.exports = { runReplyBot };
