<?php

namespace App\Controller\Trait;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

trait BearerTokenAuthTrait
{
    /**
     * Checks for a valid Bearer token in the Authorization header.
     *
     * @throws UnauthorizedHttpException if the token is missing or invalid
     */
    protected function checkBearerToken(Request $request): string
    {
        $authHeader = $request->headers->get('Authorization');
        
        if (!$authHeader) {
            throw new UnauthorizedHttpException('Bearer', 'Missing Authorization header');
        }

        // Check if header starts with 'Bearer '
        if (!preg_match('/^Bearer\s+(.+)$/', $authHeader, $matches)) {
            throw new UnauthorizedHttpException('Bearer', 'Invalid Authorization header format');
        }

        $token = $matches[1];
        
        if (empty($token)) {
            throw new UnauthorizedHttpException('Bearer', 'Bearer token is empty');
        }

        // Optional: Add custom token validation logic here
        // For example, verify against a database or JWT service
        if (!\App\Auth\Jwt::validateToken($token)) {
            throw new UnauthorizedHttpException('Bearer', 'Invalid or expired token');
        }

        return $token;
    }
}