<?php
// index.php - Main API Entry Point
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in production

// Include service files
require_once __DIR__ . '/services/validation-service.php';
require_once __DIR__ . '/services/rates-service.php';

// Set headers (suppress errors in case headers already sent)
@header('Content-Type: application/json; charset=utf-8');
@header('Access-Control-Allow-Origin: *');
@header('Access-Control-Allow-Methods: POST, OPTIONS');
@header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get request method safely with fallback
$requestMethod = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

// Handle preflight requests (CORS)
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.',
        'received_method' => $requestMethod,
        'server_info' => [
            'php_sapi' => php_sapi_name(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
        ]
    ], JSON_PRETTY_PRINT);
    exit();
}

// Get raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check for JSON parsing errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON format',
        'json_error' => json_last_error_msg(),
        'raw_input' => substr($input, 0, 200) // First 200 chars for debugging
    ], JSON_PRETTY_PRINT);
    exit();
}

// Main request handler
try {
    // Validate input
    $validator = new Validator();
    $rules = [
        'Unit Name' => 'required|string',
        'Arrival' => 'required|date_dmy',
        'Departure' => 'required|date_dmy',
        'Occupants' => 'required|integer|min:1',
        'Ages' => 'required|array'
    ];
     error_log("Validation data: " . print_r($data, true));
    if (!$validator->validate($data, $rules)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->getErrors()
        ], JSON_PRETTY_PRINT);
        exit();
    }
    
    // Validate each age is an integer
    foreach ($data['Ages'] as $index => $age) {
        if (!is_int($age) || $age < 0) {
            http_response_code(422);
            echo json_encode([
                'success' => false,
                'message' => "All ages must be positive integers. Invalid age at index $index: " . var_export($age, true)
            ], JSON_PRETTY_PRINT);
            exit();
        }
    }
   
    // Fetch rates from Gondwana API
    $ratesService = new RatesService();
    $rates = $ratesService->fetchRates($data);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $rates,
        'message' => 'Rates fetched successfully'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}