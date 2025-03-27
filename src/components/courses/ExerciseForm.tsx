import React, { useState } from 'react';

interface Option {
  option_text: string;
  is_correct: boolean;
}

interface ExerciseFormProps {
  exercise?: any;
  onSubmit: (exerciseData: any) => void;
  onCancel: () => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ exercise, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    question: exercise?.question || '',
    correct_answer: exercise?.correct_answer || '',
    exercise_type: exercise?.exercise_type || 'Multiple Choice',
    points: exercise?.points || 10,
    options: exercise?.options || [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptionChange = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  const removeOption = (index: number) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate form based on exercise type
    if (formData.exercise_type === 'Multiple Choice') {
      // Ensure at least one option is marked as correct
      const hasCorrectOption = formData.options.some((option: Option) => option.is_correct);
      if (!hasCorrectOption) {
        setError('At least one option must be marked as correct');
        setIsLoading(false);
        return;
      }
      
      // Ensure all options have text
      const emptyOptions = formData.options.some((option: Option) => !option.option_text.trim());
      if (emptyOptions) {
        setError('All options must have text');
        setIsLoading(false);
        return;
      }
    }
    
    try {
      const dataToSubmit = {
        ...formData,
        // For multiple choice, we use the correct option as the correct answer
        correct_answer: formData.exercise_type === 'Multiple Choice' 
          ? formData.options.find((opt: Option) => opt.is_correct)?.option_text || formData.correct_answer
          : formData.correct_answer
      };
      
      await onSubmit(dataToSubmit);
    } catch (err) {
      setError('Failed to save exercise');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold">
        {exercise ? 'Edit Exercise' : 'Add New Exercise'}
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="exercise_type" className="block text-sm font-medium text-gray-700 mb-1">
          Exercise Type*
        </label>
        <select
          id="exercise_type"
          name="exercise_type"
          value={formData.exercise_type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Multiple Choice">Multiple Choice</option>
          <option value="Fill in the blank">Fill in the blank</option>
          <option value="Writing">Writing</option>
        </select>
      </div>

      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Question*
        </label>
        <textarea
          id="question"
          name="question"
          value={formData.question}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your question here"
        ></textarea>
      </div>
      
      {formData.exercise_type !== 'Multiple Choice' && (
        <div>
          <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-1">
            Correct Answer*
          </label>
          <textarea
            id="correct_answer"
            name="correct_answer"
            value={formData.correct_answer}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the correct answer"
          ></textarea>
        </div>
      )}
      
      {formData.exercise_type === 'Multiple Choice' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer Options* (select the correct one)
          </label>
          
          {formData.options.map((option: Option, index: number) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`option_correct_${index}`}
                name="correct_option"
                checked={option.is_correct}
                onChange={() => {
                  // Mark this option as correct and others as incorrect
                  formData.options.forEach((_: Option, i: number) => {
                    handleOptionChange(i, 'is_correct', i === index);
                  });
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <input
                type="text"
                value={option.option_text}
                onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.options.length > 2 && (
                <button 
                  type="button" 
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {formData.options.length < 8 && (
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Option
            </button>
          )}
        </div>
      )}
      
      <div>
        <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          id="points"
          name="points"
          value={formData.points}
          onChange={handleChange}
          min="1"
          max="100"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Saving...' : (exercise ? 'Update Exercise' : 'Add Exercise')}
        </button>
      </div>
    </form>
  );
};

export default ExerciseForm;
