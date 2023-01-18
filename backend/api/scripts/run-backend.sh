./scripts/run-postgres.sh
docker logs -f postgresql > /tmp/postgresql.log &
tail -f /tmp/postgresql.log | sed '/server started/ q'
node dist/cjs/index.js
