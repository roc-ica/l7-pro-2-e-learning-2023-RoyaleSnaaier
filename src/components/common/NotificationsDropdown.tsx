import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Notification {
    id: number;
    type: 'achievement' | 'system' | 'course_enrolled' | 'lesson_completed' | 'streak' | 'level_up' | 'welcome';
    message: string;
    description?: string;
    link?: string;
    isRead: boolean;
    timestamp: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
}

const NotificationsDropdown: React.FC<Props> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll
}) => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    
    if (!isOpen) return null;

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.isRead);

    const getIcon = (type: Notification['type']) => {
        const iconStyles = {
            achievement: 'text-yellow-500',
            course_enrolled: 'text-green-500',
            lesson_completed: 'text-blue-500',
            streak: 'text-orange-500',
            level_up: 'text-purple-500',
            system: 'text-gray-500',
            welcome: 'text-blue-500',
        }[type];

        const iconPaths = {
            achievement: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
            course_enrolled: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
            lesson_completed: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            streak: "M13 10V3L4 14h7v7l9-11h-7z",
            level_up: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
            system: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            welcome: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        }[type];

        return (
            <div className={`p-2 rounded-full bg-opacity-20 ${iconStyles.replace('text-', 'bg-')}`}>
                <svg className={`w-5 h-5 ${iconStyles}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths} />
                </svg>
            </div>
        );
    };

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Mark all as read
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filter === 'all' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filter === 'unread' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Unread
                        </button>
                    </div>
                    <button
                        onClick={onClearAll}
                        className="text-sm text-gray-600 hover:text-red-600"
                    >
                        Clear all
                    </button>
                </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>No notifications found</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => onMarkAsRead(notification.id)}
                        >
                            <div className="flex items-start space-x-3">
                                {getIcon(notification.type)}
                                <div className="flex-1 min-w-0">
                                    {notification.link ? (
                                        <Link to={notification.link} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                                            {notification.message}
                                        </Link>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                    )}
                                    {notification.description && (
                                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100">
                <button
                    onClick={onClose}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default NotificationsDropdown;
