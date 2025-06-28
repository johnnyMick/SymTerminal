<?php
namespace App\Server;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Application;

class WebTerminalServer implements MessageComponentInterface
{
    private $clients;
    private $application;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
        $this->application = new Application();
        $this->application->add(new \App\Command\TerminalCommand());
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $output = new BufferedOutput();
        try {
            $command = $this->application->find('app:terminal');
            $input = new ArrayInput(['command' => $msg]);
            $command->run($input, $output);
        } catch (\Exception $e) {
            $output->writeln('Error: ' . $e->getMessage());
        }

        $from->send($output->fetch());
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
        echo "Connection closed! ({$conn->resourceId})\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}