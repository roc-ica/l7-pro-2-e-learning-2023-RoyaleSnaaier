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
        image: "/images/testimonials/sarah.jpg",
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
        image: "/images/testimonials/miguel.jpg",
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
        image: "/images/testimonials/yuki.jpg",
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isGridView, setIsGridView] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        if (!isPaused) {
            const timer = setInterval(nextTestimonial, 5000);
            return () => clearInterval(timer);
        }
    }, [isPaused]);

    const handlers = useSwipeable({
        onSwipedLeft: nextTestimonial,
        onSwipedRight: prevTestimonial,
    });

    const filteredTestimonials = testimonials.filter(
        t => selectedCourse === 'all' || t.course === selectedCourse
    );

    const courses = ['all', ...testimonials
        .map(t => t.course)
        .filter((course, index, array) => array.indexOf(course) === index)
    ];

    return (
        <section ref={ref} className="py-20 bg-gray-50" aria-label="Testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
                    <p className="text-xl text-gray-600">Real stories from our successful learners</p>
                </motion.div>

                <div className="flex justify-between items-center mb-8">
                    <div className="flex space-x-2">
                        {courses.map(course => (
                            <button
                                key={course}
                                onClick={() => setSelectedCourse(course)}
                                className={`px-4 py-2 rounded-full ${
                                    selectedCourse === course 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-600'
                                }`}
                            >
                                {course}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsGridView(!isGridView)}
                        className="p-2 rounded-lg hover:bg-gray-200"
                    >
                        {isGridView ? <FaThList size={20} /> : <FaThLarge size={20} />}
                    </button>
                </div>

                {isGridView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTestimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <div className="relative mb-4">
                                    {testimonial.videoUrl && (
                                        <button
                                            onClick={() => setIsVideoPlaying(true)}
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg"
                                        >
                                            <FaPlay className="text-white text-3xl" />
                                        </button>
                                    )}
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                </div>
                                <p className="text-gray-600 mb-4 italic text-lg leading-relaxed">
                                    {testimonial.quote}
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                                        <img
                                            src={testimonial.image}
                                            alt={`${testimonial.name}'s portrait`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                                        <p className="text-gray-500">{testimonial.role}</p>
                                        <p className="text-blue-600">{testimonial.course}</p>
                                    </div>
                                </div>
                                {testimonial.linkedIn && (
                                    <a
                                        href={`https://linkedin.com/in/${testimonial.linkedIn}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-4"
                                    >
                                        <FaLinkedin />
                                        <span>View LinkedIn Profile</span>
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="relative max-w-4xl mx-auto"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        {...handlers}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="relative">
                                            {testimonials[currentIndex].videoUrl && !isVideoPlaying ? (
                                                <button
                                                    onClick={() => setIsVideoPlaying(true)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg"
                                                >
                                                    <FaPlay className="text-white text-3xl" />
                                                </button>
                                            ) : null}
                                            {isVideoPlaying ? (
                                                <video
                                                    autoPlay
                                                    controls
                                                    className="w-full rounded-lg"
                                                    src={testimonials[currentIndex].videoUrl}
                                                />
                                            ) : (
                                                <img
                                                    src={testimonials[currentIndex].image}
                                                    alt={testimonials[currentIndex].name}
                                                    className="w-full rounded-lg"
                                                />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {testimonials[currentIndex].completionRate}%
                                                </div>
                                                <div className="text-sm text-gray-600">Completion</div>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">
                                                    +{testimonials[currentIndex].improvedScore}%
                                                </div>
                                                <div className="text-sm text-gray-600">Improvement</div>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {testimonials[currentIndex].studyDuration}
                                                </div>
                                                <div className="text-sm text-gray-600">Duration</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="mb-6">
                                            <FaQuoteLeft className="text-4xl text-blue-500 opacity-50" />
                                        </div>
                                        <p className="text-gray-600 mb-8 italic text-lg leading-relaxed">
                                            {testimonials[currentIndex].quote}
                                        </p>
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                                                <img
                                                    src={testimonials[currentIndex].image}
                                                    alt={`${testimonials[currentIndex].name}'s portrait`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">{testimonials[currentIndex].name}</h4>
                                                <p className="text-gray-500">{testimonials[currentIndex].role}</p>
                                                <p className="text-blue-600">{testimonials[currentIndex].course}</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="flex items-center" aria-label={`${testimonials[currentIndex].rating} out of 5 stars`}>
                                                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className="w-5 h-5 text-yellow-400"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {testimonials[currentIndex].linkedIn && (
                                            <a
                                                href={`https://linkedin.com/in/${testimonials[currentIndex].linkedIn}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <FaLinkedin />
                                                <span>View LinkedIn Profile</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                            aria-label="Previous testimonial"
                        >
                            <FaChevronLeft className="text-blue-500" />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                            aria-label="Next testimonial"
                        >
                            <FaChevronRight className="text-blue-500" />
                        </button>

                        <div className="flex justify-center mt-8 gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index === currentIndex ? 'bg-blue-500 w-6' : 'bg-gray-300'
                                    }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
