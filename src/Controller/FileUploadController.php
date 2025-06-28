<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class FileUploadController extends AbstractController
{
    use  Trait\BearerTokenAuthTrait;
    
    #[Route('/file/upload', name: 'file_upload', methods: ['POST'])]
    public function uploadAction(Request $request): JsonResponse
    {
        $token = $this->checkBearerToken($request);
        // Check if a file was uploaded
        if (!$request->files->has('file')) {
            return new JsonResponse(['error' => 'No file uploaded'], 400);
        }

        // Get the uploaded file
        $file = $request->files->get('file');

        // Validate the file
        if (!$file->isValid()) {
            return new JsonResponse(['error' => 'Invalid file upload'], 400);
        }

        // Get file details
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();

        // Read the first 30 characters of the file
        $fileContent = file_get_contents($file->getPathname(), false, null, 0, 30);

        // Optionally move the file to a directory (uncomment to use)
        /*
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        $newFileName = uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move($uploadDir, $newFileName);
        */

        // Return file details in the response
        return new JsonResponse([
            'message' => 'File uploaded successfully',
            'fileName' => $fileName,
            'fileSize' => $fileSize,
            'fileContentPreview' => "$fileContent...."
        ], 200);
    }
}