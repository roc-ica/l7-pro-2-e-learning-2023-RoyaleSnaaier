import React, { useEffect, useState } from 'react';
import { UserAchievement, AchievementCategory, AchievementRarity } from '../../types/Achievement';
import AchievementCard from './components/achievements/AchievementCard';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementDetailsModal from './components/achievements/AchievementDetailsModal';
import { rarityColors } from '../../constants/achievement';
import { 
    BookOpenIcon, 
    UsersIcon, 
    TrophyIcon, 
    SparklesIcon, 
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';

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
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?.id) return;
            
            try {
                setLoading(true);
                setError(null);
                const response = await api.getAchievements(user.id);
                
                if (response.status === 'success' && response.achievements) {
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
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium">Error Loading Achievements</h3>
                                <p className="mt-2">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section - Fixed positioning and margin */}
            <div className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white mb-8">
                <div className="absolute inset-0 z-0 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                        <defs>
                            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#smallGrid)" />
                    </svg>
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Achievement Gallery</h1>
                        <p className="text-blue-100 max-w-2xl">
                            Track your progress, unlock achievements, and showcase your accomplishments 
                            as you continue your learning journey.
                        </p>
                        
                        <div className="mt-6 flex items-center gap-4">
                            <div className="h-16 w-16 rounded-lg bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm shadow-lg flex items-center justify-center">
                                <TrophyIcon className="h-8 w-8 text-yellow-300" />
                            </div>
                            <div>
                                <div className="text-xl font-semibold">{unlockedCount} of {totalCount} Achievements Unlocked</div>
                                <div className="w-64 bg-white bg-opacity-20 rounded-full h-2.5 mt-2">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completion}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="h-2.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content - Adding proper top margin/padding */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                {/* Progress Overview */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-md mb-8"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        {(['common', 'rare', 'epic', 'legendary'] as AchievementRarity[]).map(rarity => {
                            const count = achievements.filter(a => a.rarity === rarity).length;
                            const unlocked = achievements.filter(a => a.rarity === rarity && a.unlocked_at).length;
                            const percentage = count > 0 ? Math.round((unlocked / count) * 100) : 0;
                            
                            return (
                                <div key={rarity} className="p-6">
                                    <div className="flex items-center">
                                        <div 
                                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                            style={{
                                                background: `linear-gradient(135deg, ${rarityColors[rarity]}50, ${rarityColors[rarity]}20)`
                                            }}
                                        >
                                            <TrophyIcon 
                                                className="h-5 w-5" 
                                                style={{ color: rarityColors[rarity] }} 
                                            />
                                        </div>
                                        <div>
                                            <h3 className="capitalize font-medium text-gray-800">{rarity}</h3>
                                            <div className="text-sm text-gray-500">
                                                {unlocked}/{count} unlocked
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-gray-600">Progress</span>
                                            <span 
                                                className="font-semibold"
                                                style={{ color: rarityColors[rarity] }}
                                            >
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="mt-1.5 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full rounded-full" 
                                                style={{
                                                    background: `linear-gradient(to right, ${rarityColors[rarity]}aa, ${rarityColors[rarity]})`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Category Tabs Navigation */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-md mb-6 overflow-hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-5">
                        <div className="col-span-4">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                {Object.entries(categoryIcons).map(([key, icon]) => (
                                    <button
                                        key={key}
                                        onClick={() => setCategory(key as AchievementCategory)}
                                        className={`flex-1 min-w-[130px] relative flex flex-col items-center justify-center py-4 px-2 transition-all ${
                                            category === key 
                                            ? 'text-blue-600' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="mb-1">{icon}</div>
                                        <span className="capitalize text-sm font-medium">{key}</span>
                                        
                                        {category === key && (
                                            <motion.div 
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 flex items-center justify-center p-2 border-t md:border-t-0 md:border-l border-gray-100">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-lg transition-colors"
                                style={{
                                    backgroundColor: showFilters ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: showFilters ? '#2563EB' : '#4B5563'
                                }}
                            >
                                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-gray-100"
                            >
                                <div className="p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    id="search"
                                                    type="text"
                                                    placeholder="Search achievements..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                            <select
                                                id="sortBy"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as any)}
                                                className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="rarity">Rarity</option>
                                                <option value="progress">Progress</option>
                                                <option value="date">Unlock Date</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="showUnlocked" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                id="showUnlocked"
                                                value={showUnlocked}
                                                onChange={(e) => setShowUnlocked(e.target.value as any)}
                                                className="w-full p-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">All Achievements</option>
                                                <option value="unlocked">Unlocked Only</option>
                                                <option value="locked">Locked Only</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Section Title */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center mb-6"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md">
                        <span className="text-white">{categoryIcons[category]}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">{category} Achievements</h2>
                        <p className="text-gray-500">
                            {filteredAchievements.length} {filteredAchievements.length === 1 ? 'achievement' : 'achievements'} in this category
                        </p>
                    </div>
                </motion.div>

                {/* Achievement Cards Grid */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loading ? (
                            // Skeleton Loader
                            Array.from(new Array(8)).map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-md h-64 animate-pulse">
                                    <div className="h-3 bg-gray-200 rounded-t-xl w-full"></div>
                                    <div className="p-5">
                                        <div className="flex space-x-4">
                                            <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                                            <div className="flex-1 space-y-3 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mt-4">
                                            <div className="h-3 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                        <div className="mt-5">
                                            <div className="h-2 bg-gray-200 rounded"></div>
                                            <div className="flex justify-between mt-1">
                                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filteredAchievements.length === 0 ? (
                            <div className="col-span-full bg-white p-8 rounded-xl shadow-md text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                    <TrophyIcon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Achievements Found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    There are no achievements in this category matching your current filters.
                                    Try changing your search or filter settings.
                                </p>
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="mt-4 bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredAchievements.map((achievement) => (
                                <AchievementCard 
                                    key={achievement.achievement_id} 
                                    achievement={achievement}
                                    onClick={() => setSelectedAchievement(achievement)}
                                    isNew={!!achievement.unlocked_at && 
                                          new Date(achievement.unlocked_at).getTime() > Date.now() - 24 * 60 * 60 * 1000}
                                />
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Achievement Details Modal */}
            <AnimatePresence>
                {selectedAchievement && (
                    <AchievementDetailsModal
                        achievement={selectedAchievement}
                        open={!!selectedAchievement}
                        onClose={() => setSelectedAchievement(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Achievements;
