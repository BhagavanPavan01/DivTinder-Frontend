// App.jsx
import Login from "./components/Login";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup"; // Import Signup
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from './components/Body';
import Home from "./components/Home";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import SentRequests from "./components/SentRequests";

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} /> {/* Add Signup route */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/sentRequests" element={<SentRequests />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;