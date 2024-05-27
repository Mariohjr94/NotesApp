import { useState, useEffect } from "react";
import { Box, IconButton, Typography, useTheme, Badge } from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import { setFriends } from "../state";
import { receiveNewMessage, setCurrentChat } from "../state/chatSlice";
import io from "socket.io-client";
import Chats from "../scenes/chat/Chat";

const socket = io("http://localhost:3001");

const Friend = ({
  friendId,
  name,
  subtitle,
  userPicturePath,
  chatId,
  latestMessage,
}) => {
  const dispatch = useDispatch();
  const { _id } = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const { friends } = useSelector((state) => state.auth.user);
  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const hasUnreadMessage =
    latestMessage?.isRead === false && latestMessage?.recipientId === _id;

  const isFriend = friends.find((friend) => friend._id === friendId);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      if (message.chat === chatId && message.recipientId === _id) {
        console.log("You have new unread messages in chat: " + chatId);
        dispatch(receiveNewMessage({ chatId, message }));
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatId, _id, dispatch]);

  const patchFriend = async () => {
    const response = await fetch(
      `http://localhost:3001/users/${_id}/${friendId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    dispatch(setFriends({ friends: data }));
  };

  const onMessageClick = async () => {
    try {
      const response = await fetch(`http://localhost:3001/chats/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: friendId }),
      });
      if (!response.ok) throw new Error("Failed to initiate chat");

      const chat = await response.json();
      console.log("chat: ", chat);
      dispatch(setCurrentChat(chat));
      // Check if socket is connected before emitting
      if (socket && socket.connected) {
        socket.emit("joinChat", { chatId: chat._id });
        console.log("joinChat event emitted");
      } else {
        console.log("Socket not connected");
      }
      navigate("/chat");
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

  return (
    <FlexBetween>
      <FlexBetween gap="1rem">
        <UserImage image={userPicturePath} size="55px" />
        <Box
          onClick={() => {
            navigate(`/profile/${friendId}`);
          }}
        >
          <Typography
            color={main}
            variant="h5"
            fontWeight="500"
            sx={{
              "&:hover": {
                color: palette.primary.light,
                cursor: "pointer",
              },
            }}
          >
            {name}
          </Typography>
          <Typography color={medium} fontSize="0.75rem">
            {subtitle}
          </Typography>
        </Box>
      </FlexBetween>
      <IconButton onClick={() => onMessageClick(friendId)}>
        <Badge color="secondary" variant="dot" invisible={!hasUnreadMessage}>
          <MessageIcon sx={{ color: primaryDark }} />
        </Badge>
      </IconButton>
      <IconButton
        onClick={() => patchFriend()}
        sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
      >
        {isFriend ? (
          <PersonRemoveOutlined sx={{ color: primaryDark }} />
        ) : (
          <PersonAddOutlined sx={{ color: primaryDark }} />
        )}
      </IconButton>
    </FlexBetween>
  );
};

export default Friend;
