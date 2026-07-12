# syntax=docker/dockerfile:1
#
# Multi-stage Dockerfile for the React/Vite frontend.
#
#   - `dev`        : used by docker-compose.yml for local development.
#   - `production` : static build served by nginx, for ECS. This is the
#                     default target (`docker build .`).
#
# Vite inlines VITE_* env vars at build time, so the API base URL must be
# passed as a build arg per-environment:
#   docker build --target production \
#     --build-arg VITE_API_BASE_URL=https://api.example.com/api -t frontend .

FROM node:20-alpine AS base
WORKDIR /app

# ---------------------------------------------------------------------------
# dev - bind-mounted source, Vite dev server. Matches the previous local-dev
# behavior.
# ---------------------------------------------------------------------------
FROM base AS dev
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------------------------------------------------------------------------
# build - compile the production static bundle.
# ---------------------------------------------------------------------------
FROM base AS build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# production - nginx serving the static bundle, running as a non-root user.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Strip the stock `user`/`pid` directives so our `-g` overrides below don't
# collide with them (nginx errors with "directive is duplicate" otherwise).
RUN sed -i -e '/user  nginx;/d' -e '/^pid /d' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

# Some container runtimes remount /run fresh on start, discarding any
# build-time chown on /var/run/nginx.pid and leaving the non-root nginx user
# unable to unlink it on shutdown ("Permission denied"). /tmp is writable by
# the running user regardless, so keep the pid file there instead.
CMD ["nginx", "-g", "daemon off; pid /tmp/nginx.pid;"]
