FROM oven/bun:latest AS base

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json bun.lockb ./
COPY turbo.json ./

# Copy workspace package.json files
COPY ./packages/db/package.json ./packages/db/
COPY ./packages/redis/package.json ./packages/redis/
COPY ./packages/eslint-config/package.json ./packages/eslint-config/
COPY ./packages/typescript-config/package.json ./packages/typescript-config/
COPY ./apps/ws/package.json ./apps/ws/

# Install dependencies
RUN bun install

# Copy workspace source code
COPY ./packages/db/ ./packages/db/
COPY ./packages/redis/ ./packages/redis/
COPY ./packages/eslint-config/ ./packages/eslint-config/
COPY ./packages/typescript-config/ ./packages/typescript-config/
COPY ./apps/ws/ ./apps/ws/

# Generate Prisma client
RUN bun run db:generate

EXPOSE 8080

CMD ["bun", "run", "start:ws"]