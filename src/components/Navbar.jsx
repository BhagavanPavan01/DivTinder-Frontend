// components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Profile from "./Profile";
import Feed from "./Feed";
import Connections from "./Connections";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation(); // 👈 important

  useEffect(() => {
    checkAuthStatus();
  }, [location]); // 👈 re-run when route changes

  const checkAuthStatus = async () => {
    try {
      const res = await axios.get("http://localhost:3000/profile/view", {
        withCredentials: true,
      });
      setIsLoggedIn(true);
      setUser(res.data);
    } catch (err) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/logout",
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return null; // prevent flicker

  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        
        {/* Logo */}
        <div className="text-2xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent cursor-pointer">
          <Link to="/">👨‍💻🔥 divTinder</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 font-medium">
          {isLoggedIn && user ? (
            <>
              <Link
                to="/"
                className="hover:text-yellow-300 transition duration-300 text-orange-600"
              >
                Home
              </Link>

              <Link
                to="/dashboard"
                className="hover:text-yellow-300 transition duration-300 text-orange-600"
              >
                Dashboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={
                      user.photoUrl ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                  <span className="hidden md:inline text-orange-600">
                    {user.firstName}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-pink-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      to="/feed"
                      className="block px-4 py-2 text-gray-800 hover:bg-pink-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      Feed
                    </Link>

                    <hr className="my-2 border-gray-200" />

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="px-4 py-2 rounded-full border border-white font-semibold hover:bg-yellow-300">
                  Login
                </button>
              </Link>

              <Link to="/signup">
                <button className="px-4 py-2 rounded-full border border-white font-semibold hover:bg-yellow-300">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;