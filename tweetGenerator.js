function generateTweet() {
  const intros = [
    "BREAKING NEWS:", "Yo...", "Hot take:", "My brain after watching LETSMANGA:", "New drop 🔥", "Gen Z be like:"
  ];
  const jokes = [
    "Why did LETSMANGA crash Twitter? Too much sauce in one thread.",
    "If vibes were a currency, LETSMANGA would be the Federal Reserve.",
    "LETSMANGA taught me more than 4 years of college ever did.",
    "My therapist now uses LETSMANGA memes to diagnose me.",
    "The Mona Lisa saw LETSMANGA and blinked."
  ];
  const hashtags = ["#LETSMANGA", "#MemeStorm", "#NewAgeTwitter", "#GenZHumor", "#BotWithSauce"];

  const intro = intros[Math.floor(Math.random() * intros.length)];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  const tags = hashtags.sort(() => 0.5 - Math.random()).slice(0, 2).join(' ');

  return `${intro} ${joke} ${tags}`;
}

module.exports = { generateTweet };
