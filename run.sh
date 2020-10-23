#!/bin/bash -e

SECRET_SESSION_KEY_FILE="secret-session-key"

if ! test -f "$SECRET_SESSION_KEY_FILE"; then
    echo "$SECRET_SESSION_KEY_FILE file does not exist. Creating..."
    ./make-key.sh
    echo "$SECRET_SESSION_KEY_FILE file created."
fi

# uncomment for testing production build in combination with setting NODE_ENV to production
# next build harness/app

yarn lint
yarn build

# Start api in background
node harness/api/index.js &

TIMEOUT=5
until curl http://localhost:3000/ > /dev/null 2>&1 || [ $TIMEOUT -eq 0 ]; do
  echo "Waiting for API to boot, $((TIMEOUT--)) remaining attempts..."
  sleep 1
done

# uname -s => Darwin when on mac
# TODO: add condition around running open chrome to ensure macos
# possibly figure out a solid way to do this on linux as well?

open -a "Google Chrome"
osascript scripts/openChrome.applescript http://localhost:8080

echo "Starting App Server..."
node harness/app-server/index.js "$@"
