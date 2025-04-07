import React, { useState, useMemo } from 'react';

interface ExerciseHistoryItem {
    exercise_id: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    attempted_at: string;
}

interface Props {
    history: ExerciseHistoryItem[];
    onClose: () => void;
}

const ExerciseHistory: React.FC<Props> = ({ history, onClose }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

    const stats = useMemo(() => {
        const correct = history.filter(item => item.is_correct).length;
        return {
            total: history.length,
            correct,
            incorrect: history.length - correct,
            successRate: Math.round((correct / history.length) * 100) || 0
        };
    }, [history]);

    const filteredAndSortedHistory = useMemo(() => {
        let filtered = [...history];
        
        // Apply filter
        if (activeTab === 'correct') {
            filtered = filtered.filter(item => item.is_correct);
        } else if (activeTab === 'incorrect') {
            filtered = filtered.filter(item => !item.is_correct);
        }

        // Apply sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.attempted_at).getTime();
            const dateB = new Date(b.attempted_at).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [history, activeTab, sortBy]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Exercise History</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Total Attempts</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Correct</p>
                        <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Incorrect</p>
                        <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 border-b flex justify-between items-center">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('correct')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'correct' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}
                        >
                            Correct
                        </button>
                        <button
                            onClick={() => setActiveTab('incorrect')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'incorrect' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}
                        >
                            Incorrect
                        </button>
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {filteredAndSortedHistory.map((item, index) => (
                        <div 
                            key={`${item.exercise_id}-${index}`} 
                            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-medium text-lg">{item.question}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    item.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {item.is_correct ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                                    <p className="font-medium">{item.user_answer}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50">
                                    <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                                    <p className="font-medium text-blue-700">{item.correct_answer}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                Attempted: {new Date(item.attempted_at).toLocaleString()}
                            </p>
                        </div>
                    ))}

                    {filteredAndSortedHistory.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No attempts found for the selected filter.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseHistory;
