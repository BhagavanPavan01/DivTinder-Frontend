import Login from "./components/Login";
import Profile from "./components/Login";
import { BrowserRouter, Outlet, Routes, Route } from "react-router-dom";
import Body from './components/Body';
import Home from "./components/Home";

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
