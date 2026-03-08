import React from 'react'; // Add this if your config requires it
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// Icons (you can use react-icons or any icon library)
const Icons = {
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Save: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Cancel: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Add: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Gender: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Age: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Stat Card Component
const StatCard = ({ value, label, icon: Icon, color = "pink" }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon />
      </div>
    </div>
  </div>
);

// Skill Tag Component
const SkillTag = ({ skill, onRemove, removable = false }) => (
  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 group">
    {skill}
    {removable && (
      <button
        onClick={onRemove}
        className="ml-2 text-white/80 hover:text-white focus:outline-none transition-colors"
        aria-label={`Remove ${skill}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    )}
  </span>
);

// Loading Skeleton Component
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Cover Section Skeleton */}
    <div className="relative h-48 bg-gradient-to-r from-pink-400 to-purple-500">
      {/* Profile Image Placeholder */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2">
        <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white shadow-xl"></div>
      </div>
    </div>
    
    {/* Content Skeleton */}
    <div className="max-w-4xl mx-auto pt-20 px-6 pb-12">
      <div className="text-center space-y-4">
        <div className="h-8 bg-gray-300 rounded-lg w-48 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-64 mx-auto"></div>
        <div className="flex justify-center gap-4 mt-8">
          <div className="h-24 bg-gray-200 rounded-xl w-32"></div>
          <div className="h-24 bg-gray-200 rounded-xl w-32"></div>
          <div className="h-24 bg-gray-200 rounded-xl w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

// Main Profile Component
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    about: "",
    skills: [],
    photoUrl: "",
    gender: "",
    age: "",
    phoneNumber: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/profile/view", {
        withCredentials: true
      });
      setProfile(res.data);
      setEditForm({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        about: res.data.about || "",
        skills: res.data.skills || [],
        photoUrl: res.data.photoUrl || "",
        gender: res.data.gender || "",
        age: res.data.age || "",
        phoneNumber: res.data.phoneNumber || ""
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!editForm.firstName?.trim()) {
      errors.firstName = "First name is required";
    }
    
    if (editForm.age && (editForm.age < 18 || editForm.age > 100)) {
      errors.age = "Age must be between 18 and 100";
    }
    
    if (editForm.phoneNumber && !/^\d{10}$/.test(editForm.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    }
    
    if (editForm.photoUrl && !isValidUrl(editForm.photoUrl)) {
      errors.photoUrl = "Please enter a valid URL";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }

    try {
      setError("");
      setSuccess("");
      
      const updateData = { ...editForm };
      
      // Clean and prepare data
      if (updateData.age) {
        updateData.age = Number(updateData.age);
      }
      
      if (updateData.phoneNumber) {
        updateData.phoneNumber = updateData.phoneNumber.replace(/\D/g, '');
      } else {
        delete updateData.phoneNumber;
      }
      
      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === "" || updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      await axios.patch(
        "http://localhost:3000/profile/edit",
        updateData,
        { withCredentials: true }
      );
      
      await fetchProfile();
      setSuccess("Profile updated successfully! 🎉");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 5000);
      
    } catch (err) {
      console.error("Error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setEditForm(prev => ({ ...prev, phoneNumber: value }));
      if (validationErrors.phoneNumber) {
        setValidationErrors(prev => ({ ...prev, phoneNumber: "" }));
      }
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      if (editForm.skills.length >= 10) {
        setError("Maximum 10 skills allowed");
        return;
      }
      
      if (editForm.skills.includes(skillInput.trim())) {
        setError("Skill already added");
        return;
      }
      
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
      setError("");
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    setValidationErrors({});
    setEditForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      about: profile?.about || "",
      skills: profile?.skills || [],
      photoUrl: profile?.photoUrl || "",
      gender: profile?.gender || "",
      age: profile?.age || "",
      phoneNumber: profile?.phoneNumber || ""
    });
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cover Section with proper positioning */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Profile Photo - Properly positioned overlapping cover and content */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-20">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:scale-105 bg-white">
              <img
                src={profile?.photoUrl || "https://via.placeholder.com/400x400?text=Profile"}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x400?text=Profile";
                }}
              />
            </div>
            
            {/* Edit button on profile photo (only in view mode) */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-2 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label="Edit profile"
              >
                <Icons.Camera />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - With proper spacing for profile photo */}
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 pb-12">
        {/* Notification Messages */}
        {(success || error) && (
          <div className="mb-8 animate-slideDown">
            {success && (
              <div className="p-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl shadow-lg flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <span className="font-medium flex-1">{success}</span>
                <button 
                  onClick={() => setSuccess("")}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Icons.Cancel />
                </button>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl shadow-lg flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <span className="font-medium flex-1">{error}</span>
                <button 
                  onClick={() => setError("")}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Icons.Cancel />
                </button>
              </div>
            )}
          </div>
        )}

        {!isEditing ? (
          // View Mode - Enhanced UI
          <div className="space-y-8 animate-fadeIn">
            {/* Profile Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {profile?.firstName} {profile?.lastName}
                {profile?.age && `, ${profile.age}`}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-gray-600">
                {profile?.emailId && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <Icons.Mail />
                    <span className="text-sm sm:text-base">{profile.emailId}</span>
                  </div>
                )}
                
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <Icons.Phone />
                    <span className="text-sm sm:text-base">
                      {profile.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                    </span>
                  </div>
                )}
                
                {profile?.gender && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm capitalize">
                    <Icons.Gender />
                    <span className="text-sm sm:text-base">{profile.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            {profile?.about && profile.about !== "This is a default about of the user." && (
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">About Me</h2>
                <p className="text-gray-600 leading-relaxed">{profile.about}</p>
              </div>
            )}

            {/* Skills Section */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, i) => (
                    <SkillTag key={i} skill={skill} />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard value="120" label="Matches" icon={() => <span className="text-2xl">❤️</span>} color="pink" />
              <StatCard value="340" label="Likes" icon={() => <span className="text-2xl">⭐</span>} color="purple" />
              <StatCard value="58" label="Connections" icon={() => <span className="text-2xl">🤝</span>} color="blue" />
            </div>

            {/* Action Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icons.Edit />
                  Edit Profile
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode - Enhanced Form
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-slideUp">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Edit Profile
            </h2>
            
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-black ${
                      validationErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-pink-200'
                    }`}
                    placeholder="John"
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 hover:border-pink-200 transition-all text-black"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={editForm.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-black ${
                      validationErrors.age ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-pink-200'
                    }`}
                    placeholder="25"
                  />
                  {validationErrors.age && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.age}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 hover:border-pink-200 transition-all appearance-none bg-white text-black"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">👨 Male</option>
                    <option value="female">👩 Female</option>
                    <option value="others">🧑 Others</option>
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handlePhoneChange}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-black ${
                      validationErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-pink-200'
                    }`}
                    placeholder="9876543210"
                    maxLength="10"
                  />
                </div>
                {validationErrors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>

              {/* Photo URL */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  name="photoUrl"
                  value={editForm.photoUrl}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-black ${
                    validationErrors.photoUrl ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-pink-200'
                  }`}
                  placeholder="https://example.com/photo.jpg"
                />
                {validationErrors.photoUrl && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.photoUrl}</p>
                )}
              </div>

              {/* About */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  About Me
                </label>
                <textarea
                  name="about"
                  value={editForm.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 hover:border-pink-200 transition-all text-black resize-none"
                  placeholder="Tell us about yourself, your interests, and what you're looking for..."
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Skills (Maximum 10)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 hover:border-pink-200 transition-all text-black"
                    placeholder="Enter a skill (e.g., React)"
                    disabled={editForm.skills.length >= 10}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={editForm.skills.length >= 10 || !skillInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Icons.Add />
                    Add
                  </button>
                </div>
                
                {editForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {editForm.skills.map((skill, index) => (
                      <SkillTag
                        key={index}
                        skill={skill}
                        onRemove={() => handleRemoveSkill(index)}
                        removable={true}
                      />
                    ))}
                  </div>
                )}
                
                {editForm.skills.length >= 10 && (
                  <p className="text-sm text-orange-500 mt-2">
                    ⚠️ Maximum skills limit reached
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleEdit}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Icons.Save />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Icons.Cancel />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;