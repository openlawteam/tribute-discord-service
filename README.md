# Tribute Discord Service

## Development

**Dependencies:**

- Docker
- NPM `^7.0.0` (if changing `package.json` packages)

### Running the local development environment

```
npm ci
npm run dev
```

### Updating Prisma database migrations

Make sure the Docker containers have started, or at least the `db` service.

Create a new database migration after `prisma/schema.prisma` has changed:

```
# Creates a new migration, applies it to the database, and updates the generated Prisma Client
npm run migrate:dev -- --name YOUR_MIGRATION_NAME
```

Or

```
# Only creates a new migration file; does not apply it to the database.
npm run migrate:dev -- --name YOUR_MIGRATION_NAME --create-only
```
