import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LessonsList from '../../components/courses/LessonsList';
import CourseProgress from '../../components/courses/CourseProgress';
import { motion } from 'framer-motion';

// Define a proper interface for the course object
interface CourseDetails {
  course_id: number;
  title: string;
  description: string;
  difficulty_level: string;
  image_url?: string;
  created_at: string;
  status: string;
  creator_id?: number;
  is_public?: boolean;
  creator_name?: string;
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'content' | 'instructor'>('overview');
  const overviewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);

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
    if (!user) {
      navigate('/login', { state: { from: `/course/${courseId}`, message: 'Please log in to enroll in this course.' } });
      return;
    }

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

  const scrollToSection = (section: 'overview' | 'content' | 'instructor') => {
    setActiveSection(section);
    
    let ref = overviewRef;
    if (section === 'content') ref = contentRef;
    if (section === 'instructor') ref = instructorRef;
    
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 right-2 bottom-2 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-150"></div>
            <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-300"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-white shadow-xl rounded-lg p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist or is currently unavailable.'}</p>
            <Link 
              to="/courses" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              ← Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get the difficulty color
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'from-green-400 to-green-600 text-green-50';
      case 'Intermediate':
        return 'from-blue-400 to-blue-600 text-blue-50';
      case 'Advanced':
        return 'from-red-400 to-red-600 text-red-50';
      default:
        return 'from-gray-400 to-gray-600 text-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Course Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="absolute inset-0 z-0 opacity-20">
          {course.image_url && (
            <img 
              src={course.image_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/90 z-10"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-4">
                <span 
                  className={`text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r ${getDifficultyColor(course.difficulty_level)} shadow-lg`}
                >
                  {course.difficulty_level}
                </span>
                
                <span className="mx-3 text-gray-300">•</span>
                
                <span className="text-sm text-gray-200">{lessons.length} lessons</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-200 mb-8 max-w-2xl">
                {course.description.split('.')[0]}. {/* Show just the first sentence in hero */}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {isLoggedIn ? (
                  <>
                    {isCreator && (
                      <Link 
                        to={`/manage-course/${course.course_id}`}
                        className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-blue-900 transition-colors duration-300"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manage Course
                      </Link>
                    )}
                    
                    {!isEnrolled && !isCreator ? (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="inline-flex items-center px-6 py-3 bg-white text-base font-bold rounded-lg text-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
                      </button>
                    ) : !isCreator && (
                      <>
                        <Link
                          to={`/lesson/${lessons[0]?.lesson_id || '#'}`}
                          className="inline-flex items-center px-6 py-3 bg-white text-base font-bold rounded-lg text-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start Learning
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <Link
                    to={'/login'}
                    state={{ from: `/course/${courseId}` }}
                    className="inline-flex items-center px-6 py-3 bg-white text-base font-bold rounded-lg text-blue-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Login to Enroll
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Course Navigation */}
        <div className="relative z-20 border-t border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto">
              <button 
                onClick={() => scrollToSection('overview')}
                className={`py-4 px-6 focus:outline-none whitespace-nowrap ${
                  activeSection === 'overview' 
                    ? 'border-b-2 border-white font-medium'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => scrollToSection('content')}
                className={`py-4 px-6 focus:outline-none whitespace-nowrap ${
                  activeSection === 'content' 
                    ? 'border-b-2 border-white font-medium'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Course Content
              </button>
              <button 
                onClick={() => scrollToSection('instructor')}
                className={`py-4 px-6 focus:outline-none whitespace-nowrap ${
                  activeSection === 'instructor' 
                    ? 'border-b-2 border-white font-medium'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                About the Instructor
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <div ref={overviewRef} className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">About This Course</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {course.description}
                </p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">Difficulty</h3>
                    </div>
                    <p className="text-blue-700">{course.difficulty_level}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">Duration</h3>
                    </div>
                    <p className="text-green-700">
                      {lessons.reduce((sum, lesson) => sum + (lesson.estimated_minutes || 0), 0)} minutes
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">Lessons</h3>
                    </div>
                    <p className="text-purple-700">{lessons.length} lessons</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Content Section */}
            <div ref={contentRef} className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Course Content</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  This course includes {lessons.length} lessons to help you master {course.title}.
                </p>
                
                <LessonsList 
                  lessons={lessons} 
                  courseId={parseInt(courseId || '0')}
                  isEnrolled={isEnrolled}
                />
                
                {!isLoggedIn && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Get the full learning experience
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create an account to track your progress, earn achievements, and unlock all course features.
                    </p>
                    <div className="flex space-x-4">
                      <Link 
                        to="/register" 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Register for Free
                      </Link>
                      <Link 
                        to="/login" 
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instructor Section */}
            <div ref={instructorRef} className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">About the Instructor</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                    {course.creator_name ? course.creator_name.charAt(0).toUpperCase() : 'I'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">{course.creator_name || 'Instructor'}</h3>
                    <p className="text-gray-600">Course Creator</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-gray-700">
                    Expert in this field with passion for teaching and helping others learn.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div>
            <div className="sticky top-6">
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Course Information</h3>
                  
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>Language: English</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Price: Free</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {isEnrolled && user && (
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Your Progress</h3>
                    <CourseProgress 
                      lessons={lessons} 
                      courseId={parseInt(courseId || '0')} 
                      userId={user.id}
                    />
                  </div>
                </div>
              )}
              
              {/* Call to action */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white p-6 shadow-lg">
                <h3 className="font-bold text-xl mb-2">Ready to start learning?</h3>
                <p className="text-indigo-100 mb-4">Join thousands of students already learning on our platform.</p>
                
                {isLoggedIn ? (
                  !isEnrolled && !isCreator ? (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3 px-4 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
                    </button>
                  ) : !isCreator && (
                    <Link
                      to={`/lesson/${lessons[0]?.lesson_id || '#'}`}
                      className="w-full block text-center py-3 px-4 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
                    >
                      Continue Learning
                    </Link>
                  )
                ) : (
                  <Link
                    to="/register"
                    className="w-full block text-center py-3 px-4 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
