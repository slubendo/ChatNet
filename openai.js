import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function prompt({ message }) {
  let systemMessage =
    "Help the users in a groupchat. You will be given the chat members and the chat history in json format. Respond with the answer in plain text without formatting.";
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
    max_tokens: 200,
  });
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data;
}

export async function promptMessage({ message, type }) {
  // console.log("promptMessage", message, type);
  const response = await prompt({ message });

  console.log(response.choices[0].message.content);

  // return response.choices[0].text
  return response.choices[0].message.content;
}

// module.exports = { promptMessage };
