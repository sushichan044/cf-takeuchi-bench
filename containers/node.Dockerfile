# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0
ARG PNPM_VERSION=10.12.2
ARG APP_PORT=8080
ARG BUILDER_APP_DIR=/app
ARG RUNNER_APP_DIR=/app

# Builder stage
FROM node:${NODE_VERSION}-bookworm AS builder
ARG BUILDER_APP_DIR
ARG PNPM_VERSION

WORKDIR ${BUILDER_APP_DIR}

# Download dependencies as a separate step to take advantage of Docker's caching.
RUN --mount=type=bind,source=node/package.json,target=package.json \
    npm i -g pnpm@${PNPM_VERSION} && \
    pnpm install

# Runner stage
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

ARG APP_PORT
ARG BUILDER_APP_DIR
ARG RUNNER_APP_DIR

WORKDIR ${RUNNER_APP_DIR}

# Copy from builder stage
COPY --from=builder ${BUILDER_APP_DIR}/node_modules ./node_modules
COPY node/src ./src
COPY node/package.json ./package.json

ENV NODE_ENV=production

EXPOSE ${APP_PORT}

ENTRYPOINT ["/nodejs/bin/node", "/app/src/index.js"]
