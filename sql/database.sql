-- Create database if not exists
CREATE DATABASE IF NOT EXISTS learning_application;
USE learning_application;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS exercise_attempts;
DROP TABLE IF EXISTS exercise_options;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- Create tables with proper constraints
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'draft', 'archived') DEFAULT 'active',
    creator_id INT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE lessons (
    lesson_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    order_number INT NOT NULL,
    estimated_minutes INT DEFAULT 30,
    status ENUM('active', 'draft', 'archived') DEFAULT 'active',
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_lesson_order (course_id, order_number)
);

-- Exercises table
CREATE TABLE exercises (
    exercise_id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    exercise_type ENUM('Multiple Choice', 'Fill in the blank', 'Writing') NOT NULL,
    points INT DEFAULT 10,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);

-- Multiple choice options table
CREATE TABLE exercise_options (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

-- User Progress table
CREATE TABLE user_progress (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    lesson_id INT,
    completed BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id),
    UNIQUE KEY unique_user_lesson (user_id, lesson_id)
);

-- User Exercise Attempts table
CREATE TABLE exercise_attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    exercise_id INT,
    user_answer TEXT,
    is_correct BOOLEAN,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

-- Add user_profiles table
CREATE TABLE user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(50) DEFAULT NULL,
    last_name VARCHAR(50) DEFAULT NULL,
    bio TEXT,
    location VARCHAR(100) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    language_preference VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    phone_number VARCHAR(20) DEFAULT NULL,
    social_links JSON DEFAULT ('{}'),
    education_level VARCHAR(50) DEFAULT NULL,
    interests JSON DEFAULT ('[]'),
    learning_goals TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add user_settings table
CREATE TABLE user_settings (
    settings_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    achievement_notifications BOOLEAN DEFAULT TRUE,
    course_updates BOOLEAN DEFAULT TRUE,
    show_progress BOOLEAN DEFAULT TRUE,
    show_profile BOOLEAN DEFAULT TRUE,
    learning_reminders BOOLEAN DEFAULT TRUE,
    preferred_difficulty VARCHAR(20) DEFAULT 'Beginner',
    daily_goal_minutes INT DEFAULT 30,
    dyslexic_preference BOOLEAN DEFAULT FALSE,
    theme VARCHAR(20) DEFAULT 'light',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add achievements table
CREATE TABLE achievements (
    achievement_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    category ENUM('learning', 'social', 'milestone', 'special') NOT NULL,
    max_progress INT NOT NULL DEFAULT 1,
    rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL,
    requirements JSON DEFAULT NULL,
    rewards JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user achievements table
CREATE TABLE user_achievements (
    user_id INT,
    achievement_id VARCHAR(50),
    progress INT DEFAULT 0,
    unlocked_at TIMESTAMP NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE
);

-- Add achievement_history table for tracking progress
CREATE TABLE achievement_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    achievement_id VARCHAR(50),
    action_type ENUM('progress', 'unlock') NOT NULL,
    old_value INT,
    new_value INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE
);

CREATE TABLE course_enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at DATETIME NOT NULL,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- Add indexes for performance
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_achievement_history_user ON achievement_history(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
