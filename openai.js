import axios from "axios";
import dotenv from "dotenv";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const md = new MarkdownIt({
  highlight: function (str, lang) {
    return (
      '<pre class="hljs"><code>' +
      hljs.highlightAuto(str).value +
      "</code></pre>"
    );
  },
});

dotenv.config();
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function prompt({ message, temp, systemMessage }) {
  // console.log("temperature: ", temp);
  // let systemMessage = systemMessage;
  // "You are ChatGPT, an AI assistant in a groupchat. You may be given the chat members, message history and message time in json format. This history will include past ChatGPT prompts and answers. Respond with the answer in plain text without formatting.";
  // console.log(systemMessage)
  let userMessage = "";
  let temperature = parseInt(temp);

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

export async function promptMessage({ message, type, temp, systemMessage }) {
  const response = await prompt({ message, temp, systemMessage });
  const htmlResponse = md.render(response.choices[0].message.content);
  const markdownDatabase = response.choices[0].message.content;
  // console.log(result);

  // return result;
  return { htmlResponse: htmlResponse, markdownDatabase: markdownDatabase };
}
