import React, { useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";

import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/LoginPage";
import ProfilePage from "./scenes/profilePage";
import Chat from "./scenes/chat/Chat";
import { themeSettings } from "./theme";

import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:3001";

function App() {
  const { mode, token, user } = useSelector((state) => ({
    mode: state.mode,
    token: state.token,
    user: state.user,
  }));
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(token);
  const userName = user?.firstName ?? "Default Name";
  const userId = user?._id;

  useEffect(() => {
    if (!isAuth) return;

    const socket = io(ENDPOINT, { query: { token } });

    socket.on("connect", () => {
      console.log(`${userName} Connected to the server via WebSocket`);
      socket.emit("userOnline", { userId });
    });

    socket.on("userStatusChanged", ({ userId, isOnline }) => {
      console.log(`User ${userId} is now ${isOnline ? "online" : "offline"}.`);
    });

    return () => {
      socket.emit("userOffline", { userId });
      socket.disconnect();
      console.log("Disconnected from the server.");
    };
  }, [isAuth, token, userName, userId]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={isAuth ? <HomePage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile/:userId"
            element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
          />
          <Route
            path="/chat"
            element={isAuth ? <Chat /> : <Navigate to="/" />}
          />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
