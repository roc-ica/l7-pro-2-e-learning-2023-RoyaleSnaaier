export interface ExerciseHistoryItem {
    exercise_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    attempted_at: string;
}

export interface LessonCompletion {
    total_exercises: number;
    correct_answers: number;
    total_points: number;
    lesson_title: string;
    next_lesson_id: number | null;
    exercise_history?: ExerciseHistoryItem[];
}

export interface ExerciseOption {
    option_id: number;
    exercise_id: number;
    option_text: string;
    is_correct: boolean;
}

export interface Exercise {
    exercise_id: number;
    lesson_id: number;
    question: string;
    correct_answer: string;
    exercise_type: "Multiple Choice" | "Fill in the blank" | "Writing";
    points: number;
    options?: ExerciseOption[];
}

export interface Lesson {
    lesson_id: number;
    title: string;
    content: string;
    exercises: Exercise[];
}
