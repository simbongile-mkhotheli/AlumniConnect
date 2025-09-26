#!/bin/bash

# Frontend build script for Render deployment

echo "=== Starting Frontend Build Process ==="

# Check environment
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# List files
echo "Files in current directory:"
ls -la

# Install dependencies
echo "=== Installing Dependencies ==="
npm install

# Verify installation
echo "=== Verifying Installation ==="
ls -la node_modules/.bin/

# Build the application
echo "=== Building Application ==="
npx vite build
echo "Building server..."
npm run build

# Go back to root
cd ..

# Build the frontend
echo "Building frontend..."
npm run build

echo "Build complete!"