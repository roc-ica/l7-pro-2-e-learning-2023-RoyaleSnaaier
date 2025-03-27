import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SectionProvider } from './contexts/SectionContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/landings_page/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/user/Dashboard';
import LessonPage from './pages/learning/lesson_Page/LessonPage';
import RoadmapPage from './pages/learning/roadmap_page/RoadmapPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import CreateCoursePage from './pages/courses/CreateCoursePage';
import CourseManagementPage from './pages/courses/CourseManagementPage';
import LessonEditorPage from './pages/courses/LessonEditorPage';
import PrivateRoute from './components/layout/PrivateRoute';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/profile/SettingsPage';
import Achievements from './pages/Achievements_page/Achievements';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SectionProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/lesson/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
                  <Route path="/roadmap" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/course/:courseId" element={<CourseDetailPage />} /> {/* Make sure this exists */}
                  <Route path="/courses/:courseId" element={<CourseDetailPage />} /> {/* Add this as fallback */}
                  <Route path="/create-course" element={<PrivateRoute><CreateCoursePage /></PrivateRoute>} />
                  
                  {/* New routes for course management */}
                  <Route path="/manage-course/:courseId" element={<PrivateRoute><CourseManagementPage /></PrivateRoute>} />
                  <Route path="/lesson-editor/:lessonId" element={<PrivateRoute><LessonEditorPage /></PrivateRoute>} />
                  
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/achievements" element={<Achievements />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </SectionProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
