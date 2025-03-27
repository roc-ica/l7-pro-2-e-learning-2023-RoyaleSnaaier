import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import TabNavigation from '../../components/common/TabNavigation';
import ExerciseForm from '../../components/courses/ExerciseForm';
import ExerciseList from '../../components/courses/ExerciseList';

type TabType = 'content' | 'exercises';

// Update the Lesson interface to include the estimated_minutes property
interface Lesson {
  lesson_id: number;
  course_id: number;
  title: string;
  content: string;
  order_number: number;
  estimated_minutes: number;  // Add this property
  exercises?: any[];
  course_title?: string;
}

const LessonEditorPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    estimated_minutes: 30
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Parse URL parameters to determine initial tab
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'exercises' ? 'exercises' : 'content';
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab as TabType);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !user?.id) return;

      try {
        setLoading(true);
        const response = await api.getLesson(parseInt(lessonId));
        
        if (response.status === 'success' && response.lesson) {
          // Cast response.lesson to the expected Lesson type with default values for missing properties
          // Check if estimated_minutes exists in the response, if not provide default
          const responseLesson = response.lesson as any; // Use any to avoid type checking temporarily
          
          const loadedLesson: Lesson = {
            ...responseLesson,
            estimated_minutes: responseLesson.estimated_minutes || 30
          };
          
          setLesson(loadedLesson);
          setLessonForm({
            title: loadedLesson.title || '',
            content: loadedLesson.content || '',
            estimated_minutes: loadedLesson.estimated_minutes
          });
          setExercises(loadedLesson.exercises || []);
          setCourseId(loadedLesson.course_id);
        } else {
          setError(response.error || 'Failed to load lesson data');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, user?.id]);

  const handleLessonUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId || !user?.id) return;

    try {
      setMessage(null);
      const response = await api.updateLesson({
        lesson_id: parseInt(lessonId),
        user_id: user.id,
        ...lessonForm
      });

      if (response.status === 'success') {
        setLesson({...lesson, ...lessonForm} as Lesson);
        setMessage({ text: 'Lesson updated successfully', type: 'success' });
      } else {
        setMessage({ text: response.error || 'Failed to update lesson', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLessonForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExercise = async (exerciseData: any) => {
    if (!lessonId || !user?.id) return;

    try {
      const response = await api.createExercise({
        lesson_id: parseInt(lessonId),
        user_id: user.id,
        ...exerciseData
      });

      if (response.status === 'success') {
        // Add the new exercise to the list
        setExercises([...exercises, response.exercise]);
        setIsAddingExercise(false);
        setMessage({ text: 'Exercise added successfully', type: 'success' });
      } else {
        setMessage({ text: response.error || 'Failed to add exercise', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error(err);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!user?.id || !window.confirm('Are you sure you want to delete this exercise?')) return;

    try {
      const response = await api.deleteExercise({
        exercise_id: exerciseId,
        user_id: user.id
      });

      if (response.status === 'success') {
        setExercises(exercises.filter(ex => ex.exercise_id !== exerciseId));
        setMessage({ text: 'Exercise deleted successfully', type: 'success' });
      } else {
        setMessage({ text: response.error || 'Failed to delete exercise', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
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

  if (error || !lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error || 'Lesson not found'}
        </div>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800">
          ← Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'Lesson Content' },
    { id: 'exercises', label: 'Exercises' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Lesson</h1>
        <div className="flex items-center space-x-4">
          {courseId && (
            <Link
              to={`/manage-course/${courseId}`}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Course Management
            </Link>
          )}
          {activeTab !== 'exercises' && (
            <button 
              onClick={() => setActiveTab('exercises')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Manage Exercises
            </button>
          )}
        </div>
      </div>

      {message && (
        <div 
          className={`p-4 rounded-md mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab as TabType)} 
        />

        <div className="p-6">
          {activeTab === 'content' && (
            <form onSubmit={handleLessonUpdate} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={lessonForm.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Content*
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={lessonForm.content}
                  onChange={handleInputChange}
                  required
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="estimated_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  id="estimated_minutes"
                  name="estimated_minutes"
                  value={lessonForm.estimated_minutes}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'exercises' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Lesson Exercises</h2>
                {!isAddingExercise ? (
                  <button
                    onClick={() => setIsAddingExercise(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add New Exercise
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddingExercise(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isAddingExercise ? (
                <ExerciseForm
                  onSubmit={handleAddExercise}
                  onCancel={() => setIsAddingExercise(false)}
                />
              ) : (
                <ExerciseList
                  exercises={exercises}
                  onDelete={handleDeleteExercise}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonEditorPage;
