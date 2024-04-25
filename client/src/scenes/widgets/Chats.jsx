import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import {
  ChatBubbleOutlineOutlined,
  SendOutlined,
  Token,
} from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import WidgetWrapper from "../../componets/WidgetWrapper";
import FlexBetween from "../../componets/FlexBetween";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Chats = ({ userId, isProfile }) => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const theme = useTheme();
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;
  const currentChat = useSelector((state) => state.chat.currentChat);

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [recipientId, setRecipientId] = useState("");

  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log(currentChat);

  const handleSendMessage = () => {
    if (currentChat && newMessage.trim()) {
      sendMessage(currentChat._id, userId, newMessage.trim());
      setNewMessage(""); // Clear the input after sending the message
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3001/messages/${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };

  useEffect(() => {
    setLoading(true);
    // Simulate fetching chat messages
    fetchChatMessages(currentChat._id)
      .then((messages) => {
        setMessages(messages);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        setLoading(false);
      });
  }, [currentChat._id]);

  const sendMessage = async (chatId, recipientId, content) => {
    console.log("message data: ", chatId, recipientId, content);
    try {
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Your actual token for authorization
        },
        body: JSON.stringify({ chatId, recipientId, content }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data]);
      } else {
        // Handle any errors returned from the server
        console.error("Failed to send message:", data.message);
      }
    } catch (error) {
      // Handle network errors or show error feedback
      console.error("Network error when sending message:", error);
    }
  };

  return (
    <WidgetWrapper>
      <FlexBetween mb="1rem">
        <Typography variant="h6">
          {currentChat ? currentChat.chatName : "Chat"}
        </Typography>
        <Typography variant="subtitle1">
          {currentChat &&
            currentChat.users.map((user, index) => (
              <span key={user._id}>
                {user.name}
                {index < currentChat.users.length - 1 ? ", " : ""}
              </span>
            ))}
        </Typography>
      </FlexBetween>

      {error && <Typography color="error">{error}</Typography>}
      {loading ? (
        <Typography>Loading messages...</Typography>
      ) : (
        <Box
          sx={{
            maxHeight: "300px",
            overflowY: "auto",
            p: "8px",
            mb: "1rem",
            bgcolor: "background.paper",
          }}
        >
          {messages.map((message) => (
            <Paper key={message._id} elevation={1} sx={{ mb: 1, p: 1 }}>
              <Typography>{message.content}</Typography>
            </Paper>
          ))}
        </Box>
      )}
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
        ></Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default Chats;
