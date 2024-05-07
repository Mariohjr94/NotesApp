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
} from "@mui/material";
import { styled } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";
import WidgetWrapper from "../../componets/WidgetWrapper";
import FlexBetween from "../../componets/FlexBetween";
import UserImage from "../../componets/UserImage";

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isSender",
})(({ theme, isSender }) => ({
  backgroundColor: isSender
    ? theme.palette.primary.light
    : theme.palette.grey[200],
  color: isSender
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  borderRadius: "20px",
  padding: "10px 15px",
  maxWidth: "60%",
  marginLeft: isSender ? "auto" : undefined,
  marginRight: isSender ? undefined : "auto",
  "&:after": {
    content: '""',
    width: 0,
    height: 0,
    position: "absolute",
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: `10px solid ${
      isSender ? theme.palette.primary.main : theme.palette.grey[300]
    }`,
    bottom: "-10px",
    right: isSender ? "0" : undefined,
    left: isSender ? undefined : "0",
  },
}));

const Chats = ({ isProfile }) => {
  const currentChat = useSelector((state) => state.chat.currentChat);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user._id);
  const [socket, setSocket] = useState(null);
  const theme = useTheme();

  const chatId = currentChat._id;
  const otherUser = currentChat.users.find((user) => user._id !== userId);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    newSocket.emit("joinChat", { chatId });
    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => newSocket.close();
  }, [chatId]);

  useEffect(() => {
    if (currentChat) {
      const fetchMessages = async () => {
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
        if (response.ok) setMessages(data);
        else throw new Error(data.message);
      };
      fetchMessages();
    }
  }, [currentChat, chatId, token]);

  const handleSendMessage = async () => {
    if (newMessage.trim() & otherUser) {
      const message = {
        chatId,
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
          {otherUser?.firstName} {otherUser?.lastName}
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
              flexDirection: "column",
              alignItems:
                message.senderId === userId ? "flex-end" : "flex-start",
              mb: "10px",
            }}
          >
            {message.senderId._id !== userId && (
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <UserImage image={otherUser.picturePath} size="30px" />
                <MessageBubble isSender={message.senderId._id === userId}>
                  <Typography>{message.content}</Typography>
                </MessageBubble>
              </Box>
            )}

            {message.senderId._id === userId && (
              <MessageBubble isSender={message.senderId._id === userId}>
                <Typography>{message.content}</Typography>
              </MessageBubble>
            )}

            <Typography
              variant="caption"
              display="block"
              sx={{
                textAlign:
                  message.senderId._id === userId ? "flex-end" : "flex-start",
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
