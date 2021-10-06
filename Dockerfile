##
# `Dockerfile` for development and production.
# This file is configured as a multi-staged build.
#
# @see https://docs.docker.com/develop/develop-images/multistage-build/
##

FROM node:16 as build
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
RUN ["npm", "run", "build"]

# This stage npm installs the production node
# modules only, so that they can be copied over to the production
# stage.  This is done in an independent stage so that NPM/bash
# can be left out of the final production image for security.
FROM build as only-npm-dependencies
##
# Set to `production` for npm to install only
# `dependencies` for the app to run.
##
ENV NODE_ENV=production
# Install `dependencies`
RUN npm ci --production

##
# For the production image, the Google "distroless" container is used,
# which does not contain extra things which increase the attack
# surface. The final image is essentially the node binary,
# OS support (i.e. SSL certs, tzdata files, etc), and the compiled JS files.
#
# @see https://github.com/GoogleContainerTools/distroless#why-should-i-use-distroless-images
##
FROM gcr.io/distroless/nodejs:16
# Copy `node_modules` from the `only-npm-dependencies` step
COPY --from=only-npm-dependencies /app/node_modules /app/node_modules
# Copy the compiled `dist` directory from the `build` step
COPY --from=build /app/dist /app/dist
WORKDIR /app
# Run any DB migrations and start the app
ENTRYPOINT ["npm", "run", "start:deployed"]
