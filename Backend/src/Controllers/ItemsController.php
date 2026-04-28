<?php

declare(strict_types=1);

namespace Trumpet\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Trumpet\Services\ItemsService;
use Trumpet\Services\TaggingService;
use Trumpet\Services\RecommendationService;

class ItemsController
{
    private ItemsService          $itemsService;
    private TaggingService        $taggingService;
    private RecommendationService $recommendationService;

    public function __construct(PDO $pdo, array $settings)
    {
        $this->itemsService          = new ItemsService($pdo);
        $this->taggingService        = new TaggingService($pdo, $settings);
        $this->recommendationService = new RecommendationService($pdo);
    }

    // ── GET /api/items/fields ────────────────────────────────────────────────

    public function getFields(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        return $this->json($res, $this->itemsService->getFields());
    }

    // ── GET /api/items/path-values ───────────────────────────────────────────

    public function getPathValues(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        return $this->json($res, $this->itemsService->getPathValues());
    }

    // ── GET /api/items/path-counts ───────────────────────────────────────────

    public function getPathCounts(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        return $this->json($res, $this->itemsService->getPathCounts());
    }

    // ── GET /api/items/search-all?value=xxx ─────────────────────────────────

    public function searchAllMetadata(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        $value = $req->getQueryParams()['value'] ?? '';
        if ($value === '') {
            return $this->json($res, [], 400);
        }
        return $this->json($res, $this->itemsService->searchAllMetadata($value));
    }

    // ── GET /api/items ───────────────────────────────────────────────────────

    public function getItems(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        $q = $req->getQueryParams();
        $items = $this->itemsService->getItems(
            path:         $q['path']         ?? null,
            search:       $q['search']       ?? null,
            communityId:  $q['communityId']  ?? null,
            collectionId: $q['collectionId'] ?? null,
            page:         (int) ($q['page']     ?? 1),
            pageSize:     (int) ($q['pageSize'] ?? 10)
        );
        return $this->json($res, $items);
    }

    // ── GET /api/items/{id} ──────────────────────────────────────────────────

    public function getItem(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $item = $this->itemsService->getItem($args['id']);
        if ($item === null) {
            return $this->json($res, ['detail' => 'Item not found'], 404);
        }
        return $this->json($res, $item);
    }

    // ── POST /api/items/{id}/tags/generate ───────────────────────────────────

    public function generateTags(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $item = $this->itemsService->getItem($args['id']);
        if ($item === null) {
            return $this->json($res, ['detail' => 'Item not found'], 404);
        }
        $tags = $this->taggingService->generateTags($item);
        return $this->json($res, $tags);
    }

    // ── POST /api/items/tags/generate-all ────────────────────────────────────

    public function generateAllTags(ServerRequestInterface $req, ResponseInterface $res): ResponseInterface
    {
        $count = $this->taggingService->backfillTags();
        return $this->json($res, ['message' => "Tag generation completed for {$count} items."]);
    }

    // ── GET /api/items/{id}/recommendations ──────────────────────────────────

    public function getRecommendations(ServerRequestInterface $req, ResponseInterface $res, array $args): ResponseInterface
    {
        $items = $this->recommendationService->getRecommendations($args['id']);
        return $this->json($res, $items);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function json(ResponseInterface $res, mixed $data, int $status = 200): ResponseInterface
    {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $res
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
