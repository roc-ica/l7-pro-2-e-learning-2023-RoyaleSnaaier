import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { DashboardStats } from '../../types/dashboard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
    ApiActivity, 
    CourseProgress, 
    UserAchievementData, 
    WeeklyProgressData 
} from '../../types/api';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [createdCourses, setCreatedCourses] = useState<any[]>([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setError('Please log in to view your dashboard');
        setLoading(false);
        return;
      }

      try {
        const [progressResponse, coursesResponse] = await Promise.all([
          api.getUserProgress(user.id),
          api.getCourseProgress(user.id)
        ]);

        if (progressResponse.status === 'error') {
          throw new Error(progressResponse.error || 'Failed to fetch user progress');
        }

        if (coursesResponse.status === 'error') {
          throw new Error(coursesResponse.error || 'Failed to fetch course progress');
        }

        const progressData = progressResponse.data;
        const coursesData = coursesResponse.data;

        if (!progressData || !coursesData) {
          throw new Error('Missing required data from server');
        }

        setStats({
          totalLessons: progressData.total_lessons,
          completedLessons: progressData.completed_lessons,
          totalPoints: progressData.total_points,
          currentLevel: progressData.current_level,
          nextMilestone: progressData.next_milestone,
          recentActivities: progressData.activities.map((activity: ApiActivity) => ({
            id: activity.id,
            date: activity.completion_date,
            type: activity.activity_type,
            name: activity.activity_name,
            score: activity.points_earned,
            lessonId: activity.lesson_id
          })),
          courseProgress: coursesData.map((course: CourseProgress) => ({
            courseId: course.course_id,
            title: course.title,
            progress: calculateProgress(course.completed_lessons, course.total_lessons),
            completed: course.completed_lessons,
            total: course.total_lessons,
            total_score: course.total_score,
            lastAccessedLesson: course.last_accessed_lesson || undefined
          })),
          streak: {
            current: progressData.streak?.current || 0,
            longest: progressData.streak?.longest || 0,
            lastActive: progressData.streak?.last_active || new Date().toISOString()
          },
          recentAchievements: progressData.achievements?.map((achievement: UserAchievementData) => ({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            earnedDate: achievement.earned_date,
            icon: achievement.icon
          })) || [],
          timeSpentToday: progressData.time_spent_today || 0,
          dailyGoal: progressData.daily_goal || 30,
          weeklyProgress: progressData.weekly_progress?.map((day: WeeklyProgressData) => ({
            date: day.date,
            minutes: day.minutes || 0,
            completed: day.completed || 0
          })) || Array(7).fill({ date: new Date().toISOString(), minutes: 0, completed: 0 }),
          nextLesson: progressData.next_lesson ? {
            id: progressData.next_lesson.id,
            title: progressData.next_lesson.title,
            courseTitle: progressData.next_lesson.course_title,
            estimatedTime: progressData.next_lesson.estimated_time || 15
          } : undefined
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(`Failed to fetch dashboard data: ${errorMessage}`);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Fetch user's created courses
    const fetchCreatedCourses = async () => {
      if (!user?.id) return;
      
      try {
        const response = await api.getUserCourses(user.id);
        if (response.status === 'success') {
          setCreatedCourses(response.courses || []);
        }
      } catch (err) {
        console.error('Error fetching created courses:', err);
      }
    };
    
    fetchCreatedCourses();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-500 mb-6">Sorry for the inconvenience. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
  
  if (!stats) return <div className="text-center p-8">No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with User Welcome */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {user?.username || 'Learner'}
                </h1>
                <p className="text-blue-100 mt-2">
                  Track your progress, continue learning, and achieve your goals
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20 shadow-lg">
                  <div className="flex space-x-6 text-white">
                    <div className="text-center">
                      <p className="text-blue-200 text-sm">Level</p>
                      <p className="text-2xl font-bold">{stats.currentLevel}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-200 text-sm">Points</p>
                      <p className="text-2xl font-bold">{stats.totalPoints}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-200 text-sm">Progress</p>
                      <p className="text-2xl font-bold">{calculateProgress(stats.completedLessons, stats.totalLessons)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning Section */}
            {stats.nextLesson && (
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">Continue Learning</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <span className="text-xs text-indigo-600 font-medium">UP NEXT</span>
                      <h3 className="text-xl font-semibold text-gray-900 mt-1">{stats.nextLesson.title}</h3>
                      <p className="text-gray-500">{stats.nextLesson.courseTitle}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {stats.nextLesson.estimatedTime} minutes
                      </div>
                    </div>
                    
                    <Link
                      to={`/lesson/${stats.nextLesson.id}`}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg"
                    >
                      Resume Learning
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Course Progress */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Course Progress</h2>
              </div>
              <div className="p-6">
                {stats.courseProgress.length > 0 ? (
                  <div className="space-y-6">
                    {stats.courseProgress.map((course) => (
                      <div key={course.courseId} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mb-1 md:mb-0">{course.title}</h3>
                          <span className="text-sm text-gray-600">
                            {course.completed}/{course.total} Lessons
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="relative w-full sm:w-3/4 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getProgressColor(course.progress)}`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          
                          <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center justify-between sm:justify-end w-full sm:w-auto">
                            <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                            {course.lastAccessedLesson && (
                              <Link 
                                to={`/lesson/${course.lastAccessedLesson}`}
                                className="ml-4 flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <span>Continue</span>
                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">You haven't started any courses yet</p>
                    <Link 
                      to="/courses" 
                      className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
                    >
                      <span>Browse Courses</span>
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Courses Created Section */}
            {createdCourses.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Your Created Courses</h2>
                  <Link 
                    to="/create-course" 
                    className="flex items-center text-sm bg-white text-green-600 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors shadow"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                  </Link>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {createdCourses.slice(0, 4).map(course => (
                      <div key={course.course_id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white font-bold mr-3">
                            {course.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">{course.title}</h3>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                course.status === 'active' ? 'bg-green-100 text-green-800' : 
                                course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">{course.total_lessons || 0} lessons</span>
                              <span className="ml-2 text-xs text-gray-500">{course.student_count || 0} students</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end space-x-2">
                          <Link
                            to={`/course/${course.course_id}`}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            View
                          </Link>
                          <Link
                            to={`/manage-course/${course.course_id}`}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {createdCourses.length > 4 && (
                    <div className="mt-4 text-center">
                      <Link 
                        to="/instructor/courses" 
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        View all courses
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Right Column - 1/3 width on desktop */}
          <div className="space-y-8">
            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Learning Stats</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateProgress(stats.completedLessons, stats.totalLessons)}%
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mt-1">
                      Overall Progress
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.completedLessons}/{stats.totalLessons}
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mt-1">
                      Lessons Complete
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                    <div className="text-2xl font-bold text-indigo-600">
                      {stats.totalPoints}
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mt-1">
                      Total Points
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.currentLevel}
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mt-1">
                      Current Level
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Next level in</span>
                    <span className="text-sm font-medium">{stats.nextMilestone - stats.totalPoints} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                      style={{ width: `${(stats.totalPoints / stats.nextMilestone) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Recent Activities */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-6">
                {stats.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity) => (
                      <div key={activity.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <Link to={`/lesson/${activity.lessonId}`} className="hover:bg-gray-50 flex items-start p-1 rounded-lg transition-colors">
                          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(activity.date)}
                            </p>
                          </div>
                          
                          <div className="ml-3 flex-shrink-0 flex items-center">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                              +{activity.score}
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-400 mb-4">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No recent activity recorded</p>
                    <p className="text-sm text-gray-400 mt-1">Complete lessons to track your progress</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Recent Achievements */}
            {stats.recentAchievements.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">Achievements</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {stats.recentAchievements.slice(0, 4).map((achievement) => (
                      <div key={achievement.id} className="bg-gray-50 rounded-lg p-3 text-center flex flex-col items-center border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined">{achievement.icon}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">{achievement.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  {stats.recentAchievements.length > 4 && (
                    <div className="mt-4 text-center">
                      <Link 
                        to="/achievements" 
                        className="text-amber-600 hover:text-amber-800 font-medium inline-flex items-center"
                      >
                        View all achievements
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/courses"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                >
                  <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm">Browse Courses</span>
                </Link>
                
                <Link
                  to="/roadmap"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                >
                  <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm">Learning Path</span>
                </Link>
                
                <Link
                  to="/achievements"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                >
                  <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-sm">Achievements</span>
                </Link>
                
                <Link
                  to="/profile"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 flex flex-col items-center text-center transition-colors"
                >
                  <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">Your Profile</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
