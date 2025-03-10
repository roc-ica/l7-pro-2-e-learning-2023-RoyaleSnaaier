# Required API Endpoints

The following endpoints need to be implemented on the backend with proper CORS headers:

```php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
```

## User Progress Endpoints

- GET `/api/user/get_progress.php`
- GET `/api/user/get_streak.php`
- GET `/api/user/get_next_lesson.php`

## Response Formats

### /api/user/get_streak.php
```json
{
    "current_streak": 3,
    "longest_streak": 5,
    "last_active": "2024-02-19T14:26:06.909Z"
}
```

### /api/user/get_next_lesson.php
```json
{
    "next_lesson": {
        "id": 1,
        "title": "Lesson Title",
        "course_title": "Course Title",
        "estimated_time": 15
    }
}
```
