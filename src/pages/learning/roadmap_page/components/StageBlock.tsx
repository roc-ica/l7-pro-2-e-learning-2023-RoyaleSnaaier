import React from 'react';
import { motion } from 'framer-motion';
import { RoadmapStage, StageColors, StageProgress as StageProgressType } from '../types/roadmapTypes';
import StageProgress from './StageProgress';
import LessonItem from './LessonItem';

interface StageBlockProps {
    stage: RoadmapStage;
    colors: StageColors;
    index: number;
    calculateStageProgress: (stage: RoadmapStage) => StageProgressType;
}

const StageBlock: React.FC<StageBlockProps> = ({ stage, colors, index, calculateStageProgress }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative"
        >
            {/* Stage Header */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className={`${colors.bg} text-white px-6 py-3 rounded-full shadow-md transform hover:scale-105 transition-transform`}>
                    <h2 className="text-lg font-bold">
                        {stage.title}
                        <span className="ml-2 text-sm opacity-90">
                            ({stage.lessons.filter(l => l.completed).length}/{stage.lessons.length})
                        </span>
                    </h2>
                </div>
                <StageProgress 
                    progress={calculateStageProgress(stage)} 
                    colors={colors} 
                />
            </div>

            {/* Lessons Container */}
            <div className="grid gap-4">
                {stage.lessons.map((lesson, lessonIndex) => (
                    <LessonItem
                        key={`lesson-${lesson.id}`}
                        lesson={lesson}
                        lessonIndex={lessonIndex}
                        colors={colors}
                        stage={stage}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default StageBlock;
