import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Body = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
        <Outlet />
      </div>
    </div>
  );
};

export default Body;