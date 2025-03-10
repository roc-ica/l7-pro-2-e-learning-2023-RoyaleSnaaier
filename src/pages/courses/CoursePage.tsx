import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaPlay } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Lesson {
    lesson_id: number;
    title: string;
    order_number: number;
    content: string;
}

interface LessonWithStatus extends Lesson {
    is_completed: boolean;
    is_unlocked: boolean;
    score: number;
}

const CoursePage: React.FC = () => {
    const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { courseId } = useParams();
    const { user } = useAuth();

    const renderLessonStatus = (lesson: LessonWithStatus) => {
        if (!lesson.is_unlocked) {
            return (
                <div className="flex items-center text-gray-500">
                    <FaLock className="mr-2" />
                    <span>Complete previous lesson to unlock</span>
                </div>
            );
        }

        if (lesson.is_completed) {
            return (
                <div className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-2" />
                    <span>Completed - {lesson.score} points</span>
                </div>
            );
        }

        return (
            <div className="flex items-center text-blue-600">
                <FaPlay className="mr-2" />
                <span>Start Lesson</span>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ...existing header... */}
            
            <div className="grid gap-4">
                {lessons.map((lesson: LessonWithStatus) => (
                    <div 
                        key={lesson.lesson_id}
                        className={`p-4 border rounded-lg ${
                            lesson.is_unlocked ? 'bg-white' : 'bg-gray-50'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium">
                                    {lesson.order_number}. {lesson.title}
                                </h3>
                            </div>
                            {lesson.is_unlocked ? (
                                <Link 
                                    to={`/lesson/${lesson.lesson_id}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {renderLessonStatus(lesson)}
                                </Link>
                            ) : (
                                <div className="px-4 py-2 text-gray-500">
                                    {renderLessonStatus(lesson)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursePage;
