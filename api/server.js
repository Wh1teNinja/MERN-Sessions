const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const MongoConnect = require("connect-mongo");

require("dotenv").config();

const PORT = process.env.PORT || 80;

const corsConfig = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
};

const io = require("socket.io")(server, {
  cors: corsConfig,
});

app.enable("trust proxy");

const session = require("express-session")({
  secret: "test socket session",
  resave: false,
  saveUninitialized: true,
  store: MongoConnect.create({
    mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n6hit.mongodb.net/testMERNSessions?retryWrites=true&w=majority`,
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 48,
    sameSite: "none",
  },
});
const socketSession = require("express-socket.io-session");

app.use(cors(corsConfig));

app.use(session);

io.use(
  socketSession(session, {
    autoSave: true,
  })
);

app.use((req, res, next) => {
  if (req.session.num === undefined) {
    req.session.num = 0;
  }
  next();
});

io.on("connection", (socket) => {
  socket.on("increase", () => {
    socket.emit("value", ++socket.handshake.session.num);
  });

  socket.on("decrease", () => {
    socket.emit("value", --socket.handshake.session.num);
  });

  socket.on("reload-session", () => {
    socket.handshake.session.reload(() => {});
  });
});

app.get("/increase", (req, res) => {
  res.json({ num: ++req.session.num });
});

app.get("/decrease", (req, res) => {
  res.json({ num: --req.session.num });
});

app.get("/", (req, res) => {
  res.json({ num: req.session.num });
});

server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
