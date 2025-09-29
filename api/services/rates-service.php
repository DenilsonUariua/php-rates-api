<?php
require_once __DIR__ . '../../vendor/autoload.php'; // Include Composer autoloader

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class RatesService {
    private $remoteApiUrl = 'https://dev.gondwana-collection.com/Web-Store/Rates/Rates.php';

    private $unitTypeMapping = [
        'Standard Room' => -2147483637,
        'Deluxe Suite' => -2147483456,
    ];

    public function fetchRates($payload) {
        try {
            // Transform payload
            $transformedPayload = $this->transformPayload($payload);
            error_log('Transformed data: ' . print_r($transformedPayload, true));
            // Log request
            $this->log('Request', [
                'original' => $payload,
                'transformed' => $transformedPayload
            ]);

            // Make HTTP request
            $response = $this->makeHttpRequest($transformedPayload);

            // Log response
            $this->log('Response', $response);

            return $response;
        } catch (Exception $e) {
            throw new Exception('Failed to fetch rates: ' . $e->getMessage());
        }
    }

    private function transformPayload($payload) {
        // Validate occupants match ages count
        if (count($payload['Ages']) !== $payload['Occupants']) {
            throw new Exception('Number of ages must match number of occupants');
        }

        // Get Unit Type ID
        $unitTypeId = $this->getUnitTypeId($payload['Unit Name']);

        // Convert dates from dd/mm/yyyy to yyyy-mm-dd
        $arrival = $this->convertDate($payload['Arrival']);
        $departure = $this->convertDate($payload['Departure']);

        // Validate departure is after arrival
        if (strtotime($departure) <= strtotime($arrival)) {
            throw new Exception('Departure date must be after arrival date');
        }

        // Transform ages to guests
        $guests = $this->transformGuests($payload['Ages']);

        return [
            'Unit Type ID' => $unitTypeId,
            'Arrival' => $arrival,
            'Departure' => $departure,
            'Guests' => $guests
        ];
    }

    private function getUnitTypeId($unitName) {
        return $this->unitTypeMapping[$unitName] ?? -2147483637;
    }

    private function convertDate($date) {
        $dateObj = DateTime::createFromFormat('d/m/Y', $date);
        if (!$dateObj) {
            throw new Exception("Invalid date format: $date");
        }
        return $dateObj->format('Y-m-d');
    }

    private function transformGuests($ages) {
        $guests = [];

        foreach ($ages as $age) {
            $ageGroup = '';

            if ($age >= 18) {
                $ageGroup = 'Adult';
            } elseif ($age >= 13) {
                $ageGroup = 'Teens';
            } else {
                $ageGroup = 'Child';
            }

            $guests[] = [
                'AgeGroup' => $ageGroup
            ];
        }

        return $guests;
    }

    private function makeHttpRequest($payload) {
        $client = new Client([
            'base_uri' => $this->remoteApiUrl,
            'timeout' => 30,
            'verify' => false,
        ]);

        try {
            $response = $client->post('', [
                'json' => $payload,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
            ]);

            $httpCode = $response->getStatusCode();
            if ($httpCode !== 200) {
                throw new Exception("Remote API returned status code: $httpCode");
            }

            $decodedResponse = json_decode($response->getBody(), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON response from remote API');
            }

            return $decodedResponse;
        } catch (RequestException $e) {
            throw new Exception('Guzzle HTTP error: ' . $e->getMessage());
        }
    }

    private function log($type, $data) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'type' => $type,
            'data' => $data
        ];

        file_put_contents(
            'logs/api.log',
            json_encode($logEntry) . PHP_EOL,
            FILE_APPEND
        );
    }
}
?>