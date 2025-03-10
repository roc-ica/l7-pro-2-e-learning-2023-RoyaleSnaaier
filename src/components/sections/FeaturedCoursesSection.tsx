import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';
import { useCourses } from '../../hooks/useCourses';

const CourseCard: React.FC<{ course: any; index: number }> = ({ course, index }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView();

    React.useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            animate={controls}
            initial="hidden"
            variants={{
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.2 }
                },
                hidden: { opacity: 0, y: 50 }
            }}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
        >
            <div className="relative">
                <img
                    src={course.image_url || '/images/placeholder.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                    {course.difficulty_level}
                </div>
            </div>
            
            <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex items-center text-gray-600 mb-4">
                    <FaUsers className="mr-2" />
                    <span>{course.total_lessons} lessons</span>
                    <FaClock className="ml-4 mr-2" />
                    <span>{course.total_exercises} exercises</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <Link
                        to={`/courses/${course.course_id}`}
                        className="w-full px-6 py-2 bg-blue-600 text-white text-center rounded-full hover:bg-blue-700 transition-colors"
                    >
                        View Course
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturedCoursesSection: React.FC = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView();
    const { courses, isLoading, error } = useCourses();

    React.useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    if (isLoading) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="animate-pulse">Loading courses...</div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 text-center text-red-600">
                    {error}
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    animate={controls}
                    initial="hidden"
                    variants={{
                        visible: { opacity: 1, y: 0 },
                        hidden: { opacity: 0, y: 50 }
                    }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">Featured Courses</h2>
                    <p className="text-xl text-gray-600">Start your journey with our most popular courses</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.slice(0, 3).map((course, index) => (
                        <CourseCard key={course.course_id} course={course} index={index} />
                    ))}
                </div>

                <motion.div
                    animate={controls}
                    initial="hidden"
                    variants={{
                        visible: { opacity: 1, y: 0, transition: { delay: 0.6 } },
                        hidden: { opacity: 0, y: 20 }
                    }}
                    className="text-center mt-12"
                >
                    <Link
                        to="/courses"
                        className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transform hover:scale-105 transition-all"
                    >
                        View All Courses
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedCoursesSection;
