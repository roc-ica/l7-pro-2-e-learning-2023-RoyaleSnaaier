import React, { useState, useEffect, useRef } from 'react';
import { Exercise, ExerciseOption } from '../../../../../types/exercise';
import { motion } from 'framer-motion';

interface Props {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  previousAttempt?: {
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  };
  onNext?: () => void;
}

const MultipleChoiceExercise: React.FC<Props> = ({ 
  exercise, 
  onSubmit, 
  disabled, 
  previousAttempt,
  onNext 
}) => {
  // Track selected option and submission state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const exerciseIdRef = useRef<number>(exercise.exercise_id);
  
  // Reset state when exercise changes
  useEffect(() => {
    if (exerciseIdRef.current !== exercise.exercise_id) {
      setSelectedOption('');
      setIsCorrect(false);
      setIsSubmitted(false);
      setFeedback(null);
      exerciseIdRef.current = exercise.exercise_id;
    }
    
    // If we have a previous correct attempt, use it
    if (previousAttempt && previousAttempt.is_correct) {
      setSelectedOption(previousAttempt.user_answer);
      setIsCorrect(true);
      setIsSubmitted(true);
    }
  }, [exercise.exercise_id, previousAttempt]);

  // Check if the selected option is correct
  const checkAnswer = (option: string): boolean => {
    // For multiple choice, we need to check if the selected option matches the correct answer
    const correctOption = exercise.options?.find(opt => opt.option_text === exercise.correct_answer);
    return option === correctOption?.option_text;
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (isSubmitted || disabled) return;
    
    setSelectedOption(option);
    
    // Check if answer is correct
    const isAnswerCorrect = checkAnswer(option);
    if (isAnswerCorrect && !isCorrect) {
      setIsCorrect(true);
      setFeedback("Correct! Click 'Next Question' to continue.");
    } else {
      setFeedback(null);
    }
  };

  // Handle submission when the Next Question button is clicked
  const handleSubmitCorrectAnswer = () => {
    if (!isSubmitted && isCorrect) {
      setIsSubmitted(true);
      onSubmit(selectedOption);
      if (onNext) {
        setTimeout(() => onNext(), 500);
      }
    }
  };

  // Helper to determine option classes
  const getOptionClasses = (option: ExerciseOption): string => {
    const isSelected = option.option_text === selectedOption;
    const isCorrectOption = option.option_text === exercise.correct_answer;
    
    let baseClasses = "flex items-center p-4 border rounded-lg transition-colors";
    
    // For unsubmitted state with correct answer already identified
    if (isCorrect && !isSubmitted) {
      if (isSelected) {
        return `${baseClasses} border-green-500 bg-green-50 text-green-700`;
      }
      return `${baseClasses} border-gray-200 opacity-60 cursor-default`;
    }
    
    // For unsubmitted state
    if (!isSubmitted) {
      return `${baseClasses} ${
        isSelected 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
      } cursor-pointer`;
    }
    
    // For submitted state with feedback
    if (previousAttempt) {
      if (isSelected && previousAttempt.is_correct) {
        return `${baseClasses} border-green-500 bg-green-50 cursor-default`;
      } else if (isSelected && !previousAttempt.is_correct) {
        return `${baseClasses} border-red-500 bg-red-50 cursor-default`;
      } else if (isCorrectOption && !previousAttempt.is_correct) {
        return `${baseClasses} border-green-500 bg-green-50/40 cursor-default`;
      }
    }
    
    // Other options after submission
    return `${baseClasses} border-gray-200 opacity-60 cursor-default`;
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-lg font-medium text-gray-700">{exercise.question}</div>
      
      {/* Options list */}
      <div className="space-y-3">
        {exercise.options?.map((option) => (
          <div
            key={option.option_id}
            className={getOptionClasses(option)}
            onClick={() => handleOptionSelect(option.option_text)}
          >
            <div className={`w-5 h-5 flex-shrink-0 rounded-full border ${
              option.option_text === selectedOption 
                ? (isCorrect ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500') 
                : 'border-gray-300'
            } mr-3`}>
              {option.option_text === selectedOption && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full flex items-center justify-center text-white"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </div>
            
            <span className="flex-grow">{option.option_text}</span>
            
            {/* Feedback icons for submitted answers */}
            {isSubmitted && previousAttempt && (
              <div className="ml-3">
                {option.option_text === previousAttempt.correct_answer && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
                {option.option_text === selectedOption && option.option_text !== previousAttempt.correct_answer && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-red-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Feedback message */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-sm text-green-600"
        >
          {feedback}
        </motion.div>
      )}
      
      {/* Next button - only show when answer is correct but not yet submitted */}
      {isCorrect && !isSubmitted && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleSubmitCorrectAnswer}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
        >
          Next Question
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}
      
      {/* Feedback after submission */}
      {isSubmitted && previousAttempt && (
        <div className={`p-4 rounded-lg ${
          previousAttempt.is_correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="font-medium">
            {previousAttempt.is_correct 
              ? 'Correct! Good job!' 
              : 'Not quite right.'}
          </div>
          {!previousAttempt.is_correct && (
            <div className="mt-1">
              <span className="font-medium">Correct answer:</span> {previousAttempt.correct_answer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceExercise;
