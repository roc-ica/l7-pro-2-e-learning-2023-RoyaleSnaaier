import React from 'react';
import { UserAchievement } from '../../types/Achievement';
import { TrophyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { rarityColors } from '../../constants/achievement';

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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative cursor-pointer"
        >
            <div
                className={`relative rounded-lg border-2 overflow-hidden ${
                    isUnlocked ? 'opacity-100' : 'opacity-80'
                }`}
                style={{
                    borderColor: rarityColors[achievement.rarity],
                    background: isUnlocked ? 
                        `linear-gradient(45deg, ${rarityColors[achievement.rarity]}30, ${rarityColors[achievement.rarity]}50)` : 
                        undefined
                }}
            >
                {isNew && (
                    <div className="absolute top-4 -right-7 bg-green-500 text-white px-8 py-1 transform rotate-45 z-10">
                        <span className="text-xs font-semibold">NEW!</span>
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-center mb-4">
                        <div 
                            className="relative w-12 h-12 mr-3 flex items-center justify-center rounded-full bg-opacity-10"
                            style={{ 
                                backgroundColor: `${rarityColors[achievement.rarity]}20`,
                                borderColor: rarityColors[achievement.rarity]
                            }}
                        >
                            {isUnlocked ? (
                                <TrophyIcon className="w-6 h-6" style={{ color: rarityColors[achievement.rarity] }} />
                            ) : (
                                <LockClosedIcon className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{achievement.title}</h3>
                            <span 
                                className="inline-block px-2 py-1 rounded-full text-xs text-white"
                                style={{ backgroundColor: rarityColors[achievement.rarity] }}
                            >
                                {achievement.rarity.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-4 min-h-[60px]">
                        {achievement.description}
                    </p>

                    {!isUnlocked && (
                        <div className="mt-4">
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                                    <div
                                        style={{ 
                                            width: `${progress}%`,
                                            backgroundColor: rarityColors[achievement.rarity]
                                        }}
                                        className="transition-all duration-300 ease-out"
                                    />
                                </div>
                                <div className="text-right mt-1">
                                    <span className="text-sm text-gray-500">
                                        {achievement.progress}/{achievement.max_progress}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
                    <span className="text-white">Click for details</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AchievementCard;
