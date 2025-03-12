import React, { useEffect, useState } from 'react';
import { UserAchievement, AchievementCategory, AchievementRarity } from '../../types/Achievement';
import AchievementCard from './components/achievements/AchievementCard';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import AchievementDetailsModal from './components/achievements/AchievementDetailsModal';
import { rarityColors } from '../../constants/achievement';
import { BookOpenIcon, UsersIcon, TrophyIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Achievements: React.FC = () => {
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [category, setCategory] = useState<AchievementCategory>('learning');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [selectedAchievement, setSelectedAchievement] = useState<UserAchievement | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'rarity' | 'progress' | 'date'>('rarity');
    const [showUnlocked, setShowUnlocked] = useState<'all' | 'unlocked' | 'locked'>('all');

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?.id) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await api.getAchievements(user.id);
                
                if (response.status === 'success' && response.achievements) {
                    console.log('Loaded achievements:', response.achievements);
                    setAchievements(response.achievements);
                } else {
                    setError(response.message || 'Failed to load achievements');
                }
            } catch (error) {
                console.error('Achievement loading error:', error);
                setError('Failed to load achievements. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [user]);

    const filteredAchievements = achievements
        .filter(a => a.category === category)
        .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(a => {
            if (showUnlocked === 'unlocked') return a.unlocked_at !== null;
            if (showUnlocked === 'locked') return a.unlocked_at === null;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'rarity') {
                const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            }
            if (sortBy === 'progress') {
                return (b.progress / b.max_progress) - (a.progress / a.max_progress);
            }
            if (sortBy === 'date') {
                if (!a.unlocked_at) return 1;
                if (!b.unlocked_at) return -1;
                return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
            }
            return 0;
        });

    const unlockedCount = achievements.filter(a => a.unlocked_at).length;
    const totalCount = achievements.length;
    const completion = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    const categoryIcons = {
        learning: <BookOpenIcon className="w-5 h-5" />,
        social: <UsersIcon className="w-5 h-5" />,
        milestone: <TrophyIcon className="w-5 h-5" />,
        special: <SparklesIcon className="w-5 h-5" />
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Overall Progress */}
                    <div className="text-center p-4">
                        <h2 className="font-semibold text-lg mb-2">Overall Progress</h2>
                        <div className="relative inline-flex mb-2">
                            <svg className="w-24 h-24">
                                <circle
                                    className="text-gray-100"
                                    strokeWidth="5"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50%"
                                    cy="50%"
                                />
                                <circle
                                    className="text-blue-500"
                                    strokeWidth="5"
                                    strokeDasharray={`${2 * Math.PI * 45}`}
                                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - completion / 100)}`}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50%"
                                    cy="50%"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-bold">{Math.round(completion)}%</span>
                                <span className="text-xs text-gray-500">Complete</span>
                            </div>
                        </div>
                        <div className="flex justify-center items-center text-sm text-gray-600">
                            <TrophyIcon className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>{unlockedCount} of {totalCount} unlocked</span>
                        </div>
                    </div>

                    {/* Rarity Cards */}
                    <div className="col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {(['common', 'rare', 'epic', 'legendary'] as AchievementRarity[]).map(rarity => {
                            const count = achievements.filter(a => a.rarity === rarity).length;
                            const unlocked = achievements.filter(a => a.rarity === rarity && a.unlocked_at).length;
                            const percentage = count > 0 ? Math.round((unlocked / count) * 100) : 0;
                            
                            return (
                                <div 
                                    key={rarity}
                                    className="border-l-4 rounded p-3 bg-gray-50"
                                    style={{ borderColor: rarityColors[rarity] }}
                                >
                                    <h3 className="capitalize font-medium mb-2">{rarity}</h3>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-500">Unlocked</p>
                                            <p className="text-lg font-semibold">{unlocked}/{count}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Progress</p>
                                            <p className="text-lg font-semibold">{percentage}%</p>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full" 
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: rarityColors[rarity]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Category tabs */}
                <div className="bg-white rounded-lg shadow-sm p-1 place-content-center ">
                    <div className="flex">
                        {Object.entries(categoryIcons).map(([key, icon]) => (
                            <button
                                key={key}
                                onClick={() => setCategory(key as AchievementCategory)}
                                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
                                    category === key 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                <span className="mr-2">{icon}</span>
                                <span className="capitalize">{key}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search and filters */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search achievements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-white text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="w-32">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full p-2 border border-gray-200 rounded-md bg-white text-gray-800"
                            >
                                <option value="rarity">Rarity</option>
                                <option value="progress">Progress</option>
                                <option value="date">Unlock Date</option>
                            </select>
                        </div>

                        <div className="w-32">
                            <select
                                value={showUnlocked}
                                onChange={(e) => setShowUnlocked(e.target.value as any)}
                                className="w-full p-2 border border-gray-200 rounded-md bg-white text-gray-800"
                            >
                                <option value="all">All</option>
                                <option value="unlocked">Unlocked</option>
                                <option value="locked">Locked</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Title */}
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <span className="text-white">{categoryIcons[category]}</span>
                </div>
                <h2 className="text-2xl font-semibold capitalize">{category} Achievements</h2>
                <span className="ml-3 px-2 py-0.5 text-sm bg-gray-100 rounded-full text-gray-600">
                    {filteredAchievements.length} {filteredAchievements.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Achievement Cards */}
            <motion.div layout className="transition-opacity duration-500" style={{ opacity: loading ? 0.5 : 1 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from(new Array(8)).map((_, index) => (
                            <div key={index} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                        ))
                    ) : filteredAchievements.length === 0 ? (
                        <div className="col-span-full bg-blue-50 text-blue-600 p-4 rounded-lg">
                            No achievements found in this category matching your filters.
                        </div>
                    ) : (
                        filteredAchievements.map((achievement) => (
                            <motion.div 
                                key={achievement.achievement_id} 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <AchievementCard 
                                    achievement={achievement}
                                    onClick={() => setSelectedAchievement(achievement)}
                                    isNew={!!achievement.unlocked_at && 
                                          new Date(achievement.unlocked_at).getTime() > Date.now() - 24 * 60 * 60 * 1000}
                                />
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {selectedAchievement && (
                <AchievementDetailsModal
                    achievement={selectedAchievement}
                    open={!!selectedAchievement}
                    onClose={() => setSelectedAchievement(null)}
                />
            )}
        </div>
    );
};

export default Achievements;
