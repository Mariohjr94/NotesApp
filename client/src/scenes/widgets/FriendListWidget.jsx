import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import Friend from "../../componets/Friend";
import WidgetWrapper from "../../componets/WidgetWrapper";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { setFriends } from "../../state";
import CircularProgress from "@mui/material/CircularProgress";
import io from "socket.io-client";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.auth.token);

  const friends = useSelector((state) => {
    return state.auth.user?.friends ?? [];
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("receiveMessage", (message) => {
      // Assuming message contains { chatId, senderId }
      if (message.senderId !== userId) {
        dispatch(updateFriendUnreadCount(message.senderId));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

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
      setIsLoading(false); // Set loading to false regardless of outcome
    }
  };

  useEffect(() => {
    if (userId && token) {
      getFriends();
    }
  }, [userId, token, dispatch]);

  if (isLoading) {
    return <CircularProgress />;
  }

  // Splitting friends into online and offline groups
  const onlineFriends = friends.filter((friend) => friend.isOnline);
  const offlineFriends = friends.filter((friend) => !friend.isOnline);

  //handle click to display chats
  const handleChatClick = async (friendId) => {
    try {
      // Construct the request to access or create a chat
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
      // Do something with the chat data, such as redirecting to the chat view or updating the state
      console.log(chat);
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
            {onlineFriends.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturePath}
                isOnline={friend.isOnline}
                onChatClick={handleChatClick}
                unreadCount={friend.unreadCount}
              />
            ))}
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
            {offlineFriends.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturePath}
                isOnline={friend.isOnline}
              />
            ))}
          </Box>
        </>
      )}
    </WidgetWrapper>
  );
};

export default FriendListWidget;
