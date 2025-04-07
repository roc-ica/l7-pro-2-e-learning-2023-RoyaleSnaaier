import { AchievementRarity } from '../types/Achievement';

export const rarityColors: Record<AchievementRarity, string> = {
    common: '#8e8e8e',
    rare: '#4287f5',
    epic: '#9c27b0',
    legendary: '#ffd700'
};

export const rarityGradients: Record<AchievementRarity, string> = {
    common: 'linear-gradient(45deg, #8e8e8e 30%, #a8a8a8 90%)',
    rare: 'linear-gradient(45deg, #4287f5 30%, #42a5f5 90%)',
    epic: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
    legendary: 'linear-gradient(45deg, #ffd700 30%, #ffeb3b 90%)'
};
