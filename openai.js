import axios from "axios";
import dotenv from "dotenv";
import MarkdownIt  from 'markdown-it'
import hljs from 'highlight.js';


const md = new MarkdownIt()

dotenv.config();
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function prompt({ message }) {
  let systemMessage =
    "Help the users in a groupchat. You will be given the chat members and the chat history in stringified json format. Respond with the answer in plain text without formatting.";
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
  console.log("promptMessage", message, type);
  const response = await prompt({ message });
  const result = md.render(response.choices[0].message.content);
  console.log(result)
  // console.log("response", response)
  // console.log("choices", response.choices[0])
  
  return result
}
