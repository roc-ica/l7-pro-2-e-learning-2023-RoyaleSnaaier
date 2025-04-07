import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaStar, FaUsers, FaClock, FaGraduationCap, FaTags, FaBookmark } from 'react-icons/fa';
import { useCourses } from '../../../../hooks/useCourses';

const CourseCard: React.FC<{ course: any; index: number }> = ({ course, index }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView();
    const [isHovered] = React.useState(false);

    React.useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    // Generate random rating between 4.0 and 5.0 for demo purposes
    const rating = React.useMemo(() => (4 + Math.random()).toFixed(1), []);

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
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300"
            style={{
                boxShadow: isHovered ? '0 15px 30px rgba(0,0,0,0.15)' : '0 5px 15px rgba(0,0,0,0.05)'
            }}
            whileHover={{
                scale: 1.03,
            }}
        >
            <div className="relative">
                {/* Course image with gradient overlay */}
                <div className="relative h-52">
                    <img
                        src={course.image_url || '/images/placeholder.jpg'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-40'}`}></div>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 right-4 bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold text-white shadow-lg">
                    {course.difficulty_level}
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        <FaTags className="inline mr-1" />
                        {course.category || 'Catagory'}
                    </span>
                    <span className="text-green-600 font-bold">
                        {course.price ? `$${course.price}` : 'Free'}
                    </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{course.description}</p>
                
                <div className="flex justify-between text-gray-600 mb-5 text-sm">
                    <div className="flex items-center">
                        <FaUsers className="mr-2 text-blue-500" />
                        <span>{course.total_lessons} lessons</span>
                    </div>
                    <div className="flex items-center">
                        <FaClock className="mr-2 text-blue-500" />
                        <span>{course.total_exercises} exercises</span>
                    </div>
                </div>
            
                <div className="flex items-center justify-between">
                    <Link
                        to={`/courses/${course.course_id}`}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
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
