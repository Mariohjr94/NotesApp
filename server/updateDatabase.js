// This file is used to update the database as needed!!!
// Use code below as a reference for future updates.

import mongoose from "mongoose";
import Chat from "./models/chat.js";
import dotenv from "dotenv";

dotenv.config();
const updateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    const result = await Chat.updateMany(
      { users: { $size: 0 } },
      { $set: { isGroupChat: false } } // Update: sets 'isGroupChat' to false
    );

    console.log(`Updated ${result.modifiedCount} chat documents.`);

    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(`Error updating database: ${error.message}`);
    process.exit(1);
  }
};

updateDatabase();
