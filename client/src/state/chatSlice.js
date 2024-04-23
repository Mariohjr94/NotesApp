import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [], // Array to store fetched chats
  currentChat: null, // Object to store the currently selected chat
  isLoading: false, // Indicates whether chats are currently being fetched
  error: null, // Holds any error that occurs during chat-related operations
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Action to indicate that fetching chats has started
    fetchChatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Action to store fetched chats in state
    fetchChatsSuccess: (state, action) => {
      state.chats = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    // Action to handle errors that occur during fetching chats
    fetchChatsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    // Clear the current chat when user leaves a chat or logs out
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    // Other actions for creating group chats, renaming chats, etc. can be defined similarly
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setCurrentChat,
  clearCurrentChat,
} = chatSlice.actions;

export default chatSlice.reducer;
