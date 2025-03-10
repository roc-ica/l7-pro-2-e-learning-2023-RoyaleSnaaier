import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Grid, 
    Tab, 
    Tabs,
    Paper,
    Skeleton,
    Alert,
    useTheme,
    CircularProgress,
    Menu,
    MenuItem,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    TextField,
    Chip,
    LinearProgress
} from '@mui/material';
import { UserAchievement, AchievementCategory, AchievementRarity } from '../types/Achievement';
import AchievementCard from '../components/achievements/AchievementCard';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';  // Changed from SchoolIcon
import PeopleIcon from '@mui/icons-material/People';      // Changed from GroupIcon
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';  // Changed from MilitaryTechIcon
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';  // Changed from StarIcon
import { motion } from 'framer-motion';
import AchievementDetailsModal from '../components/achievements/AchievementDetailsModal';
import FilterListIcon from '@mui/icons-material/FilterList';
import { rarityColors } from '../constants/achievement';

const Achievements: React.FC = () => {
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [category, setCategory] = useState<AchievementCategory>('learning');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const theme = useTheme();
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
        learning: <MenuBookIcon />,
        social: <PeopleIcon />,
        milestone: <WorkspacePremiumIcon />,
        special: <AutoAwesomeIcon />
    };

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Replace the old progress section with new MUI Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 2,
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        }}
                    >
                        {/* Overall Progress Card */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Box>
                                    <Typography variant="h6" gutterBottom>Overall Progress</Typography>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={completion}
                                            size={80}
                                            thickness={4}
                                        />
                                        <Box sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Typography variant="h6">{Math.round(completion)}%</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {unlockedCount} of {totalCount} unlocked
                                    </Typography>
                                </Box>
                            </Grid>

                            {/* Rarity Cards */}
                            {(['common', 'rare', 'epic', 'legendary'] as AchievementRarity[]).map(rarity => {
                                const count = achievements.filter(a => a.rarity === rarity).length;
                                const unlocked = achievements.filter(a => a.rarity === rarity && a.unlocked_at).length;
                                return (
                                    <Grid item xs={12} md={2.25} key={rarity}>
                                        <Box 
                                            sx={{ 
                                                p: 2, 
                                                borderLeft: `4px solid ${rarityColors[rarity]}`,
                                                height: '100%',
                                                bgcolor: 'background.default',
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Typography variant="subtitle1" sx={{ 
                                                textTransform: 'capitalize',
                                                mb: 1,
                                                fontWeight: 'medium'
                                            }}>
                                                {rarity}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">Unlocked</Typography>
                                                    <Typography variant="h6">{unlocked}/{count}</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" color="text.secondary">Progress</Typography>
                                                    <Typography variant="h6">
                                                        {count > 0 ? Math.round((unlocked / count) * 100) : 0}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        label="Sort By"
                    >
                        <MenuItem value="rarity">Rarity</MenuItem>
                        <MenuItem value="progress">Progress</MenuItem>
                        <MenuItem value="date">Unlock Date</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Show</InputLabel>
                    <Select
                        value={showUnlocked}
                        onChange={(e) => setShowUnlocked(e.target.value as any)}
                        label="Show"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="unlocked">Unlocked</MenuItem>
                        <MenuItem value="locked">Locked</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Tabs
                value={category}
                onChange={(_, newValue) => setCategory(newValue)}
                sx={{ mb: 4 }}
                variant="fullWidth"
            >
                {Object.entries(categoryIcons).map(([key, icon]) => (
                    <Tab 
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={key}
                        icon={icon}
                        iconPosition="start"
                    />
                ))}
            </Tabs>

            <motion.div layout>
                <Grid container spacing={3}>
                    {loading ? (
                        Array.from(new Array(6)).map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Skeleton variant="rectangular" height={200} />
                            </Grid>
                        ))
                    ) : filteredAchievements.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">
                                No achievements found in this category.
                            </Alert>
                        </Grid>
                    ) : (
                        filteredAchievements.map((achievement) => (
                            <Grid item xs={12} sm={6} md={4} key={achievement.achievement_id} component={motion.div} layout>
                                <AchievementCard 
                                    achievement={achievement}
                                    onClick={() => setSelectedAchievement(achievement)}
                                    isNew={!!achievement.unlocked_at && 
                                          new Date(achievement.unlocked_at).getTime() > Date.now() - 24 * 60 * 60 * 1000}
                                />
                            </Grid>
                        ))
                    )}
                </Grid>
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
