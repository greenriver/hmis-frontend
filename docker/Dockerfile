#####################################################################
# build container
#####################################################################
ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS builder

ARG GITHASH
WORKDIR /app

COPY . .

ENV INLINE_RUNTIME_CHUNK=false

# Env vars prefixed with PUBLIC_ are made available to the app at build time
ENV PUBLIC_GIT_COMMIT_HASH ${GITHASH}

RUN corepack enable \
 && yarn install --offline \
 && yarn format:check \
 && yarn lint:check \
 && yarn test \
 && yarn build:staging

#####################################################################
# nginx container
#####################################################################
FROM nginx:1.23-alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder --chown=app:app /app/dist .
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/templates/*.template /etc/nginx/templates/

RUN addgroup --gid 10001 --system app \
 && adduser  --uid 10000 --system --ingroup app --home /usr/share/nginx/html app \
 && chown -R app:app /var/cache/nginx \
 && chmod -R g+w /var/cache/nginx \
 && chown -R app:app /etc/nginx \
 && chmod -R g+w /etc/nginx \
 && touch /tmp/nginx.pid \
 && chown -R app:app /tmp/nginx.pid \
 && apk add --no-cache tini

# set entrypoint to handle signals
ENTRYPOINT ["/sbin/tini", "--", "/docker-entrypoint.sh"]

# run as a non-root user
USER app

CMD ["nginx", "-g", "daemon off;"]
