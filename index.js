require('dotenv').config();
const { postToTwitter } = require('./poster');
const { runReplyBot } = require('./replier');
const { runRetweetBot } = require('./retweeter');
const generateTweet = require('./tweetGenerator');

async function runBotCycle() {
  console.log('🚀 Bot started. Initializing first cycle...');

  try {
    // Generate tweet
    const tweet = await generateTweet();
    console.log('🔥 Generated Tweet:', tweet);

    // Post tweet
    await postToTwitter(tweet);
  } catch (err) {
    console.error('❌ Tweet bot error:', err.message);
  }

  try {
    // Run reply bot
    await runReplyBot();
  } catch (err) {
    console.error('❌ Reply bot error:', err.message);
  }

  try {
    // Run retweet bot
    await runRetweetBot();
  } catch (err) {
    console.error('❌ Retweet bot error:', err.message);
  }

  console.log('⏳ Cycle complete. Waiting 30 mins...\n');
  setTimeout(runBotCycle, 1000 * 60 * 30); // 30 min cycle
}

runBotCycle();
