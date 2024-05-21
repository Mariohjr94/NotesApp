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
      console.log("Before updating:", state.chats);
      state.chats = action.payload.map((chat) => ({
        ...chat,
        hasUnreadMessage: chat.latestMessage?.isRead === false,
      }));
      console.log("After updating:", state.chats);
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
      // Reset unread count when a chat is opened
      const chatIndex = state.chats.findIndex(
        (chat) => chat.id === action.payload
      );
      if (chatIndex !== -1) {
        state.chats[chatIndex].hasUnreadMessage = false;
      }
    },
    // Clear the current chat when user leaves a chat or logs out
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    receiveNewMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].latestMessage = message;
        if (state.currentChat?._id !== chatId) {
          state.chats[chatIndex].hasUnreadMessage = true;
        }
      }
    },
    markMessagesAsRead: (state, action) => {
      const { chatId } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1 && state.chats[chatIndex].hasUnreadMessage) {
        state.chats[chatIndex].hasUnreadMessage = false; // Mark as read
      }
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setCurrentChat,
  clearCurrentChat,
  receiveNewMessage,
  markMessagesAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;
