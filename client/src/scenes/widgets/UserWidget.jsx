import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
  SaveOutlined,
  GitHub,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  IconButton,
  TextField,
} from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import FlexBetween from "../../componets/FlexBetween";
import linkTextStyle from "../../componets/linkTextStyle";
import UserImage from "../../componets/UserImage";
import WidgetWrapper from "../../componets/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserWidget = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

  // console.log(token);

  //social media
  const [editSocialLinks, setEditSocialLinks] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    linkedin: "",
    github: "",
  });

  // Function to handle social link change
  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks((prevLinks) => ({
      ...prevLinks,
      [platform.toLowerCase()]: value,
    }));
  };

  // Function to save the edited social links
  // You need to implement saving logic to your backend-----------
  const saveSocialLinks = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ socialLinks }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      setEditSocialLinks(false);
    } catch (error) {
      // Handle errors, e.g., network issues or JSON parsing errors
      console.error("Error saving social links:", error);
    }
  };
  //---------------------------------------------------------------------
  const getUser = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/users/${userId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setUser({
      ...data,
      friends: data.friends || [],
    });
    setSocialLinks(data.socialLinks || {});
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const {
    firstName,
    lastName,
    location,
    occupation,
    viewedProfile,
    impressions,
    friends,
  } = user;

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <FlexBetween gap="1rem">
          <UserImage image={picturePath} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": {
                  color: palette.primary.light,
                  cursor: "pointer",
                },
              }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>
              {user && user.friends ? user.friends.length : 0} friends
            </Typography>
          </Box>
        </FlexBetween>
        <ManageAccountsOutlined />
      </FlexBetween>

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* THIRD ROW 
      funtionality to be added, this will display impresions in user profile 
      by the amount of likes and comments they get on their posts
      */}

      {/* <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />  */}

      {/* FOURTH ROW */}
      {/* SOCIAL PROFILES */}
      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          Social Profiles
        </Typography>

        {/* Twitter */}
        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <XIcon />
            <Box>
              <Typography color={main} fontWeight="500">
                Twitter
              </Typography>
              {editSocialLinks ? (
                <TextField
                  size="small"
                  value={socialLinks.twitter}
                  onChange={(e) =>
                    handleSocialLinkChange("twitter", e.target.value)
                  }
                />
              ) : (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Typography style={linkTextStyle} color="medium">
                    {socialLinks.twitter || "Add your Twitter link"}
                  </Typography>
                </a>
              )}
            </Box>
          </FlexBetween>
          {editSocialLinks ? (
            <IconButton onClick={saveSocialLinks}>
              <SaveOutlined sx={{ color: main }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditSocialLinks(true)}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>

        {/* LinkedIn */}
        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <LinkedInIcon />
            <Box>
              <Typography color={main} fontWeight="500">
                Linkedin
              </Typography>
              {editSocialLinks ? (
                <TextField
                  size="small"
                  value={socialLinks.Linkedin}
                  onChange={(e) =>
                    handleSocialLinkChange("linkedin", e.target.value)
                  }
                />
              ) : (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Typography style={linkTextStyle} color="medium">
                    {socialLinks.linkedin || "Add your linkedin link"}
                  </Typography>
                </a>
              )}
            </Box>
          </FlexBetween>
          {editSocialLinks ? (
            <IconButton onClick={saveSocialLinks}>
              <SaveOutlined sx={{ color: main }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditSocialLinks(true)}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>

        {/* Github */}
        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <GitHub />
            <Box>
              <Typography color={main} fontWeight="500">
                Github
              </Typography>
              {editSocialLinks ? (
                <TextField
                  size="small"
                  value={socialLinks.github}
                  onChange={(e) =>
                    handleSocialLinkChange("github", e.target.value)
                  }
                />
              ) : (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Typography style={linkTextStyle} color="medium">
                    {socialLinks.github || "Add your github link"}
                  </Typography>
                </a>
              )}
            </Box>
          </FlexBetween>
          {editSocialLinks ? (
            <IconButton onClick={saveSocialLinks}>
              <SaveOutlined sx={{ color: main }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditSocialLinks(true)}>
              <EditOutlined sx={{ color: main }} />
            </IconButton>
          )}
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;
