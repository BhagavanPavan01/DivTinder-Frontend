import React from "react";
import Home from "./Home";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <div className="fixed absolute top-0 left-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        
        {/* Logo */}
        <div className="text-2xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent cursor-pointer">
          <Link to="/home">
          💘🔥 divTinder</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6 text-white font-medium">
          <a className="hover:text-yellow-300 transition duration-300 cursor-pointer">
            Explore
          </a>
          <a className="hover:text-yellow-300 transition duration-300 cursor-pointer">
            About
          </a>
          <button className="px-4 py-2 rounded-full bg-white text-pink-600 font-semibold hover:bg-yellow-300 hover:text-black transition duration-300">
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
