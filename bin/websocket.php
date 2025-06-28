<?php
require dirname(__DIR__).'/vendor/autoload.php';

use App\Server\FileUploadServer;
use App\Server\WebTerminalServer;
use Ratchet\Server\EchoServer;

$port = 8080;
$httpHost = 'localhost';
$address = '0.0.0.0';

// Run the server application through the WebSocket protocol on port 8080
$app = new Ratchet\App($httpHost, $port, $address);
$app->route('/', new WebTerminalServer(), array('*'));
$app->route('/echo', new EchoServer(), array('*'));
$app->route('/upload/file', new FileUploadServer, array('*'));
echo "WebSocket server running at ws://$address:$port binding on domain: $httpHost \n";
$app->run();