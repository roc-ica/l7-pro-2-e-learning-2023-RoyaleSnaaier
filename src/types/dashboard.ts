export interface Activity {
    id: number;
    date: string;
    type: 'lesson_completed' | 'quiz_completed' | 'achievement_earned';
    name: string;
    score: number;
    lessonId: number;
}

export interface CourseProgress {
    courseId: number;
    title: string;
    progress: number;
    completed: number;
    total: number;
    total_score: number;
    lastAccessedLesson?: number;
}

export interface LearningStreak {
    current: number;
    longest: number;
    lastActive: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    earnedDate: string;
    icon: string;
}

export interface DashboardStats {
    totalLessons: number;
    completedLessons: number;
    totalPoints: number;
    currentLevel: string;
    nextMilestone: number;
    recentActivities: Activity[];
    courseProgress: CourseProgress[];
    streak: LearningStreak;
    recentAchievements: Achievement[];
    timeSpentToday: number;
    dailyGoal: number;
    weeklyProgress: Array<{
        date: string;
        minutes: number;
        completed: number;
    }>;
    nextLesson?: {
        id: number;
        title: string;
        courseTitle: string;
        estimatedTime: number;
    };
}
