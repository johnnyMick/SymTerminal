<?php

namespace App\Command;

use App\Server\FileUploadServer;
use App\Server\WebTerminalServer;
use Ratchet\Server\EchoServer;
use Ratchet\App;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsCommand(
    name: 'websocket:start-server',
    description: 'Starts the WebSocket server'
)]
class WebSocketServerCommand extends Command
{
    private $projectDir;

    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->projectDir = $parameterBag->get('kernel.project_dir');
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setHelp('This command starts the WebSocket server on the specified port and address')
            ->addOption('tls', null, InputOption::VALUE_NONE, 'Use secure WebSocket protocol (wss)')
            ->addOption('port', null, InputOption::VALUE_OPTIONAL, 'Port number', 8080)
            ->addOption('host', null, InputOption::VALUE_OPTIONAL, 'HTTP host', 'localhost')
            ->addOption('address', null, InputOption::VALUE_OPTIONAL, 'Bind address', '127.0.0.1');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $secure = $input->getOption('tls') ? 'wss' : 'ws';
        $port = (int) $input->getOption('port');
        $httpHost = $input->getOption('host');
        $address = $input->getOption('address');
        $scheme = ($secure === 'wss') ? 'tls' : 'tcp';

        $context = [
            'tcp' => [],
            'tls' => [
                'local_cert' => $this->projectDir . '/bin/certs/ssl.crt',
                'local_pk' => $this->projectDir . '/bin/certs/ssl.key',
                'verify_peer' => false,
                'allow_self_signed' => true,
                'verify_peer_name' => false,
            ]
        ];

        try {
            $app = new App($httpHost, $port, $scheme . '://' . $address, null, $context);
            $app->route('/', new WebTerminalServer(), ['*']);
            $app->route('/echo', new EchoServer(), ['*']);
            $app->route('/upload/file', new FileUploadServer(), ['*']);
            
            $output->writeln("WebSocket server running at $scheme://$address:$port binding on domain: $secure://$httpHost:$port");
            
            $app->run();
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $output->writeln('<error>Error starting WebSocket server: ' . $e->getMessage() . '</error>');
            return Command::FAILURE;
        }
    }
}