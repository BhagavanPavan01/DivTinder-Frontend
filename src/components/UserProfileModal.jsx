// components/UserProfileModal.jsx
import React, { useState, useEffect } from "react";

const UserProfileModal = ({
  user,
  isOpen,
  onClose,
  onConnect,
  connectionStatus,
  requestLoading
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !user) return null;

  // Dynamic data from user schema
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const profileImage = user.photoUrl;
  const userAge = user.age ? `${user.age} years` : 'Not specified';
  const userGender = user.gender || 'Not specified';
  const userSkills = user.skills || [];
  const userBio = user.about || "No bio available";
  const userPhone = user.phoneNumber || 'Not provided';
  const userEmail = user.emailId || 'No email';
  
  // Calculate stats (you can replace these with actual data from your app)
  const projects = userSkills.length * 2 || 0;
  const following = Math.floor(Math.random() * 200) + 50;
  const followers = Math.floor(Math.random() * 300) + 100;

  const getInitials = () => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getAvatarColor = () => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-red-500 to-red-600",
      "from-yellow-500 to-yellow-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600"
    ];

    const index = (user.firstName?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  // Social media icons as components
  const SocialIcon = ({ type }) => {
    const icons = {
      facebook: "📘",
      twitter: "🐦",
      linkedin: "🔗",
      google: "G+",
      behance: "🎨"
    };
    
    return (
      <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition">
        {icons[type] || type}
      </button>
    );
  };

  // FULLSCREEN IMAGE
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <button
          onClick={() => setIsFullScreen(false)}
          className="absolute top-6 right-6 text-white text-3xl hover:scale-110 transition"
        >
          ✕
        </button>

        {profileImage && !imageError ? (
          <img
            src={profileImage}
            alt={fullName}
            className="max-h-[90vh] rounded-lg"
          />
        ) : (
          <div className={`w-72 h-72 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center`}>
            <span className="text-7xl text-white font-bold">
              {getInitials()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 bg-white/90 rounded-full p-2 shadow-lg hover:scale-110 transition z-10"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* COVER IMAGE - Using gradient as fallback */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="px-6 pb-6">
          
          {/* PROFILE IMAGE - Positioned on cover */}
          <div className="flex -mt-12 mb-4">
            <div
              onClick={() => setIsFullScreen(true)}
              className="cursor-pointer group relative"
            >
              {profileImage && !imageError ? (
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg group-hover:scale-105 transition"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {getInitials()}
                </div>
              )}
              {/* Zoom icon on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Contact info next to profile pic */}
            <div className="ml-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📧</span>
                <span className="truncate max-w-[200px]">{userEmail}</span>
              </div>
              {userPhone !== 'Not provided' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>📞</span>
                  <span>{userPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* NAME AND TITLE */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{fullName || 'User'}</h2>
            <p className="text-gray-600 capitalize">{userGender} • {userAge}</p>
          </div>

          {/* STATS - Using dynamic data */}
          <div className="flex gap-8 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{projects}</div>
              <div className="text-xs text-gray-500">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{following}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{followers}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
          </div>

          {/* BIO */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {userBio}
          </p>

          {/* SKILLS SECTION - Using skills from schema */}
          {userSkills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userSkills.slice(0, 5).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {userSkills.length > 5 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                    +{userSkills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* SOCIAL ICONS */}
          <div className="flex gap-2 mb-4">
            <SocialIcon type="facebook" />
            <SocialIcon type="twitter" />
            <SocialIcon type="linkedin" />
            <SocialIcon type="google" />
            <SocialIcon type="behance" />
          </div>

          {/* VIEW PROFILE BUTTON */}
          <button
            onClick={() => onConnect?.(user._id, 'interested')}
            disabled={requestLoading?.[user._id]}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
          >
            {requestLoading?.[user._id] ? "Loading..." : "View Profile"}
          </button>

          {/* Member since info */}
          {user.createdAt && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;