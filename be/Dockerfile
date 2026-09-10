# --- build ---------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY be/package.json ./be/
COPY fe/package.json ./fe/

RUN npm ci --workspace be --include-workspace-root

COPY be ./be

RUN npm run build --workspace be

# --- run -----------------------------------------------------------------------
FROM node:22-alpine AS run

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
COPY be/package.json ./be/

RUN npm ci --workspace be --include-workspace-root --omit=dev

COPY --from=build /app/be/dist ./be/dist

CMD ["node", "be/dist/server.js"]
