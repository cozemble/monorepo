FROM node:18.16.0-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
COPY staging/ .

# Add lockfile and package.json's of isolated subworkspace
FROM node:18.16.0-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
RUN apk add build-base libc6-compat gcompat curl
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/ .
RUN pnpm install
RUN pnpm run build

FROM node:18.16.0-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 cozemble

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=installer --chown=cozemble:nodejs /app/ ./
EXPOSE 3000
USER cozemble
CMD node dist/esm/index.js
