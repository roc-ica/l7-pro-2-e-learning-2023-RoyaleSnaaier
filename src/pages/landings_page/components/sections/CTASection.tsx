import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaGraduationCap, FaGlobe, FaUsers, FaArrowRight, FaClock, FaCheck } from 'react-icons/fa';

const stats = [
    { icon: FaGraduationCap, value: '50,000+', label: 'Graduates' },
    { icon: FaGlobe, value: '120+', label: 'Countries' },
    { icon: FaUsers, value: '98%', label: 'Success Rate' },
];

const CTASection: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setIsValidEmail(false);
            return;
        }
        setIsValidEmail(true);
        setIsSubmitted(true);
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEmail('');
    };

    return (
        <section ref={ref} className="relative py-20 overflow-hidden">
            {/* Background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90">
                <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                    style={{
                        backgroundImage: 'url("/path/to/pattern.png")',
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Enhanced Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="space-y-8 text-white"
                    >
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block px-4 py-2 bg-blue-500 bg-opacity-50 rounded-full text-sm font-semibold"
                            >
                                🎉 Limited Time Offer
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                Transform Your English Skills
                                <span className="block text-blue-200">in Just 3 Months</span>
                            </h2>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={inView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 text-center transform hover:scale-105 transition-transform"
                                >
                                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-sm text-blue-200">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Benefits List */}
                        <div className="space-y-4">
                            {['Personalized Learning Path', 'Native Speaking Teachers', 'Flexible Schedule'].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                    className="flex items-center space-x-3"
                                >
                                    <FaCheck className="text-green-400" />
                                    <span>{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column - Enhanced Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="bg-white p-8 rounded-xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Timer Banner */}
                        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white py-3 px-6 flex items-center justify-center space-x-2">
                            <FaClock className="animate-pulse" />
                            <span>Offer ends in: {formatTime(timeLeft)}</span>
                        </div>

                        <div className="mt-12 space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800">Get Started Now</h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-blue-800">
                                    🎓 Start with a free placement test worth $50
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setIsValidEmail(true);
                                        }}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            !isValidEmail ? 'border-red-500 ring-red-200' : 'border-gray-300'
                                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    {!isValidEmail && (
                                        <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 group"
                                >
                                    <span>Start Your Journey</span>
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <AnimatePresence>
                                {isSubmitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg text-center"
                                    >
                                        <FaCheck className="inline-block mr-2" />
                                        Check your email for next steps!
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Trust Indicators */}
                            <div className="border-t pt-6 mt-6">
                                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                                    <img src="/path/to/ssl-badge.svg" alt="SSL Secure" className="h-10" />
                                    <img src="/path/to/guarantee-badge.svg" alt="Money Back Guarantee" className="h-10" />
                                </div>
                            </div>

                            <div className="text-center text-sm text-gray-500">
                                By signing up, you agree to our{' '}
                                <a href="/terms" className="text-blue-600 hover:underline">Terms</a>
                                {' '}and{' '}
                                <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
