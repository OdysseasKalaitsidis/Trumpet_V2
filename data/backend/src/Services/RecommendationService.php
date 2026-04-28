<?php

declare(strict_types=1);

namespace Trumpet\Services;

use PDO;

/**
 * RecommendationService
 *
 * Mirrors recommendation_service.py — finds items sharing the most trumpet.tag
 * metadata values with the source item, ordered by match count.
 *
 * This is pure SQL — no Python CLI needed (the logic is just GROUP BY + ORDER BY).
 */
class RecommendationService
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    /**
     * Returns up to $maxResults items that share the most tags with $itemId.
     */
    public function getRecommendations(string $itemId, int $maxResults = 5): array
    {
        // ── 1. Get tags of the source item ──────────────────────────────────
        $tagsStmt = $this->pdo->prepare(
            "SELECT `Value` FROM MetadataValues
             WHERE ItemId = :id AND `Field` = 'trumpet.tag'"
        );
        $tagsStmt->execute([':id' => $itemId]);
        $sourceTags = $tagsStmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($sourceTags)) {
            return [];
        }

        // ── 2. Find other items sharing these tags ───────────────────────────
        $placeholders = implode(',', array_fill(0, count($sourceTags), '?'));
        $recStmt = $this->pdo->prepare(
            "SELECT ItemId, COUNT(Id) AS match_count
             FROM MetadataValues
             WHERE `Field` = 'trumpet.tag'
               AND ItemId != ?
               AND `Value` IN ({$placeholders})
             GROUP BY ItemId
             ORDER BY match_count DESC
             LIMIT ?"
        );

        $recStmt->execute(array_merge([$itemId], $sourceTags, [$maxResults]));
        $recRows = $recStmt->fetchAll();

        if (empty($recRows)) {
            return [];
        }

        $recommendedIds = array_column($recRows, 'ItemId');
        $matchCounts    = array_column($recRows, 'match_count', 'ItemId');

        // ── 3. Fetch and hydrate the actual items ────────────────────────────
        $idPlaceholders = implode(',', array_fill(0, count($recommendedIds), '?'));
        $itemsStmt = $this->pdo->prepare(
            "SELECT Id, Name, Handle, LastModified, Withdrawn, Archived, CollectionId
             FROM Items WHERE Id IN ({$idPlaceholders})"
        );
        $itemsStmt->execute($recommendedIds);
        $rawItems = $itemsStmt->fetchAll();

        $itemsService = new ItemsService($this->pdo);
        $items        = $itemsService->hydratePublic($rawItems);

        // Sort by match_count descending (SQL IN doesn't guarantee order)
        usort($items, fn($a, $b) =>
            ($matchCounts[$b['id']] ?? 0) <=> ($matchCounts[$a['id']] ?? 0)
        );

        return $items;
    }
}
