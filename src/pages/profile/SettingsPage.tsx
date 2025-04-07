import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface SettingsForm {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  notifications: {
    email: boolean;
    achievements: boolean;
    courseUpdates: boolean;
  };
}

interface ExtendedSettingsForm extends SettingsForm {
  profile: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    website: string;
    languagePreference: string;
    timezone: string;
    dateOfBirth: string;
    phoneNumber: string;
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
    educationLevel: string;
    interests: string[];
    learningGoals: string;
  };
  preferences: {
    showProgress: boolean;
    showProfile: boolean;
    learningReminders: boolean;
    preferredDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    dailyGoalMinutes: number;
    theme: 'light' | 'dark';
    emailNotifications: boolean;      // Added
    achievementNotifications: boolean; // Added
    courseUpdates: boolean;           // Added
  };
}

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<ExtendedSettingsForm>({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      achievements: true,
      courseUpdates: true
    },
    profile: {
      firstName: '',
      lastName: '',
      bio: '',
      location: '',
      website: '',
      languagePreference: '',
      timezone: '',
      dateOfBirth: '',
      phoneNumber: '',
      socialLinks: {
        twitter: '',
        linkedin: '',
        github: ''
      },
      educationLevel: '',
      interests: [],
      learningGoals: ''
    },
    preferences: {
      showProgress: true,
      showProfile: true,
      learningReminders: true,
      preferredDifficulty: 'Beginner',
      dailyGoalMinutes: 30,
      theme: 'light',
      emailNotifications: true,      // Added
      achievementNotifications: true, // Added
      courseUpdates: true            // Added
    }
  });
  const [activeTab, setActiveTab] = useState('profile');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Map notifications to preferences before sending
      const updatedForm = {
        ...form,
        preferences: {
          ...form.preferences,
          emailNotifications: form.notifications.email,
          achievementNotifications: form.notifications.achievements,
          courseUpdates: form.notifications.courseUpdates
        }
      };

      const response = await api.updateUserSettings({
        userId: user?.id,
        ...updatedForm
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: 'Settings updated successfully' });
        updateUser({ ...user, email: form.email });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (
    section: keyof ExtendedSettingsForm,
    field: string,
    value: any
  ) => {
    setForm((prevForm) => {
      const sectionData = prevForm[section] as Record<string, any>;
      return {
        ...prevForm,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm rounded-lg px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account settings and preferences here.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Navigation Sidebar */}
            <div className="bg-white shadow-sm rounded-lg p-6 h-fit lg:col-span-1">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'profile' ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'preferences' ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Learning Preferences
                </button>
                <a href="#email" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-50">
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Settings
                </a>
                <a href="#password" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50">
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </a>
                <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50">
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </a>
              </nav>
            </div>

            {/* Settings Form */}
            <div className="bg-white shadow-sm rounded-lg lg:col-span-3">
              {message && (
                <div className={`p-4 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                {activeTab === 'profile' && (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.firstName}
                          onChange={(e) => updateForm('profile', 'firstName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.lastName}
                          onChange={(e) => updateForm('profile', 'lastName', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.bio}
                          onChange={(e) => updateForm('profile', 'bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.location}
                          onChange={(e) => updateForm('profile', 'location', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <input
                          type="url"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.website}
                          onChange={(e) => updateForm('profile', 'website', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.phoneNumber}
                          onChange={(e) => updateForm('profile', 'phoneNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.dateOfBirth}
                          onChange={(e) => updateForm('profile', 'dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Twitter</label>
                          <input
                            type="url"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={form.profile.socialLinks.twitter}
                            onChange={(e) => updateForm('profile', 'socialLinks', { ...form.profile.socialLinks, twitter: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                          <input
                            type="url"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={form.profile.socialLinks.linkedin}
                            onChange={(e) => updateForm('profile', 'socialLinks', { ...form.profile.socialLinks, linkedin: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">GitHub</label>
                          <input
                            type="url"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={form.profile.socialLinks.github}
                            onChange={(e) => updateForm('profile', 'socialLinks', { ...form.profile.socialLinks, github: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Language Preference</label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.profile.languagePreference}
                          onChange={(e) => updateForm('profile', 'languagePreference', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="nl">Dutch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Goal (minutes)</label>
                        <input
                          type="number"
                          min="5"
                          max="480"
                          step="5"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.preferences.dailyGoalMinutes}
                          onChange={(e) => updateForm('preferences', 'dailyGoalMinutes', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Difficulty</label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.preferences.preferredDifficulty}
                          onChange={(e) => updateForm('preferences', 'preferredDifficulty', e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Theme</label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={form.preferences.theme}
                          onChange={(e) => updateForm('preferences', 'theme', e.target.value)}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Learning Goals</h3>
                      <textarea
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={form.profile.learningGoals}
                        onChange={(e) => updateForm('profile', 'learningGoals', e.target.value)}
                        placeholder="What do you want to achieve?"
                      />
                    </div>
                  </div>
                )}

                <div id="email" className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Email Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div id="password" className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div id="notifications" className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.notifications.email}
                        onChange={(e) => setForm({
                          ...form,
                          notifications: { ...form.notifications, email: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.notifications.achievements}
                        onChange={(e) => setForm({
                          ...form,
                          notifications: { ...form.notifications, achievements: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Achievement Notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.notifications.courseUpdates}
                        onChange={(e) => setForm({
                          ...form,
                          notifications: { ...form.notifications, courseUpdates: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700">Course Update Notifications</span>
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setForm({
                      email: user?.email || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                      notifications: { email: true, achievements: true, courseUpdates: true },
                      profile: {
                        firstName: '',
                        lastName: '',
                        bio: '',
                        location: '',
                        website: '',
                        languagePreference: '',
                        timezone: '',
                        dateOfBirth: '',
                        phoneNumber: '',
                        socialLinks: {
                          twitter: '',
                          linkedin: '',
                          github: ''
                        },
                        educationLevel: '',
                        interests: [],
                        learningGoals: ''
                      },
                      preferences: {
                        showProgress: true,
                        showProfile: true,
                        learningReminders: true,
                        preferredDifficulty: 'Beginner',
                        dailyGoalMinutes: 30,
                        theme: 'light',
                        emailNotifications: true,      // Added
                        achievementNotifications: true, // Added
                        courseUpdates: true            // Added
                      }
                    })}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
