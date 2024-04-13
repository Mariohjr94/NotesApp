import React, { useEffect } from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import Friend from "../../componets/Friend";
import WidgetWrapper from "../../componets/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "../../state";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends);

  const getFriends = async () => {
    const response = await fetch(
      `http://localhost:3001/users/${userId}/friends`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    const sortedFriends = data.sort((a, b) => b.isOnline - a.isOnline);
    dispatch(setFriends({ friends: sortedFriends }));
  };

  useEffect(() => {
    getFriends();
  }, [userId, token, dispatch]);

  // Splitting friends into online and offline groups
  const onlineFriends = friends.filter((friend) => friend.isOnline);
  const offlineFriends = friends.filter((friend) => !friend.isOnline);

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
