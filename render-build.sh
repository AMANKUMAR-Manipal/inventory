#!/bin/bash

# This script is used by Render to build the application

echo "Installing dependencies..."
npm ci

echo "Running database migrations..."
npx drizzle-kit push

# Build the client
echo "Building client application..."
cd client && npm install && npm run build && cd ..

# Build the server
echo "Building server application..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"