<?php

declare(strict_types=1);

namespace Trumpet\Services;

use MicrosoftAzure\Storage\Blob\BlobSharedAccessSignatureHelper;
use MicrosoftAzure\Storage\Common\Internal\Resources;

/**
 * StorageService
 *
 * Mirrors storage_service.py — generates Azure Blob SAS URLs (1-hour read tokens)
 * or falls back to a local /media/ path when Azure is not configured.
 */
class StorageService
{
    private ?string $accountName = null;
    private ?string $accountKey  = null;
    private string  $container;

    public function __construct(private readonly array $settings)
    {
        $this->container = $settings['azure_container'] ?? 'media';
        $connStr         = $settings['azure_conn_str']  ?? '';

        if ($connStr !== '') {
            // Parse "AccountName=xxx;AccountKey=yyy;..." format
            foreach (explode(';', $connStr) as $part) {
                if (str_starts_with($part, 'AccountName=')) {
                    $this->accountName = substr($part, 12);
                }
                if (str_starts_with($part, 'AccountKey=')) {
                    $this->accountKey = substr($part, 11);
                }
            }
        }
    }

    /**
     * Returns either a signed Azure Blob SAS URL (1-hour read) or a local /media/ path.
     * Mirrors StorageService.get_blob_url() in Python.
     */
    public function getBlobUrl(string $blobPath): string
    {
        $blobName = ltrim($blobPath, '/');

        // No Azure configured — return local fallback URL
        if ($this->accountName === null || $this->accountKey === null) {
            return "/media/{$blobName}";
        }

        try {
            $sasHelper = new BlobSharedAccessSignatureHelper(
                $this->accountName,
                $this->accountKey
            );

            $expiry   = (new \DateTimeImmutable('+1 hour'))->format('Y-m-d\TH:i:s\Z');
            $sasToken = $sasHelper->generateBlobServiceSharedAccessSignatureToken(
                Resources::RESOURCE_TYPE_BLOB,
                "{$this->container}/{$blobName}",
                'r',      // read-only
                $expiry,
                ''        // start time (empty = now)
            );

            return "https://{$this->accountName}.blob.core.windows.net"
                 . "/{$this->container}/{$blobName}?{$sasToken}";

        } catch (\Throwable) {
            // SAS generation failed — return direct public URL (works if container is public)
            return "https://{$this->accountName}.blob.core.windows.net"
                 . "/{$this->container}/{$blobName}";
        }
    }
}
