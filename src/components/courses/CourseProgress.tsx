import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';

interface CourseProgressProps {
  lessons: any[];
  courseId: number;
  userId: number;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ lessons, courseId, userId }) => {
  const [progress, setProgress] = useState({
    completedLessons: 0,
    totalLessons: 0,
    percentComplete: 0,
    lastActivity: ''
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.getCourseProgress(userId);
        if (response.status === 'success') {
          const courseProgress = response.data.find(
            (course: any) => course.course_id === courseId
          );

          if (courseProgress) {
            setProgress({
              completedLessons: courseProgress.completed_lessons || 0,
              totalLessons: courseProgress.total_lessons || lessons.length,
              percentComplete: courseProgress.progress_percentage || 0,
              lastActivity: courseProgress.last_accessed || ''
            });
          } else {
            setProgress({
              completedLessons: 0,
              totalLessons: lessons.length,
              percentComplete: 0,
              lastActivity: ''
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch course progress:", error);
      }
    };

    if (userId && courseId) {
      fetchProgress();
    }
  }, [userId, courseId, lessons]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusText = (percentage: number) => {
    if (percentage === 0) return 'Not started';
    if (percentage === 100) return 'Completed';
    if (percentage < 25) return 'Just started';
    if (percentage < 50) return 'In progress';
    if (percentage < 75) return 'Well underway';
    return 'Almost complete';
  };

  return (
    <div className="space-y-5">
      {/* Visual progress indicator */}
      <div className="relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${getProgressColor(progress.percentComplete)}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentComplete}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        <div className="mt-2 text-sm font-medium flex justify-between">
          <span className="text-gray-600">{getStatusText(progress.percentComplete)}</span>
          <span className={`
            ${progress.percentComplete >= 75 ? 'text-green-600' :
              progress.percentComplete >= 50 ? 'text-blue-600' :
              progress.percentComplete >= 25 ? 'text-yellow-600' : 'text-gray-600'}
            `}
          >
            {progress.percentComplete}% complete
          </span>
        </div>
      </div>
      
      {/* Lesson status info */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex space-x-2 items-center">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <div>
            <div className="text-xs text-gray-500">Lessons Completed</div>
            <div className="font-medium">{progress.completedLessons} of {progress.totalLessons}</div>
          </div>
        </div>
        
        {progress.lastActivity && (
          <div>
            <div className="text-xs text-gray-500">Last Activity</div>
            <div className="font-medium">{new Date(progress.lastActivity).toLocaleDateString()}</div>
          </div>
        )}
      </div>
      
      {/* Action button */}
      <div className="pt-3">
        <button 
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          onClick={() => window.location.href = `/lesson/${lessons[0]?.lesson_id}`}
        >
          {progress.percentComplete === 0 ? 'Start Learning' : 'Continue Learning'}
        </button>
      </div>
    </div>
  );
};

export default CourseProgress;
