const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const path = require("path");
const http = require("http");
const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer);
const initializeSocket = require("./socket");

const port = process.env.PORT || 3000;

const connectDB = require("./server/config/db");
const authRoutes = require("./server/routes/authRoutes");
const mainRoutes = require("./server/routes/mainRoutes");
const productRoutes = require("./server/routes/productRoutes");
const cartRoutes = require("./server/routes/cartRoutes");
const orderRoutes = require("./server/routes/orderRoutes");

require("dotenv").config();

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Session middleware setup
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());
app.use(flash());
app.use("/", authRoutes);
app.use("/", mainRoutes);
app.use("/", productRoutes);
app.use("/", cartRoutes);
app.use("/", orderRoutes);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Initialize Socket.IO
initializeSocket(io);

httpServer.listen(port, () => {
  console.log("App listening to: " + port);
});
module.exports = { io, app, httpServer };
