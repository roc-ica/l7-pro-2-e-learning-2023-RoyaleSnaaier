import React from 'react';
import StatisticsSection from './components/sections/StatisticsSection';
import FeaturedCoursesSection from './components/sections/FeaturedCoursesSection';
import LearningPathSection from './components/sections/LearningPathSection';
import TestimonialsSection from './components/sections/TestimonialsSection';
import CTASection from './components/sections/CTASection';
import FeaturesSection from './components/sections/FeaturesSection';
import HeroSection from './components/sections/HeroSection';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <FeaturedCoursesSection />
            <TestimonialsSection />
            <StatisticsSection />
            <LearningPathSection />
            <CTASection />
        </div>
    );
};

export default LandingPage;
