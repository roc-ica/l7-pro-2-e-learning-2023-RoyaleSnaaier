import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface UserProfile {
  username: string;
  email: string;
  joinDate: string;
  totalPoints: number;
  completedLessons: number;
  achievements: number;
  profile?: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    website: string;
    languagePreference: string;
    educationLevel: string;
    learningGoals: string;
    phoneNumber: string;
    timezone: string;      // Added
    interests: string[];   // Added
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  preferences?: {
    preferredDifficulty: string;
    dailyGoalMinutes: number;
    theme: 'light' | 'dark';           // Added
    showProgress: boolean;             // Added
    learningReminders: boolean;        // Added
    showProfile: boolean;              // Added
    emailNotifications: boolean;       // Added
    achievementNotifications: boolean; // Added
    courseUpdates: boolean;           // Added
  };
}

interface ActivityItem {
  id: number;
  type: 'lesson_completed' | 'achievement_earned' | 'course_started';
  title: string;
  description: string;
  timestamp: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 1,
      type: 'lesson_completed',
      title: 'Completed Introduction to React',
      description: 'Finished lesson with 95% score',
      timestamp: new Date().toISOString()
    },
    // Add more sample activities
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.getUserProfile(user?.id);
        if (response.status === 'success' && response.data) {
          setProfile(response.data);
        } else {
          setError(response.error || 'Failed to load profile data');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">Error: {error}</div>;
  if (!profile) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">No profile data found</div>;

  const renderActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lesson_completed':
        return (
          <div className="bg-green-100 rounded-lg p-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'achievement_earned':
        return (
          <div className="bg-yellow-100 rounded-lg p-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 rounded-full bg-white shadow-xl text-blue-600 flex items-center justify-center text-4xl font-bold border-4 border-white">
                  {profile.username[0].toUpperCase()}
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-white">
                    {profile.profile?.firstName && profile.profile?.lastName 
                      ? `${profile.profile.firstName} ${profile.profile.lastName}`
                      : profile.username}
                  </h1>
                  <p className="text-blue-100 text-lg">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
                  {profile.profile?.location && (
                    <p className="text-blue-100 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.profile.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-blue-600">{profile.totalPoints}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Total Points</div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-green-600">{profile.completedLessons}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Completed Lessons</div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-yellow-600">{profile.achievements}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Achievements</div>
              </div>
            </div>
          </div>

          {/* Extended Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                {profile.profile?.bio ? (
                  <p className="text-gray-600">{profile.profile.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio provided</p>
                )}
                
                {/* Education & Learning */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Education & Learning</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Education Level</dt>
                      <dd className="text-sm text-gray-900">{profile.profile?.educationLevel || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Preferred Language</dt>
                      <dd className="text-sm text-gray-900">{profile.profile?.languagePreference || 'English'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Learning Goals</dt>
                      <dd className="text-sm text-gray-900">{profile.profile?.learningGoals || 'No goals set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Preferred Difficulty</dt>
                      <dd className="text-sm text-gray-900">{profile.preferences?.preferredDifficulty || 'Not set'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Interests */}
                {profile.profile?.interests && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.profile.interests.map((interest: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Learning Progress */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Daily Goal Progress</span>
                      <span className="text-gray-900 font-medium">
                        {profile.preferences?.dailyGoalMinutes || 0} minutes/day
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {activities.map((activity, idx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {idx !== activities.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            {renderActivityIcon(activity.type)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900 font-medium">{activity.title}</div>
                              <p className="mt-0.5 text-sm text-gray-500">{activity.description}</p>
                              <p className="mt-1 text-xs text-gray-400">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Additional Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {profile.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{profile.email}</span>
                    </div>
                  )}
                  {profile.profile?.phoneNumber && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{profile.profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile.profile?.website && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.profile.website}
                      </a>
                    </div>
                  )}
                  
                  {/* Timezone */}
                  {profile.profile?.timezone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{profile.profile.timezone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member Since</span>
                    <span className="text-gray-900">{new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Active</span>
                    <span className="text-gray-900">Today</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completion Rate</span>
                    <span className="text-gray-900">85%</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {profile.profile?.socialLinks && Object.values(profile.profile.socialLinks).some(link => link) && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
                  <div className="flex space-x-4">
                    {profile.profile.socialLinks.github && (
                      <a 
                        href={profile.profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                    )}
                    {/* Add LinkedIn and Twitter links here */}
                  </div>
                </div>
              )}

              {/* Learning Preferences */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Theme</span>
                    <span className="text-gray-900 capitalize">{profile.preferences?.theme || 'Light'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Show Progress</span>
                    <span className="text-gray-900">{profile.preferences?.showProgress ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reminders</span>
                    <span className="text-gray-900">{profile.preferences?.learningReminders ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
