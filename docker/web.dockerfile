FROM oven/bun:latest AS base

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
COPY turbo.json ./

# Copy workspace package.json files
COPY ./packages/db/package.json ./packages/db/
COPY ./packages/redis/package.json ./packages/redis/
COPY ./packages/eslint-config/package.json ./packages/eslint-config/
COPY ./packages/typescript-config/package.json ./packages/typescript-config/
COPY ./apps/web/package.json ./apps/web/

# Install dependencies
RUN bun install

# Copy workspace source code
COPY ./packages/db/ ./packages/db/
COPY ./packages/redis/ ./packages/redis/
COPY ./packages/eslint-config/ ./packages/eslint-config/
COPY ./packages/typescript-config/ ./packages/typescript-config/
COPY ./apps/web/ ./apps/web/

# Generate Prisma client
RUN bun run db:generate
RUN bun run build

EXPOSE 4000

CMD ["bun", "run", "start:web"]