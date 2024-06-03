import Post from "../models/Post.js";
import User from "../models/User.js";

// /* CREATE */
// export const createPost = async (req, res) => {
//   try {
//     const { userId, description } = req.body;
//     console.log("Request body:", req.body);
//     console.log("File:", req.file);

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const newPost = new Post({
//       userId,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       location: user.location,
//       description,
//       userPicturePath: user.picturePath,
//       picturePath: req.file ? req.file.filename : "", // Use filename if file exists
//       likes: {},
//       comments: [],
//     });

//     await newPost.save();
//     const posts = await Post.find();
//     res.status(201).json(posts);
//   } catch (err) {
//     console.error("Error creating post:", err);
//     res.status(409).json({ message: err.message });
//   }
// };

/* CREATE */
export const createPost = async (req, res) => {
  try {
    console.log("Inside createPost function");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const { userId, description, picturePath } = req.body;

    if (!userId || !description) {
      console.log("Missing userId or description in request body");
      return res
        .status(400)
        .json({ message: "User ID and description are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: req.file ? req.file.filename : "", // Use filename if file exists
      likes: {},
      comments: [],
    });

    console.log("New post object:", newPost);

    await newPost.save();

    console.log("Post saved successfully");

    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate({
      path: "comments.userId",
      select: "firstName lastName picturePath",
    });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).populate({
      path: "comments.userId",
      select: "firstName lastName picturePath",
    });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { userId, text } = req.body;
  try {
    // Add the comment to the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { userId, text } } },
      { new: true } // Return the updated document
    ).populate({
      path: "comments.userId",
      select: "firstName lastName picturePath", // Populate the user's name and picture
    });

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
