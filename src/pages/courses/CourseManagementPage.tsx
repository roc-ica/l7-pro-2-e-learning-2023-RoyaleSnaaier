import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Import custom components
import CourseHeader from '../../components/courseManagement/CourseHeader';
import ConfirmationModal from '../../components/courseManagement/ConfirmationModal';
import SuccessMessage from '../../components/courseManagement/SuccessMessage';

// Import tab components
import CourseDetailsTab from '../../components/courseManagement/tabs/CourseDetailsTab';
import LessonsTab from '../../components/courseManagement/tabs/LessonsTab';
import ExercisesTab from '../../components/courseManagement/tabs/ExercisesTab';
import StudentsTab from '../../components/courseManagement/tabs/StudentsTab';

type TabType = 'details' | 'lessons' | 'students' | 'exercises' | 'analytics';

const CourseManagementPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isAddingLesson, setIsAddingLesson] = useState<boolean>(false);
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    completionRate: 0,
    averageScore: 0,
    mostActiveStudents: [] as any[],
    totalCompletedLessons: 0,
    studentProgress: 0
  });
  
  // Fetch course data
  const fetchCourseData = async () => {
    if (!courseId || !user?.id) return;

    try {
      setLoading(true);
      const response = await api.getCourseDetails(parseInt(courseId), user.id);
      
      if (response.status === 'success') {
        setCourse(response.course);
        setLessons(response.lessons || []);
        
        // Calculate basic analytics
        // Handle the students property with a type assertion since it's not in the CourseDetailsResponse type
        const responseWithStudents = response as any;
        const studentCount = responseWithStudents.students?.length || 0;
        const completedLessons = responseWithStudents.students?.reduce((total: number, student: any) => 
          total + (student.completed_lessons || 0), 0) || 0;
        const totalPossibleLessons = studentCount * (response.lessons?.length || 1);
        const completionRate = totalPossibleLessons > 0 
          ? Math.round((completedLessons / totalPossibleLessons) * 100) 
          : 0;
        
        setAnalytics(prev => ({
          ...prev,
          totalStudents: studentCount,
          completionRate
        }));
        
        // Always fetch students data for analytics regardless of active tab
        fetchStudents();
        
        // Only fetch exercises data when the exercises tab is active
        if (activeTab === 'exercises') {
          fetchExercises();
        }
      } else {
        setError(response.error || 'Failed to load course data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch students data
  const fetchStudents = async () => {
    if (!courseId || !user?.id) return;
    
    try {
      const response = await api.getCourseStudents(parseInt(courseId), user.id);
      if (response.status === 'success') {
        setStudents(response.students || []);
        
        // Calculate more comprehensive analytics
        if (response.students?.length) {
          // Student statistics
          const totalStudents = response.students.length;
          
          // Completion statistics
          const completedLessons = response.students.reduce((sum: number, student: any) => 
            sum + (student.completed_lessons || 0), 0);
          const totalPossibleLessons = totalStudents * lessons.length;
          const completionRate = totalPossibleLessons > 0 
            ? Math.round((completedLessons / totalPossibleLessons) * 100) 
            : 0;
          
          // Score statistics
          const totalScore = response.students.reduce((sum: number, student: any) => 
            sum + (student.total_score || 0), 0);
          const averageScore = Math.round(totalScore / response.students.length);
          
          // Most active students
          const activeStudents = response.students
            .filter((s: any) => s.last_activity_date)
            .sort((a: any, b: any) => 
              new Date(b.last_activity_date).getTime() - new Date(a.last_activity_date).getTime()
            ).slice(0, 5);
          
          setAnalytics({
            totalStudents,
            completionRate,
            averageScore,
            mostActiveStudents: activeStudents,
            totalCompletedLessons: completedLessons,
            studentProgress: completionRate
          });
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };
  
  // Fetch exercises data
  const fetchExercises = async () => {
    if (!courseId || !user?.id) return;
    
    try {
      // We need to build a collection of all exercises from all lessons in this course
      const allExercises: any[] = [];
      
      // For each lesson, fetch its exercises
      for (const lesson of lessons) {
        const response = await api.getLesson(lesson.lesson_id);
        if (response.status === 'success' && response.lesson && response.lesson.exercises) {
          response.lesson.exercises.forEach((exercise: any) => {
            allExercises.push({
              ...exercise,
              lesson_title: lesson.title,
              lesson_id: lesson.lesson_id
            });
          });
        }
      }
      
      setExercises(allExercises);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCourseData();
  }, [courseId, user?.id]);
  
  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'exercises') {
      fetchExercises();
    }
  }, [activeTab]);

  // Event handlers
  const handleCourseUpdate = async (updatedCourse: any) => {
    if (!courseId || !user?.id) return;

    try {
      const response = await api.updateCourse({
        course_id: parseInt(courseId),
        user_id: user.id,
        ...updatedCourse
      });

      if (response.status === 'success') {
        setCourse({...course, ...updatedCourse});
        showSuccessMessage('Course updated successfully');
      } else {
        setError(response.error || 'Failed to update course');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const handleAddLesson = async (lessonData: any) => {
    if (!courseId || !user?.id) return;

    try {
      const response = await api.createLesson({
        course_id: parseInt(courseId),
        user_id: user.id,
        ...lessonData
      });

      if (response.status === 'success') {
        // Add the new lesson to the list with proper sorting
        const updatedLessons = [...lessons, response.lesson]
          .sort((a, b) => a.order_number - b.order_number);
          
        setLessons(updatedLessons);
        setIsAddingLesson(false);
        showSuccessMessage('Lesson added successfully');
      } else {
        setError(response.error || 'Failed to add lesson');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };
  
  const handleAddExercise = async (exerciseData: any) => {
    if (!selectedLessonId || !user?.id) return;
    
    try {
      const response = await api.createExercise({
        lesson_id: selectedLessonId,
        user_id: user.id,
        ...exerciseData
      });
      
      if (response.status === 'success') {
        // Update the exercises list
        const newExercise = {
          ...response.exercise,
          lesson_title: lessons.find(l => l.lesson_id === selectedLessonId)?.title || 'Unknown Lesson'
        };
        setExercises([...exercises, newExercise]);
        setIsAddingExercise(false);
        setSelectedLessonId(null);
        showSuccessMessage('Exercise added successfully');
      } else {
        setError(response.error || 'Failed to add exercise');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const handlePublishCourse = async () => {
    if (!courseId || !user?.id) return;

    try {
      const response = await api.updateCourse({
        course_id: parseInt(courseId),
        user_id: user.id,
        status: 'active'
      });

      if (response.status === 'success') {
        setCourse({...course, status: 'active'});
        showSuccessMessage('Course published successfully');
      } else {
        setError(response.error || 'Failed to publish course');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const handleArchiveCourse = async () => {
    setShowConfirmation(false);
    
    if (!courseId || !user?.id) return;

    try {
      const response = await api.updateCourse({
        course_id: parseInt(courseId),
        user_id: user.id,
        status: 'archived'
      });

      if (response.status === 'success') {
        navigate('/dashboard', { state: { message: 'Course archived successfully' } });
      } else {
        setError(response.error || 'Failed to archive course');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };
  
  const handleDeleteExercise = async (exerciseId: number) => {
    if (!user?.id) return;
    
    try {
      const response = await api.deleteExercise({
        exercise_id: exerciseId,
        user_id: user.id
      });
      
      if (response.status === 'success') {
        setExercises(exercises.filter(ex => ex.exercise_id !== exerciseId));
        showSuccessMessage('Exercise deleted successfully');
      } else {
        setError(response.error || 'Failed to delete exercise');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };
  
  // Add this handler for toggling course visibility
  const handleToggleVisibility = async () => {
    if (!courseId || !user?.id) return;

    try {
      const response = await api.updateCourse({
        course_id: parseInt(courseId),
        user_id: user.id,
        is_public: !course.is_public
      });

      if (response.status === 'success') {
        setCourse({...course, is_public: !course.is_public});
        showSuccessMessage(`Course is now ${!course.is_public ? 'public' : 'private'}`);
      } else {
        setError(response.error || 'Failed to update course visibility');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  // Helper functions for UI
  const toggleAddLesson = () => setIsAddingLesson(!isAddingLesson);
  const toggleAddExercise = () => setIsAddingExercise(!isAddingExercise);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 right-2 bottom-2 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-150"></div>
            <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-300"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading course data...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist or you do not have permission to access it.'}</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const tabs = [
    { id: 'details', label: 'Course Details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'lessons', label: 'Lessons', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'exercises', label: 'Exercises', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmation}
        title="Archive Course?"
        message={`This will archive "${course.title}" and make it unavailable to students. This action can be reversed later.`}
        confirmText="Archive Course"
        cancelText="Cancel"
        onConfirm={handleArchiveCourse}
        onCancel={() => setShowConfirmation(false)}
      />

      {/* Success Message */}
      <SuccessMessage 
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />

      {/* Course Header */}
      <CourseHeader
        course={course}
        totalStudents={analytics.totalStudents}
        lessonsCount={lessons.length}
        onPublishCourse={handlePublishCourse}
        onArchiveCourse={() => setShowConfirmation(true)}
        onToggleVisibility={handleToggleVisibility}
      />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile tab selector */}
        <div className="sm:hidden my-6">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop tabs */}
        <div className="hidden sm:block">
          <nav className="-mb-px flex overflow-x-auto scrollbar-hide space-x-8 border-b border-gray-200" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    group inline-flex items-center py-4 px-1 font-medium text-sm border-b-2 
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    whitespace-nowrap
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <svg 
                    className={`mr-2 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                  
                  {/* Tooltip */}
                  {isHovered && !isActive && (
                    <div className="absolute bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow">
                      {tab.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[60vh]"
            >
              {/* Course Details Tab */}
              {activeTab === 'details' && (
                <CourseDetailsTab
                  course={course}
                  analytics={analytics}
                  onCourseUpdate={handleCourseUpdate}
                  onPublish={handlePublishCourse}
                />
              )}

              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <LessonsTab
                  lessons={lessons}
                  isAddingLesson={isAddingLesson}
                  courseId={parseInt(courseId || '0')}
                  onAddLesson={handleAddLesson}
                  onToggleAddLesson={toggleAddLesson}
                  onLessonsUpdated={setLessons}
                />
              )}

              {/* Exercises Tab */}
              {activeTab === 'exercises' && (
                <ExercisesTab
                  lessons={lessons}
                  exercises={exercises}
                  isAddingExercise={isAddingExercise}
                  selectedLessonId={selectedLessonId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onLessonSelect={setSelectedLessonId}
                  onToggleAddExercise={toggleAddExercise}
                  onAddExercise={handleAddExercise}
                  onDeleteExercise={handleDeleteExercise}
                />
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <StudentsTab
                  students={students}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="bg-white shadow-lg rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Analytics</h2>
                  
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Analytics feature coming soon</p>
                    <p className="text-sm mt-2">Track student performance and engagement with detailed analytics</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CourseManagementPage;
