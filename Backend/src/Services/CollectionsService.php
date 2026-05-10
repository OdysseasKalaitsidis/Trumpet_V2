<?php

declare(strict_types=1);

namespace Trumpet\Services;

use PDO;

/**
 * CollectionsService — mirrors collections_service.py
 */
class CollectionsService
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function getCollections(): array
    {
        $stmt = $this->pdo->query(
            'SELECT Id AS id, Name AS name, Handle AS handle, IntroductoryText AS introductoryText, ParentCommunityId AS parentCommunityId
             FROM Collections ORDER BY Name'
        );
        return $stmt->fetchAll();
    }

    public function getCollection(string $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT Id AS id, Name AS name, Handle AS handle, IntroductoryText AS introductoryText, ParentCommunityId AS parentCommunityId
             FROM Collections WHERE Id = :id'
        );
        $stmt->execute([':id' => $id]);
        $collection = $stmt->fetch();

        if (!$collection) {
            return null;
        }

        // Attach items (light — no metadata/bitstreams here)
        $iStmt = $this->pdo->prepare(
            'SELECT Id AS id, Name AS name, Handle AS handle, LastModified AS lastModified, Withdrawn AS withdrawn, Archived AS archived, CollectionId AS collectionId
             FROM Items WHERE CollectionId = :id ORDER BY Name'
        );
        $iStmt->execute([':id' => $id]);
        $collection['items'] = $iStmt->fetchAll();

        return $collection;
    }

    public function getMappings(): array
    {
        $stmt = $this->pdo->query(
            'SELECT Id AS id, Name AS name FROM Collections ORDER BY Name'
        );
        return $stmt->fetchAll();
    }
}
