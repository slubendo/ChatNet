require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function prompt({ message }) {
  let systemMessage = "";
  let userMessage = "";
  let temperature = 0.8;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
      { role: "user", content: message },
    ],
    temperature: temperature,
    max_tokens: 2000,
  });
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data;
}

async function promptMessage({ message, type }) {
  const response = await prompt({ message });

  console.log(response.choices[0].message.content);

  // return response.choices[0].text
  return response.choices[0].message.content;
}

module.exports = { promptMessage };
