import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapLesson {
    id: number;
    title: string;
    completed: boolean;
    score: number;
    order: number;
    totalScore?: number;  // Add this if not already present
}

interface RoadmapStage {
    id: number;
    title: string;
    difficulty_level: string;
    lessons: RoadmapLesson[];
}

interface EnrolledCourse {
    id: number;
    title: string;
    difficulty_level: string;
    total_lessons: number;
    completed_lessons: number;
    enrolled_at: string;
}

const RoadmapPage: React.FC = () => {
    const [stages, setStages] = useState<RoadmapStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [completedStage, setCompletedStage] = useState<number | null>(null);
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

    const deduplicateLessons = (lessons: RoadmapLesson[]): RoadmapLesson[] => {
        const uniqueLessons = new Map<string, RoadmapLesson>();
        
        lessons.forEach(lesson => {
            const existingLesson = uniqueLessons.get(lesson.title);
            if (!existingLesson || lesson.score > existingLesson.score) {
                uniqueLessons.set(lesson.title, lesson);
            }
        });
        
        return Array.from(uniqueLessons.values())
            .sort((a, b) => a.order - b.order);
    };

    const calculateStageProgress = (stage: RoadmapStage) => {
        const completed = stage.lessons.filter(l => l.completed).length;
        const total = stage.lessons.length;
        return {
            percentage: (completed / total) * 100,
            completed,
            total
        };
    };

    useEffect(() => {
        // Check if greeting has been shown before
        const hasSeenGreeting = localStorage.getItem('hasSeenGreeting');
        if (!hasSeenGreeting && user) {
            setShowGreeting(true);
            localStorage.setItem('hasSeenGreeting', 'true');
        }
    }, [user]);

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!user) {
                setError('Please log in to view your roadmap');
                setLoading(false);
                return;
            }

            try {
                const response = await api.getRoadmap(user.id);
                if (response.status === 'success') {
                    const deduplicatedStages = response.stages.map((stage: RoadmapStage) => ({
                        ...stage,
                        lessons: deduplicateLessons(stage.lessons)
                    }));
                    setStages(deduplicatedStages);
                } else {
                    setError(response.error || 'Failed to load roadmap');
                }
            } catch (err) {
                setError('Failed to load roadmap');
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [user]);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!user?.id) return;
            
            try {
                const response = await api.getEnrolledCourses(user.id);
                if (response.status === 'success') {
                    setEnrolledCourses(response.courses);
                }
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
            }
        };

        fetchEnrolledCourses();
    }, [user?.id]);

    const getStageColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-500' };
            case 'Intermediate': return { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500' };
            case 'Advanced': return { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-500' };
            default: return { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-500' };
        }
    };

    const filteredStages = showCompleted 
        ? stages.map(stage => ({
            ...stage,
            lessons: stage.lessons.filter(lesson => lesson.completed)
          })).filter(stage => stage.lessons.length > 0)
        : stages;

    const renderStageProgress = (stage: RoadmapStage, colors: any) => {
        const progress = calculateStageProgress(stage);
        return (
            <div className="flex flex-col items-center">
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`absolute h-full ${colors.bg}`}
                    />
                </div>
                <span className="text-sm mt-1 text-gray-600">
                    {progress.completed}/{progress.total} completed
                </span>
            </div>
        );
    };

    const renderLesson = (lesson: RoadmapLesson, lessonIndex: number, colors: any, stage: RoadmapStage) => {
        const isLocked = !lesson.completed && lessonIndex > 0 && !stage.lessons[lessonIndex - 1]?.completed;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: lessonIndex * 0.1 }}
                key={`lesson-${lesson.id}`} 
                className={`flex items-center ${lessonIndex % 2 === 0 ? 'justify-end mr-[52%]' : 'justify-start ml-[52%]'}`}
            >
                <div className={`absolute left-1/2 w-[calc(50%-1rem)] h-px ${colors.bg} opacity-20
                    ${lessonIndex % 2 === 0 ? '-translate-x-full' : 'translate-x-0'}`} />

                <Link
                    to={isLocked ? '#' : `/lesson/${lesson.id}`}
                    className={`group relative w-[calc(100%-2rem)] p-4 rounded-lg border-2 transition-all duration-300
                        ${lesson.completed 
                            ? `${colors.border} bg-white shadow-md` 
                            : isLocked
                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                : `${colors.border} bg-white hover:shadow-lg hover:scale-105`
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {lesson.completed ? (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`${colors.text}`}
                                >✓</motion.span>
                            ) : isLocked ? (
                                <span className="text-gray-400">🔒</span>
                            ) : (
                                <span className={`${colors.text} group-hover:translate-x-1 transition-transform`}>→</span>
                            )}
                            <span className="font-medium">{lesson.title}</span>
                        </div>
                        {lesson.completed && (
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${colors.text}`}>
                                    Score: {lesson.score}
                                </span>
                                {lesson.score >= 90 && (
                                    <span title="Excellent score!" className="text-yellow-500">⭐</span>
                                )}
                            </div>
                        )}
                    </div>
                    {!isLocked && !lesson.completed && (
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 rounded-lg transition-opacity" />
                    )}
                </Link>
            </motion.div>
        );
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {showGreeting && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg text-center">
                    <h2 className="text-xl font-semibold mb-2">Welcome to your learning journey!</h2>
                    <p className="text-gray-600">Complete lessons to progress through your roadmap.</p>
                    <button 
                        onClick={() => setShowGreeting(false)}
                        className="mt-2 text-blue-500 hover:text-blue-600"
                    >
                        Got it!
                    </button>
                </div>
            )}
            
            {enrolledCourses.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Enrolled Courses</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {enrolledCourses.map(course => (
                            <Link
                                key={course.id}
                                to={`/course/${course.id}`}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                                    <span>{course.difficulty_level}</span>
                                    <span>Enrolled {new Date(course.enrolled_at).toLocaleDateString()}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-500"
                                            style={{ 
                                                width: `${(course.completed_lessons / course.total_lessons) * 100}%` 
                                            }}
                                        />
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {course.completed_lessons} of {course.total_lessons} lessons completed
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-center">Learning Roadmap</h1>
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {showCompleted ? 'Show All Lessons' : 'Show Completed Only'}
                </button>
            </div>

            <div className="relative">
                {/* Main vertical line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-20" />

                <div className="relative space-y-20">
                    {filteredStages.map((stage, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            key={`stage-${stage.difficulty_level}-${index}`}
                            className="relative"
                        >
                            {/* Stage Header */}
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className={`${getStageColor(stage.difficulty_level).bg} text-white px-6 py-3 rounded-full shadow-md transform hover:scale-105 transition-transform`}>
                                    <h2 className="text-lg font-bold">
                                        {stage.title}
                                        <span className="ml-2 text-sm opacity-90">
                                            ({stage.lessons.filter(l => l.completed).length}/{stage.lessons.length})
                                        </span>
                                    </h2>
                                </div>
                                {renderStageProgress(stage, getStageColor(stage.difficulty_level))}
                            </div>

                            {/* Lessons Container */}
                            <div className="grid gap-4">
                                {stage.lessons.map((lesson, lessonIndex) => 
                                    renderLesson(
                                        lesson, 
                                        lessonIndex, 
                                        getStageColor(stage.difficulty_level),
                                        stage
                                    )
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {completedStage !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={() => setCompletedStage(null)}
                    >
                        <div className="bg-white p-8 rounded-lg text-center">
                            <h3 className="text-2xl font-bold mb-4">🎉 Stage Complete! 🎉</h3>
                            <p className="text-gray-600">You've completed all lessons in this stage!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoadmapPage;
