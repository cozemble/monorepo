./scripts/stop-postgres.sh
./scripts/rmDataFile.sh
./scripts/run-postgres.sh
docker logs -f postgresql > /tmp/postgresql.log &
tail -f /tmp/postgresql.log | sed '/server started/ q'

