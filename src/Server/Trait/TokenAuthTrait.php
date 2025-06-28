<?php
namespace App\Server\Trait;

use Ratchet\ConnectionInterface;

trait TokenAuthTrait
{
    protected function hasValidToken(ConnectionInterface $conn): bool
    {
        $query = $conn->httpRequest->getUri()->getQuery();
        parse_str($query, $queryParams);
        $token = $queryParams['token']?? null;
        if (!\App\Auth\Jwt::validateToken($token)) {
            $conn->close(4001); // Custom close code for missing token
            echo "Connection closed! No valid token found!\n";
            return false;
        }
        return true;
    }
}