#!/bin/bash

# This script is used by Vercel to build and prepare the application

echo "Installing dependencies..."
npm ci

echo "Running database migrations..."
npx drizzle-kit push

echo "Building client application..."
cd client && vite build && cd ..

echo "Building server application..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"