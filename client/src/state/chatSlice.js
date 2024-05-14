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
      state.chats = action.payload.map((chat) => ({
        ...chat,
        unreadCount: 0,
      }));

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
        state.chats[chatIndex].unreadCount = 0;
      }
    },
    // Clear the current chat when user leaves a chat or logs out
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    receiveNewMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].messages.push(message);
        // Increment unread count if it's not the current chat
        if (state.currentChat !== chatId) {
          state.chats[chatIndex].unreadCount++;
        }
      }
    },
    updateFriendUnreadCount: (state, action) => {
      const friendId = action.payload;
      const chatIndex = state.chats.findIndex((chat) =>
        chat.users.some((user) => user._id === friendId)
      );

      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount =
          (state.chats[chatIndex].unreadCount || 0) + 1;
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
  updateFriendUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
