import React from 'react';
import { motion } from 'framer-motion';

interface CompletionModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div className="bg-white p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-4">🎉 Stage Complete! 🎉</h3>
                <p className="text-gray-600">You've completed all lessons in this stage!</p>
            </div>
        </motion.div>
    );
};

export default CompletionModal;
