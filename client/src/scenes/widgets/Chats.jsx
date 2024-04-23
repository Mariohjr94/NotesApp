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

  const handleSendMessage = () => {
    const updatedMessages = [
      ...messages,
      { id: messages.length, text: newMessage },
    ];
    setMessages(updatedMessages);
    setNewMessage("");
  };

  useEffect(() => {
    if (currentChat && currentChat.messages) {
      // Here you set the messages for the currently selected chat
      setMessages(currentChat.messages);
    }
  }, [currentChat]);

  return (
    <WidgetWrapper>
      <FlexBetween mb="1rem">
        <Typography variant="h6">Chats</Typography>
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
        {messages.map((message) => (
          <Paper key={message.id} elevation={1} sx={{ mb: 1, p: 1 }}>
            <Typography>{message.text}</Typography>
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
          sx={{
            flexGrow: 1,
          }}
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
