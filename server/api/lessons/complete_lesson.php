<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../services/AchievementChecker.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['user_id'] ?? null;
$lessonId = $data['lesson_id'] ?? null;

if (!$userId || !$lessonId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing parameters']);
    exit;
}

try {
    $conn->beginTransaction();

    // Mark lesson as completed
    $stmt = $conn->prepare("
        INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()
    ");
    $stmt->execute([$userId, $lessonId]);

    // Check for achievements
    $achievementChecker = new AchievementChecker($conn, $userId);
    $newAchievements = $achievementChecker->checkAndUpdateAchievements();

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Lesson completed successfully',
        'new_achievements' => $newAchievements
    ]);

} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
}
?>
