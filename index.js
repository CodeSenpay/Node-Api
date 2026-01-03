import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import router from "./routes.js";
// import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
  process.env.URL_1,
  process.env.URL_2,
  process.env.URL_3,
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked by origin"));
    }
  },
  credentials: true, // if you use cookies/sessions
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use("/", router);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io(Image created but used dev origin url!!!)
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN_URL,
    methods: ["GET", "POST"],
  },
});

// Attach io instance to app
app.set("socketio", io);

// Socket.io events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("registerUser", (userId) => {
    socket.join(userId?.toString());
    console.log(`User joined their Room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
