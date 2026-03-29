// components/Requests.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'sent'
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/request/pending");
      setRequests(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      await api.post(`/request/review/${status}/${requestId}`);
      
      // Remove the processed request from list
      setRequests(requests.filter(req => req._id !== requestId));
      
      // Show success message (you can add a toast notification here)
      console.log(`Request ${status} successfully`);
      
    } catch (err) {
      console.error(`Error ${status} request:`, err);
      alert(err.response?.data?.message || `Failed to ${status} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getSkillColor = (skill) => {
    const colorMap = {
      'MERN Stack': 'bg-blue-100 text-blue-800',
      'Python': 'bg-green-100 text-green-800',
      'Java': 'bg-orange-100 text-orange-800',
      'DSA': 'bg-purple-100 text-purple-800',
      'Photography': 'bg-pink-100 text-pink-800',
      'Computer Networks': 'bg-indigo-100 text-indigo-800',
      'Java Full Stack': 'bg-red-100 text-red-800',
      'Machine Learning': 'bg-yellow-100 text-yellow-800',
      'Deep Learning': 'bg-teal-100 text-teal-800',
      'Artificial Intelligence': 'bg-cyan-100 text-cyan-800'
    };
    return colorMap[skill] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
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
            onClick={fetchRequests}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Connection Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage your pending connection requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === "pending"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Requests
            {requests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/sentRequests")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "sent"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sent Requests →
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No pending requests</h3>
            <p className="text-gray-500 mb-6">You don't have any connection requests at the moment.</p>
            <button
              onClick={() => navigate("/feed")}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition shadow-md"
            >
              Find Connections
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-pink-500"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {request.requester?.photoUrl ? (
                        <img
                          src={request.requester.photoUrl}
                          alt={request.requester.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-pink-100"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-pink-100">
                          {request.requester?.firstName?.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">
                            {request.requester?.name}
                          </h2>
                          <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <span>📧</span>
                            {request.requester?.email}
                          </p>
                          
                          {/* Age & Gender */}
                          <div className="flex items-center gap-3 mt-2">
                            {request.requester?.age && (
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <span>🎂</span> {request.requester.age} years
                              </span>
                            )}
                            {request.requester?.gender && (
                              <span className="text-sm text-gray-600 capitalize flex items-center gap-1">
                                <span>👤</span> {request.requester.gender}
                              </span>
                            )}
                          </div>

                          {/* About */}
                          {request.requester?.about && (
                            <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                              {request.requester.about}
                            </p>
                          )}

                          {/* Skills */}
                          {request.requester?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {request.requester.skills.slice(0, 5).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${getSkillColor(skill)}`}
                                >
                                  {skill}
                                </span>
                              ))}
                              {request.requester.skills.length > 5 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                  +{request.requester.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Request Time */}
                          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                            <span>⏰</span>
                            Received {formatTimeAgo(request.createdAt)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleRequest(request._id, 'accepted')}
                            disabled={processingId === request._id}
                            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {processingId === request._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing</span>
                              </>
                            ) : (
                              <>
                                <span>✓</span>
                                <span>Accept</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleRequest(request._id, 'rejected')}
                            disabled={processingId === request._id}
                            className="px-6 py-2.5 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <span>✗</span>
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {requests.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total pending requests</span>
              <span className="font-bold text-pink-600">{requests.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Respond to requests to connect with developers
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;