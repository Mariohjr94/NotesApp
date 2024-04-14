import { createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
  chat: {
    selectedChat: null,
    messages: [],
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        const currentFriends = state.user.friends;
        if (!deepEqual(currentFriends, action.payload.friends)) {
          state.user.friends = action.payload.friends;
        }
      } else {
        console.error("User friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    setSelectedChat: (state, action) => {
      state.chat.selectedChat = action.payload;
    },
    setMessages: (state, action) => {
      state.chat.messages = action.payload;
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost } =
  authSlice.actions;
export default authSlice.reducer;
