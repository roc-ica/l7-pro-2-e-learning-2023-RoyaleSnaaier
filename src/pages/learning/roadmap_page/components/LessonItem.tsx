import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RoadmapLesson, StageColors, RoadmapStage } from '../types/roadmapTypes';

interface LessonItemProps {
    lesson: RoadmapLesson;
    lessonIndex: number;
    colors: StageColors;
    stage: RoadmapStage;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, lessonIndex, colors, stage }) => {
    const isLocked = !lesson.completed && lessonIndex > 0 && !stage.lessons[lessonIndex - 1]?.completed;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: lessonIndex * 0.1 }}
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

export default LessonItem;
