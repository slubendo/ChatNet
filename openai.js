const axios = require("axios");
require("dotenv").config();

const GPT3_API_URL =
  "https://api.openai.com/v1/engines/davinci-002/completions";

async function generateResponse(prompt) {
  try {
    const response = await axios.post(
      GPT3_API_URL,
      {
        prompt,
        maxTokens: 150,
        temperature: 0.5,
        model: "text-davinci-002",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 10000, // 10 seconds
      }
    );
    return response.data.choices[0].text;
  } catch (error) {
    console.error(error);
    throw new Error("Error generating response from GPT-3.5 API");
  }
}

module.exports = { generateResponse };
