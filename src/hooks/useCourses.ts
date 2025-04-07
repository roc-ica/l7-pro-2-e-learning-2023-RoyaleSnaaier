import { useState, useEffect } from 'react';
import api from '../services/api';
import { Course } from '../types/course';

export const useCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.getCourses();
                if (response.status === 'success' && response.courses) {
                    setCourses(response.courses);
                } else {
                    setError('Failed to fetch courses');
                }
            } catch (err) {
                setError('Error loading courses');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return { courses, isLoading, error };
};
