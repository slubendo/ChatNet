const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');

const GPT3_API_URL = 'https://api.openai.com/v1/engines/davinci-002/completions';

app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/gpt3', async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(GPT3_API_URL, {
      prompt,
      maxTokens: 150,
      temperature: 0.5,
      model: 'text-davinci-002',
      apiKey: process.env.OPENAI_API_KEY
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });

    res.send({ message: response.data.choices[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error generating response from GPT-3.5 API' });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);

    if (msg.includes('@bot')) {
      const prompt = msg.replace('@bot', '').trim();

      axios.post('/api/gpt3', { prompt })
        .then(response => {
          io.emit('chat message', `@bot ${JSON.stringify(response.data.message)}`);
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      io.emit('chat message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
