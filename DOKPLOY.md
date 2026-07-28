# Dokploy deployment

Deploy this repository as an **Application** using the `Dockerfile` build type.

## Build settings

- Build type: `Dockerfile`
- Dockerfile path: `Dockerfile`
- Docker context: `.`
- Container port: `3000`
- Replicas: `1`

## Environment variables

```env
DATABASE_URL=file:/data/custom.db
RESEND_API_KEY=replace_with_a_new_key
```

Do not reuse a key that has previously been committed to Git.

## Persistent storage

Create a named volume and mount it at:

```text
/data
```

The container copies `db/custom.db` to `/data/custom.db` only when the volume is empty. Later deployments preserve the existing database.

SQLite should run with one application replica. For multiple replicas or heavier concurrent writes, migrate the Prisma datasource to PostgreSQL.

## Local verification

```sh
docker compose up --build
```

Open `http://localhost:3000` and verify that catalog queries complete without Prisma error code 14.
