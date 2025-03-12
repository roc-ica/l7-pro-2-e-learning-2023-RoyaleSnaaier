import React from 'react';
import { Exercise } from '../types/lessonTypes';

interface ExerciseNavigationProps {
  exercises: Exercise[];
  currentExerciseIndex: number;
  exerciseResults: Record<number, boolean>;
  onExerciseSelect: (index: number) => void;
}

const ExerciseNavigation: React.FC<ExerciseNavigationProps> = ({ 
  exercises, 
  currentExerciseIndex, 
  exerciseResults, 
  onExerciseSelect 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-500">
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {exercises.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onExerciseSelect(idx)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
              ${currentExerciseIndex === idx 
                ? 'bg-blue-600 text-white' 
                : exerciseResults[exercises[idx].exercise_id]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseNavigation;
