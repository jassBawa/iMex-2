FROM oven/bun:latest AS base

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json bun.lockb ./
COPY turbo.json ./

COPY ./apps/api/package.json ./apps/api/

COPY ./packages/db/package.json ./packages/db/
COPY ./packages/redis/package.json ./packages/redis/
COPY ./packages/eslint-config/package.json ./packages/eslint-config/
COPY ./packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN bun install


COPY ./apps/api/ ./apps/api/

COPY ./packages/db/ ./packages/db/
COPY ./packages/redis/ ./packages/redis/
COPY ./packages/eslint-config/ ./packages/eslint-config/
COPY ./packages/typescript-config/ ./packages/typescript-config/

# Generate Prisma client
RUN bun run db:generate

EXPOSE 4000

CMD ["bun", "run", "start:api"]