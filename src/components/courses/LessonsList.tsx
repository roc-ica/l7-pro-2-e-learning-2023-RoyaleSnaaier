import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonsListProps {
  lessons: any[];
  courseId: number;
  onLessonsUpdated?: (lessons: any[]) => void;
  isEnrolled?: boolean;
}

const LessonsList: React.FC<LessonsListProps> = ({ 
  lessons, 
  courseId, 
  onLessonsUpdated,
  isEnrolled = true
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<number, boolean>>({});

  const handleDeleteLesson = async (lessonId: number) => {
    if (!user?.id || !window.confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
    
    try {
      const response = await api.deleteLesson({
        lesson_id: lessonId,
        user_id: user.id
      });
      
      if (response.status === 'success' && onLessonsUpdated) {
        onLessonsUpdated(lessons.filter(lesson => lesson.lesson_id !== lessonId));
      } else {
        setError(response.error || 'Failed to delete lesson');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const toggleExpand = (lessonId: number) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  React.useEffect(() => {
    // Fetch completion status for each lesson if user is logged in and enrolled
    if (user && isEnrolled) {
      lessons.forEach(async (lesson) => {
        try {
          const response = await api.getLessonCompletion(lesson.lesson_id, user.id);
          if (response.status === 'success') {
            setCompletedLessons(prev => ({
              ...prev,
              [lesson.lesson_id]: response.completed
            }));
          }
        } catch (err) {
          console.error(`Error fetching completion for lesson ${lesson.lesson_id}:`, err);
        }
      });
    }
  }, [lessons, user, isEnrolled]);

  if (onLessonsUpdated) {
    // If this is used in a management context
    return (
      <div>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {lessons.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No lessons yet. Add your first lesson to get started.
          </div>
        ) : (
          <ul className="space-y-4">
            {lessons.map((lesson) => (
              <li 
                key={lesson.lesson_id} 
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{lesson.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Lesson {lesson.order_number}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/lesson-editor/${lesson.lesson_id}?tab=exercises`}
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Exercise
                    </Link>
                    <Link
                      to={`/lesson-editor/${lesson.lesson_id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteLesson(lesson.lesson_id)}
                      className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Show exercise count if any */}
                {lesson.exercises && lesson.exercises.length > 0 && (
                  <div className="mt-2 flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {lesson.exercises.length} {lesson.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Student view with enhanced UI
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 divide-y divide-gray-200">
      {lessons.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white">
          No lessons available for this course yet.
        </div>
      ) : (
        <div className="bg-white divide-y divide-gray-100">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons[lesson.lesson_id];
            const isExpanded = expandedLesson === lesson.lesson_id;
            
            return (
              <motion.div 
                key={lesson.lesson_id}
                initial={false}
                animate={{ backgroundColor: isExpanded ? "#f9fafb" : "#ffffff" }}
                className="border-l-4 transition-colors"
                style={{ 
                  borderLeftColor: isCompleted ? '#10b981' : isExpanded ? '#3b82f6' : 'transparent' 
                }}
              >
                <button
                  onClick={() => toggleExpand(lesson.lesson_id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {lesson.estimated_minutes} min
                        {lesson.exercises && lesson.exercises.length > 0 && 
                          ` • ${lesson.exercises.length} ${lesson.exercises.length === 1 ? 'exercise' : 'exercises'}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isEnrolled && (
                      <Link 
                        to={`/lesson/${lesson.lesson_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`mr-4 px-3 py-1 rounded text-sm ${
                          isCompleted 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isCompleted ? 'Review' : 'Start'}
                      </Link>
                    )}
                    
                    <svg 
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        {lesson.description ? (
                          <p className="text-gray-700 mb-3">{lesson.description}</p>
                        ) : (
                          <p className="text-gray-500 italic mb-3">No description available</p>
                        )}
                        
                        {!isEnrolled && (
                          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-center">
                            <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-blue-700 text-sm">Enroll in this course to access this lesson.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LessonsList;
