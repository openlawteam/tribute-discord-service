#!/bin/bash

# @see https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate
npm run migrate:dev
npx nodemon --watch 'src/**/*.{ts,js,json}' --exec 'ts-node' src/index.ts
