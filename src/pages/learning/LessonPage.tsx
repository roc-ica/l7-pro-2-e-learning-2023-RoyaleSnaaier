import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import MultipleChoiceExercise from '../../components/exercises/MultipleChoiceExercise';
import FillInBlankExercise from '../../components/exercises/FillInBlankExercise';
import api from '../../services/api';
import LessonComplete from '../../components/lessons/LessonComplete';
import LessonReview from '../../components/lessons/LessonReview';

// Define types for our component
interface ExerciseHistoryItem {
    exercise_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    attempted_at: string;
}

interface LessonCompletion {
    total_exercises: number;
    correct_answers: number;
    total_points: number;
    lesson_title: string;
    next_lesson_id: number | null;
    exercise_history?: ExerciseHistoryItem[];
}

interface Exercise {
    exercise_id: number;
    lesson_id: number;
    question: string;
    correct_answer: string;
    exercise_type: "Multiple Choice" | "Fill in the blank" | "Writing";
    points: number;
    options?: Array<{
        option_id: number;
        exercise_id: number;
        option_text: string;
        is_correct: boolean;
    }>;
}

interface Lesson {
    lesson_id: number;
    title: string;
    content: string;
    exercises: Exercise[];
}

const LessonPage: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const notifications = useNotifications();
    
    // State variables
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exerciseResults, setExerciseResults] = useState<Record<number, boolean>>({});
    const [answeredExercise, setAnsweredExercise] = useState<number | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [isLessonComplete, setIsLessonComplete] = useState(false);
    const [completion, setCompletion] = useState<LessonCompletion | null>(null);
    const [reviewMode, setReviewMode] = useState(false);
    const [progressPercentage, setProgressPercentage] = useState(0);

    // Load lesson data when component mounts or lessonId changes
    useEffect(() => {
        const fetchLesson = async () => {
            if (!lessonId || !user?.id) return;
            
            setLoading(true);
            try {
                // Fetch lesson data
                const lessonResponse = await api.getLesson(parseInt(lessonId));
                
                // Check if the user is allowed to access this lesson
                const previousLessonResponse = await api.getPreviousLessonStatus(parseInt(lessonId), user.id);
                
                // If this isn't the first lesson and previous lesson isn't completed, redirect
                if (parseInt(lessonId) !== 1 && 
                    previousLessonResponse?.status === 'success' && 
                    !previousLessonResponse.is_completed) {
                    notifications.showError("You need to complete the previous lesson first.");
                    navigate('/courses');
                    return;
                }
                
                // Check if the user has already completed any exercises in this lesson
                const completionResponse = await api.getLessonCompletion(parseInt(lessonId), user.id);
                
                if (lessonResponse.status === 'success' && lessonResponse.lesson) {
                    setLesson(lessonResponse.lesson);
                    
                    // Handle previously completed exercises
                    if (completionResponse?.status === 'success') {
                        const completedExercises: Record<number, boolean> = {};
                        
                        if (completionResponse.exercise_history?.length) {
                            completionResponse.exercise_history.forEach((history: ExerciseHistoryItem) => {
                                if (history.is_correct) {
                                    completedExercises[history.exercise_id] = true;
                                }
                            });
                            
                            // Calculate progress percentage
                            const completedCount = Object.keys(completedExercises).length;
                            const totalCount = lessonResponse.lesson.exercises.length;
                            setProgressPercentage(Math.floor((completedCount / totalCount) * 100));
                            
                            // Check if all exercises are completed
                            const allExercisesCompleted = lessonResponse.lesson.exercises.every(
                                (ex: Exercise) => completedExercises[ex.exercise_id] === true
                            );
                            
                            if (allExercisesCompleted) {
                                setCompletion(completionResponse);
                                setIsLessonComplete(true);
                            } else {
                                setCompletion(completionResponse);
                                setExerciseResults(completedExercises);
                                
                                // Find the first uncompleted exercise to show
                                const nextExerciseIndex = lessonResponse.lesson.exercises.findIndex(
                                    (ex: Exercise) => !completedExercises[ex.exercise_id]
                                );
                                if (nextExerciseIndex !== -1) {
                                    setCurrentExerciseIndex(nextExerciseIndex);
                                }
                            }
                        }
                    }
                } else {
                    setError('Failed to load lesson data.');
                }
            } catch (err) {
                console.error('Error fetching lesson:', err);
                setError('An error occurred while loading the lesson.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchLesson();
    }, [lessonId, user?.id, navigate, notifications]);

    // Update progress bar when exercise results change
    useEffect(() => {
        if (lesson?.exercises) {
            const completedCount = Object.keys(exerciseResults).length;
            const totalCount = lesson.exercises.length;
            setProgressPercentage(Math.floor((completedCount / totalCount) * 100));
        }
    }, [exerciseResults, lesson]);

    // Handle submitting an answer to an exercise
    const handleSubmitAnswer = async (answer: string) => {
        if (!user?.id || !lesson) return;
        
        const currentExercise = lesson.exercises[currentExerciseIndex];
        
        try {
            // Submit the answer to the API
            const response = await api.submitExercise({
                exercise_id: currentExercise.exercise_id,
                user_id: user.id,
                answer
            });
            
            if (response.status === 'success') {
                // Store the result locally, always track the exercise as attempted
                const isCorrect = response.result.is_correct;
                setExerciseResults(prev => ({
                    ...prev,
                    [currentExercise.exercise_id]: isCorrect
                }));
                
                setAnsweredExercise(currentExercise.exercise_id);
                setIsAnswerCorrect(isCorrect);
                
                // Show notification based on result
                if (isCorrect) {
                    notifications.showSuccess('Correct answer!');
                } else {
                    notifications.showError('Incorrect answer.');
                    // No longer suggest "try again"
                }
                
                // No automatic advancement - user must click next button
            }
        } catch (err) {
            console.error('Error submitting answer:', err);
            notifications.showError('Failed to submit answer. Please try again.');
        }
    };
    
    // Handle moving to the next exercise
    const handleNextExercise = () => {
        if (!lesson) return;
        
        // If all exercises are completed, show lesson completion
        const allCompleted = lesson.exercises.every(
            (ex) => exerciseResults[ex.exercise_id] === true
        );
        
        if (allCompleted) {
            setIsLessonComplete(true);
        } else {
            // Find the next incomplete exercise
            const nextIncompleteIndex = lesson.exercises.findIndex(
                (ex, idx) => idx > currentExerciseIndex && !exerciseResults[ex.exercise_id]
            );
            
            if (nextIncompleteIndex !== -1) {
                setCurrentExerciseIndex(nextIncompleteIndex);
            } else {
                // If no incomplete exercises after current, find first incomplete
                const firstIncompleteIndex = lesson.exercises.findIndex(
                    (ex) => !exerciseResults[ex.exercise_id]
                );
                
                if (firstIncompleteIndex !== -1) {
                    setCurrentExerciseIndex(firstIncompleteIndex);
                } else {
                    // All exercises are actually complete
                    setIsLessonComplete(true);
                }
            }
        }
        
        // Reset answer state
        setAnsweredExercise(null);
        setIsAnswerCorrect(null);
    };
    
    // Navigate to the next lesson
    const handleNextLesson = () => {
        if (completion?.next_lesson_id) {
            navigate(`/lesson/${completion.next_lesson_id}`);
        } else {
            navigate('/courses');
        }
    };
    
    // Switch to lesson review mode
    const handleReviewLesson = () => {
        setReviewMode(true);
    };
    
    // Return to lesson completion screen
    const handleBackToResults = () => {
        setReviewMode(false);
    };

    // Render functions for different parts of the UI
    const renderProgressBar = () => {
        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        );
    };

    const renderExerciseNavigation = () => {
        if (!lesson) return null;
        
        return (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">
                        Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    {lesson.exercises.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentExerciseIndex(idx)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                                ${currentExerciseIndex === idx 
                                    ? 'bg-blue-600 text-white' 
                                    : exerciseResults[lesson.exercises[idx].exercise_id]
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

    const renderExercise = (exercise: Exercise) => {
        const isAnswered = answeredExercise === exercise.exercise_id;
        const isAlreadyCompleted = exercise.exercise_id in exerciseResults;
        const showNextButton = isAnswered || isAlreadyCompleted;
        const isLastExercise = currentExerciseIndex === (lesson?.exercises.length || 0) - 1;
        
        switch (exercise.exercise_type) {
            case 'Multiple Choice':
                return (
                    <div className="space-y-6">
                        <MultipleChoiceExercise
                            exercise={exercise}
                            onSubmit={handleSubmitAnswer}
                            disabled={isAlreadyCompleted}
                            previousAttempt={
                                completion?.exercise_history?.find(h => h.exercise_id === exercise.exercise_id)
                            }
                        />
                        
                        {isAnswered && (
                            <div className={`p-4 rounded-lg ${isAnswerCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className={`font-medium ${isAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    {isAnswerCorrect 
                                        ? 'Correct! Well done.' 
                                        : `Incorrect. The correct answer is: ${exercise.correct_answer}`
                                    }
                                </p>
                            </div>
                        )}
                        
                        {showNextButton && (
                            <button
                                onClick={handleNextExercise}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                {isLastExercise ? 'Complete Lesson' : 'Next Exercise'}
                            </button>
                        )}
                    </div>
                );
            
            case 'Fill in the blank':
                return (
                    <div className="space-y-6">
                        <FillInBlankExercise
                            exercise={exercise}
                            onSubmit={handleSubmitAnswer}
                            disabled={isAlreadyCompleted}
                            previousAttempt={
                                completion?.exercise_history?.find(h => h.exercise_id === exercise.exercise_id)
                            }
                        />
                        
                        {isAnswered && (
                            <div className={`p-4 rounded-lg ${isAnswerCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className={`font-medium ${isAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    {isAnswerCorrect 
                                        ? 'Correct! Well done.' 
                                        : `Incorrect. The correct answer is: ${exercise.correct_answer}`
                                    }
                                </p>
                            </div>
                        )}
                        
                        {showNextButton && (
                            <button
                                onClick={handleNextExercise}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                {isLastExercise ? 'Complete Lesson' : 'Next Exercise'}
                            </button>
                        )}
                    </div>
                );
                
            default:
                return <div>Unsupported exercise type</div>;
        }
    };

    // Render different views based on state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-medium text-gray-600">Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-100 p-6 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/courses')} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Return to Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-yellow-100 p-6 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-yellow-700 mb-2">Lesson Not Found</h2>
                    <p className="text-yellow-600 mb-4">The lesson you're looking for could not be found.</p>
                    <button 
                        onClick={() => navigate('/courses')} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Return to Courses
                    </button>
                </div>
            </div>
        );
    }

    if (reviewMode) {
        return (
            <LessonReview
                lessonTitle={lesson.title}
                content={lesson.content}
                exercises={lesson.exercises}
                onBack={handleBackToResults}
            />
        );
    }

    if (isLessonComplete && completion) {
        return (
            <LessonComplete
                totalExercises={completion.total_exercises}
                correctAnswers={completion.correct_answers}
                totalPoints={completion.total_points}
                lessonTitle={completion.lesson_title}
                nextLessonId={completion.next_lesson_id}
                onNextLesson={handleNextLesson}
                onReviewLesson={handleReviewLesson}
            />
        );
    }

    const currentExercise = lesson.exercises[currentExerciseIndex];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {renderProgressBar()}
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="prose max-w-none mb-6">
                    {lesson.content}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-bold mb-2">Exercises</h2>
                    <p className="text-gray-600 mb-6">
                        Complete the following exercises to master this lesson.
                    </p>
                    
                    {renderExerciseNavigation()}
                    
                    {lesson.exercises && lesson.exercises.length > 0 ? (
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-4">
                                {currentExercise.question}
                            </h3>
                            {renderExercise(currentExercise)}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No exercises available for this lesson.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPage;
