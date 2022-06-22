[![codecov](https://codecov.io/gh/openlawteam/tribute-discord-service/branch/main/graph/badge.svg?token=1SM8FCMIQ6)](https://codecov.io/gh/openlawteam/tribute-discord-service)

# Tribute Discord Service

## Development

### Dependencies:

- Docker
- Node `^16.6.0`. It is a dependency for `discord.js`.
- NPM `>=7`
- [Alchemy](https://www.alchemy.com) API key (i.e. sign up for their free tier)
- Add `ALCHEMY_API_KEY` to `<project>/.env`: `echo ALCHEMY_API_KEY=your_key >> .env`
- Create `src/config/daos/daosLocalhost.ts` from copying `daosLocalhost.example.ts`

### Running the local development environment

```sh
npm ci
npm start
```

#### Webhook database entries

Once the environment is started, webhooks may be inserted into the database's `discord_webhooks` table.

### Stopping the local development environment

```sh
# Runs `docker-compose down` to stop and remove any containers, networks
npm run docker:down
```

### Resetting the local development environment

```sh
# Runs `docker-compose down` and removes data volumes
npm run docker:teardown

# Runs the above, and also removes all images used by the services
npm run docker:teardown -- --rmi=all
```

### Applying new Prisma database migrations

When running `npm start` any migrations will be run which have not yet been applied to the database, or which are yet to be created as a result of a `schema.prisma` change. Database migrations do not automatically run during active local development (i.e. via `nodemon` watching for file changes). You will need to follow the instructions under _Creating migrations after schema changes_.

### Creating migrations after schema changes

Make sure the `db` container has started, then create and/or run the migrations.

See [developing with Prisma `migrate`](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate) for more information.

There is a convenient npm command for this below. The `DATABASE_URL` will most likely be needed. This is because when using `npm start` the database container name, `db`, is used instead of `localhost` due to Docker container networking. The `DATABASE_URL` environment variable can be found in `/.env.dev`.

```sh
DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:<HOST_POST>/postgres" npm run docker:migrate:dev
```

Alternatively, the `migrate:dev` npm command is also available. Any arguments passed should be for Prisma's `prisma migrate dev`:

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

Any push to `main` will run a development environment release to Tribute Labs' Google Cloud->Kubernetes Engine. The `deploy-dev.yml` GitHub Action will run and, if successful, will push a commit to `infrastructure`, which will complete the deployment to Google Cloud.

### Production

It is recommended to use `npm run release` locally to deploy a production release. Follow the prompts (typically answering `Y` for each). The command will determine the next semantic version and open a page to create a new GitHub release.

Any tags (`v*`) pushed to `main` (i.e. via `npm run release`) will run a production environment release to Tribute Labs' Google Cloud->Kubernetes Engine. The `deploy-prod.yml` GitHub Action will run and, if successful, will push a commit to `infrastructure`, which will complete the deployment to Google Cloud.
