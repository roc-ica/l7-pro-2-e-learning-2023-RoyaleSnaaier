import React, { createContext, useContext, useState } from 'react';

interface SectionContextType {
    activeSection: string;
    setActiveSection: (section: string) => void;
    sectionRefs: {
        [key: string]: React.RefObject<HTMLDivElement>;
    };
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeSection, setActiveSection] = useState('hero');
    const sectionRefs = {
        hero: React.createRef<HTMLDivElement>(),
        features: React.createRef<HTMLDivElement>(),
        courses: React.createRef<HTMLDivElement>(),
        testimonials: React.createRef<HTMLDivElement>(),
        statistics: React.createRef<HTMLDivElement>(),
        learningPath: React.createRef<HTMLDivElement>(),
        cta: React.createRef<HTMLDivElement>(),
    };

    return (
        <SectionContext.Provider value={{ activeSection, setActiveSection, sectionRefs }}>
            {children}
        </SectionContext.Provider>
    );
};

export const useSectionContext = () => {
    const context = useContext(SectionContext);
    if (!context) {
        throw new Error('useSectionContext must be used within a SectionProvider');
    }
    return context;
};
