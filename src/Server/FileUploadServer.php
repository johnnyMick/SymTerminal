<?php
namespace App\Server;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class FileUploadServer implements MessageComponentInterface
{
    use Trait\TokenAuthTrait;

    private $clients;
    private $pendingFiles;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
        $this->pendingFiles = []; // Store metadata for connections awaiting binary data
    }

    public function onOpen(ConnectionInterface $conn)
    {
        if (!$this->hasValidToken($conn)) {
            return;
        }
        $this->clients->attach($conn);
        $this->pendingFiles[$conn->resourceId] = null;
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $conn, $msg)
    {
        try {
            // Check if message is JSON (metadata)
            $data = json_decode($msg, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($data['type']) && $data['type'] === 'metadata') {
                // Store metadata and wait for binary data
                $this->pendingFiles[$conn->resourceId] = [
                    'fileName' => $data['fileName'],
                    'fileSize' => $data['fileSize']
                ];
                return;
            }

            // Handle binary data (file content)
            if (isset($this->pendingFiles[$conn->resourceId])) {
                $metadata = $this->pendingFiles[$conn->resourceId];
                $fileName = $metadata['fileName'];
                $fileSize = $metadata['fileSize'];

                // Validate file size
                if (strlen($msg) !== $fileSize) {
                    throw new \Exception('Received file size does not match metadata');
                }

                // Get first 30 bytes for preview
                $fileContentPreview = substr($msg, 0, 30);
                // Attempt to interpret as string; if not readable, use hex
                $isText = @mb_check_encoding($fileContentPreview, 'UTF-8');
                $preview = $isText ? $fileContentPreview : bin2hex($fileContentPreview);

                // Optionally save the file (uncomment to use)
                /*
                $uploadDir = __DIR__ . '/../../public/uploads';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $newFileName = uniqid() . '_' . $fileName;
                file_put_contents($uploadDir . '/' . $newFileName, $msg);
                */

                // Send response back to client
                $response = [
                    'message' => 'File uploaded successfully',
                    'fileName' => $fileName,
                    'fileSize' => $fileSize,
                    'fileContentPreview' => $preview,
                    'isText' => $isText
                ];
                $conn->send(json_encode($response));

                // Clear pending file metadata
                $this->pendingFiles[$conn->resourceId] = null;
            } else {
                throw new \Exception('No metadata received before file content');
            }
        } catch (\Exception $e) {
            $conn->send(json_encode(['error' => $e->getMessage()]));
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
        unset($this->pendingFiles[$conn->resourceId]);
        echo "Connection closed! ({$conn->resourceId})\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->send(json_encode(['error' => $e->getMessage()]));
        $conn->close();
    }
}