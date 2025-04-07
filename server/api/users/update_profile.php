<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? null;

if (!$userId) {
    echo json_encode(['status' => 'error', 'error' => 'User ID is required']);
    exit;
}

try {
    $conn->beginTransaction();

    // Update user_profiles
    $stmt = $conn->prepare("
        UPDATE user_profiles SET
            first_name = ?,
            last_name = ?,
            bio = ?,
            location = ?,
            website = ?,
            language_preference = ?,
            timezone = ?,
            date_of_birth = ?,
            phone_number = ?,
            social_links = ?,
            education_level = ?,
            interests = ?,
            learning_goals = ?,
            avatar_url = ?
        WHERE user_id = ?
    ");

    $stmt->execute([
        $data['firstName'] ?? null,
        $data['lastName'] ?? null,
        $data['bio'] ?? null,
        $data['location'] ?? null,
        $data['website'] ?? null,
        $data['languagePreference'] ?? 'en',
        $data['timezone'] ?? null,
        $data['dateOfBirth'] ?? null,
        $data['phoneNumber'] ?? null,
        json_encode($data['socialLinks'] ?? []),
        $data['educationLevel'] ?? null,
        json_encode($data['interests'] ?? []),
        $data['learningGoals'] ?? null,
        $data['avatarUrl'] ?? null,
        $userId
    ]);

    // Update user_settings
    $stmt = $conn->prepare("
        UPDATE user_settings SET
            email_notifications = ?,
            achievement_notifications = ?,
            course_updates = ?,
            show_progress = ?,
            show_profile = ?,
            learning_reminders = ?,
            preferred_difficulty = ?,
            daily_goal_minutes = ?,
            theme = ?
        WHERE user_id = ?
    ");

    $stmt->execute([
        $data['emailNotifications'] ?? true,
        $data['achievementNotifications'] ?? true,
        $data['courseUpdates'] ?? true,
        $data['showProgress'] ?? true,
        $data['showProfile'] ?? true,
        $data['learningReminders'] ?? true,
        $data['preferredDifficulty'] ?? 'Beginner',
        $data['dailyGoalMinutes'] ?? 30,
        $data['theme'] ?? 'light',
        $userId
    ]);

    // Update email if provided
    if (isset($data['email'])) {
        $stmt = $conn->prepare("UPDATE users SET email = ? WHERE user_id = ?");
        $stmt->execute([$data['email'], $userId]);
    }

    // Update password if provided
    if (!empty($data['currentPassword']) && !empty($data['newPassword'])) {
        $stmt = $conn->prepare("SELECT password_hash FROM users WHERE user_id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['currentPassword'], $user['password_hash'])) {
            $newPasswordHash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
            $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
            $stmt->execute([$newPasswordHash, $userId]);
        } else {
            throw new Exception('Current password is incorrect');
        }
    }

    $conn->commit();
    echo json_encode(['status' => 'success']);
} catch(Exception $e) {
    $conn->rollBack();
    echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
}
?>
