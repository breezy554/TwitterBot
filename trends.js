const axios = require('axios');
const cheerio = require('cheerio');

async function getTrendingTopics() {
  const { data } = await axios.get('https://trends24.in/');
  const $ = cheerio.load(data);
  const trends = [];

  const bannedKeywords = [
    'preta gil', 'rip', 'dies', 'dead', 'explosion', 'massacre', 'shooting', 'killed', 'injured'
  ];

  $('ol.trend-card__list li a').each((i, el) => {
    const text = $(el).text().trim();
    if (
      text &&
      !text.includes('…') &&
      /^[a-zA-Z0-9# ]+$/.test(text) &&
      text.length < 50 &&
      !bannedKeywords.some(bad => text.toLowerCase().includes(bad))
    ) {
      trends.push(text);
    }
  });

  return trends.slice(0, 5);
}

module.exports = { getTrendingTopics };
