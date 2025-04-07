import React from 'react';
import { UserAchievement } from '../../../../types/Achievement';
import { TrophyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { rarityColors } from '../../../../constants/achievement';

interface Props {
    achievement: UserAchievement;
    onClick: () => void;
    isNew?: boolean;
}

const AchievementCard: React.FC<Props> = ({ achievement, onClick, isNew }) => {
    const progress = (achievement.progress / achievement.max_progress) * 100;
    const isUnlocked = achievement.unlocked_at !== null;

    return (
        <motion.div
            onClick={onClick}
            initial={isNew ? { scale: 0.8, opacity: 0 } : false}
            animate={isNew ? { scale: 1, opacity: 1 } : false}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <div
                className={`relative h-full bg-white rounded-xl border overflow-hidden shadow-md transition-all duration-300 ${
                    isUnlocked ? 'opacity-100' : 'opacity-90'
                }`}
                style={{
                    borderColor: isUnlocked ? rarityColors[achievement.rarity] : 'transparent'
                }}
            >
                {/* Rarity indicator at the top */}
                <div 
                    className="h-2 w-full"
                    style={{ backgroundColor: rarityColors[achievement.rarity] }}
                />
                
                {isNew && (
                    <div className="absolute top-4 -right-7 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-1 transform rotate-45 z-10 shadow-sm">
                        <span className="text-xs font-semibold">NEW!</span>
                    </div>
                )}

                <div className="p-5">
                    <div className="flex items-center mb-4">
                        <div 
                            className="relative w-12 h-12 mr-3 flex items-center justify-center rounded-lg shadow-sm"
                            style={{ 
                                background: isUnlocked ? 
                                    `linear-gradient(135deg, ${rarityColors[achievement.rarity]}50, ${rarityColors[achievement.rarity]}30)` : 
                                    'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                            }}
                        >
                            {isUnlocked ? (
                                <TrophyIcon className="w-6 h-6" style={{ color: rarityColors[achievement.rarity] }} />
                            ) : (
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800">{achievement.title}</h3>
                            <span 
                                className="inline-block px-2 py-1 rounded-full text-xs text-white shadow-sm"
                                style={{ 
                                    background: `linear-gradient(to right, ${rarityColors[achievement.rarity]}, ${rarityColors[achievement.rarity]}cc)`
                                }}
                            >
                                {achievement.rarity.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[3rem]">
                        {achievement.description}
                    </p>

                    {!isUnlocked ? (
                        <div className="mt-4">
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        style={{ 
                                            backgroundColor: rarityColors[achievement.rarity]
                                        }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs font-medium text-gray-500">Progress</span>
                                    <span className="text-xs font-medium text-gray-600">
                                        {achievement.progress}/{achievement.max_progress}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Unlocked</span>
                            <span className="text-xs text-gray-600">
                                {new Date(achievement.unlocked_at!).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-indigo-800 bg-opacity-90 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-90">
                    <span className="text-white font-medium">View Details</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AchievementCard;
