FROM oven/bun:1 AS dependencies

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/db/custom.db

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate
RUN bun run build

FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/data/custom.db

RUN mkdir -p /app/bootstrap /data

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/db/custom.db /app/bootstrap/custom.db
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "server.js"]
