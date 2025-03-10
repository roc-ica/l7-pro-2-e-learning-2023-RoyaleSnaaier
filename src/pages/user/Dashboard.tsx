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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
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
          // Add missing required properties
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
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center text-red-500 p-8">
        <p className="text-xl font-semibold">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
  if (!stats) return <div className="text-center p-8">No data available</div>;

  const progressPercentage = Math.round((stats.completedLessons / stats.totalLessons) * 100) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your progress and continue learning</p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Keep only these cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Progress</h3>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-blue-600">
              {calculateProgress(stats.completedLessons, stats.totalLessons)}%
            </p>
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
                <circle
                  className="text-blue-600"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - calculateProgress(stats.completedLessons, stats.totalLessons) / 100)}`}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Lessons Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.completedLessons}/{stats.totalLessons}</p>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className={`h-full rounded-full ${getProgressColor(calculateProgress(stats.completedLessons, stats.totalLessons))}`}
              style={{ width: `${calculateProgress(stats.completedLessons, stats.totalLessons)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Current Level</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.currentLevel}</p>
          <p className="text-sm text-gray-600 mt-2">
            {stats.nextMilestone - stats.totalPoints} points to next level
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Score</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalPoints}</p>
          <p className="text-sm text-gray-600 mt-2">Points Earned</p>
        </div>
      </div>

      {/* Next Lesson Preview */}
      {stats.nextLesson && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stats.nextLesson.courseTitle}</p>
              <p className="font-medium">{stats.nextLesson.title}</p>
              <p className="text-sm text-gray-500">Est. time: {stats.nextLesson.estimatedTime} min</p>
            </div>
            <Link
              to={`/lesson/${stats.nextLesson.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Start Lesson →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {stats.recentAchievements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.recentAchievements.map((achievement) => (
              <div key={achievement.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <img src={achievement.icon} alt={achievement.name} className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">{achievement.name}</p>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(achievement.earnedDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Course Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
          <div className="space-y-4">
            {stats.courseProgress.length > 0 ? (
              stats.courseProgress.map((course) => (
                <div key={course.courseId} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{course.title}</h3>
                    <span className="text-sm text-gray-600">
                      {course.completed}/{course.total} Lessons
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-600">
                      Score: {course.total_score} points
                    </p>
                    {course.lastAccessedLesson && (
                      <Link 
                        to={`/lesson/${course.lastAccessedLesson}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Continue →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No courses started yet</p>
                <Link 
                  to="/courses" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <Link 
                    to={`/lesson/${activity.lessonId}`}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <span>{activity.score} points</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <Link
          to="/roadmap"
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-center"
        >
          Continue Learning
        </Link>
        <Link
          to="/courses"
          className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 text-center"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
