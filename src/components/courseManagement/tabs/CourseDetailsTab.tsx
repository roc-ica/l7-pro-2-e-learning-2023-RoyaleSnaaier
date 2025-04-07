import React from 'react';
import CourseForm from '../../../components/courses/CourseForm';

interface CourseDetailsTabProps {
  course: any;
  analytics: {
    totalStudents: number;
    completionRate: number;
    averageScore: number;
    mostActiveStudents?: any[];
    totalCompletedLessons?: number;
    studentProgress?: number;
  };
  onCourseUpdate: (courseData: any) => void;
  onPublish: () => void;
}

const CourseDetailsTab: React.FC<CourseDetailsTabProps> = ({
  course,
  analytics,
  onCourseUpdate,
  onPublish
}) => {
  // Add a handler for toggling public/private status
  const handleVisibilityToggle = () => {
    onCourseUpdate({
      is_public: !course.is_public
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4">
            <h2 className="text-xl font-medium text-white">Course Details</h2>
            <p className="text-blue-200 text-sm">Edit your course information</p>
          </div>
          
          <div className="p-6">
            <CourseForm course={course} onSubmit={onCourseUpdate} />
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-1">
        {/* Course Preview Card */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium text-white">Course Preview</h2>
              <p className="text-indigo-200 text-sm">How students see your course</p>
            </div>
            
            {/* New visibility toggle */}
            <div className="flex items-center">
              <span className="text-xs text-indigo-200 mr-2">
                {course.is_public ? 'Public' : 'Private'}
              </span>
              <button 
                onClick={handleVisibilityToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  course.is_public ? 'bg-green-500' : 'bg-gray-400'
                }`}
                role="switch"
                aria-checked={course.is_public ? 'true' : 'false'}
              >
                <span className="sr-only">Toggle course visibility</span>
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    course.is_public ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div>
            {course.image_url ? (
              <img 
                src={course.image_url} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                <svg className="h-12 w-12 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                    course.status === 'draft' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                  
                  {/* Visibility badge */}
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    course.is_public ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800' : 
                    course.difficulty_level === 'Intermediate' ? 'bg-blue-100 text-blue-800' : 
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {course.difficulty_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-700 to-teal-800 px-6 py-4">
            <h2 className="text-xl font-medium text-white">Quick Stats</h2>
            <p className="text-green-200 text-sm">Course performance at a glance</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Students</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Completion</p>
                <div className="flex items-center justify-center">
                  <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
                  {analytics.completionRate > 0 && (
                    <div className="w-8 h-8 ml-2">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path 
                          className="circle-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="2"
                        />
                        <path 
                          className="circle"
                          strokeDasharray={`${analytics.completionRate}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.totalCompletedLessons || 0} lessons completed
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}</p>
                <p className="text-xs text-gray-500 mt-1">points per student</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.mostActiveStudents?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">active students</p>
              </div>
            </div>
            
            {course.status === 'active' ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-800 font-medium">Course is live</p>
                    <p className="text-sm text-green-600">Students can enroll</p>
                  </div>
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            ) : course.status === 'draft' ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-yellow-800 font-medium">Course is in draft</p>
                    <p className="text-sm text-yellow-600">Not visible to students</p>
                  </div>
                  <button 
                    onClick={onPublish}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800 font-medium">Course is archived</p>
                    <p className="text-sm text-gray-600">Not visible to students</p>
                  </div>
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Add some CSS for the circular chart */}
            <style>{`
              .circular-chart {
                display: block;
                max-width: 100%;
                max-height: 100%;
                transform: rotate(-90deg);
              }
              .circle-bg {
                fill: none;
                stroke: #eee;
                stroke-width: 2;
              }
              .circle {
                fill: none;
                stroke-width: 2;
                stroke-linecap: round;
                animation: progress 1s ease-out forwards;
              }
              @keyframes progress {
                0% {
                  stroke-dasharray: 0 100;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsTab;
