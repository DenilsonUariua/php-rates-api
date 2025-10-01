# PHP Rates API

This project is a full-stack application consisting of a Next.js client and a PHP backend. The backend acts as a proxy to fetch rates from an external API, and the client provides a user interface to interact with it.

## Project Structure

The project is divided into two main parts:

-   `client/`: A Next.js/React frontend application.
-   `api/`: A PHP-based backend API.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [pnpm](https://pnpm.io/)
-   [PHP](https://www.php.net/) (v7.4 or newer)
-   [Composer](https://getcomposer.org/)

### Installation

#### Client

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install the dependencies using pnpm:
    ```bash
    pnpm install
    ```

#### API

1.  Navigate to the `api` directory:
    ```bash
    cd api
    ```
2.  Install the PHP dependencies using Composer:
    ```bash
    composer install
    ```

### Running the Application

#### Client

1.  Make sure you are in the `client` directory.
2.  Run the development server:
    ```bash
    pnpm dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

#### API

1.  Make sure you are in the `api` directory.
2.  Start the PHP built-in web server:
    ```bash
    php -S localhost:8000
    ```
    The API will be available at [http://localhost:8000](http://localhost:8000).

## API

The PHP backend provides a single endpoint to fetch rates.

### Endpoint: `/`

-   **Method:** `POST`
-   **Description:** Fetches rates based on the provided booking details.
-   **Request Body:**

    ```json
    {
      "Unit Name": "Standard Room",
      "Arrival": "dd/mm/yyyy",
      "Departure": "dd/mm/yyyy",
      "Occupants": 1,
      "Ages": [30]
    }
    ```

-   **Success Response (200 OK):**

    ```json
    {
      "success": true,
      "data": {
        // Rates data from the external API
      },
      "message": "Rates fetched successfully"
    }
    ```

-   **Error Response (4xx/5xx):**

    ```json
    {
      "success": false,
      "message": "Error message",
      "errors": {
        // Validation errors, if any
      }
    }
    ```

## Technologies Used

### Client (Frontend)

-   [Next.js](https://nextjs.org/)
-   [React](https://reactjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [shadcn/ui](https://ui.shadcn.com/)
-   [pnpm](https://pnpm.io/)

### API (Backend)

-   [PHP](https.php.net)
-   [Composer](https://getcomposer.org/)
-   [Guzzle](https://github.com/guzzle/guzzle)