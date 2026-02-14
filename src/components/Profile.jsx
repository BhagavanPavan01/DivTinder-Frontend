import React from "react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-base-200">

      {/* Cover Section */}
      <div className="relative h-64 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600">

        {/* Profile Image */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-xl">
            <img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto mt-24 px-6 text-center">

        <h1 className="text-4xl font-bold">
          Alex Johnson, 25 🔥
        </h1>

        <p className="text-gray-500 mt-2">
          Frontend Developer 💻 | Coffee Lover ☕ | Traveler ✈️
        </p>

        {/* Bio */}
        <p className="mt-6 text-lg text-gray-700">
          Passionate about building beautiful web experiences and meeting amazing people.
          Looking for meaningful conversations and real connections 💘
        </p>

        {/* Interests */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {["React", "Travel", "Music", "Fitness", "Photography"].map((tag, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-10 text-center">
          <div>
            <h2 className="text-2xl font-bold text-pink-600">120</h2>
            <p className="text-gray-500">Matches</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-pink-600">340</h2>
            <p className="text-gray-500">Likes</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-pink-600">58</h2>
            <p className="text-gray-500">Connections</p>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-10">
          <button className="px-8 py-3 bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 transition transform hover:scale-105">
            Edit Profile ✏️
          </button>
        </div>

      </div>

    </div>
  );
};

export default Profile;
