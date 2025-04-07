import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';

const CreateCoursePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'Beginner',
    image_url: '',
    is_public: true,
    keywords: ''
  });

  // Track field focus for animation effects
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Helper for validation
  const validateField = (name: string, value: string | boolean): string => {
    if (name === 'title' && typeof value === 'string' && value.length < 5) {
      return 'Title must be at least 5 characters';
    }
    if (name === 'description' && typeof value === 'string' && value.length < 20) {
      return 'Description should be at least 20 characters';
    }
    if (name === 'image_url' && typeof value === 'string' && value && !/^https?:\/\/.+/.test(value)) {
      return 'Image URL must be a valid URL starting with http:// or https://';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      
      // Validate the field
      const error = validateField(name, checkbox.checked);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validate the field
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleFocus = (name: string) => {
    setFocusedField(name);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    let hasErrors = false;
    const errors: {[key: string]: string} = {};
    
    for (const [name, value] of Object.entries(formData)) {
      const error = validateField(name, value);
      if (error) {
        errors[name] = error;
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Format keywords from comma-separated string to array if needed
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const courseData = {
        ...formData,
        keywords,
        user_id: user?.id
      };
      
      const result = await api.createCourse(courseData);
      
      if (result.status === 'success') {
        navigate(`/course/${result.course.course_id}`);
      } else {
        setError(result.error || 'Failed to create course');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  // Difficulty level options with descriptions
  const difficultyOptions = [
    { 
      value: 'Beginner', 
      label: 'Beginner', 
      description: 'No prior knowledge required',
      color: 'from-green-400 to-green-600' 
    },
    { 
      value: 'Intermediate', 
      label: 'Intermediate', 
      description: 'Basic understanding needed',
      color: 'from-blue-400 to-blue-600' 
    },
    { 
      value: 'Advanced', 
      label: 'Advanced', 
      description: 'Complex or specialized topics', 
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const getSelectedDifficultyColor = () => {
    const selected = difficultyOptions.find(option => option.value === formData.difficulty_level);
    return selected ? selected.color : 'from-gray-400 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      {/* Hero section with background effect */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-3">Create Your Course</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Share your knowledge with the world! Design an engaging learning experience that will help others master new skills.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 2
            </span>
            <span className="text-sm font-medium text-gray-700">
              {currentStep === 1 ? 'Basic Info' : 'Details & Settings'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: currentStep === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8 shadow-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={currentStep === 1 ? goToNextStep : handleSubmit} className="relative">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800">Course Basics</h2>
                  <p className="text-gray-500 text-sm mt-1">Start by providing the essential information about your course</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Course Title
                      <span className="text-red-500 ml-1">*</span>
                      <span className="ml-2 text-xs text-gray-400">(5-60 characters)</span>
                    </label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      className={`relative rounded-md shadow-sm ${
                        validationErrors.title ? 'ring-1 ring-red-500' : ''
                      }`}
                    >
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        onFocus={() => handleFocus('title')}
                        onBlur={handleBlur}
                        maxLength={60}
                        required
                        className={`block w-full px-4 py-3 rounded-md border ${
                          focusedField === 'title' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                        } focus:outline-none transition-all duration-200 text-lg`}
                        placeholder="e.g., Mastering JavaScript Fundamentals"
                      />
                      {focusedField === 'title' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                    {validationErrors.title && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.title}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Create a clear, descriptive title that accurately reflects your course content.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Course Description
                      <span className="text-red-500 ml-1">*</span>
                      <span className="ml-2 text-xs text-gray-400">(20-1000 characters)</span>
                    </label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      className={`relative rounded-md shadow-sm ${
                        validationErrors.description ? 'ring-1 ring-red-500' : ''
                      }`}
                    >
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onFocus={() => handleFocus('description')}
                        onBlur={handleBlur}
                        required
                        rows={5}
                        maxLength={1000}
                        className={`block w-full px-4 py-3 rounded-md border ${
                          focusedField === 'description' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                        } focus:outline-none transition-all duration-200`}
                        placeholder="Describe what students will learn, prerequisites, and expected outcomes..."
                      ></textarea>
                    </motion.div>
                    {validationErrors.description && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Write a compelling description that tells potential students what they'll learn and why they should take your course.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image URL
                      <span className="ml-2 text-xs text-gray-400">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <motion.div
                          whileFocus={{ scale: 1.01 }}
                          className={`relative rounded-md shadow-sm ${
                            validationErrors.image_url ? 'ring-1 ring-red-500' : ''
                          }`}
                        >
                          <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            onFocus={() => handleFocus('image_url')}
                            onBlur={handleBlur}
                            className={`block w-full px-4 py-3 rounded-md border ${
                              focusedField === 'image_url' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                            } focus:outline-none transition-all duration-200`}
                            placeholder="https://example.com/image.jpg"
                          />
                        </motion.div>
                        {validationErrors.image_url && (
                          <p className="mt-2 text-sm text-red-600">{validationErrors.image_url}</p>
                        )}
                      </div>
                      <div className="relative rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {formData.image_url ? (
                          <img 
                            src={formData.image_url} 
                            alt="Course preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                            }}
                          />
                        ) : (
                          <div className="text-center p-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-1 text-xs text-gray-500">Image preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add an engaging image that represents your course (recommended dimensions: 1200×800 px)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Additional Info and Settings */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800">Course Settings</h2>
                  <p className="text-gray-500 text-sm mt-1">Configure additional course settings and metadata</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Difficulty Level
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {difficultyOptions.map((option) => (
                        <div key={option.value}>
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, difficulty_level: option.value })}
                            className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                              formData.difficulty_level === option.value
                                ? `border-${option.color.split(' ')[1]} bg-gradient-to-br ${option.color} text-white`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{option.label}</h3>
                              {formData.difficulty_level === option.value && (
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${formData.difficulty_level === option.value ? 'text-white/80' : 'text-gray-500'}`}>
                              {option.description}
                            </p>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords/Tags
                      <span className="ml-2 text-xs text-gray-400">(Comma separated)</span>
                    </label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      className="relative rounded-md shadow-sm"
                    >
                      <input
                        type="text"
                        id="keywords"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        onFocus={() => handleFocus('keywords')}
                        onBlur={handleBlur}
                        className={`block w-full px-4 py-3 rounded-md border ${
                          focusedField === 'keywords' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                        } focus:outline-none transition-all duration-200`}
                        placeholder="e.g., javascript, web development, programming"
                      />
                    </motion.div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add relevant keywords to help students find your course more easily
                    </p>
                    
                    {formData.keywords && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.keywords.split(',').map((keyword, index) => (
                          keyword.trim() && (
                            <span 
                              key={index} 
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {keyword.trim()}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_public"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 block text-gray-700">
                        Make this course public and visible to all users
                      </span>
                    </label>
                    <p className="mt-2 text-sm text-gray-500 ml-7">
                      {formData.is_public 
                        ? 'Your course will be listed in the public course directory and searchable by all users.'
                        : 'Your course will be private and only accessible via direct link or to users you invite.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Preview Card */}
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800">Course Preview</h2>
                  <p className="text-gray-500 text-sm mt-1">This is how your course will appear to students</p>
                </div>
                
                <div className="p-6">
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md">
                    <div className="h-48 bg-cover bg-center" 
                      style={{
                        backgroundImage: formData.image_url ? `url(${formData.image_url})` : 'none',
                        backgroundColor: !formData.image_url ? '#f3f4f6' : 'transparent'
                      }}
                    >
                      {!formData.image_url && (
                        <div className="h-full flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-xl text-gray-900">
                          {formData.title || 'Course Title'}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          formData.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          formData.difficulty_level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {formData.difficulty_level}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {formData.description || 'Your course description will appear here...'}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {user?.username || 'Instructor'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          {formData.is_public ? (
                            <><svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg> Public</>
                          ) : (
                            <><svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg> Private</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep === 1 ? (
              <div></div> // Empty div to maintain flex justify-between
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : currentStep === 1 ? (
                <>
                  Continue
                  <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Create Course
                  <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
