# syntax=docker/dockerfile:1
#
# Multi-stage Dockerfile for the Django backend.
#
#   - `dev`        : used by docker-compose.yml for local development.
#   - `production` : lean, non-root image for ECS. Talks to an external RDS
#                     instance via DATABASE_URL - no database runs in this
#                     container. This is the default target (`docker build .`).

FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
      libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# dev - bind-mounted source, Django dev server, full build toolchain for any
# native extensions. Matches the previous local-dev behavior.
# ---------------------------------------------------------------------------
FROM base AS dev
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt requirements-dev.txt ./
RUN pip install -r requirements-dev.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ---------------------------------------------------------------------------
# deps - compile production Python deps in a throwaway layer that has the
# build toolchain, so the final image doesn't need to.
# ---------------------------------------------------------------------------
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# ---------------------------------------------------------------------------
# production - what actually ships to ECR/ECS.
# ---------------------------------------------------------------------------
FROM base AS production
RUN groupadd -r app && useradd -r -g app -d /app -s /usr/sbin/nologin app

COPY --from=deps /install /usr/local
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Defensive normalization: a Windows checkout (core.autocrlf) can still hand
# this a CRLF-terminated file even with .gitattributes in place, which
# corrupts the shebang and makes `exec` fail with "no such file or directory".
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/staticfiles /app/media \
    && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fs http://localhost:8000/api/health/ || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "4", "--timeout", "60", "--access-logfile", "-", "--error-logfile", "-"]
