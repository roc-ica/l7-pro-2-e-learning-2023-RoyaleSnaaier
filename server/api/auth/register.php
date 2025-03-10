<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing required fields']);
    exit;
}

try {
    $conn->beginTransaction();

    // Check if email already exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'error' => 'Email already exists']);
        exit;
    }

    // Hash password
    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$data['username'], $data['email'], $password_hash]);
    
    $userId = $conn->lastInsertId();

    // Create default profile
    $stmt = $conn->prepare("
        INSERT INTO user_profiles (
            user_id, 
            first_name, 
            last_name, 
            bio, 
            language_preference,
            interests
        ) VALUES (?, '', '', '', 'en', '[]')
    ");
    $stmt->execute([$userId]);

    // Create default settings
    $stmt = $conn->prepare("
        INSERT INTO user_settings (
            user_id,
            email_notifications,
            achievement_notifications,
            course_updates,
            show_progress,
            show_profile,
            learning_reminders,
            preferred_difficulty,
            daily_goal_minutes,
            theme
        ) VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Beginner', 30, 'light')
    ");
    $stmt->execute([$userId]);

    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $userId,
            'username' => $data['username'],
            'email' => $data['email']
        ]
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Registration failed: ' . $e->getMessage()]);
}
?>
