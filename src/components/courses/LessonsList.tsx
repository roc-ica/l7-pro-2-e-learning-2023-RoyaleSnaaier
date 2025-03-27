import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

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

  // If this is used in a course view context (with isEnrolled)
  if (isEnrolled !== undefined) {
    return (
      <div>
        {lessons.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No lessons available for this course yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li 
                key={lesson.lesson_id} 
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <Link 
                  to={isEnrolled ? `/lesson/${lesson.lesson_id}` : '#'} 
                  className={`block p-4 ${!isEnrolled ? 'cursor-not-allowed opacity-75' : ''}`}
                  onClick={(e) => !isEnrolled && e.preventDefault()}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      <p className="text-sm text-gray-500">
                        {lesson.estimated_minutes} min
                      </p>
                    </div>
                    {isEnrolled ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Original management functionality
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
};

export default LessonsList;
