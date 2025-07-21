// ai.js
const axios = require('axios');

async function generateText(prompt) {
  const res = await axios.post('http://localhost:11434/api/generate', {
    model: 'gemma:2b',
    prompt,
    stream: false
  });
  return res.data.response.trim();
}

module.exports = { generateText };
