import React, { createContext, useContext, useState, useEffect } from 'react';
import { Achievement } from '../types/Achievement';
import { useAuth } from './AuthContext';

export interface Notification {
    id: number;
    type: 'achievement' | 'system' | 'course_enrolled' | 'lesson_completed' | 'streak' | 'level_up' | 'welcome';
    message: string;
    description?: string;
    link?: string;
    isRead: boolean;
    timestamp: string;
    data?: any;
}

interface NotificationContextType {
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
    addAchievementNotification: (achievement: Achievement) => void;
    addLevelUpNotification: (level: string) => void;
    addWelcomeNotification: (username: string) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now(),
            isRead: false,
            timestamp: new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show browser notification if supported
        if (Notification.permission === 'granted') {
            new Notification(notification.message, {
                body: notification.description,
            });
        }
    };

    const addAchievementNotification = (achievement: Achievement) => {
        const description = `You've unlocked ${achievement.title}! ${achievement.description}`;
        addNotification({
            type: 'achievement',
            message: 'New Achievement Unlocked! 🏆',
            description,
            link: '/achievements',
            data: achievement
        });

        // Play achievement sound
        const audio = new Audio('/sounds/achievement.mp3');
        audio.play().catch(() => {}); // Ignore if audio fails to play
    };

    const addLevelUpNotification = (level: string) => {
        addNotification({
            type: 'level_up',
            message: 'Level Up! 🎉',
            description: `Congratulations! You've reached level ${level}!`,
            link: '/profile'
        });
    };

    const addWelcomeNotification = (username: string) => {
        addNotification({
            type: 'welcome',
            message: 'Welcome to LearnHub! 👋',
            description: `Welcome ${username}! Start your learning journey today.`,
            link: '/courses'
        });
    };

    const markAsRead = (id: number) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Request notification permission on mount
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Load notifications from localStorage
    useEffect(() => {
        if (user?.id) {
            const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
            if (savedNotifications) {
                setNotifications(JSON.parse(savedNotifications));
            }
        }
    }, [user?.id]);

    // Save notifications to localStorage
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
        }
    }, [notifications, user?.id]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            addAchievementNotification,
            addLevelUpNotification,
            addWelcomeNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            showError: (message: string) => addNotification({ type: 'system', message }),
            showSuccess: (message: string) => addNotification({ type: 'system', message })
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
