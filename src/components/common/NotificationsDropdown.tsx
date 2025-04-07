import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../contexts/NotificationContext';
import { 
    BellIcon, 
    CheckCircleIcon, 
    AcademicCapIcon, 
    InformationCircleIcon,
    SpeakerWaveIcon,
    ArrowPathIcon,
    CheckIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface NotificationsDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll
}) => {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const hasNotifications = notifications.length > 0;

    // Get icon based on notification type
    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'achievement':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'course_enrolled':
                return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
            case 'lesson_completed':
                return <CheckCircleIcon className="h-5 w-5 text-purple-500" />; 
            case 'streak':
            case 'level_up':
                return <SpeakerWaveIcon className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <InformationCircleIcon className="h-5 w-5 text-red-500" />;
            case 'success':
                return <CheckIcon className="h-5 w-5 text-green-500" />;
            case 'system':
            case 'welcome':
            default:
                return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    // Background color based on notification type
    const getBackgroundColor = (type: Notification['type'], isRead: boolean) => {
        if (isRead) return 'bg-gray-50';
        
        switch (type) {
            case 'achievement':
                return 'bg-green-50';
            case 'course_enrolled':
                return 'bg-blue-50';
            case 'lesson_completed':
                return 'bg-purple-50';
            case 'streak':
            case 'level_up':
                return 'bg-yellow-50';
            case 'error':
                return 'bg-red-50';
            case 'success':
                return 'bg-green-50';
            case 'system':
            case 'welcome':
            default:
                return 'bg-gray-100';
        }
    };

    // Format notification date
    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    return (
        <div className="w-full max-h-[70vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {unreadCount} new
                    </span>
                )}
            </div>
            
            {/* Action buttons */}
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between bg-gray-50">
                <button
                    onClick={onMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className={`text-xs flex items-center ${
                        unreadCount > 0 
                            ? 'text-blue-600 hover:text-blue-800' 
                            : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Mark all as read
                </button>
                <button
                    onClick={onClearAll}
                    disabled={!hasNotifications}
                    className={`text-xs flex items-center ${
                        hasNotifications 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Clear all
                </button>
            </div>

            {/* Notifications list */}
            <div className="overflow-y-auto flex-grow">
                {hasNotifications ? (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <motion.li
                                key={notification.id}
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`${getBackgroundColor(notification.type, notification.isRead)} transition-colors`}
                            >
                                <Link
                                    to={notification.link || '#'}
                                    className="px-4 py-3 flex items-start hover:bg-gray-50"
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            onMarkAsRead(notification.id);
                                        }
                                        onClose();
                                    }}
                                >
                                    <div className="flex-shrink-0 pt-0.5">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="ml-3 w-0 flex-1">
                                        <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(notification.timestamp)}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="ml-3 flex-shrink-0 self-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                        </div>
                                    )}
                                </Link>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center">
                        <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            When you get notifications, they'll show up here.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {hasNotifications && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <button
                        onClick={() => {
                            // In a real app, this would load more notifications
                            // For now, we'll just close the dropdown
                            onClose();
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Refresh notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
