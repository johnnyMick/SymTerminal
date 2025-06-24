<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

class AjaxTerminalController extends AbstractController
{
    #[Route('/terminal/execute', name: 'terminal_execute', methods: ['POST'])]
    public function execute(Request $request): JsonResponse
    {
        $commandStr = trim($request->request->get('command', ''));

        if (empty($commandStr)) {
            return new JsonResponse(['output' => 'No command provided'], 400);
        }

        $application = new Application();
        $application->add(new \App\Command\TerminalCommand());

        $output = new BufferedOutput();
        try {
            $command = $application->find('app:terminal');
            $input = new ArrayInput(['command' => $commandStr]);
            $command->run($input, $output);
            $response = ['output' => $output->fetch()];
            return new JsonResponse($response);
        } catch (\Exception $e) {
            return new JsonResponse(['output' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}