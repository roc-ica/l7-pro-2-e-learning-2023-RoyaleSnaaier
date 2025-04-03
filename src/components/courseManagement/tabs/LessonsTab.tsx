import React from 'react';
import AddLessonForm from '../../../components/courses/AddLessonForm';
import LessonsList from '../../../components/courses/LessonsList';

interface LessonsTabProps {
  lessons: any[];
  isAddingLesson: boolean;
  courseId: number;
  onAddLesson: (lessonData: any) => Promise<void>;
  onToggleAddLesson: () => void;
  onLessonsUpdated: (lessons: any[]) => void;
}

const LessonsTab: React.FC<LessonsTabProps> = ({
  lessons,
  isAddingLesson,
  courseId,
  onAddLesson,
  onToggleAddLesson,
  onLessonsUpdated
}) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
          <p className="text-gray-600">Organize and manage your course content</p>
        </div>
        <button
          onClick={onToggleAddLesson}
          className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium
            ${isAddingLesson
              ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              : 'border border-transparent text-white bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {isAddingLesson ? (
            <>Cancel</>
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Lesson
            </>
          )}
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {isAddingLesson ? (
          <div className="border-l-4 border-blue-500">
            <AddLessonForm
              onSubmit={onAddLesson}
              onCancel={onToggleAddLesson}
            />
          </div>
        ) : (
          <div className="p-6">
            <LessonsList 
              lessons={lessons} 
              courseId={courseId}
              onLessonsUpdated={onLessonsUpdated}
            />
            
            {lessons.length > 0 && (
              <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Lesson Management Tips</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Keep lessons focused on a single topic for better student comprehension.
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Add exercises to test understanding after each major concept.
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Use a variety of exercise types to engage different learning styles.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsTab;
