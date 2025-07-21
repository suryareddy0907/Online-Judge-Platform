import React, { useState, useEffect, useMemo } from 'react';
import { getUserProfile, updateUserProfile, getMySubmissions } from '../services/authService';
import { User, Mail, Calendar, Shield, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [submissions, setSubmissions] = useState([]);
  const [heatmapFilter, setHeatmapFilter] = useState('all'); // 'all' or 'ac'
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Wait for user context to finish loading
    if (user === undefined) return;
    if (user === null) {
      navigate('/login', { replace: true });
    } else {
      setAuthLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchProfile();
    fetchSubmissions();
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

  const fetchSubmissions = async () => {
    try {
      const data = await getMySubmissions();
      setSubmissions(data.submissions || []);
    } catch (e) {
      setSubmissions([]);
    }
  };

  // Compute heatmap data: { 'YYYY-MM-DD': count }
  const heatmapData = useMemo(() => {
    const map = {};
    submissions.forEach(sub => {
      if (heatmapFilter === 'ac' && sub.verdict !== 'AC') return;
      const date = new Date(sub.submittedAt);
      const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [submissions, heatmapFilter]);

  // LeetCode/Codeforces-style heatmap: 53 weeks x 7 days
  // Find the start date (last Sunday before 1 year ago)
  const startDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 364);
    d.setHours(0, 0, 0, 0);
    // Move to previous Sunday
    d.setDate(d.getDate() - d.getDay());
    return d;
  })();
  // Build 53 weeks x 7 days
  const weeks = Array.from({ length: 53 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      return date;
    })
  );
  // Month labels (above first day of each month)
  const monthLabels = [];
  let lastMonth = null;
  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w][0];
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ week: w, label: firstDay.toLocaleString('default', { month: 'short' }) });
      lastMonth = month;
    }
  }
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Find max count for color scaling
  const maxCount = Math.max(1, ...Object.values(heatmapData));

  const getColor = (count) => {
    if (!count) return '#232b3a';
    // Scale from light to dark green
    const percent = Math.min(1, count / maxCount);
    if (percent === 0) return '#232b3a';
    if (percent < 0.25) return '#baffea';
    if (percent < 0.5) return '#00ff99';
    if (percent < 0.75) return '#00cfff';
    return '#00b36b';
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

  // Helper function for max streak
  function getMaxStreak(weeks, heatmapData) {
    let maxStreak = 0, currentStreak = 0;
    const today = new Date();
    for (let w = 0; w < weeks.length; w++) {
      for (let d = 0; d < weeks[w].length; d++) {
        const date = weeks[w][d];
        if (date > today) continue;
        const key = date.toISOString().slice(0, 10);
        if (heatmapData[key]) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    }
    return maxStreak;
  }

  return (
    <div className="min-h-screen bg-[#181c24] text-white font-mono" style={{ fontFamily: 'Fira Mono, monospace' }}>
      <div className="max-w-4xl mx-auto py-12 px-4">
        {authLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="mb-8 px-4 py-2 border-2 border-[#00cfff] rounded-lg text-[#00cfff] bg-[#181c24] hover:bg-[#232b3a] font-bold transition-all"
          >
            ← Back
          </button>
        )}
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-8 tracking-tight text-center">User Profile</h1>
        <div className="flex flex-col items-center w-full">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : profile ? (
            <>
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=0D8ABC&color=fff`}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-8 border-4 border-[#00cfff] shadow-lg"
              />
              {/* Heatmap Toggle */}
              <div className="w-full flex flex-col items-center mb-8">
                <div className="flex gap-4 mb-2">
                  <button
                    className={`px-4 py-1 rounded-full font-bold border-2 ${heatmapFilter === 'all' ? 'bg-[#00ff99] text-[#181c24] border-[#00ff99]' : 'bg-[#232b3a] text-[#baffea] border-[#00cfff]'}`}
                    onClick={() => setHeatmapFilter('all')}
                  >
                    All Submissions
                  </button>
                  <button
                    className={`px-4 py-1 rounded-full font-bold border-2 ${heatmapFilter === 'ac' ? 'bg-[#00ff99] text-[#181c24] border-[#00ff99]' : 'bg-[#232b3a] text-[#baffea] border-[#00cfff]'}`}
                    onClick={() => setHeatmapFilter('ac')}
                  >
                    Only AC
                  </button>
                </div>
                {/* LeetCode-style Heatmap Summary */}
                <div className="w-full flex flex-col items-center mb-8">
                  {/* Summary Row */}
                  <div className="flex flex-wrap items-center justify-between w-full mb-2 px-2">
                    <div className="text-lg font-bold text-white">
                      {Object.values(heatmapData).reduce((a, b) => a + b, 0)} submissions in the past one year
                    </div>
                    <div className="flex gap-6 text-sm text-[#baffea] font-mono">
                      <span>Total active days: <span className="font-bold text-[#00ff99]">{Object.keys(heatmapData).length}</span></span>
                      <span>Max streak: <span className="font-bold text-[#00ff99]">{getMaxStreak(weeks, heatmapData)}</span></span>
                    </div>
                  </div>
                  {/* Heatmap Grid - LeetCode style */}
                  <div className="overflow-x-auto w-full flex justify-center" style={{ background: '#22252a', borderRadius: 12, padding: 16 }}>
                    <div>
                      {/* Heatmap grid: weeks as columns, days as rows */}
                      <div className="flex">
                        {/* Days of week (Sun-Sat) as rows */}
                        <div className="flex flex-col justify-between mr-2" style={{ height: 7 * 16 }}>
                          {dayLabels.map((d, i) => (
                            <div key={d} className="h-4 w-4 text-xs text-[#baffea] text-center font-mono" style={{ height: 16, lineHeight: '16px' }}>{d[0]}</div>
                          ))}
                        </div>
                        {/* Weeks as columns */}
                        <div className="flex">
                          {weeks.map((week, w) => {
                            // Find if this week is the start of a new month
                            const isMonthStart = monthLabels.some(m => m.week === w);
                            return (
                              <div key={w} style={{ display: 'flex', flexDirection: 'column', marginRight: isMonthStart && w !== 0 ? 6 : 2 }}>
                                {week.map((date, d) => {
                                  const key = date.toISOString().slice(0, 10);
                                  const count = (date > new Date() ? null : heatmapData[key] || 0);
                                  // Light gray for empty/future cells, green scale for submissions
                                  const cellColor = count === null ? '#2d2f36' : count === 0 ? '#44464d' : getColor(count);
                                  return (
                                    <div
                                      key={key}
                                      title={count > 0 ? `${count} submission${count !== 1 ? 's' : ''} on ${date.toLocaleDateString()}` : undefined}
                                      style={{ width: 14, height: 14, background: cellColor, borderRadius: 3, border: '1px solid #232b3a', marginBottom: 2, marginRight: 0, boxSizing: 'border-box', outline: isMonthStart && d === 0 && w !== 0 ? '2px solid #555' : 'none', outlineOffset: '-2px', transition: 'background 0.2s' }}
                                    />
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Month labels below the grid, centered under first week of each month */}
                      <div className="flex mt-2 ml-6" style={{ minWidth: 53 * 16 }}>
                        {weeks.map((_, w) => {
                          const monthLabel = monthLabels.find(m => m.week === w)?.label;
                          return (
                            <div key={w} style={{ width: 16, textAlign: 'center', marginRight: monthLabel && w !== 0 ? 6 : 2 }}>
                              <span className="text-xs text-[#baffea] font-mono">{monthLabel || ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#baffea] mt-2">Last 1 year</div>
                </div>
              </div>
              {/* Profile Info Section */}
              <div className="w-full flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:gap-12 gap-8 w-full">
                  <div className="flex-1">
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
                  <div className="flex-1">
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
                </div>
                <div className="flex flex-col md:flex-row md:gap-12 gap-8 w-full">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Role</label>
                    <div className="px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                      {getRoleBadge(profile.role)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Member Since</label>
                    <div className="flex items-center px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-white text-base">{new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {profile.lastLogin && (
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Last Login</label>
                      <div className="flex items-center px-4 py-2 bg-[#181c24] rounded-md border border-[#2d3748]">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-white text-base">{new Date(profile.lastLogin).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
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
            </>
          ) : (
            <div className="text-center text-red-500 mb-8">{error || "Failed to load profile."}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 