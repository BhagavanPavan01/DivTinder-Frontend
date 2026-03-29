// components/SentRequests.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

const SentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/request/sent");
      setRequests(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching sent requests:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
      setError("Failed to load sent requests");
    } finally {
      setLoading(false);
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

  const handleCardClick = (request) => {
    setSelectedUser(request.recipient);
    setShowModal(true);
  };

  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation();
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const getFullName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  const getInitials = (firstName, lastName) => {
    let initials = firstName?.charAt(0) || '';
    if (lastName) initials += lastName.charAt(0);
    return initials.toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sent requests...</p>
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
            onClick={fetchSentRequests}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sent Requests</h1>
              <p className="text-gray-600 mt-1">
                Track your outgoing connection requests
              </p>
            </div>
            <button
              onClick={() => navigate("/requests")}
              className="px-4 py-2 text-pink-600 hover:text-pink-700 font-medium"
            >
              ← Back to Pending
            </button>
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No sent requests</h3>
              <p className="text-gray-500 mb-6">You haven't sent any connection requests yet.</p>
              <button
                onClick={() => navigate("/feed")}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition shadow-md"
              >
                Find Developers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const user = request.recipient;
                const fullName = getFullName(user?.firstName, user?.lastName);
                
                return (
                  <div
                    key={request._id}
                    onClick={() => handleCardClick(request)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {user?.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={fullName}
                              onClick={(e) => handlePhotoClick(user.photoUrl, e)}
                              className="w-16 h-16 rounded-full object-cover border-4 border-gray-100 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105"
                            />
                          ) : (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-4 border-gray-100"
                            >
                              {getInitials(user?.firstName, user?.lastName)}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h2 className="text-xl font-bold text-gray-800 hover:text-pink-600 transition-colors">
                                {fullName}
                              </h2>
                              <p className="text-gray-500 flex items-center gap-1 mt-1">
                                <span>📧</span>
                                {user?.emailId || user?.email}
                              </p>
                              
                              {/* Skills Preview */}
                              {user?.skills && user.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {user.skills.slice(0, 3).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {user.skills.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                      +{user.skills.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <div className="flex items-center gap-2 mt-3">
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
                                  <span>⏳</span>
                                  Pending
                                </span>
                                <span className="text-xs text-gray-400">
                                  Sent {formatTimeAgo(request.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Message Button */}
                            <Link
                              to={`/chat/${user?._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition shadow-md text-sm font-medium"
                            >
                              Send Message
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Info Modal */}
      {showModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                User Information
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center mb-6">
                {selectedUser.photoUrl ? (
                  <img
                    src={selectedUser.photoUrl}
                    alt={getFullName(selectedUser.firstName, selectedUser.lastName)}
                    onClick={(e) => handlePhotoClick(selectedUser.photoUrl, e)}
                    className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </div>
                )}
                <h3 className="text-2xl font-bold mt-4 text-gray-800">
                  {getFullName(selectedUser.firstName, selectedUser.lastName)}
                </h3>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selectedUser.emailId || selectedUser.email}
                </p>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                {/* Personal Information */}
                {(selectedUser.gender || selectedUser.age) && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.gender && (
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="text-gray-800 capitalize font-medium">{selectedUser.gender}</p>
                        </div>
                      )}
                      {selectedUser.age && (
                        <div>
                          <p className="text-sm text-gray-500">Age</p>
                          <p className="text-gray-800 font-medium">{selectedUser.age} years</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Phone Number */}
                {selectedUser.phoneNumber && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contact Information
                    </h4>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-800 font-medium">{selectedUser.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {/* About/Bio */}
                {selectedUser.about && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      About
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedUser.about}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Skills & Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white text-pink-700 rounded-full text-sm font-medium shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {selectedUser.createdAt && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Account Information
                    </h4>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-800 font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Link
                  to={`/chat/${selectedUser._id}`}
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl text-center font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Message
                  </span>
                </Link>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedPhoto}
              alt="Profile"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <p className="text-center text-white mt-4 text-sm">Click anywhere to close</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SentRequests;