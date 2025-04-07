<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../services/AchievementChecker.php';

header('Content-Type: application/json');

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
    exit;
}

try {
    // Check achievements first
    $checker = new AchievementChecker($conn, $userId);
    $checker->checkAllAchievements();

    // Get updated achievements
    $stmt = $conn->prepare("
        SELECT 
            a.*,
            COALESCE(ua.progress, 0) as progress,
            ua.unlocked_at,
            JSON_UNQUOTE(a.requirements) as requirements,
            JSON_UNQUOTE(a.rewards) as rewards
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id 
            AND ua.user_id = :userId
        ORDER BY 
            FIELD(a.rarity, 'legendary', 'epic', 'rare', 'common'),
            a.category
    ");

    $stmt->execute(['userId' => $userId]);
    $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    foreach ($achievements as &$achievement) {
        $achievement['requirements'] = json_decode($achievement['requirements'], true);
        $achievement['rewards'] = json_decode($achievement['rewards'], true);
    }

    echo json_encode([
        'status' => 'success',
        'achievements' => $achievements
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
