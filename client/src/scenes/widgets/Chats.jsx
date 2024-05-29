import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import socket from "../../socket"; // import the shared socket instance
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
import { receiveNewMessage } from "../../state/chatSlice";

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
  const dispatch = useDispatch();
  const currentChat = useSelector((state) => state.chat.currentChat);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user._id);
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  const chatId = currentChat?._id;
  const otherUser = currentChat?.users.find((user) => user._id !== userId);

  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", { chatId });
    console.log(`Joined chat room: ${chatId}`);

    socket.on("receiveMessage", (message) => {
      console.log("Message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      dispatch(receiveNewMessage({ chatId, message }));
    });

    socket.on("messageRead", ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageId ? { ...message, isRead: true } : message
        )
      );
    });

    return () => {
      console.log("Leaving chat room");
      socket.emit("leaveChat", { chatId });
      socket.off("receiveMessage");
      socket.off("messageRead");
    };
  }, [chatId, dispatch]);

  useEffect(() => {
    if (currentChat) {
      const fetchMessages = async () => {
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
            console.log("Messages fetched:", data);
            setMessages(data);
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [currentChat, chatId, token]);

  const handleSendMessage = async () => {
    if (currentChat && newMessage.trim()) {
      const message = {
        chatId: currentChat._id,
        recipientId: otherUser._id,
        senderId: userId,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, senderId: { _id: userId } },
      ]);
      socket.emit("sendMessage", message);
      console.log("Message sent:", message);
      setNewMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markMessagesAsRead = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/messages/read/${chatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      const data = await response.json();
      console.log("Response from marking messages as read:", data);

      if (Array.isArray(data)) {
        data.forEach((message) => {
          socket.emit("messageRead", {
            messageId: message._id,
            senderId: message.senderId,
          });
        });
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          markMessagesAsRead();
        }
      },
      { threshold: 1.0 }
    );

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }

    return () => {
      if (messagesEndRef.current) {
        observer.unobserve(messagesEndRef.current);
      }
    };
  }, [messages]);

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
                message.senderId._id === userId ? "flex-end" : "flex-start",
              mb: "10px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              {message.senderId._id !== userId && (
                <UserImage image={otherUser.picturePath} size="30px" />
              )}
              <MessageBubble isSender={message.senderId._id === userId}>
                <Typography>{message.content}</Typography>
              </MessageBubble>
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: "4px",
                color: "text.secondary",
                alignSelf:
                  message.senderId._id === userId ? "flex-end" : "flex-start",
              }}
            >
              {new Date(message.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
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
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        />
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default Chats;
