import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import WaveDecoration from '../../../../components/common/WaveDecoration';

const HeroSection: React.FC = () => (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden pb-16">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute inset-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#smallGrid)" />
                </svg>
            </div>
            
            {/* Decorative circles */}
            <motion.div 
                animate={{ 
                    x: [0, 5, -5, 0],
                    y: [0, -5, 5, 0],
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 20,
                    ease: "easeInOut" 
                }}
                className="absolute -top-10 -left-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"
            />
            <motion.div 
                animate={{ 
                    x: [0, -10, 10, 0],
                    y: [0, 10, -10, 0],
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 15,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute -bottom-20 -right-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"
            />
        </div>
        
        {/* Main hero content */}
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-6xl font-bold mb-8 leading-tight"
                >
                    Master English with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400">
                        Interactive Learning
                    </span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto"
                >
                    Join thousands of students mastering English through our innovative learning platform
                </motion.p>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
                    >
                        Start Learning Free
                    </Link>
                    <Link
                        to="/courses"
                        className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:bg-opacity-10 transform hover:scale-105 transition-all backdrop-blur-sm"
                    >
                        Browse Courses
                    </Link>
                </motion.div>
                
                {/* Stats pill */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-4 mt-12 text-sm"
                >
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-5 py-2 inline-flex items-center border border-white border-opacity-20">
                        <span className="font-bold mr-2">50,000+</span>
                        <span className="text-blue-100">Active Students</span>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-5 py-2 inline-flex items-center border border-white border-opacity-20">
                        <span className="font-bold mr-2">100+</span>
                        <span className="text-blue-100">Interactive Courses</span>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-5 py-2 inline-flex items-center border border-white border-opacity-20">
                        <span className="font-bold mr-2">98%</span>
                        <span className="text-blue-100">Success Rate</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
        
        <WaveDecoration />
    </div>
);

export default HeroSection;
