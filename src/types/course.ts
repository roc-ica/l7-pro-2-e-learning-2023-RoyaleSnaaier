export interface Course {
    course_id: number;
    title: string;
    description: string;
    difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
    created_at: string;
    image_url: string | null;
}

export interface Lesson {
    lesson_id: number;
    course_id: number;
    title: string;
    content: string;
    order_number: number;
}
