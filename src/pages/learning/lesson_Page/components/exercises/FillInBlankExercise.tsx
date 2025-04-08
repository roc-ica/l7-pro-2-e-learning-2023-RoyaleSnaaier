import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '../../../../../types/exercise';
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

const FillInBlankExercise: React.FC<Props> = ({ 
  exercise, 
  onSubmit, 
  disabled, 
  previousAttempt,
  onNext 
}) => {
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track if this specific exercise has been completed
  const exerciseIdRef = useRef<number>(exercise.exercise_id);
  
  useEffect(() => {
    // Reset state when exercise changes
    if (exerciseIdRef.current !== exercise.exercise_id) {
      setAnswer('');
      setIsCorrect(false);
      setIsSubmitted(false);
      setFeedback(null);
      exerciseIdRef.current = exercise.exercise_id;
    }
    
    // Focus the input when component mounts
    if (inputRef.current && !disabled && !isCorrect) {
      inputRef.current.focus();
    }
    
    // If we have a previous correct attempt, use it
    if (previousAttempt && previousAttempt.is_correct) {
      setAnswer(previousAttempt.user_answer);
      setIsCorrect(true);
      setIsSubmitted(true);
    }
  }, [exercise.exercise_id, disabled, previousAttempt, isCorrect]);

  // Check if answer matches as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCorrect || isSubmitted) return; // Don't allow changes if already correct or submitted
    
    const inputValue = e.target.value;
    setAnswer(inputValue);
    
    // Check if answer is correct (case-insensitive comparison)
    const isAnswerCorrect = inputValue.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase();
    
    if (isAnswerCorrect) {
      // Answer is correct - just show feedback but don't submit yet
      setIsCorrect(true);
      setFeedback("Correct! Click 'Next Question' to continue.");
    } 
    else if (inputValue.trim().length > 0) {
      // Show hint when user is typing but not yet correct
      if (exercise.correct_answer.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 1) {
        setFeedback("You're getting closer!");
      } else {
        setFeedback(null);
      }
    } else {
      setFeedback(null);
    }
  };

  // Handle the submission when the user clicks the "Next Question" button
  const handleSubmitCorrectAnswer = () => {
    if (!isSubmitted && isCorrect) {
      setIsSubmitted(true);
      onSubmit(answer.trim());
      if (onNext) {
        setTimeout(() => onNext(), 500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-lg font-medium text-gray-700">{exercise.question}</div>
      
      <div className="space-y-4">
        {/* Input field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={handleInputChange}
            disabled={isSubmitted || disabled}
            placeholder="Type your answer here..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors
              ${isCorrect 
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }
              ${disabled || isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''}
            `}
          />
          
          {isCorrect && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-500 text-white p-1 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          )}
        </div>
        
        {/* Feedback message */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm ${isCorrect ? 'text-green-600' : 'text-blue-600'}`}
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
        
        {/* Previous attempt feedback */}
        {previousAttempt && isSubmitted && (
          <div className={`p-4 rounded-lg mt-4 ${previousAttempt.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="font-medium mb-1">
              {previousAttempt.is_correct ? 'Correct answer!' : 'Incorrect answer'}
            </p>
            <p className={previousAttempt.is_correct ? 'text-green-800' : 'text-red-800'}>
              Your answer: <span className="font-medium">{previousAttempt.user_answer}</span>
            </p>
            {!previousAttempt.is_correct && (
              <p className="text-gray-700 mt-2">
                Correct answer: <span className="font-medium">{previousAttempt.correct_answer}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FillInBlankExercise;
