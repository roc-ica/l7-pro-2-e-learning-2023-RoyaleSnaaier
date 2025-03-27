import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LessonsList from '../../components/courses/LessonsList';
import CourseProgress from '../../components/courses/CourseProgress';

// Define a proper interface for the course object
interface CourseDetails {
  course_id: number;
  title: string;
  description: string;
  difficulty_level: string;
  image_url?: string;
  created_at: string;
  status: string;
  creator_id?: number;  // Add this missing property
  is_public?: boolean;
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isLoggedIn } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const response = await api.getCourseDetails(parseInt(courseId), user?.id);

        if (response.status === 'success' && response.course) {
          setCourse(response.course);
          setLessons(response.lessons || []);
          setIsEnrolled(response.is_enrolled || false);
          
          // Check if the current user is the creator of the course
          if (user && response.course && response.course.creator_id === user.id) {
            setIsCreator(true);
          }
        } else {
          setError('Failed to load course details');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) return;

    try {
      setEnrolling(true);
      const response = await api.enrollInCourse(user.id, parseInt(courseId || '0'));

      if (response.status === 'success') {
        setIsEnrolled(true);
      } else {
        setError(response.error || 'Failed to enroll in course');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading course details...</div>;
  }

  if (error || !course) {
    return <div className="text-center py-10 text-red-500">{error || 'Course not found'}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Course header */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          
          {/* Course actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <span 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                course.difficulty_level === 'Beginner' 
                  ? 'bg-green-100 text-green-800' 
                  : course.difficulty_level === 'Intermediate'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
              }`}
            >
              {course.difficulty_level}
            </span>
            
            {isLoggedIn && (
              <>
                {isCreator && (
                  <Link 
                    to={`/manage-course/${course.course_id}`}
                    className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Manage Course
                  </Link>
                )}
                
                {!isEnrolled && !isCreator && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:bg-gray-400"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}

                {isEnrolled && (
                  <span className="px-4 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                    Enrolled
                  </span>
                )}
              </>
            )}
          </div>

          {/* Course description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">About This Course</h2>
            <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
          </div>

          {/* Course content/lessons */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Course Content</h2>
            <LessonsList 
              lessons={lessons} 
              courseId={parseInt(courseId || '0')}
              isEnrolled={isEnrolled}
            />
            
            {!isLoggedIn && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <Link to="/login" className="font-medium">Log in</Link> or <Link to="/register" className="font-medium">register</Link> to track your progress and earn achievements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3">
          {/* Course image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {course.image_url ? (
              <img 
                src={course.image_url} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                <div>
                  <span className="block text-xs text-gray-500">Lessons</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Created</span>
                  <span className="font-medium">{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course progress (if enrolled) */}
          {isEnrolled && user && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="font-semibold mb-3">Your Progress</h3>
              <CourseProgress 
                lessons={lessons} 
                courseId={parseInt(courseId || '0')} 
                userId={user.id}
              />
            </div>
          )}
          
          {/* Related courses or recommendations could go here */}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
