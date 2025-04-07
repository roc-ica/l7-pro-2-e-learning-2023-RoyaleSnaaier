import React from 'react';
import { motion } from 'framer-motion';
import { StageColors, StageProgress as StageProgressType } from '../types/roadmapTypes';

interface StageProgressProps {
    progress: StageProgressType;
    colors: StageColors;
}

const StageProgress: React.FC<StageProgressProps> = ({ progress, colors }) => {
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

export default StageProgress;
