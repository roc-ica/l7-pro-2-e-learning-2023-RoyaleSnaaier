import React, { useState } from 'react';
import { Exercise } from '../../../../../types/exercise';

interface Props {
    exercise: Exercise;
    onSubmit: (answer: string) => void;
    disabled?: boolean;
    previousAttempt?: {
        user_answer: string;
        correct_answer: string;
        is_correct: boolean;
    };
}

const FillInBlankExercise: React.FC<Props> = ({ exercise, onSubmit, disabled, previousAttempt }) => {
    const [answer, setAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled || hasSubmitted) return;
        
        if (answer.trim()) {
            setHasSubmitted(true); // Lock answer after submission
            onSubmit(answer.trim());
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={disabled || hasSubmitted}
                    placeholder="Type your answer here..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${hasSubmitted ? 'bg-gray-50' : ''}`}
                />
                {!hasSubmitted && (
                    <button
                        type="submit"
                        disabled={!answer.trim() || disabled}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                    >
                        Submit Answer
                    </button>
                )}
            </form>

            {disabled && previousAttempt && (
                <div className="mt-4 space-y-3">
                    <div className={`p-4 rounded-lg ${previousAttempt.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm font-medium mb-1">Your previous answer:</p>
                        <p className={previousAttempt.is_correct ? 'text-green-700' : 'text-red-700'}>
                            {previousAttempt.user_answer}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                    >
                        {showAnswer ? 'Hide' : 'Show'} Correct Answer
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d={showAnswer ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                    </button>

                    {showAnswer && (
                        <div className="p-4 rounded-lg bg-blue-50">
                            <p className="text-sm font-medium mb-1">Correct answer:</p>
                            <p className="text-blue-700">{previousAttempt.correct_answer}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FillInBlankExercise;
