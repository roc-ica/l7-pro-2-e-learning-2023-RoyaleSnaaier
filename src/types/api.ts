import { Course, Lesson } from './course';
import { Exercise } from './exercise';
import { AchievementCategory, AchievementRarity } from './Achievement';

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface UserProgress {
    completed_lessons: number;
    total_score: number;
    current_level: string;
}

export interface Activity {
    id: number;
    name: string;
    date: string;
    score: number;
    type: string;
    lesson_id: number;
}

export interface LoginResponse {
    status: 'success' | 'error';
    user?: User;
    error?: string;
}

export interface RegisterResponse {
    status: 'success' | 'error';
    user?: User;
    error?: string;
}

export interface CoursesResponse {
    status: 'success' | 'error';
    courses?: Course[];
    error?: string;
}

export interface LessonWithProgress extends Lesson {
    is_completed: boolean;
    score: number;
    total_exercises: number;     // Add these two fields
    completed_exercises: number; // to track exercise completion
}

export interface CourseDetailsResponse {
    status: 'success' | 'error';
    error?: string;
    course?: Course; // Change this to use the full Course type
    lessons?: LessonWithProgress[];
    is_enrolled?: boolean;
}

export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
}

export interface ApiCourseProgressItem {
    id: number;
    title: string;
    completed_lessons: number;
    total_lessons: number;
    progress_percentage: number;
    last_accessed: string;
    total_score: number;
    last_accessed_lesson?: number;
}

export interface ApiActivity {
    id: number;
    completion_date: string;
    activity_type: 'lesson_completed' | 'quiz_completed' | 'achievement_earned';
    activity_name: string;
    points_earned: number;
    lesson_id: number;
}

export interface StreakData {
    current: number;
    longest: number;
    last_active: string;
}

export interface WeeklyProgressData {
    date: string;
    minutes: number;
    completed: number;
}

export interface NextLessonData {
    id: number;
    title: string;
    course_title: string;
    estimated_time: number;
}

export interface UserAchievementData {
    id: string;
    name: string;
    description: string;
    earned_date: string;
    icon: string;
}

export interface UserProgressData {
    total_lessons: number;
    completed_lessons: number;
    total_points: number;
    current_level: string;
    next_milestone: number;
    activities: ApiActivity[];
    streak?: StreakData;
    achievements?: UserAchievementData[];
    time_spent_today?: number;
    daily_goal?: number;
    weekly_progress?: WeeklyProgressData[];
    next_lesson?: NextLessonData;
}

export interface CourseProgressData {
    id: number;
    title: string;
    completed_lessons: number;
    total_lessons: number;
    total_score: number;
    last_accessed_lesson?: number;
}

export interface CourseProgress {
    course_id: number;
    completed_lessons: number;
    total_lessons: number;
    progress_percentage: number;
    last_accessed: string;
    total_score: number;
    title: string;
    last_accessed_lesson?: number;
}

export interface CourseProgressResponse {
    status: 'success' | 'error';
    data?: CourseProgress[];
    error?: string;
    progress?: RawCourseProgress[];  // Add this to match API response
}

export type UserProgressResponse = ApiResponse<UserProgressData>;

export interface LessonResponse {
    status: 'success' | 'error';
    lesson?: {
        lesson_id: number;
        course_id: number;
        course_title: string;
        title: string;
        content: string;
        order_number: number;
        exercises: Exercise[];
    };
    error?: string;
}

export interface ExerciseHistoryItem {
    exercise_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    attempted_at: string;
}

export interface LessonCompletionResponse {
    status: 'success' | 'error';
    error?: string;
    total_exercises: number;
    correct_answers: number;
    total_points: number;
    lesson_title: string;
    next_lesson_id: number | null;
    exercise_history?: ExerciseHistoryItem[];
}

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

export interface RawCourseProgress {
    courseId: number;
    title: string;
    completed: number;
    total: number;
    progress: number;
    total_score?: number;
}

export interface CourseProgress {
    course_id: number;
    completed_lessons: number;
    total_lessons: number;
    progress_percentage: number;
    last_accessed: string;
    total_score: number;
    title: string;
    last_accessed_lesson?: number;  // Add this field
}