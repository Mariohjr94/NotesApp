import mongoose from "mongoose";
import dotenv from "dotenv";
import Chat from "./models/chat.js"; // Ensure the path is correct
import User from "./models/User.js";
import Message from "./models/messages.js";

dotenv.config();

const updateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // If you use the User model, ensure it is correctly registered before use.
    // Example operation that involves the User model:
    const users = await User.find({}); // Just an example to show User model usage
    console.log(`Fetched ${users.length} users`);

    // Your existing logic to update documents...
    const chats = await Chat.find({}).populate("users");
    let updateCount = 0;

    for (let chat of chats) {
      // Your logic to update each chat
      console.log(`Processing chat ID: ${chat._id}`);
      updateCount++;
    }

    console.log(`Updated ${updateCount} chat documents.`);
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(`Error updating database: ${error.message}`);
    process.exit(1);
  }
};

updateDatabase();
