import React from "react";

const Login = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 animate-gradient">

      {/* Floating Glow Effects */}
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-[-100px] left-[-100px] animate-float"></div>
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-float delay-2000"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 px-6">

        {/* Left Section */}
        <div className="text-white max-w-lg text-center lg:text-left animate-slide-up">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Find Your Perfect <span className="text-yellow-300">Match</span> 💘
          </h1>
          <p className="text-lg opacity-90">
            Join thousands discovering meaningful connections through divTinder.
            Love, friendship, or coding partner — it starts here.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-8 animate-slide-up delay-300">

          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Welcome Back 🔥
          </h2>

          <div className="space-y-6">

            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
              />
            </div>

            <div className="flex justify-between text-sm text-white/80">
              <a className="hover:text-white transition cursor-pointer">
                Forgot password?
              </a>
              <a className="hover:text-white transition cursor-pointer">
                Create account
              </a>
            </div>

            <button className="w-full py-3 rounded-xl bg-white text-pink-600 font-bold text-lg hover:bg-yellow-300 hover:text-black transition-all duration-300 transform hover:scale-105">
              Login
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
