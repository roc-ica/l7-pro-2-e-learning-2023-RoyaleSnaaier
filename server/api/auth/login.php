<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing email or password']);
    exit;
}

try {
    // Get user data along with profile and settings
    $stmt = $conn->prepare("
        SELECT 
            u.user_id,
            u.username,
            u.email,
            u.password_hash,
            u.created_at,
            u.last_login,
            p.*,
            s.*
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        LEFT JOIN user_settings s ON u.user_id = s.user_id
        WHERE u.email = ?
    ");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'error' => 'Invalid credentials']);
        exit;
    }

    // Update last login
    $stmt = $conn->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);

    // Get user stats
    $stmt = $conn->prepare("
        SELECT 
            COUNT(DISTINCT CASE WHEN up.completed = 1 THEN l.lesson_id END) as completed_lessons,
            COALESCE(SUM(CASE WHEN up.completed = 1 THEN e.points ELSE 0 END), 0) as total_points,
            COUNT(DISTINCT CASE WHEN up.completed = 1 AND up.score >= 80 THEN l.lesson_id END) as achievements
        FROM users u
        LEFT JOIN user_progress up ON u.user_id = up.user_id
        LEFT JOIN lessons l ON up.lesson_id = l.lesson_id
        LEFT JOIN exercises e ON l.lesson_id = e.lesson_id
        WHERE u.user_id = ?
        GROUP BY u.user_id
    ");
    $stmt->execute([$user['user_id']]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Remove sensitive data
    unset($user['password_hash']);

    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'profile' => [
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'bio' => $user['bio'],
                'languagePreference' => $user['language_preference'],
                'socialLinks' => json_decode($user['social_links'] ?? '{}'),
                'interests' => json_decode($user['interests'] ?? '[]')
            ],
            'preferences' => [
                'theme' => $user['theme'],
                'showProgress' => (bool)$user['show_progress'],
                'emailNotifications' => (bool)$user['email_notifications'],
                'learningReminders' => (bool)$user['learning_reminders'],
                'preferredDifficulty' => $user['preferred_difficulty'],
                'dailyGoalMinutes' => (int)$user['daily_goal_minutes']
            ],
            'stats' => $stats
        ]
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Login failed: ' . $e->getMessage()]);
}
?>
