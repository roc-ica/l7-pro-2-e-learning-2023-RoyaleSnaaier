import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import api from '../../../services/api';
import LessonComplete from '../../../components/lessons/LessonComplete';
import LessonReview from '../../../components/lessons/LessonReview';
import { Lesson, LessonCompletion, ExerciseHistoryItem } from './types/lessonTypes';
import ProgressBar from './components/ProgressBar';
import LessonContent from './components/LessonContent';
import LessonExercise from './components/LessonExercise';

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
                                (ex) => completedExercises[ex.exercise_id] === true
                            );
                            
                            if (allExercisesCompleted) {
                                setCompletion(completionResponse);
                                setIsLessonComplete(true);
                            } else {
                                setCompletion(completionResponse);
                                setExerciseResults(completedExercises);
                                
                                // Find the first uncompleted exercise to show
                                const nextExerciseIndex = lessonResponse.lesson.exercises.findIndex(
                                    (ex) => !completedExercises[ex.exercise_id]
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
                }
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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ProgressBar progressPercentage={progressPercentage} />
            
            <LessonContent title={lesson.title} content={lesson.content} />
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                {lesson.exercises && lesson.exercises.length > 0 ? (
                    <LessonExercise
                        exercises={lesson.exercises}
                        currentExerciseIndex={currentExerciseIndex}
                        exerciseResults={exerciseResults}
                        answeredExercise={answeredExercise}
                        isAnswerCorrect={isAnswerCorrect}
                        exerciseHistory={completion?.exercise_history}
                        isLastExercise={currentExerciseIndex === lesson.exercises.length - 1}
                        onExerciseSelect={setCurrentExerciseIndex}
                        onSubmitAnswer={handleSubmitAnswer}
                        onNextExercise={handleNextExercise}
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No exercises available for this lesson.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonPage;
