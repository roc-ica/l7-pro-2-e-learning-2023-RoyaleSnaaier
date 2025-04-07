import React from 'react';
import { Link } from 'react-router-dom';

interface ExerciseListProps {
  exercises: any[];
  onDelete: (exerciseId: number) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onDelete }) => {
  // Get the exercise type badge color
  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'Multiple Choice':
        return 'bg-blue-100 text-blue-800';
      case 'Fill in the blank':
        return 'bg-green-100 text-green-800';
      case 'Writing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No exercises yet. Add your first exercise to test student knowledge.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {exercises.map((exercise) => (
        <li 
          key={exercise.exercise_id} 
          className="bg-white border border-gray-200 rounded-lg p-5"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getExerciseTypeColor(exercise.exercise_type)}`}>
                  {exercise.exercise_type}
                </span>
                <span className="ml-3 text-gray-500 text-sm">
                  {exercise.points} {exercise.points === 1 ? 'point' : 'points'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-1">{exercise.question}</h3>
              
              {exercise.exercise_type === 'Multiple Choice' && exercise.options && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Options:</p>
                  <ul className="ml-5 text-sm">
                    {exercise.options.map((option: any, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className={`mr-2 ${option.is_correct ? 'text-green-600 font-medium' : ''}`}>
                          {option.option_text}
                        </span>
                        {option.is_correct && (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(exercise.exercise_type === 'Fill in the blank' || exercise.exercise_type === 'Writing') && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 font-medium">Correct Answer:</p>
                  <p className="text-sm text-gray-700">{exercise.correct_answer}</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/exercise-editor/${exercise.exercise_id}`}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => onDelete(exercise.exercise_id)}
                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ExerciseList;
