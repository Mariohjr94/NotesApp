import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Assuming 'User' is your user model
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Ensures the recipient is also a valid user
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: {
          type: String, // Could be "image", "file", etc.
          required: true,
        },
        url: {
          type: String, // URL to the attachment
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
