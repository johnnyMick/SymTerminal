<?php
namespace App\Auth;

class Jwt
{
    public static function getToken():string
    {
        trigger_error('This is a fake JWT token class for testing purpose only!', \E_USER_DEPRECATED);
        return sha1('fake jwt token string for testing purpose');
    }

    public static function validateToken(string $key): bool
    {
        if (empty($key)) {
            return false;
        }
        trigger_error('This is a fake JWT token class for testing purpose only!', \E_USER_DEPRECATED);
        // fake jwt token validation, for testing purpose only
        return $key === self::getToken();
    }
}