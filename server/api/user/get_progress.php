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
    // Get total lessons and completed lessons
    $stmt = $conn->prepare("
        SELECT 
            (SELECT COUNT(*) FROM lessons WHERE status = 'active') as total_lessons,
            COUNT(DISTINCT up.lesson_id) as completed_lessons,
            COALESCE(SUM(up.score), 0) as total_points
        FROM user_progress up
        WHERE up.user_id = ? AND up.completed = 1
    ");
    $stmt->execute([$userId]);
    $progress = $stmt->fetch(PDO::FETCH_ASSOC);

    // Calculate level and milestone
    $total_points = (int)$progress['total_points'];
    if ($total_points >= 2000) {
        $current_level = 'Advanced';
        $next_milestone = 5000;
    } elseif ($total_points >= 1000) {
        $current_level = 'Intermediate';
        $next_milestone = 2000;
    } else {
        $current_level = 'Beginner';
        $next_milestone = 1000;
    }

    // Updated recent activities query to show lessons with course context
    $stmt = $conn->prepare("
        SELECT 
            up.progress_id as id,
            up.completed_at as completion_date,
            'lesson_completed' as activity_type,
            CONCAT(c.title, ' - ', l.title) as activity_name,
            up.score as points_earned,
            l.lesson_id
        FROM user_progress up
        JOIN lessons l ON up.lesson_id = l.lesson_id
        JOIN courses c ON l.course_id = c.course_id
        WHERE up.user_id = ? 
        AND up.completed = 1
        ORDER BY up.completed_at DESC
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_lessons' => (int)$progress['total_lessons'],
            'completed_lessons' => (int)$progress['completed_lessons'],
            'total_points' => $total_points,
            'current_level' => $current_level,
            'next_milestone' => $next_milestone,
            'activities' => array_map(function($activity) {
                return [
                    'id' => (int)$activity['id'],
                    'completion_date' => $activity['completion_date'] ?: date('Y-m-d H:i:s'),
                    'activity_type' => $activity['activity_type'],
                    'activity_name' => $activity['activity_name'],
                    'points_earned' => (int)$activity['points_earned'],
                    'lesson_id' => (int)$activity['lesson_id']
                ];
            }, $activities),
            'achievements' => [],
            'next_lesson' => null
        ]
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
