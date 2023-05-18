#!/bin/bash
set -e

echo "Deployment started ..."

echo "Pulling from master branch ..."
git pull origin master

echo "Installing npm dependencies ..."
npm i

echo "Restarting pm2 and rebuilding app"
pm2 restart fromyfarm

echo "Deployment finished!"