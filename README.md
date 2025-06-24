# Cloudflare Takeuchi Benchmark

A Cloudflare Workers application that benchmarks the Takeuchi function implementation in TypeScript vs Go using Cloudflare Containers.

## Development

```bash
pnpm install
pnpm dev
```

## Deployment

```bash
pnpm deploy
```

## Sample Benchmark Result of Takeuchi Function

### On Local (`wrangler dev`)

```bash
$ curl -X POST http://localhost:8787/takeuchi/ts \
  -H "Content-Type: application/json" \
  -d '{
    "x": 28,
    "y": 15,
    "z": 13
  }'
{"executionTimeMs":4227,"isError":false,"result":28}

$ curl -X POST http://localhost:8787/takeuchi/go \
  -H "Content-Type: application/json" \
  -d '{
    "x": 28,
    "y": 15,
    "z": 13
  }'
{"executionTimeMs":17562.2523,"isError":false,"result":28}
```

### On Cloudflare Workers Runtime

not released yet

## HTTP API

### GET /

Simple health check endpoint.

**Response:**

```
Hello Hono!
```

### POST /takeuchi/ts

Execute the Takeuchi function using native TypeScript implementation.

**Request Body:**

```ts
{
  "x": number,
  "y": number,
  "z": number
}
```

**Response:**

```ts
{
  "executionTimeMs": number,
  "isError": false,
  "result": number
}
```

**Error Response:**

```ts
{
  "executionTimeMs": number,
  "isError": true,
  "message": string
}
```

### POST /takeuchi/go

Execute the Takeuchi function using containerized Go implementation.

**Request Body:**

```ts
{
  "x": number,
  "y": number,
  "z": number
}
```

**Response:**

```ts
{
  "executionTimeMs": number,
  "isError": false,
  "result": number
}
```

**Error Response:**

```ts
{
  "executionTimeMs": number,
  "isError": true,
  "message": string
}
```

### Notes

- Both endpoints have a 2-minute timeout
- Execution time is measured in milliseconds
- The Takeuchi function is computationally expensive; use small values for testing
- Example request: `{"x": 3, "y": 2, "z": 1}`
