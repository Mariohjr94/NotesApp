import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import Friend from "../../componets/Friend";
import WidgetWrapper from "../../componets/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "../../state";
import { fetchChatsSuccess, receiveNewMessage } from "../../state/chatSlice";
import CircularProgress from "@mui/material/CircularProgress";
import io from "socket.io-client";
import socket from "../../socket";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.auth.token);
  const friends = useSelector((state) => state.auth.user?.friends ?? []);
  const chats = useSelector((state) => state.chat.chats);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // const socket = io(process.env.REACT_APP_SOCKET_URL);

    socket.emit("joinChatRooms", { userId });
    console.log(`User ${userId} joined chat rooms`);

    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      if (message.recipientId === userId) {
        dispatch(receiveNewMessage({ chatId: message.chat, message }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, userId]);

  const getFriends = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/friends`,
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

  const getChats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/chats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  useEffect(() => {
    console.log("Chats state updated:", chats);
  }, [chats]);

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

  //handle click to display chats
  const handleChatClick = async (friendId) => {
    try {
      // Construct the request to access or create a chat
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/chats/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: friendId }),
        }
      );

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
            {onlineFriends.map((friend) => {
              const chat = getChatForFriend(friend._id);
              const latestMessage = chat ? chat.latestMessage : null;
              console.log(`Chat for ${friend.firstName}:`, chat);
              console.log(
                `Latest message for friend ${friend.firstName}:`,
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
