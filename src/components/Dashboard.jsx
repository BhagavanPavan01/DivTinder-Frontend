// components/Dashboard.jsx (without lucide-react)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/profile/view", {
        withCredentials: true
      });
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/logout", {}, {
        withCredentials: true
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getSkillColor = (skill) => {
    const colorMap = {
      'MERN Stack': 'bg-blue-100 text-blue-800 border-blue-200',
      'Python': 'bg-green-100 text-green-800 border-green-200',
      'Java': 'bg-orange-100 text-orange-800 border-orange-200',
      'DSA': 'bg-purple-100 text-purple-800 border-purple-200',
      'Photography': 'bg-pink-100 text-pink-800 border-pink-200',
      'Computer Networks': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colorMap[skill] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSkillIcon = (skill) => {
    const iconMap = {
      'MERN Stack': '⚛️',
      'Python': '🐍',
      'Java': '☕',
      'DSA': '📚',
      'Photography': '📸',
      'Computer Networks': '🌐'
    };
    return iconMap[skill] || '🏆';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-red-500 text-5xl mb-4">😕</div>
          <p className="text-xl text-gray-800 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {profile?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your profile today.
            </p>
          </div>
          {/* <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <span>🚪</span>
            Logout
          </button> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Profile Views</p>
                <p className="text-2xl font-bold text-gray-800">1,234</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-full text-pink-600 text-2xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Skills</p>
                <p className="text-2xl font-bold text-gray-800">{profile?.skills?.length || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full text-purple-600 text-2xl">
                💻
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Connections</p>
                <p className="text-2xl font-bold text-gray-800">156</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-2xl">
                ❤️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Achievements</p>
                <p className="text-2xl font-bold text-gray-800">24</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 text-2xl">
                ⭐
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Profile Header with Gradient */}
              <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>
              
              {/* Profile Image */}
              <div className="relative px-6 pb-6">
                <div className="flex justify-center">
                  <div className="relative -mt-16">
                    <img
                      src={profile?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                      alt={`${profile?.firstName} ${profile?.lastName}`}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="text-center mt-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
                    <span>📧</span>
                    {profile?.emailId}
                  </p>
                  <p className="text-gray-500 capitalize mt-1">
                    {profile?.gender === 'male' ? '👨' : profile?.gender === 'female' ? '👩' : '🧑'} {profile?.gender}
                  </p>
                </div>

                {/* About Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {profile?.about || "No bio added yet."}
                  </p>
                </div>

                {/* Member Since */}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="mr-2">📅</span>
                  <span>Member since {formatDate(profile?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Skills and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Skills & Expertise</h3>
                <button 
                  onClick={() => navigate("/profile")}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  Edit Profile →
                </button>
              </div>

              {profile?.skills && profile.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-4 rounded-xl border-2 ${getSkillColor(skill)} transform hover:scale-105 transition`}
                    >
                      <div className="mr-3 text-2xl">
                        {getSkillIcon(skill)}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{skill}</span>
                        <div className="flex items-center mt-1">
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-current rounded-full"
                              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                            ></div>
                          </div>
                          <span className="text-xs ml-2 opacity-75">Advanced</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No skills added yet.</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Profile updated</p>
                    <p className="text-sm text-gray-500">You updated your skills</p>
                  </div>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">New connection</p>
                    <p className="text-sm text-gray-500">You connected with Sarah</p>
                  </div>
                  <span className="text-xs text-gray-400">Yesterday</span>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">Profile view</p>
                    <p className="text-sm text-gray-500">Your profile was viewed 23 times</p>
                  </div>
                  <span className="text-xs text-gray-400">3 days ago</span>
                </div>
              </div>
            </div>

            {/* Recommended Connections */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Recommended for You</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-pink-200 transition">
                    <img
                      src={`https://i.pravatar.cc/40?img=${item + 10}`}
                      alt="Recommended user"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Alex Chen</p>
                      <p className="text-xs text-gray-500">MERN Stack Developer</p>
                      <div className="flex gap-1 mt-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">⚛️ React</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">🟢 Node.js</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;