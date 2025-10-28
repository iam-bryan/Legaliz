<?php

/**
 * Gemini API Handler
 * Handles all interactions with Google's Gemini AI API
 * Uses GEMINI_API_KEY from .htaccess environment variable
 */

/**
 * Core function to make any cURL call to the Gemini API.
 * 
 * @param string $url The full API endpoint URL
 * @param array $payload The JSON payload to send
 * @return array Response data or error array
 */
function _callGeminiAPI(string $url, array $payload): array {
    // Get API key from .htaccess SetEnv
    $apiKey = $_SERVER['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
    
    if (empty($apiKey)) {
        return ['error' => 'GEMINI_API_KEY environment variable not set.'];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'x-goog-api-key: ' . $apiKey
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 120 // Increased timeout for potentially long summaries
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        return ['error' => "cURL Error: " . $err];
    }

    $decoded = json_decode($response, true);
    
    // Check for API-level errors first
    if (isset($decoded['error'])) {
        return ['error' => "Gemini API Error: " . ($decoded['error']['message'] ?? json_encode($decoded['error']))];
    }
    
    if ($httpCode !== 200) {
        return ['error' => "Gemini API returned HTTP status {$httpCode}. Response: " . $response];
    }

    return $decoded ?? ['error' => "Invalid JSON response from API."];
}

/**
 * Call Gemini API to generate embeddings for text.
 * 
 * @param string $text The text to generate embeddings for
 * @return array Success array with embedding values or error array
 */
function callGeminiEmbeddingAPI(string $text): array {
    $model = 'text-embedding-004';
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:embedContent";
    $payload = [
        "model" => "models/{$model}",
        "content" => ["parts" => [["text" => $text]]]
    ];

    $data = _callGeminiAPI($url, $payload);

    if (isset($data['error'])) {
        return ['error' => $data['error']];
    }

    if (isset($data['embedding']['values'])) {
        return ['success' => $data['embedding']['values']];
    } else {
        return ['error' => "Unexpected Gemini embedding response: " . json_encode($data)];
    }
}

/**
 * Call Gemini API for text generation.
 * Uses gemini-2.0-flash model with high token limit for comprehensive responses.
 * 
 * @param string $prompt The prompt to send to Gemini
 * @return array Success array with generated text or error array
 */
function callGeminiTextGenerationAPI(string $prompt): array {
    // Using a powerful, available model for high-quality summaries
    $model = 'gemini-2.0-flash-exp'; 
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";
    $payload = [
        "contents" => [
            ["parts" => [["text" => $prompt]]]
        ],
        "generationConfig" => [
            "temperature" => 0.5,
            "maxOutputTokens" => 8192 // Increased token limit to prevent MAX_TOKENS error
        ]
    ];

    $data = _callGeminiAPI($url, $payload);

    if (isset($data['error'])) {
        return ['error' => $data['error']];
    }
    
    // Gracefully handle the response
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
    $finishReason = $data['candidates'][0]['finishReason'] ?? 'UNKNOWN';

    if ($text !== null) {
        $responseText = $text;
        // If the response was stopped because it was too long, add a friendly warning instead of an error.
        if ($finishReason === 'MAX_TOKENS') {
            $responseText .= "\n\n[Warning: The AI's response was cut short because it exceeded the maximum length.]";
        }
        return ['success' => $responseText];
    } else {
        // Handle cases where there is no text at all (e.g., safety blocks)
        if ($finishReason === 'SAFETY' || $finishReason === 'OTHER') {
             return ['error' => "Gemini blocked the response due to: " . $finishReason];
        }
        return ['error' => "Unexpected Gemini response (no text found): " . json_encode($data)];
    }
}