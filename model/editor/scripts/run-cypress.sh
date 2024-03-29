#!/bin/bash

# Check if anything is already listening on port 3000
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
  echo "Port 5173 is already in use. Please close any other processes that may be listening on this port."
  exit 1
fi

# Start the Svelte app in the background
npm run dev &

# Wait for the Svelte app to be ready
npx wait-on http://localhost:5173

# Run the tests
npx cypress run
TEST_EXIT_CODE=$?

# Find the PID of the Svelte app process
SVELTE_PIDS=$(lsof -ti :5173)

# Kill the Svelte app processes
for PID in $SVELTE_PIDS
do
  if [ -n "$PID" ]; then
    kill "$PID"
  fi
done
# Exit with the test exit code
exit $TEST_EXIT_CODE
