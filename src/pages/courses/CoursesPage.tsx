import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CourseCard from '../../components/courses/CourseCard';

const CoursesPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMyCoursesOnly, setShowMyCoursesOnly] = useState(false);

  // Categories derived from courses data
  const [categories, setCategories] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.getCourses();
        
        if (response.status === 'success') {
          setCourses(response.courses || []);
          
          // Extract unique categories from courses with explicit typing
          const uniqueCategories: string[] = Array.from(new Set(
            response.courses
              .map((course: any) => course.category || 'Uncategorized')
              .filter(Boolean)
          ));
          
          setCategories(['all', ...uniqueCategories]);
        } else {
          setError('Failed to load courses');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrolledCourses = async () => {
      if (!user?.id) return;
      
      try {
        const response = await api.getEnrolledCourses(user.id);
        if (response.status === 'success') {
          setEnrolledCourses(
            (response.courses || []).map((course: any) => course.course_id)
          );
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      }
    };

    fetchCourses();
    fetchEnrolledCourses();
  }, [user?.id]);

  // Apply filters whenever the filter criteria or courses change
  useEffect(() => {
    let result = [...courses];
    
    // Filter by creator if selected
    if (showMyCoursesOnly && user) {
      result = result.filter(course => course.creator_id === user.id);
    }
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'All') {
      result = result.filter(course => course.difficulty_level === difficultyFilter);
    }
    
    // Apply category filter
    if (activeCategory !== 'all') {
      result = result.filter(course => (course.category || 'Uncategorized') === activeCategory);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'popular':
        result.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0));
        break;
      default:
        break;
    }
    
    setFilteredCourses(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [courses, searchQuery, difficultyFilter, sortOption, activeCategory, showMyCoursesOnly, user]);

  // Get current courses for pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Calculate pagination range
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Animation variants for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 right-2 bottom-2 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-150"></div>
            <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-300"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-800 py-16 sm:py-24">
        <div className="absolute inset-0">
          <svg
            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 sm:left-3/4 md:left-1/2 lg:left-0 xl:left-1/4 xl:-translate-x-1/2"
            width="404"
            height="404"
            fill="none"
            viewBox="0 0 404 404"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="pattern-squares"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" className="text-blue-800" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#pattern-squares)" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Discover Your</span>
              <span className="block text-blue-200">Next Learning Adventure</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-xl text-blue-200">
              Explore our growing library of courses designed to help you master new skills and achieve your goals.
            </p>
            
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative rounded-full shadow-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full rounded-full pl-10 pr-4 py-3.5 border-0 shadow-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for courses by title or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Filtering and Course Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-10">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            {/* Difficulty Filter */}
            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            {/* Sort Options */}
            <div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Add My Courses toggle when user is logged in */}
            {isLoggedIn && (
              <button
                onClick={() => setShowMyCoursesOnly(!showMyCoursesOnly)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  showMyCoursesOnly
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showMyCoursesOnly ? 'My Courses' : 'Show My Courses'}
              </button>
            )}
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCourses.length === 0
              ? 'No courses found'
              : filteredCourses.length === 1
              ? '1 course found'
              : `${filteredCourses.length} courses found`}
          </p>
        </div>
        
        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-10 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter criteria to find more courses.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('All');
                  setSortOption('newest');
                  setActiveCategory('all');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentCourses.map((course) => (
                <motion.div
                  key={course.course_id}
                  variants={itemVariants}
                  layout
                >
                  <CourseCard
                    course={course}
                    isEnrolled={enrolledCourses.includes(course.course_id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex justify-center mt-10">
            <ul className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
              {startPage > 1 && (
                <>
                  <li>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      1
                    </button>
                  </li>
                  {startPage > 2 && (
                    <li className="px-2 text-gray-500">...</li>
                  )}
                </>
              )}
              {pageNumbers.map((number) => (
                <li key={number}>
                  <button
                    onClick={() => setCurrentPage(number)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === number
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {number}
                  </button>
                </li>
              ))}
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <li className="px-2 text-gray-500">...</li>
                  )}
                  <li>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        )}
        
        {/* CTA for Logged Out Users */}
        {!isLoggedIn && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-white opacity-10 transform -skew-x-12"></div>
            <div className="relative z-10 md:flex justify-between items-center">
              <div className="md:w-3/5">
                <h2 className="text-2xl font-bold mb-4">Ready to start learning?</h2>
                <p className="text-blue-100 mb-6">
                  Create an account to track your progress, earn achievements, and unlock all the features of our platform.
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/register"
                  className="inline-block px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Sign Up - It's Free
                </Link>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Create Course CTA for Instructors */}
        {isLoggedIn && (
          <div className="mt-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-10 transform -skew-x-12"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold">Ready to share your knowledge?</h2>
                <p className="text-green-100 mt-2">
                  Create your own course and help others learn while building your instructor profile.
                </p>
              </div>
              <Link
                to="/create-course"
                className="px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors"
              >
                Create a Course
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
