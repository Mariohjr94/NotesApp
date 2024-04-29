import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  styled,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import WidgetWrapper from "../../componets/WidgetWrapper";
import FlexBetween from "../../componets/FlexBetween";
import UserImage from "../../componets/UserImage";

const Chats = ({ isProfile, friendId, name, subtitle, userPicturePath }) => {
  const currentChat = useSelector((state) => state.chat.currentChat);
  const { friends } = useSelector((state) => state.auth.user);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user._id);
  const [socket, setSocket] = useState(null);

  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const MessageBubble = styled(Paper)(({ theme, isSender }) => ({
    // Your styles will go here
    backgroundColor: isSender
      ? theme.palette.primary.light
      : theme.palette.grey[200],
    color: isSender
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    // Additional styles based on the previous code snippet...
  }));

  const chatId = currentChat._id;

  const otherUser = currentChat.users.find((user) => user._id !== userId);

  console.log(otherUser);

  // Function to check if the message is the first in a series from the sender/receiver
  const isFirstInSeries = (message, index) => {
    return index === 0 || messages[index - 1].senderId !== message.senderId;
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    // Join the chat room
    newSocket.emit("joinChat", { chatId });

    // Handle incoming messages
    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.emit("leaveChat", { chatId });
      newSocket.close();
    };
  }, [chatId]);

  // Fetch existing messages when the chat is loaded
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (currentChat) {
        try {
          const response = await fetch(
            `http://localhost:3001/messages/${currentChat._id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok) {
            setMessages(data);
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        }
      }
    };

    fetchChatMessages();
  }, [currentChat, token]);

  const handleSendMessage = async () => {
    if (currentChat && newMessage.trim()) {
      const message = {
        chatId: currentChat._id,
        recipientId: otherUser._id,
        senderId: userId,
        content: newMessage.trim(),
      };
      socket.emit("sendMessage", message);
      setNewMessage("");
    }
  };

  return (
    <WidgetWrapper>
      <FlexBetween mb="1rem">
        <Typography variant="h6">
          {currentChat ? currentChat.chatName : "Chat"}
        </Typography>
      </FlexBetween>

      <Box
        sx={{
          maxHeight: "300px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          p: "8px",
          mb: "1rem",
          bgcolor: "background.paper",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                message.senderId === userId ? "flex-end" : "flex-start",
              mb: "10px",
            }}
          >
            {message.senderId !== userId && (
              <UserImage image={otherUser.picturePath} size="30px" />
            )}

            <MessageBubble
              elevation={1}
              isSender={message.senderId === userId}
              sx={{
                borderRadius: "20px",
                padding: "10px 15px",
                position: "relative",
                maxWidth: "60%",
                "&:after": {
                  content: '""',
                  width: 0,
                  height: 0,
                  position: "absolute",
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: `10px solid ${
                    message.senderId === userId
                      ? "senderBubbleColor"
                      : "receiverBubbleColor"
                  }`, // use actual colors
                  bottom: "-10px",
                  right: message.senderId === userId ? "0" : undefined,
                  left: message.senderId === userId ? undefined : "0",
                },
              }}
            >
              <Typography>{message.content}</Typography>
            </MessageBubble>
            <Typography
              variant="caption"
              display="block"
              sx={{
                alignSelf: "flex-end",
                ml: "10px",
                color: "text.secondary",
              }}
            >
              {new Date(message.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
      </Box>

      <FlexBetween gap="0.5rem">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        />
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default Chats;
