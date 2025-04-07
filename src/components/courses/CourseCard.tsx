import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: {
    course_id: number;
    title: string;
    description: string;
    difficulty_level: string;
    image_url?: string;
    creator_name?: string;
    total_lessons?: number;
    enrolled_count?: number;
    rating?: number;
  };
  isEnrolled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled = false }) => {
  // Get difficulty level badge color
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Truncate description
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col border border-gray-100"
    >
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{course.title.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
        
        {/* Enrolled Badge */}
        {isEnrolled && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg">
              Enrolled
            </span>
          </div>
        )}
        
        {/* Difficulty Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyColor(course.difficulty_level)}`}>
            {course.difficulty_level}
          </span>
        </div>
      </div>
      
      {/* Course Info */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {truncateDescription(course.description)}
        </p>
        
        {/* Course Meta */}
        <div className="mt-auto">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {course.total_lessons || 0} lessons
            </div>
            
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {course.enrolled_count || 0} students
            </div>
            
            {course.rating && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {course.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          {/* Instructor Info */}
          {course.creator_name && (
            <div className="border-t border-gray-100 pt-3 mb-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-2">
                  {course.creator_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600">
                  By <span className="font-medium">{course.creator_name}</span>
                </span>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <Link
            to={`/course/${course.course_id}`}
            className="w-full inline-block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            {isEnrolled ? 'Continue Learning' : 'View Course'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
