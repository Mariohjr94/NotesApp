// Chat.js
import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Navbar from "../navBar";
import FriendListWidget from "../widgets/FriendListWidget";
import Chats from "../widgets/Chats";

const Chat = () => {
  // const [message, setMessage] = useState("");
  // const [messages, setMessages] = useState([]);

  const [user, setUser] = useState(null);
  const { _id } = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: isNonMobileScreens ? "row" : "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "2rem",
          padding: "2rem",
        }}
      >
        <Box
          sx={{
            flexBasis: "26%",
          }}
        >
          <FriendListWidget userId={_id} onFriendSelect={setSelectedFriendId} />
        </Box>
        <Box
          sx={{
            flexBasis: isNonMobileScreens ? "42%" : "100%",
            mt: isNonMobileScreens ? 0 : "2rem",
          }}
        >
          <Chats />
        </Box>
      </Box>
    </Box>
  );
};
export default Chat;

/* <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form> */
