import User from "../models/User.js";
import { login } from "./auth.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//updating social media links -------------------
export const addSocialMedia = async (req, res) => {
  const { userId } = req.params; // Get the userId
  const { socialLinks } = req.body; // Get the socialLinks from the request body
  console.log("socialLinks: ", socialLinks);
  try {
    // Update the user document with the new social links
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { socialLinks } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      // If no user is found with the given ID
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is successfully updated, send back the updated user data
    res.status(200).json(updatedUser);
  } catch (error) {
    // If there's an error during the operation, send back an error response
    res.status(500).json({ message: error.message });
  }
};
