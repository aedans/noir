import cors from "cors";
import express from "express";
import http from "http";

const app = express();
const port = 8080;
const server = http.createServer(app);

app.use(cors());
app.use(express.static("dist"));
app.use(express.static("assets"));
app.use(express.json());

app.get("/*", (req, res) => {
  res.redirect("/");
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
