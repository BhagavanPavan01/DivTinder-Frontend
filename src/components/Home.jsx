import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative overflow-hidden">

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white">

        <h1 className="text-6xl font-extrabold leading-tight mb-6">
          Find Your Perfect <span className="text-yellow-300">Match</span> 💘
        </h1>

        <p className="max-w-2xl text-lg opacity-90 mb-8">
          divTinder helps you connect with people who truly match your vibe.
          Swipe, chat, and build meaningful connections today.
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-pink-600 font-bold rounded-full hover:bg-yellow-300 hover:text-black transition transform hover:scale-105"
          >
            Get Started 🔥
          </Link>

          <button className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-pink-600 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-bold mb-12">
            Why Choose divTinder? ✨
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">💘</div>
              <h3 className="text-xl font-semibold mb-3">
                Smart Matching
              </h3>
              <p className="text-gray-600">
                Our intelligent algorithm connects you with people who share your interests.
              </p>
            </div>

            <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold mb-3">
                Real Connections
              </h3>
              <p className="text-gray-600">
                Move beyond swipes — build conversations that matter.
              </p>
            </div>

            <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3">
                Safe & Secure
              </h3>
              <p className="text-gray-600">
                Your privacy and security are our top priority.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Match Preview Section */}
      <section className="py-20 bg-base-200 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-bold mb-12">
            Meet Your Matches 👀
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300"
              >
                <figure>
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    alt="profile"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">
                    Alex, 25
                  </h2>
                  <p>Frontend Developer 💻 | Coffee Lover ☕</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">View Profile</button>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
