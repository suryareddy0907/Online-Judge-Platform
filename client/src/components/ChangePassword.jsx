import React, { useState } from 'react';
import { changePassword } from '../services/authService';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import MatrixRainBackground from './MatrixRainBackground';

const ChangePassword = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      // Use backend error message if available
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <MatrixRainBackground />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-xs sm:max-w-md p-4 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-transparent bg-[#232b3a]/80 backdrop-blur-md transition-all duration-300 group hover:scale-105 hover:shadow-pink-500/30 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:z-[-1] before:bg-gradient-to-br before:from-purple-500 before:via-pink-400 before:to-blue-500 before:opacity-60 before:blur-md animated-glow-border overflow-hidden"
        style={{ fontFamily: 'Fira Mono, monospace', boxShadow: '0 0 32px 0 #7f5af0, 0 0 64px 0 #ff6ac1' }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 sm:mb-4">
          &lt;/&gt; CodersToday
        </h1>
        <h2 className="text-lg sm:text-2xl font-bold text-center mb-1 sm:mb-2 tracking-wide">Change Password</h2>
        <p className="text-center text-gray-400 mb-4 sm:mb-6 italic text-xs sm:text-sm">Update your password below.</p>
        {/* Current Password */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base text-white placeholder-gray-500 shadow-inner pr-10"
              placeholder="Enter current password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400"
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {/* New Password */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm sm:text-base text-white placeholder-gray-500 shadow-inner pr-10"
              placeholder="Enter new password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400"
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {/* Confirm New Password */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm sm:text-base text-white placeholder-gray-500 shadow-inner pr-10"
              placeholder="Confirm new password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-500 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm mt-2">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Success Message */}
        {success && (
          <div className="bg-green-600/20 border border-green-500 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm mt-2">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-green-400">{success}</p>
              </div>
            </div>
          </div>
        )}
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-3 sm:px-4 py-2 border border-transparent rounded-md text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 