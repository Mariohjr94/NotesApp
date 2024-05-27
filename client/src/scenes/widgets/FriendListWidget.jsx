import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import Friend from "../../componets/Friend";
import WidgetWrapper from "../../componets/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "../../state";
import { fetchChatsSuccess, receiveNewMessage } from "../../state/chatSlice";
import CircularProgress from "@mui/material/CircularProgress";
import socket from "../../socket"; // Import the socket instance

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.auth.token);

  const friends = useSelector((state) => state.auth.user?.friends ?? []);
  const chats = useSelector((state) => state.chat.chats);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    socket.emit("joinChatRooms", { userId });

    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      if (message.recipientId === userId) {
        dispatch(receiveNewMessage({ chatId: message.chat, message }));
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [dispatch, userId]);

  const getFriends = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/users/${userId}/friends`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const sortedFriends = data.sort((a, b) => b.isOnline - a.isOnline);
      dispatch(setFriends({ friends: sortedFriends }));
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChats = async () => {
    try {
      const response = await fetch("http://localhost:3001/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      dispatch(fetchChatsSuccess(data));
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  useEffect(() => {
    if (userId && token) {
      getFriends();
      getChats();
    }
  }, [userId, token, dispatch]);

  if (isLoading) {
    return <CircularProgress />;
  }

  // Splitting friends into online and offline groups
  const onlineFriends = friends.filter((friend) => friend.isOnline);
  const offlineFriends = friends.filter((friend) => !friend.isOnline);

  // Helper function to find the chat for a given friend
  const getChatForFriend = (friendId) => {
    return chats.find((chat) =>
      chat.users.some((user) => user._id === friendId)
    );
  };

  const handleChatClick = async (friendId) => {
    try {
      const response = await fetch("http://localhost:3001/chats/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: friendId }),
      });

      if (!response.ok) {
        throw new Error("Failed to access chat");
      }

      const chat = await response.json();
      setCurrentChatId(chat._id); // If you want to track the current chat ID
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Friend List
      </Typography>

      {/* Online friends section */}
      {onlineFriends.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: "0.5rem" }}>
            Online
          </Typography>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            {onlineFriends.map((friend) => {
              const chat = getChatForFriend(friend._id);
              const latestMessage = chat ? chat.latestMessage : null;
              console.log(`Chat for friend ${friend._id}:`, chat);
              console.log(
                `Latest message for friend ${friend._id}:`,
                latestMessage
              );
              return (
                <Friend
                  key={friend._id}
                  friendId={friend._id}
                  name={`${friend.firstName} ${friend.lastName}`}
                  subtitle={friend.occupation}
                  userPicturePath={friend.picturePath}
                  isOnline={friend.isOnline}
                  onChatClick={handleChatClick}
                  chatId={chat?._id}
                  latestMessage={latestMessage}
                />
              );
            })}
          </Box>
          <Divider sx={{ my: 2 }} />
        </>
      )}

      {/* Offline friends section */}
      {offlineFriends.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: "0.5rem" }}>
            Offline
          </Typography>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            {offlineFriends.map((friend) => {
              const chat = getChatForFriend(friend._id);
              const latestMessage = chat ? chat.latestMessage : null;
              console.log(`Chat for friend ${friend._id}:`, chat);
              console.log(
                `Latest message for friend ${friend._id}:`,
                latestMessage
              );
              return (
                <Friend
                  key={friend._id}
                  friendId={friend._id}
                  name={`${friend.firstName} ${friend.lastName}`}
                  subtitle={friend.occupation}
                  userPicturePath={friend.picturePath}
                  isOnline={friend.isOnline}
                  chatId={chat?._id}
                  latestMessage={latestMessage}
                />
              );
            })}
          </Box>
        </>
      )}
    </WidgetWrapper>
  );
};

export default FriendListWidget;
