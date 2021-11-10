[![codecov](https://codecov.io/gh/openlawteam/tribute-discord-service/branch/main/graph/badge.svg?token=1SM8FCMIQ6)](https://codecov.io/gh/openlawteam/tribute-discord-service)

# Tribute Discord Service

## Development

**Dependencies:**

- Docker
- NPM `^7.0.0` (if updating `package.json` packages)

### Running the local development environment

**Dependencies**

- Get an Alchemy API Key (i.e. sign up for their free tier)
- Add `ALCHEMY_API_KEY=your_key` to `.env`

```sh
npm ci
npm start
```

### Stopping the development environment

```sh
# Runs `docker-compose down` to stop and remove any containers, networks
npm run docker:down
```

### Resetting the development environment

```sh
# Runs `docker-compose down` and removes data volumes
npm run docker:teardown

# Runs the above, and also removes all images used by the services
npm run docker:teardown -- --rmi=all
```

### Updating Prisma database migrations

When running `npm start` any migrations will be run which have not yet been applied to the database, or which are yet to be created as a result of a `schema.prisma` change.

#### Updating migrations after schema changes

Make sure the Docker containers have started, or at least the `db` service, then create and/or run the migrations.

See [developing with Prisma `migrate`](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate) for more information.

```sh
# Creates a new migration, applies it to the database, and updates the generated Prisma Client
npm run migrate:dev -- --name YOUR_MIGRATION_NAME

# Creates a new migration file only; does not apply it to the database.
npm run migrate:dev -- --name YOUR_MIGRATION_NAME --create-only
```

#### Debugging

Running the app with debugging enabled enhances logged output, where implemented.

- **Locally:** Add, or edit, a `/.env`
- **Upstream:** Edit where deployed (e.g. Google Cloud Kubernetes configuration)

```
DEBUG=true
```

## Deployment

### Development

Any merge, or push, to `main` will run a development environment release on Tribute Labs' Google Cloud->Kubernetes Engine. The `deploy-dev.yml` GitHub Action will run and, if successful, will push a commit to `lao-backends`, which will complete the deployment (NOTE: this will change in the future as we improve our deployments).

### Production

It is recommended to use [`bump`](https://github.com/mroth/bump) locally to deploy a production release; the formatting is nice! Bump will determine the next semantic version and open a page to create a new GitHub release. The tag will be created once the GitHub release is published, not when `bump` is run.

Once the release has been published, the `deploy-prod.yml` GitHub Action will run and, if successful, will push a commit to `lao-backends`. In `lao-backends` a new GitHub release needs to be created (preferably with `bump`), which will complete the deployment to Tribute Labs' Google Cloud->Kubernetes Engine (NOTE: this will change in the future as we improve our deployments).
