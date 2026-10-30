# syntax=docker/dockerfile:1

# Single image that serves the API and the built React app from one origin.
# Same-origin keeps the session cookie first-party, so `sameSite: "lax"`
# works and no CORS preflight is needed.

# ---- 1. Build the client --------------------------------------------------
FROM node:20-bookworm-slim AS web

WORKDIR /app/Frontend

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci

COPY Frontend/ ./

# An empty base URL makes axios emit relative "/api/..." requests, which hit
# whichever origin served the page. Set this only for a split-domain deploy.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- 2. Runtime: Express + static client + Chromium -----------------------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    HOME=/home/app \
    PUPPETEER_CACHE_DIR=/home/app/.cache/puppeteer

# Chromium's shared-library dependencies (Puppeteer's Debian 12 list).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libdrm2 \
        libexpat1 \
        libfontconfig1 \
        libgbm1 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxkbcommon0 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Unprivileged runtime user. Chrome's own sandbox is disabled at launch
# instead, which is what container hosts require.
RUN groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --create-home app

WORKDIR /app/Backend

# Installs production deps and downloads the Chromium build Puppeteer uses.
COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev && chown -R app:app /home/app

COPY --chown=app:app Backend/ ./
COPY --from=web --chown=app:app /app/Frontend/dist /app/Frontend/dist

USER app

# Render (and most hosts) inject PORT; server.js falls back to 3000 locally.
EXPOSE 3000

CMD ["node", "server.js"]
