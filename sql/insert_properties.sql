USE learning_application;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE exercise_attempts;
TRUNCATE TABLE exercise_options;
TRUNCATE TABLE exercises;
TRUNCATE TABLE user_progress;
TRUNCATE TABLE lessons;
TRUNCATE TABLE courses;
TRUNCATE TABLE users;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE user_settings;
TRUNCATE TABLE achievement_history;
TRUNCATE TABLE user_achievements;
TRUNCATE TABLE achievements;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert courses with proper structure
INSERT INTO courses (title, description, difficulty_level, image_url) VALUES
('English Basics', 'Master the fundamentals of English language including basic grammar, vocabulary, and everyday phrases.', 'Beginner', 
'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60'),
('Business English', 'Learn professional English for workplace communication, including email writing and business terminology.', 'Intermediate',
'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60'),
('Advanced Writing', 'Perfect your written English with advanced grammar, style, and composition techniques.', 'Advanced',
'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60');

-- Insert well-structured lessons for English Basics course
INSERT INTO lessons (course_id, title, content, order_number) VALUES
(1, 'Greetings and Introductions', 
'Learn essential English greetings and how to introduce yourself professionally.\n\n
Key Topics:\n
- Common greetings for different times of day\n
- Formal vs informal introductions\n
- Cultural considerations in greetings\n
- Practice dialogues', 1),

(1, 'Simple Present Tense', 
'Understanding and using the simple present tense effectively.\n\n
Key Topics:\n
- Formation of simple present tense\n
- Regular and irregular verbs\n
- Third person singular rules\n
- Common use cases and examples', 2),

(1, 'Basic Questions', 
'Learn how to form and answer basic questions in English.\n\n
Key Topics:\n
- Yes/No questions\n
- WH questions\n
- Question word order\n
- Common question patterns', 3),

(1, 'Numbers and Counting', 'Learn to count and use numbers in English.\n\nKey Topics:\n- Cardinal numbers\n- Ordinal numbers\n- Dates and time\n- Phone numbers and prices', 4),
(1, 'Daily Routines', 'Vocabulary and phrases for describing daily activities.\n\nKey Topics:\n- Time expressions\n- Common activities\n- Schedule planning\n- Frequency adverbs', 5),
(1, 'Family and Relationships', 'Learn vocabulary for family members and relationships.\n\nKey Topics:\n- Family tree vocabulary\n- Possessive adjectives\n- Describing relationships\n- Family traditions', 6);

-- Insert lessons for Business English course
INSERT INTO lessons (course_id, title, content, order_number) VALUES
(2, 'Professional Email Writing', 
'Master the art of writing clear and effective business emails.\n\n
Key Topics:\n
- Email structure and format\n
- Professional greetings and closings\n
- Common email phrases\n
- Email etiquette', 1),

(2, 'Meeting Vocabulary', 
'Essential vocabulary and phrases for business meetings.\n\n
Key Topics:\n
- Meeting terminology\n
- Scheduling meetings\n
- Participating in discussions\n
- Taking and sharing minutes', 2),

(2, 'Negotiation Skills', 'Essential phrases and strategies for business negotiations.\n\nKey Topics:\n- Negotiation vocabulary\n- Making proposals\n- Reaching agreements\n- Handling objections', 3),
(2, 'Presentation Techniques', 'Learn to deliver effective business presentations.\n\nKey Topics:\n- Structure and organization\n- Visual aids\n- Engaging your audience\n- Handling Q&A', 4),
(2, 'Business Reports', 'Writing clear and concise business reports.\n\nKey Topics:\n- Report structure\n- Data presentation\n- Executive summaries\n- Recommendations', 5);

-- Insert lessons for Advanced Writing course
INSERT INTO lessons (course_id, title, content, order_number) VALUES
(3, 'Essay Structure', 'Master academic essay writing.\n\nKey Topics:\n- Thesis statements\n- Body paragraphs\n- Transitions\n- Conclusions', 1),
(3, 'Research Methods', 'Conducting and documenting research.\n\nKey Topics:\n- Source evaluation\n- Citations\n- Bibliography\n- Avoiding plagiarism', 2),
(3, 'Academic Style', 'Understanding academic writing conventions.\n\nKey Topics:\n- Formal language\n- Objective tone\n- Technical vocabulary\n- Style guides', 3);

-- Insert sample exercises for Greetings lesson
INSERT INTO exercises (lesson_id, question, correct_answer, exercise_type, points) VALUES
(1, 'What is the appropriate greeting for morning?', 'Good morning', 'Multiple Choice', 10),
(1, 'Select the most formal greeting:', 'How do you do?', 'Multiple Choice', 10),
(1, 'Fill in the blank: "___ afternoon" (formal greeting)', 'Good', 'Fill in the blank', 15),

-- Daily Routines exercises
(5, 'What time do you usually ___ up?', 'wake', 'Fill in the blank', 10),
(5, 'Select the correct frequency adverb: "I ___ go to the gym." (3 times per week)', 'usually', 'Multiple Choice', 10),
(5, 'Complete the sentence: "She ___ breakfast at 8 AM."', 'has', 'Fill in the blank', 10),

-- Business Email exercises
(4, 'Which is the most appropriate email opening?', 'Dear Mr. Smith,', 'Multiple Choice', 15),
(4, 'Complete the closing: "Best ___,"', 'regards', 'Fill in the blank', 10),
(4, 'Choose the most professional way to request a meeting:', 'I would like to schedule a meeting at your earliest convenience.', 'Multiple Choice', 15),

-- Advanced exercises for Writing course
(7, 'What is the main component of a thesis statement?', 'Central argument', 'Multiple Choice', 20),
(7, 'A good conclusion should:', 'Summarize main points and restate thesis', 'Multiple Choice', 20),
(8, 'What citation style is commonly used in humanities?', 'MLA', 'Multiple Choice', 15),
(8, 'In academic writing, sources should be:', 'Peer-reviewed and credible', 'Multiple Choice', 15),
(9, 'Choose the most appropriate academic phrase:', 'The research suggests that', 'Multiple Choice', 20);

-- Insert exercise options
INSERT INTO exercise_options (exercise_id, option_text, is_correct) VALUES
-- Morning greeting options
(1, 'Good morning', TRUE),
(1, 'Good night', FALSE),
(1, 'Hey there', FALSE),
(1, 'Yo', FALSE),

-- Formal greeting options
(2, 'How do you do?', TRUE),
(2, 'Hey!', FALSE),
(2, 'Hi there!', FALSE),
(2, 'What''s up?', FALSE),

-- Frequency adverb options
(4, 'usually', TRUE),
(4, 'never', FALSE),
(4, 'always', FALSE),
(4, 'rarely', FALSE),

-- Email opening options
(5, 'Dear Mr. Smith,', TRUE),
(5, 'Hey Smith!', FALSE),
(5, 'Hi there,', FALSE),
(5, 'Yo Mr. S,', FALSE),

-- Meeting request options
(6, 'I would like to schedule a meeting at your earliest convenience.', TRUE),
(6, 'We need to meet ASAP!', FALSE),
(6, 'When are you free to chat?', FALSE),
(6, 'Let''s catch up soon.', FALSE),

-- Thesis statement options
(7, 'Central argument', TRUE),
(7, 'List of topics', FALSE),
(7, 'Table of contents', FALSE),
(7, 'Bibliography', FALSE),

-- Conclusion options
(8, 'Summarize main points and restate thesis', TRUE),
(8, 'Introduce new topics', FALSE),
(8, 'Only repeat the thesis', FALSE),
(8, 'List references', FALSE),

-- Citation style options
(9, 'MLA', TRUE),
(9, 'Python', FALSE),
(9, 'HTML', FALSE),
(9, 'JSON', FALSE);

-- Insert achievement data
INSERT INTO achievements (achievement_id, title, description, icon, category, max_progress, rarity, requirements, rewards) VALUES
-- Learning Achievements
('first_lesson', 'First Steps', 'Complete your first lesson', 'school', 'learning', 1, 'common', 
    '["Complete 1 lesson"]', 
    '["50 XP", "Beginner Badge"]'),
('perfect_score', 'Perfect Score', 'Get all answers correct in a lesson', 'stars', 'learning', 1, 'rare',
    '["Answer all questions correctly in one attempt"]',
    '["100 XP", "Perfectionist Badge"]'),
('fast_learner', 'Speed Demon', 'Complete 5 lessons in one day', 'speed', 'learning', 5, 'epic',
    '["Complete 5 different lessons in 24 hours"]',
    '["250 XP", "Speed Learning Badge"]'),
('master_student', 'Course Master', 'Complete all lessons in a course', 'workspace_premium', 'learning', 1, 'legendary',
    '["Complete every lesson in a single course"]',
    '["500 XP", "Master Badge"]'),

-- Social Achievements
('discussion_starter', 'Discussion Starter', 'Start your first discussion', 'forum', 'social', 1, 'common',
    '["Create your first discussion post"]',
    '["30 XP", "Socializer Badge"]'),
('helpful_answer', 'Helpful Hand', 'Get 3 "helpful" votes on your answers', 'volunteer_activism', 'social', 3, 'rare',
    '["Receive 3 helpful votes from other students"]',
    '["100 XP", "Helper Badge"]'),
('community_pillar', 'Community Pillar', 'Help 10 other students', 'diversity_3', 'social', 10, 'epic',
    '["Help 10 different students with their questions"]',
    '["300 XP", "Community Leader Badge"]'),

-- Milestone Achievements
('week_streak', 'Consistent Learner', 'Study for 7 days in a row', 'calendar_month', 'milestone', 7, 'common',
    '["Log in and complete at least one lesson daily for 7 consecutive days"]',
    '["150 XP", "Consistency Badge"]'),
('month_master', 'Monthly Master', 'Complete 30 lessons in a month', 'event_available', 'milestone', 30, 'epic',
    '["Complete 30 different lessons within a calendar month"]',
    '["400 XP", "Monthly Champion Badge"]'),
('course_collector', 'Course Collector', 'Start 5 different courses', 'collections_bookmark', 'milestone', 5, 'rare',
    '["Enroll in and start 5 different courses"]',
    '["200 XP", "Explorer Badge"]'),
('quiz_champion', 'Quiz Champion', 'Score 100% on 5 different quizzes', 'quiz', 'milestone', 5, 'legendary',
    '["Achieve perfect scores on 5 different lesson quizzes"]',
    '["500 XP", "Quiz Master Badge"]'),

-- Special Achievements
('early_bird', 'Early Bird', 'Complete a lesson before 7 AM', 'wb_twilight', 'special', 1, 'rare',
    '["Complete any lesson before 7:00 AM local time"]',
    '["150 XP", "Early Riser Badge"]'),
('night_owl', 'Night Owl', 'Complete a lesson after 11 PM', 'bedtime', 'special', 1, 'rare',
    '["Complete any lesson after 23:00 local time"]',
    '["150 XP", "Night Scholar Badge"]'),
('weekend_warrior', 'Weekend Warrior', 'Study for 4 hours on a weekend', 'weekend', 'special', 1, 'epic',
    '["Spend 4 cumulative hours studying on Saturday or Sunday"]',
    '["250 XP", "Weekend Champion Badge"]'),
('holiday_hero', 'Holiday Hero', 'Study on a public holiday', 'celebration', 'special', 1, 'legendary',
    '["Complete at least one lesson on a recognized public holiday"]',
    '["300 XP", "Holiday Spirit Badge"]');

-- Insert some sample progress data
INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at) VALUES
(1, 'first_lesson', 1, NOW()),
(1, 'discussion_starter', 1, NOW()),
(1, 'early_bird', 1, NOW()),
(2, 'first_lesson', 1, NOW()),
(2, 'perfect_score', 1, NOW()),
(2, 'week_streak', 7, NOW()),
(3, 'first_lesson', 1, NOW()),
(3, 'night_owl', 1, NOW());

-- Insert sample achievement history
INSERT INTO achievement_history (user_id, achievement_id, action_type, old_value, new_value) VALUES
(1, 'first_lesson', 'unlock', 0, 1),
(2, 'perfect_score', 'progress', 0, 1),
(2, 'perfect_score', 'unlock', 1, 1),
(3, 'week_streak', 'progress', 5, 6);