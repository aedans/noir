import cors from "cors";
import express from "express";
import http from "http";
import fs from "fs";
import { Server, Socket } from "socket.io";
import { startGame } from "./game";
import { removeCard } from "./card";

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.static('dist'));
app.use(express.static('assets'));
app.use(express.json())

let players: Socket[] = [];
io.on('connection', socket => {
  players.push(socket);

  socket.on('disconnect', reason => {
    players = players.filter(x => x.id != socket.id);
  });

  if (players.length >= 2) {
    startGame(players[0], players[1]);
    players = players.slice(2);
  }
});

app.post('/cards', (req, res) => {
  try {
    if (req.body.password == "qG35HPG9DkYc8TKu") {
      removeCard(req.body.name.substring(req.body.name.lastIndexOf('.')));
      const path = `./assets/scripts/${req.body.name}`;
      if (fs.existsSync(path)) fs.rmSync(path);
      fs.writeFileSync(path, req.body.text);
      res.send({ message: `Added card ${req.body.name}` });
    } else {
      res.send({ message: "Incorrect password" });
    }
  } catch (e) {
    res.send({ message: (e as Error).message });
  }
});

app.get('/cards', (req, res) => {
  let cards = fs.readdirSync("./assets/scripts").map(file => file.substring(0, file.lastIndexOf('.')));
  res.send(cards);
});

app.get('/download', (req, res) => {
  res.download(`./assets/${req.query.asset}`);
});

app.get('/*', (req, res) => {
  res.redirect('/');
})

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});