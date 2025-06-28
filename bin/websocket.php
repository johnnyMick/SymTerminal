<?php
require dirname(__DIR__).'/vendor/autoload.php';

use App\Server\FileUploadServer;
use App\Server\WebTerminalServer;
use Ratchet\Server\EchoServer;

$secure = 'wss';
$port = 8080;
$scheme = ($secure === 'wss')? 'tls' : 'tcp'; // tls for wss
$httpHost = 'localhost';
$address = '127.0.0.1'; // 0.0.0.0 or 127.0.0.1
$context = [
    'tcp' => [],
    'tls' => [
        'local_cert' => __DIR__ . '/certs/ssl.crt',     // Path to SSL certificate
        'local_pk' => __DIR__ . '/certs/ssl.key',       // Path to private key
        'verify_peer' => false,                         // Disable for self-signed certs (testing only)
        'allow_self_signed' => true,
        'verify_peer_name' => false,
    ]
];

// Run the server application through the WebSocket protocol on port 8080
$app = new Ratchet\App($httpHost, $port, $scheme.'://'.$address, null, $context);
$app->route('/', new WebTerminalServer(), array('*'));
$app->route('/echo', new EchoServer(), array('*'));
$app->route('/upload/file', new FileUploadServer, array('*'));
echo "WebSocket server running at $scheme://$address:$port binding on domain: $secure://$httpHost:$port \n";
$app->run();