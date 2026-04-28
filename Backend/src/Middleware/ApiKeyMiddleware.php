<?php

declare(strict_types=1);

namespace Trumpet\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

/**
 * ApiKeyMiddleware
 *
 * Enforces X-API-Key header on all /api/* routes except the health check.
 * Non-/api/ paths (frontend static files served by Nginx) never reach PHP,
 * so they are not subject to this check.
 */
class ApiKeyMiddleware implements MiddlewareInterface
{
    /** Routes exempt from authentication */
    private const EXEMPT_PATHS = [
        '/api/health',
    ];

    public function __construct(private readonly string $expectedKey)
    {
    }

    public function process(
        ServerRequestInterface  $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $path = $request->getUri()->getPath();

        // Skip auth for exempted paths or if in development mode
        if (in_array($path, self::EXEMPT_PATHS, true) || ($_ENV['APP_ENV'] ?? 'development') !== 'production') {
            return $handler->handle($request);
        }

        // Only enforce on /api/* paths
        if (!str_starts_with($path, '/api/')) {
            return $handler->handle($request);
        }

        $providedKey = $request->getHeaderLine('X-API-Key');

        if ($providedKey !== $this->expectedKey || $this->expectedKey === '') {
            $response = new Response(401);
            $response->getBody()->write(
                json_encode(['error' => 'Unauthorized', 'hint' => 'Provide a valid X-API-Key header'])
            );
            return $response->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    }
}
