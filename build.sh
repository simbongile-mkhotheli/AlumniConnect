#!/bin/bash

# Build script for Render deployment

echo "Starting build process..."

# Install dependencies for the main project
echo "Installing frontend dependencies..."
npm ci

# Install dependencies for the server
echo "Installing server dependencies..."
cd server
npm ci

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Build the server
echo "Building server..."
npm run build

# Go back to root
cd ..

# Build the frontend
echo "Building frontend..."
npm run build

echo "Build complete!"