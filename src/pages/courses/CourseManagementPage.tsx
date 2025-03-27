import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CourseForm from '../../components/courses/CourseForm';
import LessonsList from '../../components/courses/LessonsList';
import AddLessonForm from '../../components/courses/AddLessonForm';
import TabNavigation from '../../components/common/TabNavigation';
import ExerciseForm from '../../components/courses/ExerciseForm';

// Update TabType to include exercises
type TabType = 'details' | 'lessons' | 'students' | 'exercises';

const CourseManagementPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user?.id) return;

      try {
        setLoading(true);
        const response = await api.getCourseDetails(parseInt(courseId), user.id);
        
        if (response.status === 'success') {
          setCourse(response.course);
          setLessons(response.lessons || []);
          
          // Only fetch students if we're on the students tab
          if (activeTab === 'students') {
            const studentsResponse = await api.getCourseStudents(parseInt(courseId), user.id);
            if (studentsResponse.status === 'success') {
              setStudents(studentsResponse.students || []);
            }
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

    fetchCourseData();
  }, [courseId, user?.id, activeTab]);

  // Add a new effect for fetching exercises when the exercises tab is selected
  useEffect(() => {
    const fetchExercises = async () => {
      if (!courseId || !user?.id || activeTab !== 'exercises') return;
      
      try {
        // We need to build a collection of all exercises from all lessons in this course
        const allExercises: any[] = [];
        
        // For each lesson, fetch its exercises and add them with lesson info
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
        setError('Failed to load exercises. Please try again.');
      }
    };
    
    fetchExercises();
  }, [courseId, user?.id, activeTab, lessons]);

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
        // Add the new lesson to the list
        setLessons([...lessons, response.lesson]);
        setIsAddingLesson(false);
      } else {
        setError(response.error || 'Failed to add lesson');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  // Add a handler for adding exercises
  const handleAddExercise = async (exerciseData: any) => {
    if (!selectedLessonId || !user?.id) return;
    
    try {
      const response = await api.createExercise({
        lesson_id: selectedLessonId,
        user_id: user.id,
        ...exerciseData
      });
      
      if (response.status === 'success') {
        // Update the exercises list with the new exercise
        setExercises([...exercises, {
          ...response.exercise,
          lesson_title: lessons.find(l => l.lesson_id === selectedLessonId)?.title || 'Unknown Lesson'
        }]);
        setIsAddingExercise(false);
        setSelectedLessonId(null);
      } else {
        setError(response.error || 'Failed to add exercise');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  // Add a handler for deleting exercises
  const handleDeleteExercise = async (exerciseId: number) => {
    if (!user?.id || !window.confirm('Are you sure you want to delete this exercise?')) return;
    
    try {
      const response = await api.deleteExercise({
        exercise_id: exerciseId,
        user_id: user.id
      });
      
      if (response.status === 'success') {
        setExercises(exercises.filter(ex => ex.exercise_id !== exerciseId));
      } else {
        setError(response.error || 'Failed to delete exercise');
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
      } else {
        setError(response.error || 'Failed to publish course');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const handleArchiveCourse = async () => {
    if (!courseId || !user?.id || !window.confirm('Are you sure you want to archive this course?')) return;

    try {
      const response = await api.updateCourse({
        course_id: parseInt(courseId),
        user_id: user.id,
        status: 'archived'
      });

      if (response.status === 'success') {
        navigate('/dashboard');
      } else {
        setError(response.error || 'Failed to archive course');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error || 'Course not found'}
        </div>
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // Update tabs array to include exercises tab
  const tabs = [
    { id: 'details', label: 'Course Details' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'exercises', label: 'Exercises' },
    { id: 'students', label: 'Students' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <div className="flex space-x-3">
          {course.status === 'draft' && (
            <button
              onClick={handlePublishCourse}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Publish Course
            </button>
          )}
          <button
            onClick={handleArchiveCourse}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Archive Course
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab as TabType)} 
        />

        <div className="p-6">
          {activeTab === 'details' && (
            <CourseForm
              course={course}
              onSubmit={handleCourseUpdate}
            />
          )}

          {activeTab === 'lessons' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Course Lessons</h2>
                {!isAddingLesson ? (
                  <button
                    onClick={() => setIsAddingLesson(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add New Lesson
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddingLesson(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isAddingLesson ? (
                <AddLessonForm
                  onSubmit={handleAddLesson}
                  onCancel={() => setIsAddingLesson(false)}
                />
              ) : (
                <LessonsList
                  lessons={lessons}
                  courseId={parseInt(courseId || '0')}
                  onLessonsUpdated={(updatedLessons) => setLessons(updatedLessons)}
                />
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Enrolled Students</h2>
              
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {student.name ? student.name.charAt(0).toUpperCase() : student.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name || student.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.enrolled_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${student.completion_percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs mt-1">
                              {student.completed_lessons}/{student.total_lessons} lessons completed ({student.completion_percentage}%)
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No students enrolled in this course yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'exercises' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Course Exercises</h2>
                {!isAddingExercise ? (
                  <div className="flex items-center">
                    <select 
                      className="mr-3 border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setSelectedLessonId(Number(e.target.value) || null)}
                      value={selectedLessonId || ""}
                    >
                      <option value="">Select a lesson...</option>
                      {lessons.map(lesson => (
                        <option key={lesson.lesson_id} value={lesson.lesson_id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (!selectedLessonId) {
                          alert('Please select a lesson first');
                          return;
                        }
                        setIsAddingExercise(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      disabled={!selectedLessonId}
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Exercise
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAddingExercise(false);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isAddingExercise && selectedLessonId ? (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-2">
                    Add Exercise to: {lessons.find(l => l.lesson_id === selectedLessonId)?.title}
                  </h3>
                  <ExerciseForm
                    onSubmit={handleAddExercise}
                    onCancel={() => {
                      setIsAddingExercise(false);
                    }}
                  />
                </div>
              ) : exercises.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {exercises.map(exercise => (
                        <tr key={exercise.exercise_id}>
                          <td className="px-6 py-4 whitespace-nowrap">{exercise.lesson_title}</td>
                          <td className="px-6 py-4">{exercise.question.length > 50 ? `${exercise.question.substring(0, 50)}...` : exercise.question}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exercise.exercise_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{exercise.points}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3">
                              <Link
                                to={`/lesson-editor/${exercise.lesson_id}?tab=exercises`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteExercise(exercise.exercise_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {lessons.length > 0 ? 
                    "No exercises yet. Select a lesson and add your first exercise." : 
                    "You need to create lessons before adding exercises."
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default CourseManagementPage;
