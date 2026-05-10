<?php

declare(strict_types=1);

namespace Trumpet\Services;

use PDO;

/**
 * CommunitiesService
 *
 * Mirrors communities_service.py — hierarchical community query with
 * optional path-based filtering on IntroductoryText.
 */
class CommunitiesService
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function getCommunities(?string $path = null): array
    {
        $where  = [];
        $params = [];

        if ($path !== null) {
            $terms = match ($path) {
                'ArtMusic'     => ['Art music', 'Art', 'μουσική του άστεως', 'Μουσική του Άστεως'],
                'UrbanPopular' => ['Urban popular music', 'Urban', 'αστικολαϊκή μουσική', 'Αστικολαϊκή μουσική'],
                'RuralMusic'   => ['Rural music', 'Rural', 'μουσική της υπαίθρου', 'Μουσική της υπαίθρου'],
                'SacredMusic'  => ['Sacred music', 'Sacred', 'εκκλησιαστική μουσική', 'Εκκλησιαστική μουσική'],
                default        => [],
            };

            if (!empty($terms)) {
                $likes = [];
                foreach ($terms as $i => $term) {
                    $key         = ":term_{$i}";
                    $likes[]     = "IntroductoryText LIKE {$key}";
                    $params[$key] = '%' . $term . '%';
                }
                $where[] = '(' . implode(' OR ', $likes) . ')';
            }
        }

        $whereClause = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $sql  = "SELECT Id, Name, Handle, IntroductoryText, ParentCommunityId
                 FROM Communities {$whereClause} ORDER BY Name";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $communities = $stmt->fetchAll();

        return $this->hydrateCommunities($communities);
    }

    public function getCommunity(string $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT Id, Name, Handle, IntroductoryText, ParentCommunityId
             FROM Communities WHERE Id = :id'
        );
        $stmt->execute([':id' => $id]);
        $community = $stmt->fetch();

        if (!$community) {
            return null;
        }

        $all = $this->hydrateCommunities([$community]);
        return $all[0] ?? null;
    }

    // ── Hydration ────────────────────────────────────────────────────────────

    private function hydrateCommunities(array $communities): array
    {
        if (empty($communities)) {
            return [];
        }

        $ids          = array_column($communities, 'Id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        // Load direct sub-communities
        $subStmt = $this->pdo->prepare(
            "SELECT Id, Name, Handle, IntroductoryText, ParentCommunityId
             FROM Communities WHERE ParentCommunityId IN ({$placeholders}) ORDER BY Name"
        );
        $subStmt->execute($ids);
        $subRows = $subStmt->fetchAll();

        // Load collections for all community ids (parent + subs)
        $allIds = array_merge($ids, array_column($subRows, 'Id'));
        $allIds = array_unique($allIds);
        $allPlaceholders = implode(',', array_fill(0, count($allIds), '?'));

        $collStmt = $this->pdo->prepare(
            "SELECT Id, Name, Handle, IntroductoryText, ParentCommunityId
             FROM Collections WHERE ParentCommunityId IN ({$allPlaceholders}) ORDER BY Name"
        );
        $collStmt->execute($allIds);
        $collRows = $collStmt->fetchAll();

        // Group collections by community
        $collsByComm = [];
        foreach ($collRows as $col) {
            $collsByComm[$col['ParentCommunityId']][] = [
                'id'                => $col['Id'],
                'name'              => $col['Name'],
                'handle'            => $col['Handle'],
                'introductoryText'  => $col['IntroductoryText'],
                'parentCommunityId' => $col['ParentCommunityId'],
            ];
        }

        // Group sub-communities by parent
        $subsByParent = [];
        foreach ($subRows as $sub) {
            $subsByParent[$sub['ParentCommunityId']][] = [
                'id'                => $sub['Id'],
                'name'              => $sub['Name'],
                'handle'            => $sub['Handle'],
                'introductoryText'  => $sub['IntroductoryText'],
                'parentCommunityId' => $sub['ParentCommunityId'],
                'subCommunities'    => [],
                'collections'       => $collsByComm[$sub['Id']] ?? [],
            ];
        }

        // Compose result
        $result = [];
        foreach ($communities as $comm) {
            $result[] = [
                'id'                => $comm['Id'],
                'name'              => $comm['Name'],
                'handle'            => $comm['Handle'],
                'introductoryText'  => $comm['IntroductoryText'],
                'parentCommunityId' => $comm['ParentCommunityId'],
                'subCommunities'    => $subsByParent[$comm['Id']] ?? [],
                'collections'       => $collsByComm[$comm['Id']]  ?? [],
            ];
        }

        return $result;
    }
}
