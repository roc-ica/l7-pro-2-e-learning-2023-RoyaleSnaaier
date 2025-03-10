export interface Exercise {
    exercise_id: number;
    lesson_id: number;
    question: string;
    correct_answer: string;
    exercise_type: 'Multiple Choice' | 'Fill in the blank' | 'Writing';
    points: number;
    options?: ExerciseOption[];
}

export interface ExerciseOption {
    option_id: number;
    exercise_id: number;
    option_text: string;
    is_correct: boolean;
}

export interface ExerciseAttempt {
    exercise_id: number;
    user_answer: string;
    is_correct: boolean;
    points_earned: number;
}
