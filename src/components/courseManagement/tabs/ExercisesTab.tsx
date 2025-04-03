import React from 'react';
import { Link } from 'react-router-dom';
import ExerciseForm from '../../../components/courses/ExerciseForm';

interface ExercisesTabProps {
  lessons: any[];
  exercises: any[];
  isAddingExercise: boolean;
  selectedLessonId: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLessonSelect: (lessonId: number | null) => void;
  onToggleAddExercise: () => void;
  onAddExercise: (exerciseData: any) => Promise<void>;
  onDeleteExercise: (exerciseId: number) => void;
}

const ExercisesTab: React.FC<ExercisesTabProps> = ({
  lessons,
  exercises,
  isAddingExercise,
  selectedLessonId,
  searchQuery,
  onSearchChange,
  onLessonSelect,
  onToggleAddExercise,
  onAddExercise,
  onDeleteExercise
}) => {
  // Filter exercises based on search query
  const filteredExercises = exercises.filter(exercise => {
    const question = (exercise.question || '').toLowerCase();
    const lessonTitle = (exercise.lesson_title || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return question.includes(query) || lessonTitle.includes(query);
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Exercises</h2>
          <p className="text-gray-600">Manage assessment and practice activities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {!isAddingExercise && (
            <div className="relative">
              <input
                type="text"
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
          
          {!isAddingExercise ? (
            <div className="flex">
              <select 
                className="mr-3 border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onChange={(e) => onLessonSelect(Number(e.target.value) || null)}
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
                  onToggleAddExercise();
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!selectedLessonId}
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Exercise
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleAddExercise}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {isAddingExercise && selectedLessonId ? (
          <div className="border-l-4 border-green-500">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Exercise to: {lessons.find(l => l.lesson_id === selectedLessonId)?.title}
              </h3>
              <ExerciseForm
                onSubmit={onAddExercise}
                onCancel={onToggleAddExercise}
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13h.01M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2 text-gray-500 text-lg">No exercises match your search</p>
                    <button 
                      className="mt-2 text-blue-500 hover:text-blue-700"
                      onClick={() => onSearchChange('')}
                    >
                      Clear search
                    </button>
                  </>
                ) : exercises.length > 0 ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No exercises found with current filter</p>
                  </>
                ) : lessons.length > 0 ? (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No exercises yet</h3>
                    <p className="mt-1 text-gray-500">Get started by creating an exercise for one of your lessons.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          onLessonSelect(lessons[0].lesson_id);
                          onToggleAddExercise();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create your first exercise
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Add lessons first</h3>
                    <p className="mt-1 text-gray-500">You need to create lessons before adding exercises.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {filteredExercises.length} of {exercises.length} exercises
                  </div>
                  <div className="text-sm text-gray-500">
                    Exercise Types:
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Multiple Choice</span>
                    <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Fill in the Blank</span>
                    <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Writing</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {filteredExercises.map((exercise) => {
                    const typeColor = 
                      exercise.exercise_type === 'Multiple Choice' ? 'bg-blue-100 text-blue-800' : 
                      exercise.exercise_type === 'Fill in the blank' ? 'bg-green-100 text-green-800' : 
                      'bg-purple-100 text-purple-800';
                    
                    return (
                      <div 
                        key={exercise.exercise_id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center text-sm">
                              <span className="text-gray-500">From lesson:</span>
                              <span className="ml-1 font-medium text-gray-800">{exercise.lesson_title}</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">{exercise.question}</h3>
                            <div className="mt-2 flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                                {exercise.exercise_type}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">{exercise.points} points</span>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Link
                              to={`/lesson-editor/${exercise.lesson_id}?tab=exercises`}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <span className="sr-only">Edit</span>
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => onDeleteExercise(exercise.exercise_id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <span className="sr-only">Delete</span>
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisesTab;
