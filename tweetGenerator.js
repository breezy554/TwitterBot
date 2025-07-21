function generateTweet() {
  const tweets = [
    "Hot take: Why did LETSMANGA crash Twitter? Too much sauce in one thread. #NewAgeTwitter #MemeStorm",
    "If vibes were currency, LETSMANGA would be the Federal Reserve. 💸🔥 #GenZHumor",
    "New rule: You can’t say 'mid' unless you've survived the meme apocalypse. #TwitterLore",
    "If 'based' had a child with 'cringe', you’d get most tweets today. LETSMANGA strikes again.",
    "What's stronger than AI? A meme with context. LETSMANGA knows. #MetaMeme"
  ];
  return tweets[Math.floor(Math.random() * tweets.length)];
}

module.exports = { generateTweet };
