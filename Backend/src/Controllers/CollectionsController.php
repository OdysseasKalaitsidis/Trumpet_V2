<?php

declare(strict_types=1);

namespace Trumpet\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Trumpet\Services\CollectionsService;

class CollectionsController
{
    private CollectionsService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new CollectionsService($pdo);
    }

    // ── GET /api/collections ─────────────────────────────────────────────────

    public function getCollections(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        return $this->json($res, $this->service->getCollections());
    }

    // ── GET /api/collections/mappings ────────────────────────────────────────

    public function getMappings(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        return $this->json($res, $this->service->getMappings());
    }

    // ── GET /api/collections/{id} ─────────────────────────────────────────────

    public function getCollection(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $collection = $this->service->getCollection($args['id']);
        if ($collection === null) {
            return $this->json($res, ['detail' => 'Collection not found'], 404);
        }
        return $this->json($res, $collection);
    }

    private function json(ResponseInterface $res, mixed $data, int $status = 200): ResponseInterface
    {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $res
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
