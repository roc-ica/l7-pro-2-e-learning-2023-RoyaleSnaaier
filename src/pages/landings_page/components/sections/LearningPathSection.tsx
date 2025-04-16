import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkedAlt, FaLock, FaTrophy, FaChartLine } from 'react-icons/fa';

const features = [
    {
        icon: <FaMapMarkedAlt className="text-4xl text-blue-500" />,
        title: "Personalized Learning Path",
        description: "Follow a customized roadmap tailored to your current English level and goals.",
        color: "from-blue-500 to-blue-600"
    },
    {
        icon: <FaLock className="text-4xl text-purple-500" />,
        title: "Progressive Unlocking",
        description: "Complete lessons in order to unlock new content, ensuring you master the basics before advancing.",
        color: "from-purple-500 to-purple-600"
    },
    {
        icon: <FaTrophy className="text-4xl text-green-500" />,
        title: "Achievement System",
        description: "Earn badges and track your progress as you complete stages and improve your skills.",
        color: "from-green-500 to-green-600"
    },
    {
        icon: <FaChartLine className="text-4xl text-yellow-500" />,
        title: "Progress Tracking",
        description: "Monitor your learning journey with detailed progress indicators and performance metrics.",
        color: "from-yellow-500 to-yellow-600"
    }
];

const LearningPathSection: React.FC = () => {
    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4">How Our Learning Path Works</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Master English systematically through our structured learning roadmap
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <div className={`p-6 bg-gradient-to-r ${feature.color}`}>
                                <div className="bg-white/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-white/90">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl font-bold mb-4"
                        >
                            Ready to Start Your Learning Journey?
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 mb-8"
                        >
                            Access your personalized roadmap and begin learning English systematically.
                            Track your progress, earn achievements, and advance through carefully structured content.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/roadmap"
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View Your Roadmap
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LearningPathSection;
