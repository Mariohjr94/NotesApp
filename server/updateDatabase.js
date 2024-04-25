// This file is used to update the database as needed!!!
// Use code below as a reference for future updates.

import mongoose from "mongoose";
import Message from "./models/messages.js";
import dotenv from "dotenv";

dotenv.config();

const updateDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Example update: add a default chat ID to messages where 'chat' is missing
    // You'll need to replace 'default_chat_id' with a valid chat document ID from your database
    const result = await Message.updateMany(
      { chat: { $exists: false } },
      { $set: { chat: "66273aadf5742d3ced79a33d" } }
    );

    console.log(`Updated ${result.modifiedCount} message documents.`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(`Error updating database: ${error.message}`);
    process.exit(1); // Exit the script with a failure code
  }
};

updateDatabase();
