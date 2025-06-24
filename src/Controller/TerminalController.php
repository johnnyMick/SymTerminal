<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TerminalController extends AbstractController
{
    #[Route('/', name: 'terminal')]
    public function index(): Response
    {
        return $this->render('terminal/index.html.twig');
    }
}