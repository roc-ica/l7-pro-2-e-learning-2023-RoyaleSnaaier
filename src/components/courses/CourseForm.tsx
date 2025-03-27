import React, { useState } from 'react';

interface CourseFormProps {
  course: {
    title: string;
    description: string;
    difficulty_level: string;
    image_url?: string;
    is_public?: boolean;
  };
  onSubmit: (courseData: any) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    difficulty_level: course.difficulty_level,
    image_url: course.image_url || '',
    is_public: course.is_public !== false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      await onSubmit(formData);
      setMessage({ text: 'Course updated successfully', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to update course', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div 
          className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Course Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Course Description*
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
          Difficulty Level*
        </label>
        <select
          id="difficulty_level"
          name="difficulty_level"
          value={formData.difficulty_level}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL
        </label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter a URL for your course's cover image (optional)
        </p>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          checked={formData.is_public}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
          Make this course public
        </label>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
