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
