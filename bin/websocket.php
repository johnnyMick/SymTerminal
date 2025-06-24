<?php
require dirname(__DIR__).'/vendor/autoload.php';

use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\Server\WebSocketServer;
use Ratchet\Server\IoServer;

$port = 8080;
$address = '0.0.0.0';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new WebSocketServer()
        )
    ),
    $port,
    $address
);

echo "WebSocket server running at ws://$address:$port\n";
$server->run();