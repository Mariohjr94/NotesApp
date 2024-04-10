//this file is use to update database as needed!!!
//use code below as a reference for future updates.

// import mongoose from "mongoose";
// import Post from "./models/Post.js"; // Adjust the path to your Post model
// import dotenv from "dotenv";

// dotenv.config();

// const mongoURL = process.env.MONGO_URL;

// const updatePostsToAddComments = async () => {
//   try {
//     await mongoose.connect(mongoURL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected to MongoDB");

//     const result = await Post.updateMany(
//       { comments: { $exists: false } }, // Filter to only update documents without a `comments` field
//       { $set: { comments: [] } } // Add an empty `comments` array
//     );

//     console.log(`Updated ${result.nModified} documents`);
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   } catch (error) {
//     console.error("Error updating documents:", error);
//   }
// };

// updatePostsToAddComments();
