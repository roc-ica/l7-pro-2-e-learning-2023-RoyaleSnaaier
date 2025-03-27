import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types/course';
import { useAuth } from '../../contexts/AuthContext';
import { CourseProgress } from '../../types/api';
import api from '../../services/api';

const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [progress, setProgress] = useState<Record<number, CourseProgress>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, isLoggedIn } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const [coursesResponse, progressResponse] = await Promise.all([
                    api.getCourses(),
                    user ? api.getCourseProgress(user.id) : null
                ]);

                if (coursesResponse.status === 'success' && coursesResponse.courses) {
                    setCourses(coursesResponse.courses);
                }

                if (progressResponse?.status === 'success' && progressResponse.data) {
                    const progressMap: Record<number, CourseProgress> = {};
                    progressResponse.data.forEach((p: CourseProgress) => {
                        if (p.course_id) {  // Only add if course_id exists
                            progressMap[p.course_id] = {
                                ...p,
                                // Ensure all required fields have default values
                                completed_lessons: p.completed_lessons || 0,
                                total_lessons: p.total_lessons || 0,
                                progress_percentage: p.progress_percentage || 0,
                                total_score: p.total_score || 0,
                                last_accessed: p.last_accessed || new Date().toISOString()
                            };
                        }
                    });
                    setProgress(progressMap);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredCourses(courses);
        } else {
            setFilteredCourses(courses.filter(course => course.difficulty_level === activeFilter));
        }
    }, [courses, activeFilter]);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-blue-100 text-blue-800';
            case 'Advanced': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 75) return 'bg-green-600';
        if (percentage >= 50) return 'bg-blue-600';
        return 'bg-yellow-600';
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Master English at your own pace with our comprehensive courses
                </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleFilterClick(filter)}
                        className={`px-6 py-2 rounded-full transition-all duration-300 ${
                            activeFilter === filter
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {isLoggedIn && (
                <div className="flex justify-end mb-8">
                    <Link 
                        to="/create-course"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Course
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => {
                    const courseProgress = progress[course.course_id];
                    const completionPercentage = courseProgress
                        ? Math.round((courseProgress.completed_lessons / courseProgress.total_lessons) * 100)
                        : 0;

                    return (
                        <Link 
                            key={course.course_id} 
                            to={`/courses/${course.course_id}`}
                            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div>
                                <div 
                                    className="h-48 bg-cover bg-center rounded-t-lg relative"
                                    style={{ 
                                        backgroundImage: `url(${course.image_url || '/default-course-image.jpg'})`,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10 rounded-t-lg">
                                        <h2 className="text-2xl font-bold text-white p-6">{course.title}</h2>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                                            {course.difficulty_level}
                                        </span>
                                        {courseProgress && (
                                            <span className="text-sm font-medium text-gray-600">
                                                {completionPercentage}% Complete
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                                    {courseProgress && (
                                        <div className="mb-4">
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getProgressColor(completionPercentage)} transition-all duration-300`}
                                                    style={{ width: `${completionPercentage}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2 text-sm text-gray-600">
                                                <span>{courseProgress.completed_lessons}/{courseProgress.total_lessons} Lessons</span>
                                                {courseProgress.total_score !== undefined && (
                                                    <span>{courseProgress.total_score} Points</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-600 font-medium group-hover:text-blue-700">
                                            {courseProgress ? 'Continue Course' : 'Start Learning'} →
                                        </span>
                                        {courseProgress && (
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                                <span className="text-sm text-gray-600">In Progress</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                
                {filteredCourses.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 text-lg">
                            No courses found for {activeFilter} level.
                        </p>
                        <button
                            onClick={() => setActiveFilter('All')}
                            className="mt-4 text-blue-600 hover:text-blue-800"
                        >
                            Show all courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
