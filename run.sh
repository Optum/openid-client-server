#!/bin/bash -e

prettier --config rig/.prettierrc --loglevel error --write "rig/api/**/*.js" "rig/app/components/**/*.js" "rig/app/pages/**/*.js" "rig/app-server/**/*.js"
eslint "src/**/*.ts" --fix --quiet

tsc --project src/tsconfig.json

# Start api in background
node rig/api/index.js &

TIMEOUT=5
until curl http://localhost:3000/ > /dev/null 2>&1 || [ $TIMEOUT -eq 0 ]; do
  echo "Waiting for API to boot, $((TIMEOUT--)) remaining attempts..."
  sleep 1
done

echo "Starting App Server..."
node rig/app-server/index.js "$@"
