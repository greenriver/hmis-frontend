#####################################################################
# build container
#####################################################################
ARG NODE_VERSION
FROM node:${NODE_VERSION}-bookworm-slim AS builder

ARG GITHASH
ARG FULL_GITHASH
ARG SENTRY_AUTH_TOKEN
WORKDIR /app

ENV INLINE_RUNTIME_CHUNK=false

# Env vars prefixed with PUBLIC_ are made available to the app at build time
ENV PUBLIC_GIT_COMMIT_HASH ${GITHASH}
ENV FULL_GITHASH ${FULL_GITHASH}
ENV SENTRY_AUTH_TOKEN ${SENTRY_AUTH_TOKEN}
ENV SENTRY_ORG 'green-river'
ENV SENTRY_PROJECT 'hmis-frontend'
ENV NODE_OPTIONS '--max-old-space-size=32768'

# Use this for faster iterations on nginx config
# RUN mkdir -p /app/dist  && echo hello > /app/dist/index.html

COPY . .

RUN --mount=type=cache,target=/app/node_modules \
     apt-get update \
     && apt-get install -y --no-install-recommends ca-certificates \
     && rm -rf /var/lib/apt/lists/* \
     && corepack enable \
     && yarn install \
     && yarn format:check \
     && yarn lint:check \
     && yarn build

#####################################################################
# nginx container
#####################################################################
FROM nginx:1.30-bookworm
ARG USERID=${USERID:-10000}
ARG GROUPID=${GROUPID:-10001}

WORKDIR /usr/share/nginx/html

RUN groupadd --gid ${GROUPID} app \
 && useradd --uid ${USERID} --gid app --home-dir /usr/share/nginx/html --no-create-home app \
 && chown -R app:app /var/cache/nginx \
 && chmod -R g+w /var/cache/nginx \
 && chown -R app:app /etc/nginx \
 && chmod -R g+w /etc/nginx \
 && touch /tmp/nginx.pid \
 && chown -R app:app /tmp/nginx.pid \
 && apt-get update \
 && apt-get upgrade -y --no-install-recommends \
 && apt-get install -y --no-install-recommends dumb-init \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=app:app /app/dist .
COPY --chown=app:app ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --chown=app:app ./docker/nginx-reload ./docker/docker-entrypoint.sh /
COPY --chown=app:app ./docker/templates/*.template /etc/nginx/templates/

# Set entrypoint to handle signals
#   15 = SIGTERM (what is sent to nicely ask process to stop)
#   3 =  SIGQUIT (what we should send to nginx to make it actually stop gracefully)
#   We remap stop to quit to make nginx act more kindly toward existing
#   connections and requests
ENTRYPOINT ["/usr/bin/dumb-init", "--rewrite", "15:3", "--", "/docker-entrypoint.sh"]

# run as a non-root user
USER app

CMD ["nginx", "-g", "daemon off;"]
