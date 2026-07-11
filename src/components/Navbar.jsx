// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null; // prevent flicker

  // Hide Navbar completely on the home page if not authenticated
  if (!isAuthenticated && location.pathname === "/") {
    return null;
  }

  return (
    <>
      <div className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b border-white/20 transition-colors duration-300 ${mobileMenuOpen ? 'bg-white' : 'bg-white/10'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">

          {/* Logo */}
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent cursor-pointer z-50">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>👨‍💻 divTinder</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            {isAuthenticated && user ? (
              <>
                {/* <Link to="/feed" className="hover:text-pink-500 transition duration-300 text-gray-800 font-bold">
                Feed
              </Link> */}

                <Link to="/dashboard" className="hover:text-pink-500 transition duration-300 text-gray-800 font-bold">
                  Dashboard
                </Link>

                <Link to="/chat" className="hover:text-pink-500 transition duration-300 text-gray-800 font-bold">
                  Messages
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <img
                      src={user.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full border-2 border-pink-400 object-cover hover:ring-2 ring-pink-300 transition"
                    />
                    <span className="text-gray-800 font-bold">{user.firstName}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>

                      <Link
                        to="/connections"
                        className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        Connections
                      </Link>

                      <Link
                        to="/requests"
                        className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        Requests
                      </Link>

                      <hr className="my-2 border-gray-100" />

                      <button
                        onClick={async () => {
                          await logout();
                          setShowDropdown(false);
                          navigate('/login');
                        }}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition font-medium"
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
                  <button className="px-5 py-2 rounded-full border-2 border-pink-500 text-pink-600 font-bold hover:bg-pink-50 transition">
                    Login
                  </button>
                </Link>

                <Link to="/signup">
                  <button className="px-5 py-2 rounded-full bg-pink-500 text-white font-bold hover:bg-pink-600 transition shadow-lg hover:shadow-xl">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center z-50">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 hover:text-pink-600 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col pt-20 px-6 overflow-y-auto pb-6">
          <div className="flex flex-col gap-6 text-xl font-bold text-gray-800">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <img
                    src={user.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                    alt={user.firstName}
                    className="w-14 h-14 rounded-full border-2 border-pink-400 object-cover"
                  />
                  <div>
                    <div className="text-xl">{user.firstName} {user.lastName}</div>
                    <Link to="/profile" className="text-sm text-pink-500" onClick={() => setMobileMenuOpen(false)}>View Profile</Link>
                  </div>
                </div>

                <Link to="/feed" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500">Feed</Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500">Dashboard</Link>
                <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500">Messages</Link>
                <Link to="/connections" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500">Connections</Link>
                <Link to="/requests" onClick={() => setMobileMenuOpen(false)} className="hover:text-pink-500">Requests</Link>

                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="mt-6 text-left text-red-500 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-4 rounded-xl border-2 border-pink-500 text-pink-500 font-bold text-lg">
                    Login
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold text-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invisible overlay for closing desktop dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40 hidden md:block"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;