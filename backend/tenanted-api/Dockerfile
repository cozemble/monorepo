FROM node:alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
COPY staging/ .

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
RUN apk add build-base libc6-compat gcompat curl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/ .
RUN pnpm install
RUN pnpm run build

FROM node:alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 cozemble
USER cozemble

COPY --from=installer --chown=cozemble:nodejs /app/ ./

CMD node dist/cjs/index.js
