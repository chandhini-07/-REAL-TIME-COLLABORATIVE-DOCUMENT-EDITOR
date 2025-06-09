const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Document = require('./models/Document');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get('/documents/:id', async (req, res) => {
  const id = req.params.id;
  let document = await Document.findById(id);
  if (!document) {
    document = await Document.create({ _id: id, content: '' });
  }
  res.json(document);
});

io.on('connection', (socket) => {
  socket.on('join', async (docId) => {
    socket.join(docId);

    socket.on('send-changes', async ({ docId, content }) => {
      socket.to(docId).emit('receive-changes', content);
      await Document.findByIdAndUpdate(docId, { content });
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
