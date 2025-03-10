import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
    FaBook, FaGraduationCap, FaClock, FaLaptop, 
    FaTrophy, FaChartLine, FaUsers, FaGlobe 
} from 'react-icons/fa';

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}> = ({ icon, title, description, index }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView();

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            animate={controls}
            initial="hidden"
            variants={{
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.1 }
                },
                hidden: { opacity: 0, y: 20 }
            }}
            className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300"
        >
            <div className="text-3xl text-blue-600 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </motion.div>
    );
};

const FeaturesSection: React.FC = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView();
    
    const features = [
        { icon: <FaBook />, title: "Structured Learning", description: "Progressive courses from beginner to advanced" },
        { icon: <FaGraduationCap />, title: "Expert Teachers", description: "Learn from qualified instructors" },
        { icon: <FaClock />, title: "Learn at Your Pace", description: "Flexible schedule that fits your life" },
        { icon: <FaLaptop />, title: "Interactive Practice", description: "Real-world scenarios and exercises" },
        { icon: <FaTrophy />, title: "Achievement System", description: "Earn badges and track progress" },
        { icon: <FaChartLine />, title: "Progress Tracking", description: "Detailed analytics and insights" },
        { icon: <FaUsers />, title: "Community Support", description: "Connect with fellow learners" },
        { icon: <FaGlobe />, title: "Global Access", description: "Learn from anywhere, anytime" }
    ];

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

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
                    <h2 className="text-4xl font-bold mb-4">Why Choose LearnHub?</h2>
                    <p className="text-xl text-gray-600">Everything you need to master English effectively</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
