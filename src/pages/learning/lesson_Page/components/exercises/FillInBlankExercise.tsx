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
  const [hasAttempted, setHasAttempted] = useState(false);
  const submittedRef = useRef<boolean>(false);
  
  // Track if this specific exercise has been completed
  const exerciseIdRef = useRef<number>(exercise.exercise_id);
  
  useEffect(() => {
    // Reset state when exercise changes
    if (exerciseIdRef.current !== exercise.exercise_id) {
      setAnswer('');
      setIsCorrect(false);
      setIsSubmitted(false);
      setFeedback(null);
      setHasAttempted(false);
      submittedRef.current = false;
      exerciseIdRef.current = exercise.exercise_id;
    }
    
    // Only use previous attempt data if it actually exists and is for THIS exercise
    if (previousAttempt && previousAttempt.user_answer && 
        previousAttempt.correct_answer === exercise.correct_answer) {
      setAnswer(previousAttempt.user_answer);
      setIsCorrect(previousAttempt.is_correct);
      setIsSubmitted(true);
      setHasAttempted(true);
      submittedRef.current = true;
    } else {
      // No valid previous attempt, ensure we're in input mode
      setIsSubmitted(false);
      setHasAttempted(false);
      submittedRef.current = false;
    }
    
    // Focus the input when component mounts, but only if not already attempted
    if (inputRef.current && !disabled && !hasAttempted && !submittedRef.current) {
      inputRef.current.focus();
    }
  }, [exercise.exercise_id, exercise.correct_answer, disabled, previousAttempt]);

  // Make sure the input is disabled after submission
  useEffect(() => {
    if (isSubmitted && inputRef.current) {
      inputRef.current.disabled = true;
    }
  }, [isSubmitted]);

  // Check if answer matches as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow changes if already submitted or correct
    if (isCorrect || isSubmitted || hasAttempted || submittedRef.current) return;
    
    const inputValue = e.target.value;
    setAnswer(inputValue);
    
    // Check if answer is correct (case-insensitive comparison)
    const isAnswerCorrect = inputValue.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase();
    
    if (isAnswerCorrect) {
      // Answer is correct
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

  // Handle input blur (when focus leaves the input)
  const handleBlur = (e: React.FocusEvent) => {
    // Only submit if there's an answer and the answer hasn't been submitted yet
    if (answer.trim() && !isSubmitted && !hasAttempted && !submittedRef.current) {
      // Lock the answer permanently
      setHasAttempted(true);
      setIsSubmitted(true);
      submittedRef.current = true;
      
      // Disable the input
      if (inputRef.current) {
        inputRef.current.disabled = true;
      }
      
      // Submit the answer to parent component
      onSubmit(answer.trim());
    }
  };

  // Handle form submission (either through Enter key or submit button)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitted || hasAttempted || submittedRef.current || !answer.trim()) return;
    
    // Lock the answer permanently
    setHasAttempted(true);
    setIsSubmitted(true);
    submittedRef.current = true;
    
    // Make sure input is disabled
    if (inputRef.current) {
      inputRef.current.disabled = true;
    }
    
    // Submit the answer to parent component
    onSubmit(answer.trim());
  };

  // Handle the submission when the user clicks the "Next Question" button
  const handleSubmitCorrectAnswer = () => {
    // Only allow for correct answers that haven't been officially submitted yet
    if (!isSubmitted && isCorrect && !hasAttempted && !submittedRef.current) {
      // Lock the answer permanently
      setHasAttempted(true);
      setIsSubmitted(true);
      submittedRef.current = true;
      
      // Submit the answer
      onSubmit(answer.trim());
      
      // Move to next question after a short delay
      if (onNext) {
        setTimeout(() => onNext(), 500);
      }
    }
  };

  return (
    <div 
      className="space-y-6"
      data-exercise-id={exercise.exercise_id}
      data-submitted={isSubmitted || hasAttempted ? "true" : "false"}
    >
      {/* Question text */}
      <div className="text-lg font-medium text-gray-700">{exercise.question}</div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Only show answer display if user has explicitly submitted an answer */}
        {!(isSubmitted || hasAttempted) ? (
          <div className="relative">
            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={handleInputChange}
              onBlur={handleBlur} // Add blur handler
              disabled={disabled || isSubmitted || hasAttempted}
              placeholder="Type your answer here..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors
                ${isCorrect 
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }
                ${disabled || isSubmitted || hasAttempted ? 'bg-gray-100 cursor-not-allowed' : ''}
              `}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            {/* Correct indicator */}
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
        ) : (
          /* Show answer display after submission - verified by state AND refs */
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-2">
              <span className="font-medium text-gray-700">Your answer: </span>
              <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                {answer}
              </span>
            </div>
            
            {!isCorrect && (
              <div>
                <span className="font-medium text-gray-700">Correct answer: </span>
                <span className="text-green-700 font-medium">{exercise.correct_answer}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Feedback message */}
        {feedback && !(isSubmitted || hasAttempted) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm ${isCorrect ? 'text-green-600' : 'text-blue-600'}`}
          >
            {feedback}
          </motion.div>
        )}
        
        {/* Controls - only show relevant buttons based on state */}
        {!(isSubmitted || hasAttempted) && (
          <div className="flex space-x-4">
            {/* Submit button - only show when not submitted yet and not correct */}
            {!isCorrect && (
              <button 
                type="button" // Changed to prevent form submission issues
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className={`px-4 py-2 rounded-md flex items-center
                  ${answer.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Submit
              </button>
            )}
            
            {/* Next button - only show when answer is correct but not yet submitted */}
            {isCorrect && (
              <motion.button
                type="button"
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
          </div>
        )}
      </form>
      
      {/* Show the one-attempt notice only if user hasn't submitted yet */}
      {!(isSubmitted || hasAttempted) && (
        <div className="text-xs text-gray-500 italic">
          You only have one attempt for this exercise. Your answer will be submitted when you press Enter, 
          click the Submit button, or move away from the input field.
        </div>
      )}
    </div>
  );
};

export default FillInBlankExercise;
