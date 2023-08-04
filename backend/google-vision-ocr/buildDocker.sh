#!/usr/bin/env bash

../../scripts/packaging/rewrite-workspace-deps.sh
cp Dockerfile .dockerignore staging
cp tsconfig.json staging
docker build --platform linux/amd64 -t google-vision-ocr .
docker tag google-vision-ocr gcr.io/cozemble/backend-google-vision-ocr:latest