import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import WaveDecoration from '../../../../components/common/WaveDecoration';

const HeroSection: React.FC = () => (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden pb-16">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
                <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                    Master English with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                        Interactive Learning
                    </span>
                </h1>
                <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto">
                    Join thousands of students mastering English through our innovative learning platform
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
                    >
                        Start Learning Free
                    </Link>
                    <Link
                        to="/courses"
                        className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all"
                    >
                        Browse Courses
                    </Link>
                </div>
            </motion.div>
        </div>
        <WaveDecoration />
    </div>
);

export default HeroSection;
