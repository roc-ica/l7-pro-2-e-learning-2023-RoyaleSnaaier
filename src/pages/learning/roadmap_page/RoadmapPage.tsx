import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { AnimatePresence } from 'framer-motion';
import { RoadmapStage, RoadmapLesson, EnrolledCourse, StageColors, StageProgress } from './types/roadmapTypes';
import GreetingBanner from './components/GreetingBanner';
import EnrolledCoursesList from './components/EnrolledCoursesList';
import StageBlock from './components/StageBlock';
import CompletionModal from './components/CompletionModal';

const RoadmapPage: React.FC = () => {
    const [stages, setStages] = useState<RoadmapStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [completedStage, setCompletedStage] = useState<number | null>(null);
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

    const deduplicateLessons = (lessons: RoadmapLesson[]): RoadmapLesson[] => {
        const uniqueLessons = new Map<string, RoadmapLesson>();
        
        lessons.forEach(lesson => {
            const existingLesson = uniqueLessons.get(lesson.title);
            if (!existingLesson || lesson.score > existingLesson.score) {
                uniqueLessons.set(lesson.title, lesson);
            }
        });
        
        return Array.from(uniqueLessons.values())
            .sort((a, b) => a.order - b.order);
    };

    const calculateStageProgress = (stage: RoadmapStage): StageProgress => {
        const completed = stage.lessons.filter(l => l.completed).length;
        const total = stage.lessons.length;
        return {
            percentage: (completed / total) * 100,
            completed,
            total
        };
    };

    useEffect(() => {
        // Check if greeting has been shown before
        const hasSeenGreeting = localStorage.getItem('hasSeenGreeting');
        if (!hasSeenGreeting && user) {
            setShowGreeting(true);
            localStorage.setItem('hasSeenGreeting', 'true');
        }
    }, [user]);

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!user) {
                setError('Please log in to view your roadmap');
                setLoading(false);
                return;
            }

            try {
                const response = await api.getRoadmap(user.id);
                if (response.status === 'success') {
                    const deduplicatedStages = response.stages.map((stage: RoadmapStage) => ({
                        ...stage,
                        lessons: deduplicateLessons(stage.lessons)
                    }));
                    setStages(deduplicatedStages);
                } else {
                    setError(response.error || 'Failed to load roadmap');
                }
            } catch (err) {
                setError('Failed to load roadmap');
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [user]);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (!user?.id) return;
            
            try {
                const response = await api.getEnrolledCourses(user.id);
                if (response.status === 'success') {
                    setEnrolledCourses(response.courses);
                }
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err);
            }
        };

        fetchEnrolledCourses();
    }, [user?.id]);

    const getStageColor = (difficulty: string): StageColors => {
        switch (difficulty) {
            case 'Beginner': return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-500' };
            case 'Intermediate': return { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500' };
            case 'Advanced': return { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-500' };
            default: return { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-500' };
        }
    };

    const filteredStages = showCompleted 
        ? stages.map(stage => ({
            ...stage,
            lessons: stage.lessons.filter(lesson => lesson.completed)
          })).filter(stage => stage.lessons.length > 0)
        : stages;

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {showGreeting && (
                <GreetingBanner onClose={() => setShowGreeting(false)} />
            )}
            
            <EnrolledCoursesList courses={enrolledCourses} />

            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-center">Learning Roadmap</h1>
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {showCompleted ? 'Show All Lessons' : 'Show Completed Only'}
                </button>
            </div>

            <div className="relative">
                {/* Main vertical line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-20" />

                <div className="relative space-y-20">
                    {filteredStages.map((stage, index) => (
                        <StageBlock 
                            key={`stage-${stage.difficulty_level}-${index}`}
                            stage={stage}
                            colors={getStageColor(stage.difficulty_level)}
                            index={index}
                            calculateStageProgress={calculateStageProgress}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                <CompletionModal 
                    isVisible={completedStage !== null}
                    onClose={() => setCompletedStage(null)}
                />
            </AnimatePresence>
        </div>
    );
};

export default RoadmapPage;
