const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');

app.use(express.static('public'))
app.use(express.json());
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/openai', async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt,
      max_tokens: 150,
      temperature: 0.5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    res.send({ message: response.data.choices[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error generating response from OpenAI' });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);

    if (msg.includes('@bot')) {
      const prompt = msg.replace('@bot', '').trim();

      axios.post('/api/openai', { prompt })
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

http.listen(3000, () => {
  console.log('listening on *:3000');
});
