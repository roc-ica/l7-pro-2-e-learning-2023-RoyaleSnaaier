import { get } from 'http';
import { LoginResponse, RegisterResponse, CoursesResponse, CourseDetailsResponse, UserProgressResponse, LessonResponse } from '../types/api';
import { UserAchievement } from '../types/Achievement';

interface UserProfileResponse {
    status: 'success' | 'error';
    data?: {
        username: string;
        email: string;
        joinDate: string;
        totalPoints: number;
        completedLessons: number;
        achievements: number;
    };
    error?: string;
}

interface UpdateUserSettingsResponse {
    status: 'success' | 'error';
    error?: string;
}

interface UpdateProfileData {
    userId?: number;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    location?: string;
    website?: string;
    languagePreference?: string;
    timezone?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
    educationLevel?: string;
    interests?: string[];
    learningGoals?: string;
    avatarUrl?: string;
    emailNotifications?: boolean;
    achievementNotifications?: boolean;
    courseUpdates?: boolean;
    showProgress?: boolean;
    showProfile?: boolean;
    learningReminders?: boolean;
    preferredDifficulty?: string;
    dailyGoalMinutes?: number;
    theme?: string;
}

interface AchievementsResponse {
    status: 'success' | 'error';
    achievements?: UserAchievement[];
    message?: string;
}

// Base API URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Course-related API calls
const courseAPI = {
  getCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/api/courses/get_courses.php`);
    return response.json();
  },
  
  getCourse: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/get_course.php?id=${id}`);
    return response.json();
  },
  
  createCourse: async (courseData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/create_course.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    return response.json();
  },
  
  updateCourse: async (courseData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/update_course.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    return response.json();
  },
  
  deleteCourse: async (courseId: number, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/delete_course.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course_id: courseId, user_id: userId }),
    });
    return response.json();
  },

  createLesson: async (lessonData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/create_lesson.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    return response.json();
  },
  
  updateLesson: async (lessonData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/update_lesson.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    return response.json();
  },
  
  deleteLesson: async (data: { lesson_id: number, user_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/delete_lesson.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  createExercise: async (exerciseData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/create_exercise.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exerciseData),
    });
    return response.json();
  },
  
  updateExercise: async (exerciseData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/update_exercise.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exerciseData),
    });
    return response.json();
  },
  
  deleteExercise: async (data: { exercise_id: number, user_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/delete_exercise.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getCourseStudents: async (courseId: number, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/get_course_students.php?course_id=${courseId}&user_id=${userId}`);
    return response.json();
  },

  getUserCourses: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/courses/get_user_courses.php?user_id=${userId}`);
    return response.json();
  },
};

const api = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    register: async (username: string, email: string, password: string): Promise<RegisterResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/auth/register.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ username, email, password }),
        });
        return response.json();
    },

    getCourses: async (): Promise<CoursesResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/courses/get_courses.php`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getUserProgress: async (userId: number): Promise<UserProgressResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/get_progress.php?user_id=${userId}`, {
                credentials: 'include',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!data || data.status === 'error') {
                throw new Error(data.error || 'Failed to fetch user progress');
            }

            // Ensure all required fields are present
            return {
                status: 'success',
                data: {
                    total_lessons: data.data?.total_lessons || 0,
                    completed_lessons: data.data?.completed_lessons || 0,
                    total_points: data.data?.total_points || 0,
                    current_level: data.data?.current_level || 'Beginner',
                    next_milestone: data.data?.next_milestone || 100,
                    activities: data.data?.activities || [],
                    achievements: [],
                    next_lesson: undefined, // Changed from null to undefined
                    streak: {
                        current: 0,
                        longest: 0,
                        last_active: new Date().toISOString()
                    }
                }
            };
        } catch (error) {
            console.error('getUserProgress error:', error);
            throw error;
        }
    },

    getCourseDetails: async (courseId: number, userId?: number): Promise<CourseDetailsResponse> => {
        const url = new URL(`${API_BASE_URL}/api/courses/get_course.php`);
        url.searchParams.append('id', courseId.toString());
        if (userId) {
            url.searchParams.append('user_id', userId.toString());
        }
        
        const response = await fetch(url.toString(), {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getCourseLessons: async (courseId: number): Promise<CourseDetailsResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/courses/get_lessons.php?course_id=${courseId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getLesson: async (lessonId: number): Promise<LessonResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/lessons/get_lesson.php?id=${lessonId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    submitExercise: async (data: { exercise_id: number; user_id: number; answer: string }): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/exercises/submit_answer.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getLessonCompletion: async (lessonId: number, userId: number): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/lessons/get_completion.php?lesson_id=${lessonId}&user_id=${userId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getCourseProgress: async (userId: number): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/get_course_progress.php?user_id=${userId}`, {
                credentials: 'include',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!data || data.status === 'error') {
                throw new Error(data.error || 'Failed to fetch course progress');
            }

            return {
                status: 'success',
                data: (data.progress || []).map((course: any) => ({
                    course_id: course.courseId || 0,
                    title: course.title || '',
                    completed_lessons: course.completed || 0,
                    total_lessons: course.total || 0,
                    progress_percentage: course.progress || 0,
                    last_accessed: new Date().toISOString(),
                    total_score: course.total_score || 0,
                    last_accessed_lesson: course.last_accessed_lesson
                }))
            };
        } catch (error) {
            console.error('getCourseProgress error:', error);
            throw error;
        }
    },

    getRoadmap: async (userId: number): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/user/get_roadmap.php?user_id=${userId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    resetLessonProgress: async (userId: number, lessonId: number): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/lessons/reset_progress.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, lesson_id: lessonId }),
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
      },

    getUserProfile: async (userId: number | undefined): Promise<UserProfileResponse> => {
        if (!userId) throw new Error('User ID is required');
        const response = await fetch(`${API_BASE_URL}/api/users/get_profile.php?user_id=${userId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    updateUserSettings: async (data: {
        userId: number | undefined;
        email: string;
        currentPassword?: string;
        newPassword?: string;
        profile: {
            firstName: string;
            lastName: string;
            bio: string;
            location: string;
            website: string;
            languagePreference: string;
            timezone: string;
            dateOfBirth: string;
            phoneNumber: string;
            socialLinks: {
                twitter?: string;
                linkedin?: string;
                github?: string;
            };
            educationLevel: string;
            learningGoals: string;
        };
        preferences: {
            showProgress: boolean;
            showProfile: boolean;
            learningReminders: boolean;
            preferredDifficulty: string;
            dailyGoalMinutes: number;
            theme: string;
            emailNotifications: boolean;
            achievementNotifications: boolean;
            courseUpdates: boolean;
        };
    }): Promise<UpdateUserSettingsResponse> => {
        if (!data.userId) throw new Error('User ID is required');
        const response = await fetch(`${API_BASE_URL}/api/users/update_settings.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateProfile: async (data: UpdateProfileData): Promise<{ status: string; error?: string }> => {
        if (!data.userId) throw new Error('User ID is required');
        const response = await fetch(`${API_BASE_URL}/api/users/update_profile.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getAchievements: async (userId: number): Promise<AchievementsResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/user/get_achievements.php?user_id=${userId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getPreviousLessonStatus: async (lessonId: number, userId: number) => {
        try {
            // Remove the extra 'api' from the URL path
            const response = await fetch(`${API_BASE_URL}/api/lessons/check_previous_lesson.php?lesson_id=${lessonId}&user_id=${userId}`, {
                credentials: 'include', // Add these options for CORS
                mode: 'cors'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking previous lesson:', error);
            return { status: 'error', error: 'Failed to check previous lesson status' };
        }
    },

    enrollInCourse: async (userId: number, courseId: number): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/courses/enroll_course.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, course_id: courseId }),
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },

    getEnrolledCourses: async (userId: number): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/api/user/get_enrolled_courses.php?user_id=${userId}`, {
            credentials: 'include',
            mode: 'cors'
        });
        return response.json();
    },
};

export default {
  ...api,
  ...courseAPI,
};
