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
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import WidgetWrapper from "../../componets/WidgetWrapper";
import FlexBetween from "../../componets/FlexBetween";

const Chats = ({ isProfile }) => {
  const currentChat = useSelector((state) => state.chat.currentChat);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user._id);
  const [socket, setSocket] = useState(null);

  const chatId = currentChat._id;

  const recipientId = currentChat.users.find(
    (user) => user._id !== userId
  )?._id;

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
        recipientId,
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
          p: "8px",
          mb: "1rem",
          bgcolor: "background.paper",
        }}
      >
        {messages.map((message, index) => (
          <Paper key={index} elevation={1} sx={{ mb: 1, p: 1 }}>
            <Typography>{message.content}</Typography>
          </Paper>
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
