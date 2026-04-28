<?php

declare(strict_types=1);

namespace Trumpet\Services;

use PDO;

/**
 * TaggingService
 *
 * Calls the Python CLI shim (python_services/tagging_cli.py) via shell_exec().
 * The CLI shim contains the exact same predefined tags + keyword logic from
 * the original tagging_service.py, but with no framework dependencies.
 *
 * Also handles backfill — iterates all items and writes trumpet.tag metadata.
 */
class TaggingService
{
    private string $python;
    private string $scriptPath;

    public function __construct(
        private readonly PDO   $pdo,
        private readonly array $settings
    ) {
        $this->python     = $settings['python_bin']      ?? '/usr/bin/python3';
        $this->scriptPath = rtrim($settings['python_services'] ?? '', '/') . '/tagging_cli.py';
    }

    /**
     * Generate tags for a single item array.
     * Passes item as JSON to the Python CLI and returns the decoded tag array.
     */
    public function generateTags(array $item): array
    {
        $payload = escapeshellarg(json_encode($item, JSON_UNESCAPED_UNICODE));
        $cmd     = "{$this->python} " . escapeshellarg($this->scriptPath) . " {$payload} 2>/dev/null";
        $output  = shell_exec($cmd);

        if ($output === null || trim($output) === '') {
            return ['Uncategorized', 'Archive Item'];
        }

        $tags = json_decode(trim($output), true);
        return is_array($tags) ? $tags : ['Uncategorized', 'Archive Item'];
    }

    /**
     * Backfill tags for ALL items.
     * Deletes existing trumpet.tag entries, then re-generates for each item.
     * Returns count of processed items.
     */
    public function backfillTags(): int
    {
        $itemsService = new ItemsService($this->pdo);

        // Fetch all items with their metadata
        $stmt  = $this->pdo->query(
            'SELECT Id, Name, Handle, LastModified, Withdrawn, Archived, CollectionId FROM Items'
        );
        $rawItems = $stmt->fetchAll();
        $items    = $itemsService->hydratePublic($rawItems);

        $count = 0;

        // Remove all existing trumpet.tag entries in one shot
        $this->pdo->exec("DELETE FROM MetadataValues WHERE `Field` = 'trumpet.tag'");

        $insertStmt = $this->pdo->prepare(
            "INSERT INTO MetadataValues (ItemId, `Field`, `Value`, Language)
             VALUES (:item_id, 'trumpet.tag', :value, 'en')"
        );

        foreach ($items as $item) {
            $tags = $this->generateTags($item);
            foreach ($tags as $tag) {
                $insertStmt->execute([':item_id' => $item['Id'], ':value' => $tag]);
            }
            $count++;
        }

        return $count;
    }
}
