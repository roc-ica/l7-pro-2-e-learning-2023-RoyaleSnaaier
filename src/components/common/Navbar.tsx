import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsDropdown from './NotificationsDropdown';
import SearchModal from './SearchModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  // States for various dropdown menus
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Refs for dropdown menus to handle outside clicks
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  // Function to check if a nav link is active
  const isActivePath = (path: string) => location.pathname === path;
  
  // Function to handle logout
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };
  
  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Function to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open search modal with Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -5, scale: 0.95, transition: { duration: 0.15 } }
  };
  
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Backdrop blur effect for glass morphism */}
      <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-md shadow-sm"></div>
      
      {/* Main navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold">
                <span className="transform group-hover:scale-110 transition-transform">E</span>
              </div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text"
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1 }}
              >
                EduPro
              </motion.span>
            </Link>
            
            {/* Desktop navigation links */}
            <div className="hidden md:flex items-center ml-8 space-x-1">
              <NavLink to="/courses" active={isActivePath('/courses')}>
                Courses
              </NavLink>
              
              {isLoggedIn && (
                <>
                  <NavLink to="/dashboard" active={isActivePath('/dashboard')}>
                    Dashboard
                  </NavLink>
                  
                  <NavLink to="/roadmap" active={isActivePath('/roadmap')}>
                    Learning Path
                  </NavLink>
                  
                  <NavLink to="/achievements" active={isActivePath('/achievements')}>
                    Achievements
                  </NavLink>
                  
                  <NavLink to="/create-course" active={isActivePath('/create-course')}>
                    Create Course
                  </NavLink>
                </>
              )}
            </div>
          </div>
          
          {/* Right side - User actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button 
              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors flex items-center"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className="hidden md:inline-block ml-1 text-sm">
                Search
              </span>
              <span className="hidden md:inline-block ml-2 text-xs text-gray-400 border border-gray-300 rounded px-1">
                Ctrl-K
              </span>
            </button>
            
            {isLoggedIn ? (
              <>
                {/* Notifications dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <motion.span 
                        className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="origin-top-right absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow-lg py-1 z-10"
                      >
                        <NotificationsDropdown 
                          isOpen={isNotificationsOpen}
                          onClose={() => setIsNotificationsOpen(false)}
                          notifications={notifications}
                          onMarkAsRead={markAsRead}
                          onMarkAllAsRead={markAllAsRead}
                          onClearAll={clearAll}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Profile dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-1 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                      {user?.username?.[0].toUpperCase() || 'U'}
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="origin-top-right absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm text-gray-700">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                        </div>
                        
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          Your Profile
                        </Link>
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          Dashboard
                        </Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          Settings
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-1"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hidden sm:inline-flex text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Main menu"
              aria-expanded="false"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden relative z-10 bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              <MobileNavLink to="/courses" active={isActivePath('/courses')}>
                Courses
              </MobileNavLink>
              
              {isLoggedIn ? (
                <>
                  <MobileNavLink to="/dashboard" active={isActivePath('/dashboard')}>
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink to="/roadmap" active={isActivePath('/roadmap')}>
                    Learning Path
                  </MobileNavLink>
                  <MobileNavLink to="/achievements" active={isActivePath('/achievements')}>
                    Achievements
                  </MobileNavLink>
                  <MobileNavLink to="/create-course" active={isActivePath('/create-course')}>
                    Create Course
                  </MobileNavLink>
                  <MobileNavLink to="/profile" active={isActivePath('/profile')}>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink to="/settings" active={isActivePath('/settings')}>
                    Settings
                  </MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" active={isActivePath('/login')}>
                    Log in
                  </MobileNavLink>
                  <Link 
                    to="/register"
                    className="flex w-full items-center justify-center px-3 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </header>
  );
};

// Desktop navigation link component
interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
        active ? 'text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

// Mobile navigation link component
interface MobileNavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
      } transition-colors`}
    >
      {children}
    </Link>
  );
};

export default Navbar;