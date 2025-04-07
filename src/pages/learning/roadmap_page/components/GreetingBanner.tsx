import React from 'react';

interface GreetingBannerProps {
    onClose: () => void;
}

const GreetingBanner: React.FC<GreetingBannerProps> = ({ onClose }) => {
    return (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome to your learning journey!</h2>
            <p className="text-gray-600">Complete lessons to progress through your roadmap.</p>
            <button 
                onClick={onClose}
                className="mt-2 text-blue-500 hover:text-blue-600"
            >
                Got it!
            </button>
        </div>
    );
};

export default GreetingBanner;
