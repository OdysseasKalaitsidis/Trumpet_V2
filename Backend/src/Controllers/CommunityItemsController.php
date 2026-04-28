<?php

declare(strict_types=1);

namespace Trumpet\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Trumpet\Services\CommunityItemsService;

class CommunityItemsController
{
    private CommunityItemsService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new CommunityItemsService($pdo);
    }

    // ── GET /api/CommunityItems/{community_id} ────────────────────────────────

    public function getByCommId(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $items = $this->service->getItemsByCommunityId($args['community_id']);
        $res->getBody()->write(
            json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
        return $res->withHeader('Content-Type', 'application/json');
    }
}
