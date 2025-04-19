#!/bin/bash

# Install dependencies
npm ci

# Run Drizzle migrations
npx drizzle-kit push

# Build the client
cd client && npm run build