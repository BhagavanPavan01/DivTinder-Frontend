// App.jsx
import Login from "./components/Login";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from './components/Body';
import Home from "./components/Home";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import SentRequests from "./components/SentRequests";
import ChatPage from "./pages/ChatPage";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter basename="/">
          <Routes>
            {/* Main routes with Body layout */}
            <Route path="/" element={<Body />}>
              <Route index element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/sentRequests" element={<SentRequests />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            {/* Chat route - outside Body for full screen */}
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;