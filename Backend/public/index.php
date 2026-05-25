<?php
/**
 * Slim 4 Front Controller — entry point for ALL /api/* requests.
 * Nginx routes every /api/* request via fastcgi_pass to this file.
 *
 * Routes mirror the FastAPI router surface 1-to-1:
 *   GET  /api/items
 *   GET  /api/items/fields
 *   GET  /api/items/path-values
 *   GET  /api/items/path-counts
 *   GET  /api/items/search-all
 *   GET  /api/items/{id}
 *   POST /api/items/{id}/tags/generate
 *   POST /api/items/tags/generate-all
 *   GET  /api/items/{id}/recommendations
 *   GET  /api/communities
 *   GET  /api/communities/{id}
 *   GET  /api/collections
 *   GET  /api/collections/mappings
 *   GET  /api/collections/{id}
 *   GET  /api/CommunityItems/{community_id}
 *   GET  /api/media/{path}
 *   GET  /api/health
 */

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Slim\Factory\AppFactory;
use Trumpet\Middleware\ApiKeyMiddleware;
use Trumpet\Controllers\ItemsController;
use Trumpet\Controllers\CommunitiesController;
use Trumpet\Controllers\CollectionsController;
use Trumpet\Controllers\CommunityItemsController;
use Trumpet\Controllers\MediaController;

// ── 1. Load environment ──────────────────────────────────────────────────────
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// ── 2. Bootstrap PDO & settings ──────────────────────────────────────────────
$pdo      = require __DIR__ . '/../config/database.php';
$settings = require __DIR__ . '/../config/settings.php';

// ── 3. Build Slim app ────────────────────────────────────────────────────────
$app = AppFactory::create();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(
    displayErrorDetails: ($_ENV['APP_ENV'] ?? 'production') !== 'production',
    logErrors:           true,
    logErrorDetails:     true
);

// ── 4. API Key auth middleware (all /api/* except /api/health) ────────────────
$app->add(new ApiKeyMiddleware($settings['api_key']));

// ── 5. CORS Middleware (Outermost layer to handle 401s) ──────────────────────
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, X-API-Key')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// ── 6. Controller factory ────────────────────────────────────────────────────
$items        = new ItemsController($pdo, $settings);
$communities  = new CommunitiesController($pdo);
$collections  = new CollectionsController($pdo);
$communityItems = new CommunityItemsController($pdo);
$media        = new MediaController($settings);

// ── 6. Routes — Items ────────────────────────────────────────────────────────
// NOTE: specific static-segment routes MUST be registered before /{id} wildcards
$app->get('/api/items/fields',              [$items, 'getFields']);
$app->get('/api/items/path-values',         [$items, 'getPathValues']);
$app->get('/api/items/path-counts',         [$items, 'getPathCounts']);
$app->get('/api/items/search-all',          [$items, 'searchAllMetadata']);
$app->post('/api/items/tags/generate-all',  [$items, 'generateAllTags']);
$app->get('/api/items',                     [$items, 'getItems']);
$app->get('/api/items/{id}/recommendations',[$items, 'getRecommendations']);
$app->post('/api/items/{id}/tags/generate', [$items, 'generateTags']);
$app->get('/api/items/{id}',                [$items, 'getItem']);

// ── 7. Routes — Communities ──────────────────────────────────────────────────
$app->get('/api/communities',               [$communities, 'getCommunities']);
$app->get('/api/communities/{id}',          [$communities, 'getCommunity']);

// ── 8. Routes — Collections ──────────────────────────────────────────────────
$app->get('/api/collections/mappings',      [$collections, 'getMappings']);
$app->get('/api/collections',               [$collections, 'getCollections']);
$app->get('/api/collections/{id}',          [$collections, 'getCollection']);

// ── 9. Routes — Community Items ──────────────────────────────────────────────
$app->get('/api/CommunityItems/{community_id}', [$communityItems, 'getByCommId']);

// ── 10. Routes — Media manifest (MUST be before wildcard route) ─────────────
$app->get('/api/media/manifest.json', function ($req, $res) use ($settings) {
    $resourcesPath = $settings['resources_path'] ?? '/var/www/trumpet/resources';
    $files = [];
    if (is_dir($resourcesPath)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($resourcesPath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $relativePath = str_replace($resourcesPath . DIRECTORY_SEPARATOR, '', $file->getPathname());
                $files[] = str_replace('\\', '/', $relativePath);
            }
        }
    }
    $payload = json_encode($files);
    $res->getBody()->write($payload);
    return $res->withHeader('Content-Type', 'application/json');
});

// ── 11. Routes — Media files ─────────────────────────────────────────────────
$app->get('/api/media/{path:.+}',           [$media, 'redirect']);


// ── 12. OPTIONS Preflight handler ────────────────────────────────────────────
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// ── 13. Health check (public, no API key required) ──────────────────────────
$app->get('/api/health', function ($req, $res) {
    $payload = json_encode(['status' => 'healthy', 'version' => '2.0.0']);
    $res->getBody()->write($payload);
    return $res->withHeader('Content-Type', 'application/json');
});

$app->run();
