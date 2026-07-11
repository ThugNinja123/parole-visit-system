#!/bin/sh
set -e

# Migrations are opt-in per container start. With >1 ECS task/replica running
# this at boot risks concurrent migration races - prefer running migrate as a
# one-off ECS task in the deploy pipeline and leave RUN_DB_MIGRATIONS unset.
if [ "${RUN_DB_MIGRATIONS:-false}" = "true" ]; then
  echo "docker-entrypoint: running database migrations..."
  python manage.py migrate --noinput
fi

echo "docker-entrypoint: collecting static files..."
python manage.py collectstatic --noinput --clear

exec "$@"
