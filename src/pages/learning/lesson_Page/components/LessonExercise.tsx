import React from 'react';
import { Exercise, ExerciseHistoryItem } from '../types/lessonTypes';
import MultipleChoiceExercise from './exercises/MultipleChoiceExercise';
import FillInBlankExercise from './exercises/FillInBlankExercise';
import ExerciseNavigation from './ExerciseNavigation';

interface LessonExerciseProps {
  exercises: Exercise[];
  currentExerciseIndex: number;
  exerciseResults: Record<number, boolean>;
  answeredExercise: number | null;
  isAnswerCorrect: boolean | null;
  exerciseHistory?: ExerciseHistoryItem[];
  isLastExercise: boolean;
  onExerciseSelect: (index: number) => void;
  onSubmitAnswer: (answer: string) => void;
  onNextExercise: () => void;
}

const LessonExercise: React.FC<LessonExerciseProps> = ({
  exercises,
  currentExerciseIndex,
  exerciseResults,
  answeredExercise,
  isAnswerCorrect,
  exerciseHistory,
  isLastExercise,
  onExerciseSelect,
  onSubmitAnswer,
  onNextExercise
}) => {
  const currentExercise = exercises[currentExerciseIndex];
  const isAnswered = answeredExercise === currentExercise.exercise_id;
  const isAlreadyCompleted = currentExercise.exercise_id in exerciseResults;
  const showNextButton = isAnswered || isAlreadyCompleted;
  
  const previousAttempt = exerciseHistory?.find(h => h.exercise_id === currentExercise.exercise_id);

  const renderExerciseContent = () => {
    switch (currentExercise.exercise_type) {
      case 'Multiple Choice':
        return (
          <MultipleChoiceExercise
            exercise={currentExercise}
            onSubmit={onSubmitAnswer}
            disabled={isAlreadyCompleted}
            previousAttempt={previousAttempt}
          />
        );
      
      case 'Fill in the blank':
        return (
          <FillInBlankExercise
            exercise={currentExercise}
            onSubmit={onSubmitAnswer}
            disabled={isAlreadyCompleted}
            previousAttempt={previousAttempt}
          />
        );
        
      default:
        return <div>Unsupported exercise type</div>;
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-2xl font-bold mb-2">Exercises</h2>
      <p className="text-gray-600 mb-6">
        Complete the following exercises to master this lesson.
      </p>
      
      <ExerciseNavigation 
        exercises={exercises}
        currentExerciseIndex={currentExerciseIndex}
        exerciseResults={exerciseResults}
        onExerciseSelect={onExerciseSelect}
      />
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">
          {currentExercise.question}
        </h3>
        
        <div className="space-y-6">
          {renderExerciseContent()}
          
          {isAnswered && (
            <div className={`p-4 rounded-lg ${isAnswerCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-medium ${isAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isAnswerCorrect 
                  ? 'Correct! Well done.' 
                  : `Incorrect. The correct answer is: ${currentExercise.correct_answer}`
                }
              </p>
            </div>
          )}
          
          {showNextButton && (
            <button
              onClick={onNextExercise}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {isLastExercise ? 'Complete Lesson' : 'Next Exercise'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonExercise;
