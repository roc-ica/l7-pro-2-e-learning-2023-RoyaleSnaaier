import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonCompleteProps {
    totalExercises: number;
    correctAnswers: number;
    totalPoints: number;
    lessonTitle: string;
    nextLessonId: number | null;
    onNextLesson: () => void;
    onReviewLesson: () => void;
}

const LessonComplete: React.FC<LessonCompleteProps> = ({
    totalExercises,
    correctAnswers,
    totalPoints,
    lessonTitle,
    nextLessonId,
    onNextLesson,
    onReviewLesson
}) => {
    const [showStats, setShowStats] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const percentage = Math.min(Math.round((correctAnswers / Math.max(totalExercises, 1)) * 100), 100);

    useEffect(() => {
        // Enhanced confetti effect
        if (percentage >= 70) {
            setShowConfetti(true);
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            const runConfetti = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#4F46E5', '#2563EB', '#3B82F6']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#4F46E5', '#2563EB', '#3B82F6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(runConfetti);
                }
            };
            runConfetti();
        }

        const timer = setTimeout(() => setShowStats(true), 500);
        return () => clearTimeout(timer);
    }, [percentage]);

    const getAchievementMessage = () => {
        if (percentage === 100) return 'Perfect Score! Outstanding!';
        if (percentage >= 90) return 'Excellent Work!';
        if (percentage >= 70) return 'Well Done!';
        if (percentage >= 50) return 'Good Progress!';
        return 'Keep Practicing!';
    };

    const getScoreColor = () => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-blue-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4"
        >
            <div className="max-w-4xl w-full mx-auto">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden"
                >
                    {showConfetti && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-confetti opacity-10" />
                        </div>
                    )}

                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <div className="mb-6">
                            <motion.div 
                                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                                    percentage >= 70 ? 'bg-green-100' : 'bg-blue-100'
                                }`}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 360]
                                }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            >
                                <svg className={`w-10 h-10 ${percentage >= 70 ? 'text-green-600' : 'text-blue-600'}`} 
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d={percentage >= 70 ? "M9 12l2 2 4-4" : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                </svg>
                            </motion.div>
                        </div>

                        <motion.h2 
                            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-3"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {getAchievementMessage()}
                        </motion.h2>

                        <motion.p 
                            className="text-xl text-gray-600"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {lessonTitle}
                        </motion.p>
                    </motion.div>

                    <motion.div 
                        className="grid md:grid-cols-3 gap-6 mb-8"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <StatsCard
                            title="Score"
                            value={`${percentage}%`}
                            color={getScoreColor()}
                            icon="trophy"
                        />
                        <StatsCard
                            title="Correct Answers"
                            value={`${correctAnswers}/${totalExercises}`}
                            color="text-blue-600"
                            icon="check"
                        />
                        <StatsCard
                            title="Points Earned"
                            value={`+${totalPoints}`}
                            color="text-purple-600"
                            icon="star"
                        />
                    </motion.div>

                    <motion.div 
                        className="flex flex-wrap justify-center gap-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <ActionButton
                            onClick={onReviewLesson}
                            icon="eye"
                            variant="secondary"
                        >
                            Review Lesson
                        </ActionButton>

                        {nextLessonId !== null ? (
                            <ActionButton
                                onClick={onNextLesson}
                                icon="arrow-right"
                                variant="primary"
                            >
                                Next Lesson
                            </ActionButton>
                        ) : (
                            <ActionButton
                                as={Link}
                                to="/courses"
                                icon="book"
                                variant="primary"
                            >
                                Back to Courses
                            </ActionButton>
                        )}

                        <ActionButton
                            as={Link}
                            to="/dashboard"
                            icon="home"
                            variant="secondary"
                        >
                            View Dashboard
                        </ActionButton>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Add these new components at the bottom of the file
const StatsCard: React.FC<{
    title: string;
    value: string;
    color: string;
    icon: string;
}> = ({ title, value, color, icon }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center relative overflow-hidden"
    >
        <div className={`text-4xl font-bold ${color} mb-2`}>{value}</div>
        <div className="text-gray-600">{title}</div>
    </motion.div>
);

const ActionButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    icon: string;
    variant: 'primary' | 'secondary';
    as?: any;
    to?: string;
}> = ({ children, onClick, icon, variant, as: Component = 'button', to }) => (
    <Component
        onClick={onClick}
        to={to}
        className={`
            flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
            transition-all duration-200 transform hover:scale-105
            ${variant === 'primary' 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' 
                : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }
        `}
    >
        {children}
    </Component>
);

export default LessonComplete;
