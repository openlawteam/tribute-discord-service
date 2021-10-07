##
# `Dockerfile` for development and production.
# This file is configured as a multi-staged build.
#
# @see https://docs.docker.com/develop/develop-images/multistage-build/
##

##
# Alpine Linux is much smaller than most distribution base images (~5MB),
# and thus leads to much slimmer images in general.
#
# @see https://hub.docker.com/_/node/
##
FROM node:16-alpine as build
##
# Set to `development` temporarily for npm to install all
# `dependencies` and `devDependencies` for compilation.
##
ENV NODE_ENV=development
WORKDIR /app
COPY package*.json ./
# Install `dependencies`, `devDependencies`
RUN npm ci
COPY tsconfig.json ./
COPY prisma prisma
COPY src src
# Generate ABI types and compile to JavaScript using TypeSript
RUN npm run build

# This stage npm installs the production node
# modules only, so that they can be copied over to the production
# stage.  This is done in an independent stage so that NPM/bash
# can be left out of the final production image for security.
FROM build as only-npm-dependencies
WORKDIR /app
##
# Set to `production` for npm to install only
# `dependencies` for the app to run.
##
ENV NODE_ENV=production
# Install `dependencies`
RUN npm ci --production

FROM node:16-alpine
# Get latest `npm` 7.x
RUN npm i -g npm@^7
# Copy `node_modules` from the `only-npm-dependencies` step
COPY --from=only-npm-dependencies /app/node_modules /app/node_modules
# Copy the TS-compiled `dist` directory from the `build` step to run the app
COPY --from=build /app/dist /app/dist
# Copy the `prisma` directory from the `build` step to migrate the database
COPY --from=build /app/prisma /app/prisma
# Copy `package.json` file from the `build` step to run our start commands
COPY --from=build /app/package.json /app/package.json
WORKDIR /app
EXPOSE 8080
# Run any DB migrations and start the app
ENTRYPOINT ["npm", "run", "start:deployed"]
