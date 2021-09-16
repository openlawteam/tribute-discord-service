# Tribute Discord Service

## Development

**Dependencies:**

- Docker
- NPM `^7.0.0` (if changing `package.json` packages)

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

**Locally:** Add, or edit, a `/.env`
**Upstream:** Edit where deployed (e.g. Google Cloud Kubernetes configuration)

```
DEBUG=true
```
