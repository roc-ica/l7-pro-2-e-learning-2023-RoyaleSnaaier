<?php
require_once '../../config/database.php';
require_once '../../config/cors.php';

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
    $profileStmt = $conn->prepare("
        INSERT INTO user_profiles (
            user_id, first_name, last_name, bio, location, website,
            language_preference, timezone, date_of_birth, phone_number,
            social_links, education_level, learning_goals, interests
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            bio = VALUES(bio),
            location = VALUES(location),
            website = VALUES(website),
            language_preference = VALUES(language_preference),
            timezone = VALUES(timezone),
            date_of_birth = VALUES(date_of_birth),
            phone_number = VALUES(phone_number),
            social_links = VALUES(social_links),
            education_level = VALUES(education_level),
            learning_goals = VALUES(learning_goals),
            interests = VALUES(interests)
    ");

    $profileStmt->execute([
        $userId,
        $data['profile']['firstName'] ?? null,
        $data['profile']['lastName'] ?? null,
        $data['profile']['bio'] ?? null,
        $data['profile']['location'] ?? null,
        $data['profile']['website'] ?? null,
        $data['profile']['languagePreference'] ?? 'en',
        $data['profile']['timezone'] ?? null,
        !empty($data['profile']['dateOfBirth']) ? $data['profile']['dateOfBirth'] : null,
        $data['profile']['phoneNumber'] ?? null,
        isset($data['profile']['socialLinks']) ? json_encode($data['profile']['socialLinks']) : null,
        $data['profile']['educationLevel'] ?? null,
        $data['profile']['learningGoals'] ?? null,
        isset($data['profile']['interests']) ? json_encode($data['profile']['interests']) : '[]'
    ]);

    // Update user_settings
    $settingsStmt = $conn->prepare("
        INSERT INTO user_settings (
            user_id, email_notifications, achievement_notifications,
            course_updates, show_progress, show_profile, learning_reminders,
            preferred_difficulty, daily_goal_minutes, theme
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            email_notifications = VALUES(email_notifications),
            achievement_notifications = VALUES(achievement_notifications),
            course_updates = VALUES(course_updates),
            show_progress = VALUES(show_progress),
            show_profile = VALUES(show_profile),
            learning_reminders = VALUES(learning_reminders),
            preferred_difficulty = VALUES(preferred_difficulty),
            daily_goal_minutes = VALUES(daily_goal_minutes),
            theme = VALUES(theme)
    ");

    $settingsStmt->execute([
        $userId,
        $data['preferences']['emailNotifications'] ?? true,
        $data['preferences']['achievementNotifications'] ?? true,
        $data['preferences']['courseUpdates'] ?? true,
        $data['preferences']['showProgress'] ?? true,
        $data['preferences']['showProfile'] ?? true,
        $data['preferences']['learningReminders'] ?? true,
        $data['preferences']['preferredDifficulty'] ?? 'Beginner',
        $data['preferences']['dailyGoalMinutes'] ?? 30,
        $data['preferences']['theme'] ?? 'light'
    ]);

    // Update user email if provided
    if (isset($data['email'])) {
        $emailStmt = $conn->prepare("UPDATE users SET email = ? WHERE user_id = ?");
        $emailStmt->execute([$data['email'], $userId]);
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

    // Fetch and return updated profile
    $stmt = $conn->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
    $stmt->execute([$userId]);
    $updatedProfile = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $updatedProfile
    ]);

} catch(Exception $e) {
    $conn->rollBack();
    echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
}
?>
