import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaPlay, FaThList, FaThLarge, FaLinkedin } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    image: string;
    quote: string;
    rating: number;
    course: string;
    videoUrl?: string;
    linkedIn?: string;
    completionRate: number;
    improvedScore: number;
    studyDuration: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "Business Professional",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
        quote: "The structured learning approach helped me improve my business English significantly. The progress tracking kept me motivated throughout.",
        rating: 5,
        course: "Business English",
        videoUrl: "/videos/sarah-testimonial.mp4",
        linkedIn: "sarah-johnson",
        completionRate: 98,
        improvedScore: 45,
        studyDuration: "3 months"
    },
    {
        id: 2,
        name: "Miguel Rodriguez",
        role: "International Student",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
        quote: "I love how the platform adapts to my learning pace. The interactive exercises make learning English fun and engaging.",
        rating: 5,
        course: "Academic English",
        videoUrl: "/videos/miguel-testimonial.mp4",
        linkedIn: "miguel-rodriguez",
        completionRate: 95,
        improvedScore: 40,
        studyDuration: "4 months"
    },
    {
        id: 3,
        name: "Yuki Tanaka",
        role: "Software Developer",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
        quote: "The technical English course helped me communicate better with my international team. The real-world scenarios are particularly helpful.",
        rating: 5,
        course: "Technical English",
        videoUrl: "/videos/yuki-testimonial.mp4",
        linkedIn: "yuki-tanaka",
        completionRate: 97,
        improvedScore: 42,
        studyDuration: "2 months"
    }
];

const TestimonialsSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewType, setViewType] = useState<'carousel' | 'grid'>('carousel');
    const [ref, inView] = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Auto slide every 5 seconds
    useEffect(() => {
        if (viewType === 'carousel') {
            const interval = setInterval(nextSlide, 7000);
            return () => clearInterval(interval);
        }
    }, [viewType]);

    const handlers = useSwipeable({
        onSwipedLeft: () => nextSlide(),
        onSwipedRight: () => prevSlide(),
    });

    return (
        <section ref={ref} className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                        What Our Students Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Join thousands of satisfied students who have transformed their English skills through our platform
                    </p>

                    {/* View type selector */}
                    <div className="flex justify-center mt-6">
                        <div className="bg-white shadow-md rounded-xl p-1 flex space-x-1">
                            <button
                                onClick={() => setViewType('carousel')}
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    viewType === 'carousel'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                } transition-all`}
                            >
                                <FaThList className="mr-2" />
                                <span>Carousel</span>
                            </button>
                            <button
                                onClick={() => setViewType('grid')}
                                className={`flex items-center px-3 py-2 rounded-lg ${
                                    viewType === 'grid'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                } transition-all`}
                            >
                                <FaThLarge className="mr-2" />
                                <span>All Reviews</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {viewType === 'carousel' ? (
                    <div className="relative" {...handlers}>
                        {/* Carousel Navigation */}
                        <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center z-10 -mt-6 px-4">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                onClick={prevSlide}
                            >
                                <FaChevronLeft className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                onClick={nextSlide}
                            >
                                <FaChevronRight className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Carousel */}
                        <div className="relative h-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                >
                                    {/* Testimonial Card - Left Side */}
                                    <div className="bg-white shadow-xl rounded-xl p-8 relative border border-gray-100">
                                        <div className="absolute top-8 left-8 text-blue-500 opacity-30">
                                            <FaQuoteLeft size={30} />
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-gray-700 text-lg mb-6 pl-8">{testimonials[activeIndex].quote}</p>
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 shadow-sm border border-gray-200">
                                                    <img
                                                        src={testimonials[activeIndex].image || "https://via.placeholder.com/100"}
                                                        alt={testimonials[activeIndex].name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{testimonials[activeIndex].name}</p>
                                                    <p className="text-sm text-gray-500">{testimonials[activeIndex].role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results Card - Right Side */}
                                    <div className="flex flex-col space-y-4">
                                        {/* Course Info */}
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-xl">
                                            <h3 className="text-xl font-medium mb-4">Course Experience</h3>
                                            <div className="flex justify-between mb-3">
                                                <span>Course:</span>
                                                <span className="font-semibold">{testimonials[activeIndex].course}</span>
                                            </div>
                                            <div className="flex justify-between mb-3">
                                                <span>Completion Rate:</span>
                                                <span className="font-semibold">{testimonials[activeIndex].completionRate}%</span>
                                            </div>
                                            <div className="flex justify-between mb-3">
                                                <span>Score Improvement:</span>
                                                <span className="font-semibold">+{testimonials[activeIndex].improvedScore}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Study Duration:</span>
                                                <span className="font-semibold">{testimonials[activeIndex].studyDuration}</span>
                                            </div>
                                        </div>

                                        {/* Video/LinkedIn */}
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                                            <div className="flex items-center space-x-4">
                                                {testimonials[activeIndex].videoUrl && (
                                                    <a
                                                        href={testimonials[activeIndex].videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 py-3 text-center bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                                                    >
                                                        <FaPlay className="inline-block mr-2" /> Watch Video
                                                    </a>
                                                )}
                                                {testimonials[activeIndex].linkedIn && (
                                                    <a
                                                        href={`https://linkedin.com/in/${testimonials[activeIndex].linkedIn}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 py-3 text-center bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-colors"
                                                    >
                                                        <FaLinkedin className="inline-block mr-2" /> LinkedIn
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Slider Indicators */}
                        <div className="flex justify-center mt-8 space-x-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-3 h-3 rounded-full ${
                                        index === activeIndex
                                            ? 'bg-blue-600 w-6 transition-all'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Grid view of all testimonials */
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {testimonials.map((testimonial) => (
                            <motion.div
                                key={testimonial.id}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col"
                            >
                                <div className="text-blue-500 mb-4">
                                    <FaQuoteLeft size={24} />
                                </div>
                                <p className="text-gray-700 mb-6 flex-grow">{testimonial.quote}</p>
                                <div className="flex items-center border-t border-gray-100 pt-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                        <img
                                            src={testimonial.image || "https://via.placeholder.com/100"}
                                            alt={testimonial.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                    <div className="ml-auto">
                                        {testimonial.linkedIn && (
                                            <a
                                                href={`https://linkedin.com/in/${testimonial.linkedIn}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-700 hover:text-blue-900"
                                                aria-label="LinkedIn profile"
                                            >
                                                <FaLinkedin size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
