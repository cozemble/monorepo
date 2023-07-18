../../scripts/packaging/rewrite-workspace-deps.sh
cp Dockerfile .dockerignore staging
cd staging && docker build --platform linux/amd64 -t tenanted-api .
docker tag tenanted-api gcr.io/cozemble/backend-tenanted-api:latest