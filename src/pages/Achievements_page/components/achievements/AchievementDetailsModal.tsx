import React from 'react';
import { UserAchievement } from '../../../../types/Achievement';
import { formatDistance } from 'date-fns';
import { motion } from 'framer-motion';
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
import { rarityColors } from '../../../../constants/achievement';

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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="relative bg-white rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] flex flex-col"
                style={{ zIndex: 51 }} // Ensure modal is above backdrop
            >
                {/* Modal Header with Fixed Height */}
                <div className="relative h-40 overflow-hidden flex-shrink-0">
                    <div 
                        className="absolute inset-0 bg-gradient-to-r"
                        style={{ 
                            backgroundImage: `linear-gradient(to right, ${rarityColors[achievement.rarity]}cc, ${rarityColors[achievement.rarity]})`
                        }}
                    >
                        {/* Decorative pattern overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                                <defs>
                                    <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#smallGrid)" />
                            </svg>
                        </div>
                    </div>

                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black bg-opacity-20 rounded-full p-1 transition-colors"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    {/* Achievement Icon */}
                    <div className="absolute bottom-15 left-0 transform translate-y-1/2 ml-8">
                        <div 
                            className="w-24 h-24 rounded-xl bg-white flex items-center justify-center shadow-lg p-2"
                        >
                            <div
                                className="w-full h-full rounded-lg flex items-center justify-center"
                                style={{ 
                                    background: `linear-gradient(135deg, ${rarityColors[achievement.rarity]}60, ${rarityColors[achievement.rarity]}20)`
                                }}
                            >
                                <TrophyIcon 
                                    className="h-12 w-12" 
                                    style={{ color: rarityColors[achievement.rarity] }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Achievement Title */}
                    <div className="absolute bottom-4 left-36 text-white">
                        <h2 className="text-2xl font-bold">{achievement.title}</h2>
                        <div className="flex gap-2 mt-1">
                            <span 
                                className="px-2 py-1 rounded-full text-xs font-medium shadow-sm bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm"
                            >
                                {achievement.rarity.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm">
                                {achievement.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal Content with Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 pt-6">
                    <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                        <p className="text-gray-700">{achievement.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Progress Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <ArrowUpIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-800">Progress</h4>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {Math.round((achievement.progress / achievement.max_progress) * 100)}%
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        {achievement.progress} / {achievement.max_progress} completed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rarity Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 shadow-sm border border-amber-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-amber-100">
                                    <FireIcon className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-800">Rarity</h4>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">
                                        {achievement.rarity === 'legendary' ? 'Legendary' :
                                         achievement.rarity === 'epic' ? 'Epic' :
                                         achievement.rarity === 'rare' ? 'Rare' : 'Common'}
                                    </p>
                                    <div className="flex mt-1">
                                        {Array.from({length: 
                                            achievement.rarity === 'legendary' ? 4 :
                                            achievement.rarity === 'epic' ? 3 :
                                            achievement.rarity === 'rare' ? 2 : 1
                                        }).map((_, i) => (
                                            <StarIcon key={i} className="h-4 w-4 text-amber-500 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements and Rewards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-5">
                            <h4 className="text-lg font-semibold flex items-center gap-2 text-indigo-700 mb-4">
                                <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                                Requirements
                            </h4>
                            <ul className="space-y-3">
                                {requirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-100 p-5">
                            <h4 className="text-lg font-semibold flex items-center gap-2 text-purple-700 mb-4">
                                <StarIcon className="h-5 w-5 text-purple-500" />
                                Rewards
                            </h4>
                            <ul className="space-y-3">
                                {rewards.map((reward, index) => (
                                    <li key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm">
                                            ★
                                        </span>
                                        <span className="text-gray-700">{reward}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Unlock Status */}
                    {isUnlocked ? (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <TrophyIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium">Achievement Unlocked!</h4>
                                    <div className="flex items-center gap-6 mt-1">
                                        <div className="flex items-center text-green-100">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            <span className="text-sm">
                                                {new Date(achievement.unlocked_at!).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-green-100">
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
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-5">
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Progress Tracker</h4>
                            <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full"
                                    style={{ 
                                        background: `linear-gradient(to right, ${rarityColors[achievement.rarity]}aa, ${rarityColors[achievement.rarity]})`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-sm text-gray-600">
                                    {achievement.progress} of {achievement.max_progress} complete
                                </p>
                                <p className="text-sm font-medium text-gray-700">
                                    {Math.round(progress)}% to unlock
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions - Fixed at bottom */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AchievementDetailsModal;
