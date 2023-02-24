../../scripts/packaging/rewrite-workspace-deps.sh
cp Dockerfile .dockerignore staging
cp tsconfig.json tsconfig-cjs.json staging
docker build -t tenanted-api .