require('dotenv').config();
const cron = require('node-cron');
const { generateTweet } = require('./ai');
const { postToTwitter } = require('./poster');
const { runReplyBot } = require('./replier');
const { runRetweetBot } = require('./retweeter');
const chromeLauncher = require('chrome-launcher');

async function getLocalChromePath() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const path = chrome.chromePath;
  await chrome.kill();
  return path;
}

(async () => {
  console.log('🚀 Bot started. Initializing first cycle...');

  const executablePath = await getLocalChromePath();

  // Run immediately
  try {
    const tweet = await generateTweet();
    console.log('🔥 Generated Tweet:', tweet);
    await postToTwitter(tweet, executablePath);
  } catch (e) {
    console.error('❌ Tweet bot error:', e.message);
  }

  try {
    await runReplyBot(executablePath);
  } catch (e) {
    console.error('❌ Reply bot error:', e.message);
  }

  try {
    await runRetweetBot(executablePath);
  } catch (e) {
    console.error('❌ Retweet bot error:', e.message);
  }

  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🕒 Running scheduled tweet...');
    const tweet = await generateTweet();
    console.log('🔥 Generated Tweet:', tweet);
    await postToTwitter(tweet, executablePath);
  });

  cron.schedule('*/15 * * * *', async () => {
    console.log('💬 Running reply bot...');
    await runReplyBot(executablePath);
  });

  cron.schedule('0 * * * *', async () => {
    console.log('🔁 Running retweet bot...');
    await runRetweetBot(executablePath);
  });
})();
