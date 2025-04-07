import React from 'react';
import { Link } from 'react-router-dom';
import { EnrolledCourse } from '../types/roadmapTypes';

interface EnrolledCoursesListProps {
    courses: EnrolledCourse[];
}

const EnrolledCoursesList: React.FC<EnrolledCoursesListProps> = ({ courses }) => {
    if (courses.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Enrolled Courses</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map(course => (
                    <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                            <span>{course.difficulty_level}</span>
                            <span>Enrolled {new Date(course.enrolled_at).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ 
                                        width: `${(course.completed_lessons / course.total_lessons) * 100}%` 
                                    }}
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                {course.completed_lessons} of {course.total_lessons} lessons completed
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default EnrolledCoursesList;
