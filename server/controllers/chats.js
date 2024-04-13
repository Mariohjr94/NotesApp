import User from "../models/User.js";
import Chat from "../models/chat.js";

//creating id for one-on-one communication
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(req.body);
    console.log(req.user);

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }

    if (!req.user.id) {
      console.log("Request user ID not found");
      return res.sendStatus(401);
    }

    let isChat = await Chat.findOne({
      isGroupChat: false,
      users: {
        $all: [
          { $elemMatch: { $eq: req.user._id } },
          { $elemMatch: { $eq: userId } },
        ],
      },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (!isChat) {
      const chatData = {
        chatName: "senderId",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      const createdChat = await Chat.create(chatData);
      isChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
    }

    isChat = await User.populate(isChat, {
      path: "latestMessage.senderId",
      select: "firstName picturePath email",
    });

    res.status(200).json(isChat);
  } catch (error) {
    console.error("Error in accessChat:", error);
    res
      .status(500)
      .json({ message: "An error occurred during the chat access process." });
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
export const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.senderId",
          select: "firstName picturePath email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

//@description     Create New Group Chat
//@route           POST /chat/group
//@access          Protected
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  let users = req.body.users;

  if (typeof users === "string") {
    try {
      users = JSON.parse(users);
    } catch (error) {
      return res.status(400).send("Users field is not a valid JSON.");
    }
  }

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Rename Group
// @route   PATCH /chat/rename
// @access  Protected
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    // Log the incoming data
    console.log(`Renaming chat: ${chatId} to ${chatName}`);

    // Attempt to update the chat document
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      console.log(`Chat not found with id: ${chatId}`);
      return res.status(404).json({ message: "Chat Not Found" });
    } else {
      console.log(`Chat renamed successfully: ${updatedChat}`);
      return res.json(updatedChat);
    }
  } catch (error) {
    // Log the error to the console
    console.error(`Error when renaming chat: ${error}`);
    return res
      .status(500)
      .json({ message: "Server error during group renaming" });
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};
