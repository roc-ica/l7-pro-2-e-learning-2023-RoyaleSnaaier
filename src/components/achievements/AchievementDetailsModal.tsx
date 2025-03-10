import React from 'react';
import { UserAchievement } from '../../types/Achievement';
import { formatDistance } from 'date-fns';
import { 
    TrophyIcon, 
    XMarkIcon,
    CheckCircleIcon,
    StarIcon,
    ArrowUpIcon,
    FireIcon,
    ClockIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import { rarityColors } from '../../constants/achievement';

interface Props {
    achievement: UserAchievement;
    open: boolean;
    onClose: () => void;
}

const formatAchievementData = (data: unknown): string[] => {
    if (data === null || data === undefined) {
        return [];
    }

    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                return parsed.map(String).map(s => s.trim());
            }
            return [parsed].map(String).map(s => s.trim());
        } catch {
            return [data.trim()]; 
        }
    }

    if (Array.isArray(data)) {
        return data.map(String).map(s => s.trim());
    }

    if (typeof data === 'object' && data !== null) {
        return Object.values(data as Record<string, unknown>)
            .filter(Boolean)
            .map(String)
            .map(s => s.trim());
    }

    return [String(data).trim()];
};

const AchievementDetailsModal: React.FC<Props> = ({ achievement, open, onClose }) => {
    if (!open) return null;

    const progress = (achievement.progress / achievement.max_progress) * 100;
    const isUnlocked = achievement.unlocked_at !== null;

    const requirements = formatAchievementData(achievement.requirements);
    const rewards = formatAchievementData(achievement.rewards);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header Section */}
                    <div className="relative h-32 bg-gradient-to-r from-gray-800 to-gray-900">
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-200"
                            onClick={onClose}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        <div className="absolute -bottom-10 left-6 p-2 bg-white rounded-xl shadow-lg">
                            <div 
                                className="w-20 h-20 rounded-lg flex items-center justify-center"
                                style={{ 
                                    backgroundColor: `${rarityColors[achievement.rarity]}15`,
                                    border: `2px solid ${rarityColors[achievement.rarity]}`
                                }}
                            >
                                <TrophyIcon 
                                    className="h-12 w-12" 
                                    style={{ color: rarityColors[achievement.rarity] }} 
                                />
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-36 text-white">
                            <h2 className="text-2xl font-bold">{achievement.title}</h2>
                            <div className="flex gap-2 mt-1">
                                <span 
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: rarityColors[achievement.rarity] }}
                                >
                                    {achievement.rarity.toUpperCase()}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20">
                                    {achievement.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 pt-16 pb-6">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700">{achievement.description}</p>
                            </div>

                            {/* Stats Cards */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <ArrowUpIcon className="h-5 w-5 text-blue-500 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Progress</h4>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {Math.round((achievement.progress / achievement.max_progress) * 100)}%
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            {achievement.progress} / {achievement.max_progress} completed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FireIcon className="h-5 w-5 text-orange-500 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-orange-900">Rarity Score</h4>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {achievement.rarity === 'legendary' ? 'S+' :
                                             achievement.rarity === 'epic' ? 'A' :
                                             achievement.rarity === 'rare' ? 'B' : 'C'}
                                        </p>
                                        <p className="text-sm text-orange-600">
                                            {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)} Achievement
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements and Rewards */}
                            <div className="col-span-2 grid grid-cols-2 gap-6">
                                <div className="bg-indigo-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium flex items-center gap-2 text-indigo-900 mb-3">
                                        <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                                        Requirements
                                    </h4>
                                    <ul className="space-y-2">
                                        {requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="text-indigo-700">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-amber-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium flex items-center gap-2 text-amber-900 mb-3">
                                        <StarIcon className="h-5 w-5 text-amber-500" />
                                        Rewards
                                    </h4>
                                    <ul className="space-y-2">
                                        {rewards.map((reward, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-sm">
                                                    ★
                                                </span>
                                                <span className="text-amber-700">{reward}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Unlock Status */}
                            {isUnlocked ? (
                                <div className="col-span-2 bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <TrophyIcon className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-medium text-green-900">Achievement Unlocked!</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center text-green-700">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    <span className="text-sm">
                                                        {new Date(achievement.unlocked_at!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-green-700">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    <span className="text-sm">
                                                        {formatDistance(new Date(achievement.unlocked_at!), new Date(), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="col-span-2">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full transition-all duration-500"
                                            style={{ 
                                                width: `${progress}%`,
                                                backgroundColor: rarityColors[achievement.rarity]
                                            }}
                                        />
                                    </div>
                                    <p className="text-right mt-1 text-sm text-gray-600">
                                        {achievement.progress} / {achievement.max_progress} progress
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementDetailsModal;
