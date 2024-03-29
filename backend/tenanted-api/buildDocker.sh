#!/usr/bin/env bash

../../scripts/packaging/rewrite-workspace-deps.sh
cp Dockerfile .dockerignore staging
cp tsconfig.json staging
docker build --platform linux/amd64 -t tenanted-api .
docker tag tenanted-api gcr.io/cozemble/backend-tenanted-api:latest