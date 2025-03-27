import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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
    if (percentage >= 75) return 'bg-green-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 25) return 'bg-yellow-600';
    return 'bg-gray-400';
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span>{progress.completedLessons}/{progress.totalLessons} lessons completed</span>
        <span>{progress.percentComplete}%</span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getProgressColor(progress.percentComplete)} transition-all duration-300`}
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>
      
      {progress.lastActivity && (
        <p className="text-xs text-gray-500 mt-2">
          Last activity: {new Date(progress.lastActivity).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default CourseProgress;
