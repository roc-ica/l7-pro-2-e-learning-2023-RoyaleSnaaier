import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Course {
  course_id: number;
  title: string;
  description: string;
  difficulty_level: string;
  image_url?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter courses when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(
      course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
    );
    
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCourses();
      if (response.status === 'success' && response.courses) {
        setCourses(response.courses);
        setFilteredCourses(response.courses);
      }
    } catch (error) {
      console.error('Error fetching courses for search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="flex flex-col items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            {/* Close button */}
            <div className="w-full max-w-3xl flex justify-end mb-6">
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
                aria-label="Close search"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search input */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-3xl mb-12"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="block w-full bg-white bg-opacity-10 backdrop-blur-md text-white border-0 pl-14 pr-4 py-5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xl placeholder-gray-300 placeholder-opacity-60"
                  placeholder="Search for courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleEscape}
                />
              </div>
            </motion.div>
            
            {/* Search results */}
            <div className="w-full max-w-4xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCourses.map((course) => (
                      <motion.div
                        key={course.course_id}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                      >
                        <Link 
                          to={`/course/${course.course_id}`}
                          onClick={onClose}
                          className="block h-full"
                        >
                          <div className="p-5">
                            <div 
                              className={`inline-block px-2 py-1 mb-3 text-xs font-medium rounded-md ${
                                course.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                course.difficulty_level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {course.difficulty_level}
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">{course.title}</h3>
                            <p className="text-gray-300 text-sm line-clamp-2">{course.description}</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <div className="inline-block p-4 rounded-full bg-white bg-opacity-10 mb-4">
                      <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
                    <p className="text-gray-300">
                      We couldn't find any courses matching your search.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-300">Start typing to search for courses</p>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Keyboard shortcut tip */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Press <kbd className="px-2 py-1 bg-gray-800 rounded-md text-xs">ESC</kbd> to close
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
