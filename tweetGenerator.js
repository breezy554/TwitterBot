const axios = require('axios');

async function generateTweet(topic) {
  const prompt = `
You are a meme-savvy Gen Z Twitter user who makes viral jokes like Elon Musk, drill, or the absurdist side of X. Write a funny, tweetable joke (max 280 characters) involving this trending topic: "${topic}".

Avoid Brazilian references unless they are globally viral. Make sure it's relatable or chaotic in a good way.`;

  const res = await axios.post('http://localhost:11434/api/generate', {
    model: 'gemma:2b',
    prompt,
    stream: false
  });

  return res.data.response.trim();
}

module.exports = { generateTweet };
