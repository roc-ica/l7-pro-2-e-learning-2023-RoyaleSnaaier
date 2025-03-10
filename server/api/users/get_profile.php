<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'User ID is required']);
    exit;
}

try {
    // Get user data with profile and settings
    $stmt = $conn->prepare("
        SELECT 
            u.user_id,
            u.username,
            u.email,
            u.created_at as joinDate,
            p.*,
            s.*,
            (
                SELECT COUNT(DISTINCT lesson_id) 
                FROM user_progress 
                WHERE user_id = u.user_id AND completed = 1
            ) as completedLessons,
            (
                SELECT COALESCE(SUM(e.points), 0)
                FROM user_progress up
                JOIN exercises e ON up.lesson_id = e.lesson_id
                WHERE up.user_id = u.user_id AND up.completed = 1
            ) as totalPoints,
            (
                SELECT COUNT(DISTINCT lesson_id)
                FROM user_progress
                WHERE user_id = u.user_id AND score >= 80
            ) as achievements
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        LEFT JOIN user_settings s ON u.user_id = s.user_id
        WHERE u.user_id = ?
    ");
    
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'User not found']);
        exit;
    }

    // Format the response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'username' => $userData['username'],
            'email' => $userData['email'],
            'joinDate' => $userData['joinDate'],
            'totalPoints' => (int)$userData['totalPoints'],
            'completedLessons' => (int)$userData['completedLessons'],
            'achievements' => (int)$userData['achievements'],
            'profile' => [
                'firstName' => $userData['first_name'],
                'lastName' => $userData['last_name'],
                'bio' => $userData['bio'],
                'location' => $userData['location'],
                'website' => $userData['website'],
                'languagePreference' => $userData['language_preference'],
                'timezone' => $userData['timezone'],
                'phoneNumber' => $userData['phone_number'],
                'educationLevel' => $userData['education_level'],
                'interests' => json_decode($userData['interests'] ?? '[]'),
                'learningGoals' => $userData['learning_goals'],
                'socialLinks' => json_decode($userData['social_links'] ?? '{}')
            ],
            'preferences' => [
                'preferredDifficulty' => $userData['preferred_difficulty'],
                'dailyGoalMinutes' => (int)$userData['daily_goal_minutes'],
                'theme' => $userData['theme'],
                'showProgress' => (bool)$userData['show_progress'],
                'learningReminders' => (bool)$userData['learning_reminders'],
                'showProfile' => (bool)$userData['show_profile'],
                'emailNotifications' => (bool)$userData['email_notifications'],
                'achievementNotifications' => (bool)$userData['achievement_notifications'],
                'courseUpdates' => (bool)$userData['course_updates']
            ]
        ]
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Failed to load profile: ' . $e->getMessage()]);
}
?>
