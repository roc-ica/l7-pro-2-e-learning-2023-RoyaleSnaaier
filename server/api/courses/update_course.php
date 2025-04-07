<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

// Ensure request is PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['course_id']) || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Course ID and User ID are required']);
    exit;
}

$courseId = $data['course_id'];
$userId = $data['user_id'];

try {
    // Check if the user is the creator of the course
    $stmt = $conn->prepare("SELECT creator_id FROM courses WHERE course_id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Course not found']);
        exit;
    }
    
    if ($course['creator_id'] != $userId) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to update this course']);
        exit;
    }
    
    // Build the update query based on provided fields
    $updateFields = [];
    $params = [];
    
    if (isset($data['title'])) {
        $updateFields[] = "title = ?";
        $params[] = trim($data['title']);
    }
    
    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $params[] = trim($data['description']);
    }
    
    if (isset($data['difficulty_level'])) {
        $validLevels = ['Beginner', 'Intermediate', 'Advanced'];
        if (!in_array($data['difficulty_level'], $validLevels)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Invalid difficulty level']);
            exit;
        }
        $updateFields[] = "difficulty_level = ?";
        $params[] = $data['difficulty_level'];
    }
    
    if (isset($data['image_url'])) {
        $updateFields[] = "image_url = ?";
        $params[] = $data['image_url'];
    }
    
    if (isset($data['status'])) {
        $validStatuses = ['active', 'draft', 'archived'];
        if (!in_array($data['status'], $validStatuses)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Invalid status']);
            exit;
        }
        $updateFields[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (isset($data['is_public'])) {
        // Convert to integer (0 or 1) - important for boolean fields
        $data['is_public'] = $data['is_public'] ? 1 : 0;
        $updateFields[] = "is_public = ?";
        $params[] = $data['is_public'];
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'error' => 'No fields to update']);
        exit;
    }
    
    // Add course_id to params
    $params[] = $courseId;
    
    // Update the course
    $stmt = $conn->prepare("
        UPDATE courses 
        SET " . implode(", ", $updateFields) . "
        WHERE course_id = ?
    ");
    $stmt->execute($params);
    
    // Get the updated course
    $stmt = $conn->prepare("SELECT * FROM courses WHERE course_id = ?");
    $stmt->execute([$courseId]);
    $updatedCourse = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Course updated successfully',
        'course' => $updatedCourse
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
