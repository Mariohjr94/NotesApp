//this file is use to update database as needed!!!
//use code below as a reference for future updates.

// updateSocialLinks.js
// import mongoose from "mongoose";
// import User from "./models/User.js"; // Adjust the path as necessary
// import dotenv from "dotenv";

// dotenv.config();

// const updateUsersToAddSocialLinks = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL); // Use your MongoDB URI
//     console.log("Connected to MongoDB");

//     const result = await User.updateMany(
//       {}, // This empty query object matches all documents
//       {
//         $set: {
//           "socialLinks.twitter": "",
//           "socialLinks.linkedin": "",
//           "socialLinks.github": "",
//         },
//       },
//       { multi: true } // Ensures update applies to all documents
//     );

//     console.log("Update result:", result);
//     console.log("All users have been updated to include socialLinks.");
//   } catch (error) {
//     console.error("Failed to update users:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   }
// };

// updateUsersToAddSocialLinks();
