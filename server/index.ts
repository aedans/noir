import cors from "cors";
import express from "express";
import http from "http";
import fs from "fs";
import { Server, Socket } from "socket.io";

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

app.get('/cards', (req, res) => {
  let cards = fs.readdirSync("./assets/cards").map(file => file.substring(0, file.lastIndexOf('.')));
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