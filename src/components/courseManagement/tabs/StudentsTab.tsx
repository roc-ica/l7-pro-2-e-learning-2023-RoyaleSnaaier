import React from 'react';
import { motion } from 'framer-motion';

interface StudentsTabProps {
  students: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ 
  students, 
  searchQuery, 
  onSearchChange 
}) => {
  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const fullName = (student.name || student.username || '').toLowerCase();
    const username = (student.username || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Enrolled Students</h2>
        <div className="relative">
          <input
            type="text"
            className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13h.01M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="mt-2 text-gray-500 text-lg">No students match your search</p>
                  <button 
                    className="mt-2 text-blue-500 hover:text-blue-700"
                    onClick={() => onSearchChange('')}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No enrolled students</h3>
                  <p className="mt-1 text-gray-500">This course doesn't have any students enrolled yet.</p>
                  <p className="mt-3 text-sm text-gray-500">Publish your course to allow students to enroll.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <motion.tr 
                      key={student.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                            {student.name ? student.name.charAt(0).toUpperCase() : student.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name || student.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(student.enrolled_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-xs">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${student.completion_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {student.completion_percentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.completed_lessons}/{student.total_lessons} lessons completed
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.total_score || 0} points
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;
