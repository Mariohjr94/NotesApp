import User from "../models/User.js";
import Message from "../models/messages.js";

export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("senderId", "name pic email")
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

  try {
    const newMessage = {
      senderId: req.user.id, // Use .id which is available as per your req.user log
      recipientId,
      content,
      chat: chatId,
      isRead: false,
    };

    // Create new message document
    let message = await Message.create(newMessage); // Assuming Message is your mongoose model for messages

    // Populate necessary fields after creation
    message = await message.populate([
      { path: "senderId", select: "firstName picturePath" },
      { path: "recipientId", select: "firstName picturePath" },
      { path: "chat" },
    ]);

    // Update the chat's latest message
    await Message.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .send({ message: "Failed to send message", error: error.message });
  }
};

export const readMessage = async (req, res) => {
  try {
    const recipientId = req.body.userId;
    console.log(recipientId);
    console.log(
      `Marking messages as read for chat: ${req.params.chatId} for recipient: ${recipientId}`
    );
    const result = await Message.updateMany(
      { chat: req.params.chatId, recipientId: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
    console.log(`Updated ${result.nModified} messages.`);
    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.nModified,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};
