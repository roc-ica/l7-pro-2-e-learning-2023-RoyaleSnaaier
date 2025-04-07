import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Exercise {
    exercise_id: number;
    question: string;
    correct_answer: string;
    exercise_type: string;
    options?: Array<{ option_text: string; is_correct: boolean }>;
}

interface LessonReviewProps {
    lessonTitle: string;
    content: string;
    exercises: Exercise[];
    onBack: () => void;
}

const LessonReview: React.FC<LessonReviewProps> = ({
    lessonTitle,
    content,
    exercises,
    onBack
}) => {
    const [activeSection, setActiveSection] = useState<'content' | 'exercises'>('content');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50"
        >
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Results</span>
                            </button>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{lessonTitle}</h1>
                        <div className="w-24"></div> {/* Spacer for alignment */}
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-8 mt-2">
                        <TabButton
                            active={activeSection === 'content'}
                            onClick={() => setActiveSection('content')}
                        >
                            Lesson Content
                        </TabButton>
                        <TabButton
                            active={activeSection === 'exercises'}
                            onClick={() => setActiveSection('exercises')}
                        >
                            Exercises ({exercises.length})
                        </TabButton>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeSection === 'content' ? (
                        <div className="bg-white rounded-lg shadow-sm p-8">
                            <div className="prose max-w-none">
                                {content}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {exercises.map((exercise, index) => (
                                <ExerciseCard
                                    key={exercise.exercise_id}
                                    exercise={exercise}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
    active,
    onClick,
    children
}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {children}
    </button>
);

const ExerciseCard: React.FC<{ exercise: Exercise; index: number }> = ({ exercise, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-blue-600">Exercise {index + 1}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {exercise.exercise_type}
                </span>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">{exercise.question}</h3>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-600">Correct Answer</p>
                        <p className="text-green-700 font-medium mt-1">{exercise.correct_answer}</p>
                    </div>
                </div>
            </div>

            {exercise.options && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">All Options:</p>
                    {exercise.options.map((option, optIndex) => (
                        <div
                            key={optIndex}
                            className={`p-4 rounded-lg flex items-center ${
                                option.is_correct
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {option.is_correct ? (
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className={option.is_correct ? 'text-green-700' : 'text-gray-600'}>
                                {option.option_text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </motion.div>
);

export default LessonReview;
