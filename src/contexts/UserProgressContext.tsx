import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';

interface UserProgress {
    xp: number;
    level: string;
}

const UserProgressContext = createContext<{
    userProgress: UserProgress;
    setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
} | undefined>(undefined);

const calculateLevel = (xp: number): string => {
    if (xp < 100) return 'Beginner';
    if (xp < 500) return 'Intermediate';
    if (xp < 1000) return 'Advanced';
    return 'Expert';
};

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProgress, setUserProgress] = useState<UserProgress>({
        xp: 0,
        level: 'Beginner'
    });
    const notifications = useNotifications();
    
    const updateUserLevel = (newXp: number) => {
        const currentLevel = calculateLevel(userProgress.xp);
        const newLevel = calculateLevel(newXp);
        
        if (newLevel !== currentLevel) {
            notifications.addLevelUpNotification(newLevel);
            setUserProgress(prev => ({
                ...prev,
                level: newLevel,
                xp: newXp
            }));
        }
    };

    return (
        <UserProgressContext.Provider value={{ userProgress, setUserProgress }}>
            {children}
        </UserProgressContext.Provider>
    );
};

export const useUserProgress = () => {
    const context = useContext(UserProgressContext);
    if (!context) {
        throw new Error('useUserProgress must be used within UserProgressProvider');
    }
    return context;
};
