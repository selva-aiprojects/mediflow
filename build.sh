#!/bin/bash
set -e
cd backend
npm install --include=dev
npx prisma generate
npx nest build
