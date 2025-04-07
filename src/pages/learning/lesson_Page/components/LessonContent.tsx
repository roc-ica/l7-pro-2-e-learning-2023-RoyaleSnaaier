import React from 'react';

interface LessonContentProps {
  title: string;
  content: string;
}

const LessonContent: React.FC<LessonContentProps> = ({ title, content }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="prose max-w-none mb-6">
          {content}
        </div>
      </div>
    </>
  );
};

export default LessonContent;
