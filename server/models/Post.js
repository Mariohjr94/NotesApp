import mongoose from "mongoose";

// Define the comment schema
const commentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, //  reference the User model
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Define the post schema
const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
