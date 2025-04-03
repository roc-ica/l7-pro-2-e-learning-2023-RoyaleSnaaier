<?php
// Get the origin of the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// List of allowed origins
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    // Add your production domains when ready
];

// Check if the request origin is allowed
if (in_array($origin, $allowed_origins)) {
    // Allow the specific origin that made the request
    header("Access-Control-Allow-Origin: {$origin}");
    // Allow credentials (cookies, authorization, etc.)
    header("Access-Control-Allow-Credentials: true");
} else {
    // For other origins, use wildcard but don't allow credentials
    header("Access-Control-Allow-Origin: *");
    // Note: We don't set Allow-Credentials for wildcard origins
}

// Allow these headers in requests
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Allow these HTTP methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return early to prevent further processing
    header("HTTP/1.1 200 OK");
    exit();
}
?>
