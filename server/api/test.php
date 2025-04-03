<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

// Simple test endpoint to verify CORS is working
echo json_encode([
    'status' => 'success',
    'message' => 'API is working correctly with CORS enabled',
    'timestamp' => date('Y-m-d H:i:s'),
    'cors_test' => true
]);
?>