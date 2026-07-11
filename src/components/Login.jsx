// components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await login(emailId, password);

      if (result.success) {
        console.log("Login successful");
        // Redirect to dashboard after successful login
        navigate("/dashboard");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login encountered an error:", err);
      // The error formatting is now safely handled by config/api.js
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 animate-gradient">
      {/* Floating Glow Effects */}
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-[-100px] left-[-100px] animate-float"></div>
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-float delay-2000"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 px-6">

        {/* Left Section */}
        <div className="text-white max-w-lg text-center lg:text-left animate-slide-up">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Find Your Perfect <span className="text-yellow-300">Match</span> 👨‍💻
          </h1>
          <p className="text-lg opacity-90">
            Join thousands discovering meaningful connections through divTinder.
            Love, friendship, or coding partner — it starts here.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-8 animate-slide-up delay-300 relative overflow-hidden">

          {/* Shimmer Overlay Loading State */}
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-md flex flex-col p-8 space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200/50 rounded-lg w-1/2 mx-auto mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200/50 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200/50 rounded-xl w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200/50 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200/50 rounded-xl w-full"></div>
              </div>
              <div className="h-12 bg-gray-300/60 rounded-xl w-full mt-4"></div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Welcome Back 🔥
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-center text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">

            <div>
              <label className="block text-white mb-2 font-medium">Email Address</label>
              <input
                type="email"
                value={emailId}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                onChange={(e) => setEmailId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex justify-between text-sm text-white/80">
              <span className="hover:text-white transition cursor-pointer">
                Forgot password?
              </span>
              <Link to="/signup" className="hover:text-white transition cursor-pointer font-semibold underline-offset-2 hover:underline">
                Create account
              </Link>
            </div>

            <button
              className={`w-full py-3 rounded-xl bg-white text-pink-600 font-bold text-lg hover:bg-yellow-300 hover:text-black transition-all duration-300 transform hover:scale-105 shadow-xl`}
              onClick={handleLogin}
              disabled={loading || !emailId || !password}
            >
              Login
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;