import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/authService';
import { User, Mail, Calendar, Shield, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data.user);
      setFormData({
        username: data.user.username,
        email: data.user.email
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await updateUserProfile(formData);
      setProfile(data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Auto-clear success message
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username,
      email: profile.email
    });
    setIsEditing(false);
    setError('');
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-yellow-100 text-yellow-800',
      user: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
        <Shield className="w-3 h-3 mr-1" />
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#181c24] text-white font-mono" style={{ fontFamily: 'Fira Mono, monospace' }}>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <button
          onClick={() => window.history.back()}
          className="mb-8 px-4 py-2 border-2 border-[#00cfff] rounded-lg text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] font-bold transition-all"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-8 tracking-tight text-center">User Profile</h1>
        <div className="flex flex-col items-center">
          <img
            src={profile?.avatar || (profile ? `https://ui-avatars.com/api/?name=${profile.username}&background=0D8ABC&color=fff` : "")}
            alt="Profile"
            className="w-28 h-28 rounded-full mb-6 border-4 border-[#00cfff] shadow-lg"
          />
          <div className="w-full max-w-xl p-8 bg-[#232b3a] rounded-2xl border-2 border-[#00cfff] shadow-2xl text-white font-mono">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-base text-white placeholder-gray-500 shadow-inner"
                      autoComplete="username"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                      <User className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-white text-base">{profile.username}</span>
                    </div>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-base text-white placeholder-gray-500 shadow-inner"
                      autoComplete="email"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                      <Mail className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-white text-base">{profile.email}</span>
                    </div>
                  )}
                </div>
                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Role</label>
                  <div className="px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                    {getRoleBadge(profile.role)}
                  </div>
                </div>
                {/* Join Date */}
                <div>
                  <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Member Since</label>
                  <div className="flex items-center px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-white text-base">{new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {/* Last Login */}
                {profile.lastLogin && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Last Login</label>
                    <div className="flex items-center px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-white text-base">{new Date(profile.lastLogin).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500">{error || "Failed to load profile."}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 