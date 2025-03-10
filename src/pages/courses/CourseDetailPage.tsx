import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course } from '../../types/course';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LessonWithProgress } from '../../types/api';

interface LessonProgress {
    lesson_id: number;
    completed: boolean;
    score: number;
}

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams();
    const { isLoggedIn, user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<Record<number, LessonProgress>>({});
    const [resetting, setResetting] = useState<number | null>(null);
    const [completedCount, setCompletedCount] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) return;
            
            try {
                const response = await api.getCourseDetails(parseInt(courseId), user?.id);
                if (response.status === 'success' && response.course && response.lessons) {
                    setCourse(response.course);
                    setLessons(response.lessons);
                    // Update to count lessons where all exercises are completed
                    setCompletedCount(
                        response.lessons.filter(l => 
                            l.is_completed && 
                            l.total_exercises === l.completed_exercises
                        ).length
                    );
                    setIsEnrolled(response.is_enrolled || false);
                } else {
                    setError(response.error || 'Failed to fetch course details');
                }
            } catch (err) {
                setError('Failed to fetch course details');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId, user?.id]);

    const handleResetLesson = async (lessonId: number) => {
        if (!user) return;
        
        try {
            setResetting(lessonId);
            const response = await api.resetLessonProgress(user.id, lessonId);
            if (response.status === 'success') {
                // Update local progress state
                setProgress(prev => ({
                    ...prev,
                    [lessonId]: { ...prev[lessonId], completed: false, score: 0 }
                }));
            }
        } catch (err) {
            console.error('Failed to reset lesson:', err);
        } finally {
            setResetting(null);
        }
    };

    const handleEnroll = async () => {
        if (!user?.id || !courseId) return;
        
        try {
            setEnrolling(true);
            const response = await api.enrollInCourse(user.id, parseInt(courseId));
            if (response.status === 'success') {
                setIsEnrolled(true);
            } else {
                setError(response.error || 'Failed to enroll in course');
            }
        } catch (err) {
            setError('Failed to enroll in course');
        } finally {
            setEnrolling(false);
        }
    };

    const isLessonAccessible = (index: number) => {
        if (index === 0) return isEnrolled; // First lesson only needs enrollment
        // Check if all previous lessons are completed
        for (let i = 0; i < index; i++) {
            if (!lessons[i].is_completed) return false;
        }
        return isEnrolled;
    };

    const UnauthorizedBanner = () => (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-blue-900">Sign in to access this course</h3>
                    <p className="text-blue-700">Create a free account to start learning</p>
                </div>
                <div className="flex space-x-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                    >
                        Log in
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );

    const renderLessonCard = (lesson: LessonWithProgress, index: number) => {
        const isLocked = !isLessonAccessible(index);
        const statusIcon = lesson.is_completed ? '✓' : isLocked ? '🔒' : (index + 1);
        const statusClass = lesson.is_completed 
            ? 'bg-green-100 text-green-600'
            : isLocked
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-100 text-blue-600';

        return (
            <div 
                key={lesson.lesson_id}
                className={`border rounded-lg p-4 ${isLocked ? 'opacity-75' : 'hover:border-blue-500'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${statusClass}`}>
                            {statusIcon}
                        </span>
                        <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <span className="text-sm">
                                {!isLoggedIn ? (
                                    <span className="text-gray-500">Login required</span>
                                ) : !isEnrolled ? (
                                    <span className="text-gray-500">Enroll to access</span>
                                ) : isLocked ? (
                                    <span className="text-gray-500">
                                        Complete previous lessons first
                                    </span>
                                ) : lesson.is_completed ? (
                                    <span className="text-green-600">
                                        Completed • Score: {lesson.score} points
                                    </span>
                                ) : (
                                    <span className="text-blue-600">Ready to start</span>
                                )}
                            </span>
                        </div>
                    </div>
                    {isLocked ? (
                        <span className="text-gray-400">
                            {!isLoggedIn ? 'Login required' : !isEnrolled ? 'Enroll to access' : 'Locked'}
                        </span>
                    ) : (
                        <Link 
                            to={`/lesson/${lesson.lesson_id}`}
                            className={`flex items-center gap-2 text-${lesson.is_completed ? 'green' : 'blue'}-600`}
                        >
                            {lesson.is_completed ? 'Review Lesson' : 'Start Lesson'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;
    if (!course) return <div className="text-center p-8">Course not found</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div 
                className="relative rounded-xl overflow-hidden mb-8 h-80 bg-cover bg-center"
                style={{ 
                    backgroundImage: `url(${course.image_url || '/default-course-image.jpg'})`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90">
                    <div className="h-full flex flex-col justify-center p-8">
                        <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                                {course.difficulty_level}
                            </span>
                            <span className="flex items-center text-white/90">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                {lessons.length} Lessons
                            </span>
                        </div>
                        <p className="text-lg text-white/90 max-w-2xl">{course.description}</p>
                    </div>
                </div>
            </div>

            {!isLoggedIn && <UnauthorizedBanner />}

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                        <div className="space-y-4">
                            {lessons.map((lesson, index) => renderLessonCard(lesson, index))}
                        </div>
                        {!isLoggedIn && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-blue-800 text-center">
                                    Sign in and enroll to access course content
                                </p>
                            </div>
                        )}
                        {isLoggedIn && !isEnrolled && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <p className="text-green-800 text-center">
                                    Enroll in this course to start learning
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                        <h3 className="text-lg font-bold mb-4">Course Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Lessons</span>
                                <span className="font-medium">{lessons.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Completed</span>
                                <span className="font-medium text-green-600">
                                    {completedCount} / {lessons.length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Points Available</span>
                                <span className="font-medium">{lessons.length * 10}</span>
                            </div>
                            <div className="pt-4 border-t">
                                {isLoggedIn ? (
                                    isEnrolled ? (
                                        <Link
                                            to={`/lesson/${lessons[0]?.lesson_id}`}
                                            className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Continue Learning
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="block w-full py-3 px-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                                        </button>
                                    )
                                ) : (
                                    <div className="space-y-3">
                                        <Link
                                            to="/login"
                                            className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Log in to Start
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block w-full py-3 px-4 border border-blue-600 text-blue-600 text-center rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
