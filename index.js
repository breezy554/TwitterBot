require('dotenv').config();
const { runTweetBot } = require('./poster');
const { runReplyBot } = require('./replier');
const { runRetweetBot } = require('./retweeter');
const { generateTweet } = require('./tweetGenerator');

const intervalMinutes = 30;

async function main() {
  console.log('🚀 Bot started. Initializing first cycle...');

  try {
    const tweet = generateTweet();
    console.log('🔥 Generated Tweet:', tweet);
    await runTweetBot(tweet);
  } catch (err) {
    console.error('❌ Tweet bot error:', err.message);
  }

  try {
    await runReplyBot();
  } catch (err) {
    console.error('❌ Reply bot error:', err.message);
  }

  try {
    await runRetweetBot();
  } catch (err) {
    console.error('❌ Retweet bot error:', err.message);
  }

  console.log(`⏳ Cycle complete. Waiting ${intervalMinutes} mins...`);
  setTimeout(main, intervalMinutes * 60 * 1000);
}

main();
