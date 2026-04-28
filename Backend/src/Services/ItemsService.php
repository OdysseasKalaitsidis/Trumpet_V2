<?php

declare(strict_types=1);

namespace Trumpet\Services;

use PDO;

/**
 * ItemsService
 *
 * Mirrors items_service.py — all queries translated from SQLModel/SQLAlchemy to PDO.
 * Path filtering uses the same string-match lists as the Python version.
 */
class ItemsService
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    // ── Fields ──────────────────────────────────────────────────────────────

    public function getFields(): array
    {
        $stmt = $this->pdo->query('SELECT DISTINCT `Field` FROM MetadataValues ORDER BY `Field`');
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // ── Path values ─────────────────────────────────────────────────────────

    public function getPathValues(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT DISTINCT `Value` FROM MetadataValues
             WHERE `Field` = 'dc.musicsubpath' AND Language = 'en'
             ORDER BY `Value`"
        );
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // ── Path counts ─────────────────────────────────────────────────────────

    public function getPathCounts(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT `Value` AS `value`, COUNT(Id) AS `count`
             FROM MetadataValues
             WHERE `Field` = 'dc.musicsubpath' AND Language = 'en'
             GROUP BY `Value`
             ORDER BY `count` DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // ── Search all metadata ─────────────────────────────────────────────────

    public function searchAllMetadata(string $value): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT `Field` AS `field`, COUNT(Id) AS `count`
             FROM MetadataValues
             WHERE `Value` LIKE :val
             GROUP BY `Field`
             ORDER BY `count` DESC"
        );
        $stmt->execute([':val' => '%' . $value . '%']);
        return $stmt->fetchAll();
    }

    // ── Get items (paginated, filtered) ─────────────────────────────────────

    public function getItems(
        ?string $path         = null,
        ?string $search       = null,
        ?string $communityId  = null,
        ?string $collectionId = null,
        int     $page         = 1,
        int     $pageSize     = 10
    ): array {
        $where  = [];
        $params = [];

        // Path filter — mirrors items_service.py logic
        if ($path !== null) {
            $searchValues = match ($path) {
                'ArtMusic'     => ['Art music', 'Μουσική του άστεως', 'Μουσική του Άστεως', 'Art'],
                'UrbanPopular' => ['Urban popular music', 'Αστικολαϊκή μουσική', 'Urban'],
                'RuralMusic'   => ['Rural music', 'Μουσική της υπαίθρου', 'Rural'],
                'SacredMusic'  => ['Sacred music', 'Εκκλησιαστική μουσική', 'Sacred'],
                default        => [],
            };

            if (!empty($searchValues)) {
                $likes = [];
                foreach ($searchValues as $i => $sv) {
                    $key    = ":path_val_{$i}";
                    $likes[]= "mv_path.Value LIKE {$key}";
                    $params[$key] = '%' . $sv . '%';
                }
                $where[] = "i.Id IN (
                    SELECT mv_path.ItemId FROM MetadataValues mv_path
                    WHERE mv_path.Field = 'dc.musicsubpath'
                    AND (" . implode(' OR ', $likes) . ")
                )";
            }
        }

        // Community filter (via collection)
        if ($communityId !== null) {
            $where[]              = 'c.ParentCommunityId = :community_id';
            $params[':community_id'] = $communityId;
        }

        // Collection filter
        if ($collectionId !== null) {
            $where[]               = 'i.CollectionId = :collection_id';
            $params[':collection_id'] = $collectionId;
        }

        // Full-text search
        if ($search !== null) {
            $where[]         = "(i.Name LIKE :search OR i.Id IN (
                SELECT mv_s.ItemId FROM MetadataValues mv_s WHERE mv_s.Value LIKE :search2
            ))";
            $params[':search']  = '%' . $search . '%';
            $params[':search2'] = '%' . $search . '%';
        }

        $whereClause = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $offset = ($page - 1) * $pageSize;
        $sql    = "
            SELECT i.Id, i.Name, i.Handle, i.LastModified, i.Withdrawn, i.Archived, i.CollectionId
            FROM Items i
            LEFT JOIN Collections c ON i.CollectionId = c.Id
            {$whereClause}
            ORDER BY i.Name
            LIMIT :page_size OFFSET :offset
        ";

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':page_size', $pageSize, PDO::PARAM_INT);
        $stmt->bindValue(':offset',    $offset,   PDO::PARAM_INT);
        $stmt->execute();

        $items = $stmt->fetchAll();
        return $this->hydratePublic($items);
    }

    // ── Get single item ─────────────────────────────────────────────────────

    public function getItem(string $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT Id, Name, Handle, LastModified, Withdrawn, Archived, CollectionId
             FROM Items WHERE Id = :id'
        );
        $stmt->execute([':id' => $id]);
        $item = $stmt->fetch();
        if (!$item) {
            return null;
        }
        $items = $this->hydratePublic([$item]);
        return $items[0] ?? null;
    }

    // ── Hydration helpers ───────────────────────────────────────────────────

    /**
     * Attach metadata and bitstreams to a list of raw item rows in bulk.
     * Uses 2 extra queries (IN clause) rather than N+1.
     * Public so CommunityItemsService, TaggingService, RecommendationService can reuse it.
     */
    public function hydratePublic(array $items): array
    {
        if (empty($items)) {
            return [];
        }

        $ids = array_column($items, 'Id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        // Metadata
        $metaStmt = $this->pdo->prepare(
            "SELECT Id, ItemId, `Field`, `Value`, Language
             FROM MetadataValues WHERE ItemId IN ({$placeholders}) ORDER BY Id"
        );
        $metaStmt->execute($ids);
        $metaRows = $metaStmt->fetchAll();

        $metaByItem = [];
        foreach ($metaRows as $row) {
            $metaByItem[$row['ItemId']][] = [
                'id'       => $row['Id'],
                'itemId'   => $row['ItemId'],
                'field'    => $row['Field'],
                'value'    => $row['Value'],
                'language' => $row['Language'],
            ];
        }

        // Bitstreams
        $bsStmt = $this->pdo->prepare(
            "SELECT Id, ItemId, Name, MimeType, SizeBytes, LocalFilePath
             FROM Bitstreams WHERE ItemId IN ({$placeholders}) ORDER BY Name"
        );
        $bsStmt->execute($ids);
        $bsRows = $bsStmt->fetchAll();

        $bsByItem = [];
        foreach ($bsRows as $row) {
            $bsByItem[$row['ItemId']][] = [
                'id'            => $row['Id'],
                'itemId'        => $row['ItemId'],
                'name'          => $row['Name'],
                'mimeType'      => $row['MimeType'],
                'sizeBytes'     => (int) $row['SizeBytes'],
                'localFilePath' => $row['LocalFilePath'],
            ];
        }

        // Compose final output
        $result = [];
        foreach ($items as $item) {
            $id = $item['Id'];
            $result[] = [
                'id'           => $id,
                'name'         => $item['Name'],
                'handle'       => $item['Handle'],
                'lastModified' => $item['LastModified'],
                'withdrawn'    => (bool) $item['Withdrawn'],
                'archived'     => (bool) $item['Archived'],
                'collectionId' => $item['CollectionId'],
                'metadata'     => $metaByItem[$id] ?? [],
                'bitstreams'   => $bsByItem[$id]   ?? [],
            ];
        }

        return $result;
    }
}
