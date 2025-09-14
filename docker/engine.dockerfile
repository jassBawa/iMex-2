FROM oven/bun:latest AS base

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
COPY turbo.json ./

COPY ./apps/engine/package.json ./apps/engine/

COPY ./packages/db/package.json ./packages/db/
COPY ./packages/redis/package.json ./packages/redis/
COPY ./packages/eslint-config/package.json ./packages/eslint-config/
COPY ./packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN bun install

COPY ./apps/engine/ ./apps/engine/

COPY ./packages/db/ ./packages/db/
COPY ./packages/redis/ ./packages/redis/
COPY ./packages/eslint-config/ ./packages/eslint-config/
COPY ./packages/typescript-config/ ./packages/typescript-config/

# Generate Prisma client
RUN bun run db:generate

CMD ["bun", "run", "start:engine"]