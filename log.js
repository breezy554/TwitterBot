const fs = require('fs');
const path = './log.json';

function saveTweet(tweet) {
  let history = [];
  if (fs.existsSync(path)) {
    history = JSON.parse(fs.readFileSync(path, 'utf-8'));
  }
  history.push({ tweet, time: new Date().toISOString() });
  fs.writeFileSync(path, JSON.stringify(history, null, 2));
}

function alreadyPosted(tweet) {
  if (!fs.existsSync(path)) return false;
  const history = JSON.parse(fs.readFileSync(path, 'utf-8'));
  return history.some(entry => entry.tweet === tweet);
}

module.exports = { saveTweet, alreadyPosted };
