import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessMessageProps {
  message: string | null;
  onDismiss: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onDismiss }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          className="fixed top-6 right-6 z-50 max-w-md bg-white border-l-4 border-green-500 p-4 rounded shadow-lg flex items-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button 
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:bg-green-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessMessage;
