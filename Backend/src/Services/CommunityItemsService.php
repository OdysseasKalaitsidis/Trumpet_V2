<?php

declare(strict_types=1);

namespace Trumpet\Services;

use PDO;

/**
 * CommunityItemsService
 *
 * Mirrors community_items_service.py — recursively collects all
 * sub-community IDs, then fetches items from their collections.
 */
class CommunityItemsService
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function getItemsByCommunityId(string $communityId): array
    {
        // ── 1. Recursively collect all descendant community IDs ──────────────
        $allCommunityIds   = [$communityId];
        $currentLevelIds   = [$communityId];

        while (!empty($currentLevelIds)) {
            $placeholders = implode(',', array_fill(0, count($currentLevelIds), '?'));
            $stmt = $this->pdo->prepare(
                "SELECT Id FROM Communities WHERE ParentCommunityId IN ({$placeholders})"
            );
            $stmt->execute($currentLevelIds);
            $nextLevelIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $newIds = array_diff($nextLevelIds, $allCommunityIds);
            if (empty($newIds)) {
                break;
            }

            $allCommunityIds = array_merge($allCommunityIds, array_values($newIds));
            $currentLevelIds = array_values($newIds);
        }

        // ── 2. Fetch items whose collection belongs to any of those communities
        $placeholders = implode(',', array_fill(0, count($allCommunityIds), '?'));
        $sql = "
            SELECT i.Id, i.Name, i.Handle, i.LastModified, i.Withdrawn, i.Archived, i.CollectionId
            FROM Items i
            JOIN Collections c ON i.CollectionId = c.Id
            WHERE c.ParentCommunityId IN ({$placeholders})
            ORDER BY i.Name
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($allCommunityIds);
        $items = $stmt->fetchAll();

        // ── 3. Hydrate metadata + bitstreams (reuse ItemsService logic) ──────
        $itemsService = new ItemsService($this->pdo);
        return $itemsService->hydratePublic($items);
    }
}
