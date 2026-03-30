// components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from 'react-router-dom';
import ChatPage from "../pages/ChatPage"; // Import ChatPage instead

// Create axios instance with baseURL
const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    pendingCount: 0,
    connectionsCount: 0,
    sentCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    stats: true,
    activities: true,
    recommendations: true
  });
  const [error, setError] = useState("");
  const [lastLogin, setLastLogin] = useState(null);
  
  // Chat state - for navigation only
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    // Get last login from localStorage
    const storedLastLogin = localStorage.getItem('lastLogin');
    if (storedLastLogin) {
      setLastLogin(new Date(storedLastLogin));
    }

    fetchDashboardData();
    fetchUnreadChatsCount();
  }, []);

  const fetchUnreadChatsCount = async () => {
    try {
      const response = await api.get("/chats");
      if (response.data.success) {
        const unreadCount = response.data.data.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
        setUnreadChatsCount(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [
        profileRes,
        pendingCountRes,
        connectionsRes,
        sentRes
      ] = await Promise.all([
        api.get("/profile/view"),
        api.get("/request/pending/count"),
        api.get("/connections"),
        api.get("/request/sent")
      ]);

      setProfile(profileRes.data);

      setStats({
        pendingCount: pendingCountRes.data.count || 0,
        connectionsCount: connectionsRes.data.count || 0,
        sentCount: sentRes.data.count || 0
      });

      // Generate activities based on real data
      generateActivities(profileRes.data, pendingCountRes.data.count, connectionsRes.data.data);

      // Generate recommendations
      generateRecommendations();

      setLoading({
        profile: false,
        stats: false,
        activities: false,
        recommendations: false
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
      setError("Failed to load dashboard data");
    }
  };

  // Navigate to chat page
  const openChat = (userId = null) => {
    if (userId) {
      navigate(`/chat?userId=${userId}`);
    } else {
      navigate('/chat');
    }
  };

  const generateActivities = (profileData, pendingCount, connections) => {
    const activities = [];

    // Profile last update
    const lastUpdate = new Date(profileData.updatedAt);
    const now = new Date();

    activities.push({
      id: 1,
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'You updated your profile information',
      time: lastUpdate,
      timeAgo: formatTimeAgo(lastUpdate),
      icon: '✏️',
      color: 'bg-blue-500'
    });

    // Pending requests
    if (pendingCount > 0) {
      activities.push({
        id: 2,
        type: 'pending_requests',
        title: 'Pending Connection Requests',
        description: `You have ${pendingCount} pending connection request${pendingCount > 1 ? 's' : ''}`,
        time: now,
        timeAgo: 'Just now',
        icon: '📨',
        color: 'bg-orange-500'
      });
    }

    // Recent connections
    if (connections && connections.length > 0) {
      connections.slice(0, 2).forEach((conn, index) => {
        activities.push({
          id: 3 + index,
          type: 'new_connection',
          title: 'New Connection',
          description: `You connected with ${conn.user?.name || 'someone'}`,
          time: new Date(conn.connectedSince),
          timeAgo: formatTimeAgo(new Date(conn.connectedSince)),
          icon: '🤝',
          color: 'bg-green-500'
        });
      });
    }

    // Last login
    if (lastLogin) {
      activities.push({
        id: 5,
        type: 'last_login',
        title: 'Last Login',
        description: `You last logged in ${formatTimeAgo(lastLogin)}`,
        time: lastLogin,
        timeAgo: formatTimeAgo(lastLogin),
        icon: '🔐',
        color: 'bg-purple-500'
      });
    }

    // Sort by time (most recent first)
    activities.sort((a, b) => b.time - a.time);
    setRecentActivities(activities.slice(0, 5));
  };

  const generateRecommendations = () => {
    const mockRecommendations = [
      {
        id: "69a4538c87dcca8c70a09a57", // Example user ID
        name: "Sarah Johnson",
        role: "Senior MERN Stack Developer",
        skills: ["React", "Node.js", "MongoDB"],
        avatar: "https://i.pravatar.cc/40?img=1",
        match: "95% match"
      },
      {
        id: "69ca281c44eb142dbbbf6d53", // Example user ID
        name: "Michael Chen",
        role: "Machine Learning Engineer",
        skills: ["Python", "Deep Learning", "AI"],
        avatar: "https://i.pravatar.cc/40?img=2",
        match: "88% match"
      },
      {
        id: "69a4538c87dcca8c70a09a58", // Example user ID
        name: "Priya Patel",
        role: "Full Stack Developer",
        skills: ["Java", "Spring Boot", "React"],
        avatar: "https://i.pravatar.cc/40?img=3",
        match: "82% match"
      }
    ];

    setRecommendations(mockRecommendations);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getSkillColor = (skill) => {
    const colorMap = {
      'MERN Stack': 'bg-blue-100 text-blue-800 border-blue-200',
      'Python': 'bg-green-100 text-green-800 border-green-200',
      'Java': 'bg-orange-100 text-orange-800 border-orange-200',
      'DSA': 'bg-purple-100 text-purple-800 border-purple-200',
      'Photography': 'bg-pink-100 text-pink-800 border-pink-200',
      'Computer Networks': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Java Full Stack': 'bg-red-100 text-red-800 border-red-200',
      'Machine Learning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Deep Learning': 'bg-teal-100 text-teal-800 border-teal-200',
      'Artificial Intelligence': 'bg-cyan-100 text-cyan-800 border-cyan-200'
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
      'Computer Networks': '🌐',
      'Java Full Stack': '🖥️',
      'Machine Learning': '🤖',
      'Deep Learning': '🧠',
      'Artificial Intelligence': '✨'
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

  const isLoading = Object.values(loading).some(state => state);

  if (isLoading) {
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
            onClick={fetchDashboardData}
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
              {lastLogin && `Last login: ${formatTimeAgo(lastLogin)}`}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Chat Button with Notification Badge */}
            <button
              onClick={() => openChat()}
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition shadow-md"
            >
              <span>💬</span>
              Chats
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadChatsCount > 99 ? '99+' : unreadChatsCount}
                </span>
              )}
            </button>
            
            {/* Requests Button */}
            <button
              onClick={() => navigate("/requests")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              <span>📨</span>
              Requests {stats.pendingCount > 0 && `(${stats.pendingCount})`}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <Link
            to="/connections"
            className="block bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition hover:shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Connections</p>
                <p className="text-2xl font-bold text-gray-800">{stats.connectionsCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-2xl">
                🤝
              </div>
            </div>
          </Link>

          <Link
            to="/requests"
            className="block bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition hover:shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingCount}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full text-orange-600 text-2xl">
                ⏳
              </div>
            </div>
          </Link>

          <Link
            to="/sentRequests"
            className="block bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition hover:shadow-xl cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sent</p>
                <p className="text-2xl font-bold text-gray-800">{stats.sentCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600 text-2xl">
                📤
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24">
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
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-gray-500 capitalize flex items-center gap-1">
                      <span>👤</span> {profile?.gender}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>🎂</span> {profile?.age} years
                    </span>
                  </div>
                  {profile?.phoneNumber && (
                    <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
                      <span>📱</span>
                      {profile.phoneNumber}
                    </p>
                  )}
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

                {/* Last Updated */}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="mr-2">🔄</span>
                  <span>Last updated {formatTimeAgo(new Date(profile?.updatedAt))}</span>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => navigate("/profile")}
                  className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition shadow-md"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Skills and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Skills & Expertise</h3>
                <span className="text-sm text-gray-500">{profile?.skills?.length} skills</span>
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
                              style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                            ></div>
                          </div>
                          <span className="text-xs ml-2 opacity-75">
                            {skill.includes('Stack') || skill.includes('Full') ? 'Expert' :
                              skill.includes('Learning') || skill.includes('Intelligence') ? 'Advanced' : 'Proficient'}
                          </span>
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
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{activity.icon}</span>
                        <p className="text-gray-800 font-medium">{activity.title}</p>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Connections */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Recommended for You</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                    <img
                      src={rec.avatar}
                      alt={rec.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{rec.name}</p>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {rec.match}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{rec.role}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/profile/${rec.id}`)}
                          className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                        >
                          View Profile →
                        </button>
                        <button
                          onClick={() => openChat(rec.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          💬 Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/feed")}
                className="mt-6 w-full py-2 text-center text-pink-600 hover:text-pink-700 font-medium border border-pink-200 rounded-lg hover:bg-pink-50 transition"
              >
                Find More Connections
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;