export interface Course {
  course_id: number;
  title: string;
  description: string;
  difficulty_level: string;
  image_url?: string;
  created_at: string;
  status: string;
  creator_id?: number;
  is_public?: boolean;
}

export interface Lesson {
  lesson_id: number;
  course_id: number;
  title: string;
  content: string;
  order_number: number;
  estimated_minutes: number;
  exercises?: Exercise[];
  course_title?: string;
}

export interface Exercise {
  exercise_id: number;
  lesson_id: number;
  question: string;
  correct_answer: string;
  exercise_type: string;
  points: number;
  options?: ExerciseOption[];
}

export interface ExerciseOption {
  option_id: number;
  exercise_id: number;
  option_text: string;
  is_correct: boolean;
}
