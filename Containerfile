FROM node:22-slim AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc /app/

RUN --mount=type=cache,target=/root/.local/share \
    set -xe; \
    corepack enable; \
    pnpm install --frozen-lockfile --prefer-offline;

COPY . /app

RUN --mount=type=cache,target=/root/.local/share \
    set -xe; \
    pnpm build; \
    pnpm prune --prod;


FROM node:22-slim AS release

LABEL maintainer="ThunderAl <community@thunderal.net>"

WORKDIR /app

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

EXPOSE 8000

CMD node --enable-source-maps dist/index.js
