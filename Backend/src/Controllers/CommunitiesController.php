<?php

declare(strict_types=1);

namespace Trumpet\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Trumpet\Services\CommunitiesService;

class CommunitiesController
{
    private CommunitiesService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new CommunitiesService($pdo);
    }

    // ── GET /api/communities?path=xxx ────────────────────────────────────────

    public function getCommunities(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        $path        = $req->getQueryParams()['path'] ?? null;
        $communities = $this->service->getCommunities($path);
        return $this->json($res, $communities);
    }

    // ── GET /api/communities/{id} ─────────────────────────────────────────────

    public function getCommunity(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $community = $this->service->getCommunity($args['id']);
        if ($community === null) {
            return $this->json($res, ['detail' => 'Community not found'], 404);
        }
        return $this->json($res, $community);
    }

    private function json(ResponseInterface $res, mixed $data, int $status = 200): ResponseInterface
    {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $res
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
