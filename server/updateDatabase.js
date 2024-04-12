//this file is use to update database as needed!!!
//use code below as a reference for future updates.

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // Adjust the path to your User model
import Post from "./models/Post.js"; // Adjust the path to your Post model
import Message from "./models/messages.js"; // Adjust the path to your Message model

dotenv.config();

const mongoURL = process.env.MONGO_URL;

const updateDatabase = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Updating existing posts to ensure they have the 'comments' array
    const postsResult = await Post.updateMany(
      { comments: { $exists: false } },
      { $set: { comments: [] } }
    );
    console.log(
      `Updated ${postsResult.nModified} post documents to include comments`
    );

    // Add additional update logic for User and Message if needed
    // For instance, if you need to ensure every User has an 'isOnline' field
    const usersResult = await User.updateMany(
      { isOnline: { $exists: false } },
      { $set: { isOnline: false } }
    );
    console.log(
      `Updated ${usersResult.nModified} user documents to include isOnline field`
    );

    // If you need to initialize 'attachments' in messages
    const messagesResult = await Message.updateMany(
      { attachments: { $exists: false } },
      { $set: { attachments: [] } }
    );
    console.log(
      `Updated ${messagesResult.nModified} message documents to include attachments`
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

updateDatabase();
