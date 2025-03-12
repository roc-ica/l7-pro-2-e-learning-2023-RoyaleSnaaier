export interface RoadmapLesson {
    id: number;
    title: string;
    completed: boolean;
    score: number;
    order: number;
    totalScore?: number;
}

export interface RoadmapStage {
    id: number;
    title: string;
    difficulty_level: string;
    lessons: RoadmapLesson[];
}

export interface EnrolledCourse {
    id: number;
    title: string;
    difficulty_level: string;
    total_lessons: number;
    completed_lessons: number;
    enrolled_at: string;
}

export interface StageColors {
    bg: string;
    text: string;
    border: string;
}

export interface StageProgress {
    percentage: number;
    completed: number;
    total: number;
}
