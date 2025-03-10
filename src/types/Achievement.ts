export type AchievementCategory = 'learning' | 'social' | 'milestone' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
    achievement_id: string;
    title: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    max_progress: number;
    rarity: AchievementRarity;
    requirements: any;
    rewards: any;
}

export interface UserAchievement extends Achievement {
    progress: number;
    unlocked_at: string | null;
}

export interface AchievementUnlockResponse {
    status: 'success' | 'error';
    message?: string;
    new_achievements?: Achievement[];
    error?: string;
}
