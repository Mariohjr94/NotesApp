import User from "../models/User.js";
import messages from "../models/messages.js";

export const allMessages = async (req, res) => {
  try {
    const messages = await messages
      .find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

//@description     Create New Message
//@route           POST //Messages/
//@access          Protected
export const sendMessage = async (req, res) => {
  console.log("req.user:", req.user); // Debug log
  const { content, chatId, recipientId } = req.body;

  // Check for required fields
  if (!content || !chatId || !recipientId) {
    return res.status(400).send({
      message: "Content, chatId, and recipientId are required.",
    });
  }

  const newMessage = {
    senderId: req.user._id, // The ID of the sender user
    recipientId, // The ID of the recipient user
    content, // The content of the message
    chat: chatId, // The chat ID to which this message belongs
  };

  try {
    // Create new message document
    let message = await messages.create(newMessage);

    // Populate necessary fields after creation
    message = await message
      .populate("senderId", "firstName picturePath")
      .execPopulate();
    message = await message
      .populate("recipientId", "firstName picturePath")
      .execPopulate();
    message = await message.populate("chat").execPopulate();

    // Update the chat's latest message
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .send({ message: "Failed to send message", error: error.message });
  }
};
