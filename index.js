require('dotenv').config();
const { runTweetBot } = require('./poster');
const { runReplyBot } = require('./replier');
const { runRetweetBot } = require('./retweeter');

(async () => {
  console.log('🚀 Bot started. Initializing first cycle...');

  try {
    await runTweetBot();
  } catch (e) {
    console.error('❌ Tweet bot error:', e.message);
  }

  try {
    await runReplyBot();
  } catch (e) {
    console.error('❌ Reply bot error:', e.message);
  }

  try {
    await runRetweetBot();
  } catch (e) {
    console.error('❌ Retweet bot error:', e.message);
  }

  console.log('⏳ Cycle complete. Waiting 30 mins...');
})();
