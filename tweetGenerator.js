function generateTweetPrompt() {
  const styles = [
    "🔥 Hot take",
    "😂 Meme drop",
    "💀 Just realized",
    "👀 Unpopular opinion",
    "📉 When the algorithm hits",
    "🐸 Pepe moment"
  ];

  const templates = [
    "If vibes were currency, LETSMANGA would be the Federal Reserve. 💸",
    "Why did LETSMANGA crash Twitter? Too much sauce in one thread.",
    "New rule: You can’t say 'mid' unless you've survived the meme apocalypse.",
    "Twitter X is just Tumblr in a business suit.",
    "When you follow LETSMANGA for manga and end up in therapy. 🛋️"
  ];

  const style = styles[Math.floor(Math.random() * styles.length)];
  const content = templates[Math.floor(Math.random() * templates.length)];

  return `${style}: ${content}`;
}

module.exports = { generateTweetPrompt };
