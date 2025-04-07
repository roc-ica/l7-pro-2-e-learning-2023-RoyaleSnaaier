<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

// Ensure request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['title']) || !isset($data['description']) || !isset($data['difficulty_level']) || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing required fields']);
    exit;
}

// Sanitize and validate data
$title = trim($data['title']);
$description = trim($data['description']);
$difficulty_level = $data['difficulty_level'];
$userId = $data['user_id'];
$imageUrl = $data['image_url'] ?? null;
$status = $data['status'] ?? 'draft'; // Default to draft for user-created courses
// Convert is_public to integer (1 or 0) to avoid type issues
$isPublic = isset($data['is_public']) ? (int)(bool)$data['is_public'] : 1;

// Validate title length
if (strlen($title) < 3 || strlen($title) > 100) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Course title must be between 3 and 100 characters']);
    exit;
}

// Validate difficulty level
$validLevels = ['Beginner', 'Intermediate', 'Advanced'];
if (!in_array($difficulty_level, $validLevels)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Invalid difficulty level']);
    exit;
}

try {
    // Check if title already exists
    $stmt = $conn->prepare("SELECT course_id FROM courses WHERE title = ?");
    $stmt->execute([$title]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'error' => 'Course title already exists']);
        exit;
    }
    
    // Create the new course
    $stmt = $conn->prepare("
        INSERT INTO courses (title, description, difficulty_level, image_url, creator_id, status, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$title, $description, $difficulty_level, $imageUrl, $userId, $status, $isPublic]);
    
    $courseId = $conn->lastInsertId();
    
    // Auto-enroll the creator in their own course
    $stmt = $conn->prepare("
        INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$userId, $courseId]);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Course created successfully',
        'course' => [
            'course_id' => $courseId,
            'title' => $title,
            'description' => $description,
            'difficulty_level' => $difficulty_level,
            'image_url' => $imageUrl,
            'creator_id' => $userId,
            'status' => $status,
            'is_public' => (bool)$isPublic
        ]
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
