import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type StatColor = 'blue' | 'green' | 'purple' | 'yellow';

interface Statistic {
    value: string;
    label: string;
    prefix?: string;
    suffix?: string;
    description?: string;
    color: StatColor;
    icon?: string;
    detail?: string;
}

type ColorMap = Record<StatColor, string>;

const StatisticsSection: React.FC = () => {
    const [hoveredStat, setHoveredStat] = useState<number | null>(null);
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    const stats: Statistic[] = [
        {
            value: "50000",
            label: "Active Learners",
            suffix: "+",
            description: "Students worldwide",
            color: "blue",
            icon: "👨‍🎓",
            detail: "Join our growing community of learners from over 150 countries"
        },
        {
            value: "95",
            label: "Success Rate",
            suffix: "%",
            description: "Course completion",
            color: "green",
            icon: "🎯",
            detail: "Our students consistently achieve their learning goals"
        },
        {
            value: "100",
            label: "Interactive Courses",
            suffix: "+",
            description: "Across all levels",
            color: "purple",
            icon: "📚",
            detail: "Carefully crafted courses from beginner to advanced levels"
        },
        {
            value: "4.8",
            label: "User Rating",
            suffix: "/5",
            description: "From verified users",
            color: "yellow",
            icon: "⭐",
            detail: "Based on over 10,000 student reviews"
        }
    ];

    return (
        <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="absolute inset-0 bg-dots opacity-50" />
                </motion.div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={inView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-block mb-4"
                    >
                        <span className="text-6xl">📊</span>
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                        Our Impact in Numbers
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Join thousands of successful learners who have transformed their English skills with us
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.label}
                            stat={stat}
                            index={index}
                            inView={inView}
                            isHovered={hoveredStat === index}
                            onHover={() => setHoveredStat(index)}
                            onLeave={() => setHoveredStat(null)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const StatCard: React.FC<{
    stat: Statistic;
    index: number;
    inView: boolean;
    isHovered: boolean;
    onHover: () => void;
    onLeave: () => void;
}> = ({ stat, index, inView, isHovered, onHover, onLeave }) => {
    const colors: ColorMap = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        yellow: "from-yellow-500 to-yellow-600"
    } as const;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onHoverStart={onHover}
            onHoverEnd={onLeave}
            className="relative group"
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 -m-2 bg-white rounded-2xl shadow-2xl z-10 p-6"
                    >
                        <div className="h-full flex flex-col justify-center items-center">
                            <span className="text-4xl mb-4">{stat.icon}</span>
                            <p className="text-gray-600 text-center">{stat.detail}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-xl" />
            <div className="relative bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 group-hover:scale-105">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${colors[stat.color]} text-white mb-6`}>
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ type: "spring", duration: 0.8, delay: index * 0.1 }}
                        className="text-xl font-bold"
                    >
                        {stat.prefix || ''}
                        {stat.value.charAt(0)}
                    </motion.span>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                    <div className="flex items-baseline justify-center mb-2">
                        <CountUpValue 
                            value={parseFloat(stat.value)} 
                            inView={inView} 
                            delay={index * 0.1}
                        />
                        {stat.suffix && (
                            <span className="text-2xl font-bold ml-1">{stat.suffix}</span>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</h3>
                    {stat.description && (
                        <p className="text-sm text-gray-600">{stat.description}</p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

const CountUpValue: React.FC<{ value: number; inView: boolean; delay: number }> = ({ value, inView, delay }) => {
    const [displayValue, setDisplayValue] = React.useState(0);
    const duration = 2000; // 2 seconds
    const steps = 60;

    React.useEffect(() => {
        if (!inView) return;

        let startTimestamp: number;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            setDisplayValue(progress * value);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        const timeoutId = setTimeout(() => {
            requestAnimationFrame(step);
        }, delay * 1000);

        return () => clearTimeout(timeoutId);
    }, [inView, value, delay]);

    return (
        <span className="text-4xl font-bold">
            {Number.isInteger(value) ? Math.round(displayValue) : displayValue.toFixed(1)}
        </span>
    );
};

export default StatisticsSection;
