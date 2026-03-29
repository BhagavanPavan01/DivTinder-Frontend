// components/Connections.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
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

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connections');

      let connectionsData = [];
      if (response.data?.data) {
        connectionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        connectionsData = response.data;
      }

      setConnections(connectionsData);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (connection) => {
    setSelectedUser(connection.user);
    setShowModal(true);
  };

  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation(); // Prevent card click when clicking on photo
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
  };

  const filteredConnections = connections.filter(conn =>
    conn.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.user?.emailId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName, lastName) => {
    let initials = firstName?.charAt(0) || '';
    if (lastName) initials += lastName.charAt(0);
    return initials.toUpperCase().slice(0, 2);
  };

  const getFullName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  // Generate different gradient colors based on user name
  const getGradient = (name) => {
    const gradients = [
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-sky-600',
      'from-fuchsia-500 to-purple-600',
      'from-lime-500 to-green-600'
    ];

    const index = (name?.length || 0) % gradients.length;
    return gradients[index];
  };

  // Get accent color for message button
  const getButtonColor = (name) => {
    const colors = [
      'bg-amber-600 hover:bg-amber-700',
      'bg-emerald-600 hover:bg-emerald-700',
      'bg-blue-600 hover:bg-blue-700',
      'bg-purple-600 hover:bg-purple-700',
      'bg-rose-600 hover:bg-rose-700',
      'bg-cyan-600 hover:bg-cyan-700',
      'bg-fuchsia-600 hover:bg-fuchsia-700',
      'bg-lime-600 hover:bg-lime-700'
    ];

    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your connections...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchConnections}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Section */}
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  My Connections
                </h1>
                <p className="text-gray-600 mt-1">
                  You have <span className="font-semibold text-purple-600">{connections.length}</span> {connections.length === 1 ? 'connection' : 'connections'}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results count */}
          {filteredConnections.length > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredConnections.length} of {connections.length} connections
            </p>
          )}

          {/* Connections Grid */}
          {filteredConnections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No matching connections' : 'No connections yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Start connecting with other developers to grow your network'}
              </p>
              {!searchTerm && (
                <Link
                  to="/feed"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Find Connections
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map((connection) => {
                const user = connection.user;
                const gradient = getGradient(user?.firstName);
                const buttonColor = getButtonColor(user?.firstName);
                const fullName = getFullName(user?.firstName, user?.lastName);

                return (
                  <div
                    key={connection._id}
                    onClick={() => handleCardClick(connection)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-transparent transform hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Cover gradient - dynamic colors */}
                    <div className={`h-24 bg-gradient-to-r ${gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      {/* Decorative circles */}
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full"></div>
                      <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full"></div>
                    </div>

                    <div className="px-6 pb-6 relative">
                      {/* Avatar */}
                      <div className="flex justify-center -mt-12 mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-white to-white rounded-full blur-sm"></div>
                          {user?.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={fullName}
                              onClick={(e) => handlePhotoClick(user.photoUrl, e)}
                              className="relative w-24 h-24 rounded-full border-4 border-white object-cover shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className={`relative w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold shadow-xl`}>
                              {getInitials(user?.firstName, user?.lastName)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                          {fullName}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {user?.emailId}
                        </p>
                      </div>

                      {/* Skills preview (if available) */}
                      {user?.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {user.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Message Button */}
                      <Link
                        to={`/chat/${user?._id}`}
                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking message button
                        className={`block w-full py-3 ${buttonColor} text-white text-center rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium transform group-hover:scale-[1.02]`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Send Message
                        </span>
                      </Link>

                      {/* Connected since (optional) */}
                      {connection.connectedSince && (
                        <p className="text-xs text-gray-400 text-center mt-3">
                          Connected {new Date(connection.connectedSince).toLocaleDateString()}
                        </p>
                      )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">User Information</h2>
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
                    onClick={() => handlePhotoClick(selectedUser.photoUrl, new Event('click'))}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </div>
                )}
                <h3 className="text-2xl font-bold mt-4 text-gray-800">
                  {getFullName(selectedUser.firstName, selectedUser.lastName)}
                </h3>
                <p className="text-gray-500">{selectedUser.emailId}</p>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                {/* Gender and Age */}
                {(selectedUser.gender || selectedUser.age) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.gender && (
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="text-gray-800 capitalize">{selectedUser.gender}</p>
                        </div>
                      )}
                      {selectedUser.age && (
                        <div>
                          <p className="text-sm text-gray-500">Age</p>
                          <p className="text-gray-800">{selectedUser.age} years</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Phone Number */}
                {selectedUser.phoneNumber && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-800">{selectedUser.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {/* About/Bio */}
                {selectedUser.about && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">About</h4>
                    <p className="text-gray-700">{selectedUser.about}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {selectedUser.createdAt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Account Information</h4>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Link
                  to={`/chat/${selectedUser._id}`}
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl text-center font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md"
                >
                  Send Message
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
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setShowPhotoModal(false)}>
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
          </div>
        </div>
      )}
    </>
  );
};

export default Connections;