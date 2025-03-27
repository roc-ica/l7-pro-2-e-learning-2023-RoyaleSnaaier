import React from 'react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: {
    course_id: number;
    title: string;
    description: string;
    difficulty_level: string;
    image_url: string;
    total_lessons?: number;
    total_exercises?: number;
    creator_id?: number;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Get difficulty color
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        {course.image_url ? (
          <img 
            src={course.image_url} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{course.title}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{course.title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(course.difficulty_level)}`}>
            {course.difficulty_level}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {course.total_lessons || 0} lessons
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {course.total_exercises || 0} exercises
          </div>
        </div>
        
        <Link 
          to={`/course/${course.course_id}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
