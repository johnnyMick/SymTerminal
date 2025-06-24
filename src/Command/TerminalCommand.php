<?php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:terminal')]
class TerminalCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $rawCommand = $input->getArgument('command');
        $output->writeln("Executing: $rawCommand");
        
        // Split command into name and arguments
        $parts = preg_split('/\s+/', $rawCommand);
        $command = strtolower(array_shift($parts));
        $options = $parts;

        // Add your command logic here
        switch ($command) {
            case 'help':
                $output->writeln('Available commands: help, clear, status, ls [options]');
                $output->writeln('ls options: -l, -a, -la, -al');
                break;
            case 'clear':
                $output->writeln("\033[2J\033[;H");
                break;
            case 'status':
                $output->writeln('System status: OK');
                break;
            case 'ls':
                // Use Unix 'ls' command
                $shellCommand = 'ls';
                // Sanitize and validate options
                $allowedOptions = ['-l', '-a', '-la', '-al']; // Add more as needed
                $sanitizedOptions = [];
                foreach ($options as $opt) {
                    if (in_array($opt, $allowedOptions, true)) {
                        $sanitizedOptions[] = escapeshellarg($opt);
                    } else {
                        $output->writeln("Invalid option: $opt");
                        return Command::FAILURE;
                    }
                }
                // Construct the shell command
                $fullCommand = $shellCommand;
                if (!empty($sanitizedOptions)) {
                    $fullCommand .= ' ' . implode(' ', $sanitizedOptions);
                }
                // Execute the shell command
                $shellOutput = shell_exec($fullCommand);
                $output->writeln($shellOutput ?: 'No files found');
                break;
            default:
                $output->writeln("Command not found: $command");
        }
        
        return Command::SUCCESS;
    }
}