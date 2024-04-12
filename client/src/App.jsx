import { useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/LoginPage";
import ProfilePage from "./scenes/profilePage";
import Chat from "./scenes/chat/Chat";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:3001";
let socket;

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  const token = useSelector((state) => state.token);
  const userName = useSelector(
    (state) => state.user?.firstName ?? "Default Name"
  );
  const userId = useSelector((state) => state.user?._id);
  //connecting to the socket.
  useEffect(() => {
    if (isAuth) {
      socket = io(ENDPOINT, {
        query: {
          token,
        },
      });

      socket.on("connect", () => {
        console.log(`${userName} Connected to the server via WebSocket`);
        // You can emit an event immediately after connection if necessary
      });

      socket.emit("userOnline", { userId });

      return () => {
        socket.emit("userOffline", { userId });
        socket.disconnect();
        console.log("Disconnected from the server.");
      };
    }
  }, [isAuth]);
  //listening for other users to be connected
  useEffect(() => {
    if (socket) {
      socket.on("userStatusChanged", ({ userId, isOnline }) => {
        console.log(
          `User ${userId} is now ${isOnline ? "online" : "offline"}.`
        );
        // Update your application state/UI here based on the received event
      });
    }
    return () => {
      if (socket) {
        socket.off("userStatusChanged");
      }
    };
  }, [socket]);

  return (
    <div className="app">
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
    </div>
  );
}

export default App;
