#!/bin/bash

##
# Used by `Dockerfile.dev` in order to run multiple shell
# commands and/or scripts, as a part of a setup process.
##

# @see https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate
npm run migrate:dev
npx nodemon --watch 'src/**/*.{ts,js,json}' --exec 'ts-node' src/index.ts
