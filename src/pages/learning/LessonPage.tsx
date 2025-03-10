import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MultipleChoiceExercise from '../../components/exercises/MultipleChoiceExercise';
import FillInBlankExercise from '../../components/exercises/FillInBlankExercise';
import api from '../../services/api';
import LessonComplete from '../../components/lessons/LessonComplete';
import ExerciseHistory from '../../components/exercises/ExerciseHistory';
import LessonReview from '../../components/lessons/LessonReview';

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
    exercise_history?: ExerciseHistoryItem[];  // Add this property
}

const LessonPage: React.FC = () => {
    const { lessonId } = useParams();
    const { user } = useAuth();
    const [lesson, setLesson] = useState<any>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exerciseResults, setExerciseResults] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [lessonStats, setLessonStats] = useState<{
        correctAnswers: number;
        totalPoints: number;
        nextLessonId?: number;
    } | null>(null);
    const [completion, setCompletion] = useState<LessonCompletion | null>(null);
    const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const navigate = useNavigate();

    // Reset everything when navigating
    const resetStates = () => {
        setCurrentExerciseIndex(0);
        setExerciseResults({});
        setIsComplete(false);
        setLessonStats(null);
        setLoading(true);
        setError(null);
        setCompletion(null);
        setHasCompletedBefore(false);
    };

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const [lessonResponse, completionResponse, previousLessonResponse] = await Promise.all([
                    api.getLesson(Number(lessonId)),
                    user?.id ? api.getLessonCompletion(Number(lessonId), user.id) : null,
                    user?.id ? api.getPreviousLessonStatus(Number(lessonId), user.id) : null
                ]);

                // Check if previous lesson is completed
                if (previousLessonResponse?.status === 'success') {
                    if (!previousLessonResponse.is_completed && Number(lessonId) !== 1) {
                        navigate('/courses');
                        return;
                    }
                }

                if (lessonResponse.status === 'success' && lessonResponse.lesson) {
                    setLesson(lessonResponse.lesson);
                    
                    if (completionResponse?.status === 'success') {
                        const completedExercises: Record<number, boolean> = {};
                        
                        if (completionResponse.exercise_history?.length) {
                            completionResponse.exercise_history.forEach((history: ExerciseHistoryItem) => {
                                if (history.is_correct) {
                                    completedExercises[history.exercise_id] = true;
                                }
                            });

                            // Only mark lesson as complete if ALL exercises are completed correctly
                            const allExercisesCompleted = lessonResponse.lesson.exercises.every(
                                (ex: any) => completedExercises[ex.exercise_id] === true
                            );

                            if (allExercisesCompleted) {
                                setCompletion(completionResponse);
                                setIsComplete(true);
                                setLessonStats({
                                    correctAnswers: completionResponse.correct_answers,
                                    totalPoints: completionResponse.total_points,
                                    nextLessonId: completionResponse.next_lesson_id ?? undefined
                                });
                            } else {
                                // If not all exercises are complete, just store history
                                setCompletion(completionResponse);
                                setHasCompletedBefore(true);
                                setExerciseResults(completedExercises);
                            }
                        }
                    }
                } else {
                    setError(lessonResponse.error || 'Failed to fetch lesson');
                }
            } catch (err) {
                setError('Failed to fetch lesson');
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            resetStates();
            fetchLesson();
        }

        return () => resetStates();
    }, [lessonId, user?.id]);

    const handleSubmitAnswer = async (answer: string) => {
        try {
            if (!user?.id) {
                setError('User ID is required');
                return;
            }

            const exercise = lesson.exercises[currentExerciseIndex];
            const response = await api.submitExercise({
                exercise_id: exercise.exercise_id,
                user_id: user.id,
                answer
            });

            if (response.status === 'success') {
                setExerciseResults(prev => ({
                    ...prev,
                    [exercise.exercise_id]: response.result.is_correct
                }));

                // Check if this was the last exercise
                if (currentExerciseIndex === lesson.exercises.length - 1) {
                    const stats = await api.getLessonCompletion(Number(lessonId), user?.id);
                    setLessonStats(stats);
                    setIsComplete(true);
                } else {
                    setCurrentExerciseIndex(prev => prev + 1);
                }
            }
        } catch (err) {
            setError('Failed to submit answer');
        }
    };

    const checkLessonCompletion = async () => {
        if (!user?.id || !lessonId) return;
        
        try {
            const response = await api.getLessonCompletion(Number(lessonId), user.id);
            if (response.status === 'success') {
                setCompletion(response);
                if (Object.keys(exerciseResults).length === response.total_exercises) {
                    setIsComplete(true);
                }
            }
        } catch (err) {
            console.error('Failed to check lesson completion:', err);
        }
    };

    useEffect(() => {
        if (Object.keys(exerciseResults).length > 0) {
            checkLessonCompletion();
        }
    }, [exerciseResults, user?.id, lessonId]);

    // Update handleNextLesson to use resetStates
    const handleNextLesson = () => {
        if (completion?.next_lesson_id) {
            resetStates();  // Reset states before navigation
            navigate(`/lesson/${completion.next_lesson_id}`);
        }
    };

    const resetLessonProgress = async () => {
        if (!user?.id || !lessonId) return;

        try {
            setLoading(true);
            const response = await api.resetLessonProgress(user.id, Number(lessonId));
            
            if (response.status === 'success') {
                // Reset local state
                setCurrentExerciseIndex(0);
                setExerciseResults({});
                setIsComplete(false);
                setLessonStats(null);
                setCompletion(null);
            } else {
                setError('Failed to reset progress');
            }
        } catch (err) {
            setError('Failed to reset progress');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewLesson = () => {
        setIsReviewMode(true);
        setIsComplete(false);
    };

    const handleBackToResults = () => {
        setIsReviewMode(false);  // Changed from true to false
        setIsComplete(true);
    };

    const renderExercise = (exercise: any) => {
        const isCompleted = exercise.exercise_id in exerciseResults;
        const previousAttempt = completion?.exercise_history?.find(
            h => h.exercise_id === exercise.exercise_id
        );

        switch (exercise.exercise_type) {
            case 'Multiple Choice':
                return (
                    <MultipleChoiceExercise
                        exercise={exercise}
                        onSubmit={handleSubmitAnswer}
                        disabled={isCompleted}
                        previousAttempt={previousAttempt}
                    />
                );
            case 'Fill in the blank':
                return (
                    <FillInBlankExercise
                        exercise={exercise}
                        onSubmit={handleSubmitAnswer}
                        disabled={isCompleted}
                        previousAttempt={previousAttempt}
                    />
                );
            default:
                return <div>Unsupported exercise type</div>;
        }
    };

    if (isReviewMode && lesson) {
        return (
            <LessonReview
                lessonTitle={lesson.title}
                content={lesson.content}
                exercises={lesson.exercises}
                onBack={handleBackToResults}
            />
        );
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!lesson) return <div>Lesson not found</div>;

    if (isComplete && completion) {
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="prose max-w-none mb-4">
                    {lesson.content}
                </div>
            </div>

            {lesson.exercises?.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
                    </h2>
                    <p className="font-semibold mb-4">{currentExercise.question}</p>
                    {renderExercise(currentExercise)}
                    {currentExercise.exercise_id in exerciseResults && (
                        <div className={`mt-4 p-4 rounded-md ${
                            exerciseResults[currentExercise.exercise_id]
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {exerciseResults[currentExercise.exercise_id]
                                ? 'Correct!'
                                : 'Incorrect. Try again!'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LessonPage;
