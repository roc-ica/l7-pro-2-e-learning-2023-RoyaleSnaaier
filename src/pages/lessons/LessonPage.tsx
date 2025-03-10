import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import api from '../../services/api';
import { LessonResponse } from '../../types/api';
import LessonComplete from '../../components/lessons/LessonComplete'; // Add this import

const LessonPage: React.FC = () => {
    const { lessonId } = useParams();
    const notifications = useNotifications();
    const { user } = useAuth();
    const [lesson, setLesson] = useState<LessonResponse['lesson']>();
    const [loading, setLoading] = useState(true);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [completionStats, setCompletionStats] = useState<{
        totalExercises: number;
        correctAnswers: number;
        totalPoints: number;
    } | null>(null);

    useEffect(() => {
        const fetchLesson = async () => {
            if (!lessonId) return;
            try {
                const response = await api.getLesson(parseInt(lessonId));
                if (response.status === 'success' && response.lesson) {
                    setLesson(response.lesson);
                }
            } catch (error) {
                console.error('Error fetching lesson:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId]);

    const handleExerciseComplete = async () => {
        if (!user?.id || !lessonId || !lesson?.title) return;

        try {
            console.log('Fetching lesson completion...');
            const response = await api.getLessonCompletion(parseInt(lessonId), user.id);
            console.log('Lesson completion response:', response);

            if (response.status === 'success') {
                const stats = {
                    totalExercises: response.total_exercises || 0,
                    correctAnswers: response.correct_answers || 0,
                    totalPoints: response.total_points || 0
                };
                console.log('Setting completion stats:', stats);
                setCompletionStats(stats);
                setLessonComplete(true);
            }
        } catch (error) {
            console.error('Error completing lesson:', error);
        }
    };

    // Add this to check if stats are being updated
    useEffect(() => {
        if (completionStats) {
            console.log('Stats updated:', completionStats);
        }
    }, [completionStats]);

    if (loading) return <div>Loading...</div>;
    if (!lesson) return <div>Lesson not found</div>;

    return (
        <div>
            {lessonComplete && completionStats ? (
                <LessonComplete
                    lessonTitle={lesson.title}
                    totalExercises={completionStats.totalExercises}
                    correctAnswers={completionStats.correctAnswers}
                    totalPoints={completionStats.totalPoints}
                    nextLessonId={null}
                    onNextLesson={() => {/* Add next lesson logic */}}
                    onReviewLesson={() => {/* Add review logic */}}
                />
            ) : (
                <div className="lesson-content">
                    <h1>{lesson.title}</h1>
                    {/* Add a button to trigger completion for testing */}
                    <button onClick={handleExerciseComplete}>Complete Lesson</button>
                    {/* Rest of your lesson content */}
                </div>
            )}
        </div>
    );
};

export default LessonPage;
