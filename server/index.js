import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket } from "socket.io";

//configurations

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/public/assets"))
);
app.use(
  cors({
    origin: `*`,
  })
);

// Function to update the user's online status in the database
async function updateUserStatus(userId, onlineStatus) {
  try {
    await User.findByIdAndUpdate(userId, { isOnline: onlineStatus });
    console.log(`User ${userId} status updated to: ${onlineStatus}`);
  } catch (error) {
    console.error(`Error updating status for user ${userId}: `, error);
  }
}

//creating socket connections
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("userOnline", async ({ userId }) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} is online with socket ${socket.id}`);

    // Update user status in your database
    await updateUserStatus(userId, true);

    // Broadcast to other users that this user is now online
    socket.broadcast.emit("userStatusChanged", { userId, isOnline: true });
  });

  socket.on("userOffline", async ({ userId }) => {
    console.log(`User ${userId} is going offline`);
    delete onlineUsers[userId];

    // Update user status in your database
    await updateUserStatus(userId, false);

    // Broadcast to other users that this user is now offline
    socket.broadcast.emit("userStatusChanged", { userId, isOnline: false });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    //adding data (seeding)----------------
    //uncommet this two lines in order to seed the data into the mongoDB, once done comment them out.
    // User.insertMany(users);
    // Post.insertMany(posts);
    //------------------------------
  })
  .catch((error) => console.log(`${error} did not connect`));
