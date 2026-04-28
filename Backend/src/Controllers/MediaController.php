<?php

declare(strict_types=1);

namespace Trumpet\Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Trumpet\Services\StorageService;

class MediaController
{
    private StorageService $storageService;

    public function __construct(array $settings)
    {
        $this->storageService = new StorageService($settings);
    }

    /**
     * GET /api/media/{path}
     *
     * Mirrors media.py — resolves blob URL (SAS or local fallback)
     * and issues a 307 redirect.
     */
    public function redirect(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $blobPath = $args['path'] ?? '';
        $url      = $this->storageService->getBlobUrl($blobPath);

        // If it's a local path (starts with /media/), serve it directly
        if (str_starts_with($url, '/media/')) {
            $resourcesPath = $_ENV['RESOURCES_PATH'] ?? '';
            $subPath       = ltrim(substr($url, 7), '/'); // strip /media/
            $fullPath      = $resourcesPath . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $subPath);

            if (!file_exists($fullPath) || !is_file($fullPath)) {
                return $res->withStatus(404);
            }

            $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
            $mimeType  = match (strtolower($extension)) {
                'mp3'  => 'audio/mpeg',
                'wav'  => 'audio/wav',
                'jpg', 'jpeg' => 'image/jpeg',
                'png'  => 'image/png',
                'gif'  => 'image/gif',
                'pdf'  => 'application/pdf',
                default => 'application/octet-stream'
            };

            $stream = new \Slim\Psr7\Stream(fopen($fullPath, 'rb'));
            return $res
                ->withHeader('Content-Type', $mimeType)
                ->withBody($stream);
        }

        // Otherwise redirect to Azure
        return $res
            ->withHeader('Location', $url)
            ->withStatus(307);
    }
}
