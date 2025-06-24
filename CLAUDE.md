# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Package Management

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server with wrangler
- `pnpm deploy` - Deploy to Cloudflare Workers with minification

### Code Quality

- `pnpm lint` - Run ESLint with zero warnings tolerance
- `pnpm format` - Format code with Prettier
- `pnpm format:ci` - Check formatting without modification
- `pnpm typecheck` - Run TypeScript type checking (generates types first)
- `pnpm check` - Run all quality checks (typegen, lint, format, typecheck, tests)

### Testing

- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once

### Cloudflare-Specific

- `pnpm cf-typegen` - Generate TypeScript types from wrangler configuration

## Architecture

This is a Cloudflare Workers application benchmarking the Takeuchi function implementation in TypeScript vs Go using Cloudflare Containers.

### Core Components

**Main Application (`src/index.ts`)**

- Hono web framework with TypeScript
- Two endpoints: `/takeuchi/ts` (native) and `/takeuchi/go` (containerized)
- Request validation using Valibot schemas
- 2-minute timeout middleware for POST requests
- Unified response format with execution time tracking

**Container Integration (`src/containers.ts`)**

- `GoExecutor` class extending Cloudflare Container
- Configured for port 8080 with 2-minute sleep timeout
- Handles container lifecycle events (start/stop/error)

**Go Container (`containers/go/`)**

- Minimal Go HTTP server implementing Takeuchi function
- Timeout handling with context cancellation
- JSON request/response with error handling and panic recovery
- Multi-stage Docker build for minimal image size

### Key Patterns

**Schema Validation**

- Valibot for request/response validation
- Discriminated union for error/success responses
- Type-safe request handling with `sValidator`

**Container Communication**

- Uses `getRandom()` for load balancing across container instances
- HTTP-based communication between Worker and Go container
- Consistent error handling across both implementations

**Performance Monitoring**

- Execution time tracking for both implementations
- Timeout handling at multiple levels (Worker, Container, Go)
- Error reporting with execution context

## Configuration

- `wrangler.jsonc` - Cloudflare Workers configuration with container bindings
- Container limits: max 10 instances, 1GB disk
- Durable Objects for Go executor management
- Node.js compatibility enabled
