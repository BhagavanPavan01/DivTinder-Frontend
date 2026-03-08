import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Add axios import

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [requestLoading, setRequestLoading] = useState({});
  const limit = 50;

  // Configure axios defaults (optional but recommended)
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:3000';

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Use axios like in Profile component
      const response = await axios.get(`/feed?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Feed response:', response.data); // Debug log
      
      // Handle response data
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else {
        console.warn('Unexpected data format:', response.data);
        usersData = [];
      }
      
      console.log('Processed users data:', usersData); // Debug log
      
      if (page === 1) {
        setUsers(usersData);
      } else {
        setUsers(prev => [...prev, ...usersData]);
      }
      
      setHasMore(usersData.length === limit);
      
    } catch (err) {
      console.error('Fetch error:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setUsers([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load feed');
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleConnectionRequest = async (userId, status) => {
    try {
      setRequestLoading(prev => ({ ...prev, [userId]: true }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      // Use axios for connection request too
      const response = await axios.post(
        `/request/send/${status}/${userId}`,
        {}, // empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setConnectionStatus(prev => ({
          ...prev,
          [userId]: status
        }));
      }

    } catch (err) {
      console.error('Connection request failed:', err);
    } finally {
      setRequestLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Add debug log for users state
  useEffect(() => {
    console.log('Current users in state:', users);
  }, [users]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Discover People
              </h1>
              <p className="text-gray-600 mt-1">Connect with professionals and expand your network</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {users.length} profiles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {users.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No profiles to show</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {!localStorage.getItem('token') 
                ? 'Please login to discover people and expand your network.' 
                : 'Check back later for more profiles.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-transparent transform hover:-translate-y-1"
              >
                {/* Card Header with Gradient */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {/* Profile Image or Initials */}
                  <div className="absolute -bottom-12 left-6">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-24 h-24 rounded-xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                      style={{ display: user.photoUrl ? 'none' : 'flex' }}
                    >
                      <span className="text-2xl font-bold text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-14 p-6">
                  {/* User Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                      {user.age && (
                        <span className="text-lg font-normal text-gray-500 ml-2">• {user.age} yrs</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize mt-1">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {user.gender || 'Not specified'}
                      </span>
                    </p>
                  </div>

                  {/* About Section */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {user.about || 'No about information provided'}
                  </p>

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 5 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                            +{user.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phone Number */}
                  {user.phoneNumber && (
                    <div className="mb-4 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {user.phoneNumber}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    {connectionStatus[user._id] ? (
                      <button
                        disabled
                        className="flex-1 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg font-medium text-sm border border-green-200 cursor-default"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {connectionStatus[user._id] === 'interested' 
                            ? 'Request Sent' 
                            : 'Already Connected'}
                        </span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleConnectionRequest(user._id, 'interested')}
                          disabled={requestLoading[user._id] || !localStorage.getItem('token')}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
                        >
                          {requestLoading[user._id] ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Connect
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleConnectionRequest(user._id, 'ignored')}
                          disabled={requestLoading[user._id] || !localStorage.getItem('token')}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Ignore
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
              <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm whitespace-nowrap">
                Loading amazing people...
              </p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && users.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              className="group bg-white hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="flex items-center">
                <span>Load More Profiles</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-6l-7 7-7-7" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && users.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">You've reached the end of the feed</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for more profiles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;