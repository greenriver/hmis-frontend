#####################################################################
# build container
#####################################################################
ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS builder

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
     corepack enable \
     && yarn install --offline \
     && yarn format:check \
     && yarn lint:check \
     && yarn build

#####################################################################
# nginx container
#####################################################################
FROM nginx:1.25-alpine
ARG USERID=${USERID:-10000}
ARG GROUPID=${GROUPID:-10001}

WORKDIR /usr/share/nginx/html

COPY --from=builder --chown=app:app /app/dist .
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --chown=app:app ./docker/nginx-reload ./docker/docker-entrypoint.sh /
COPY ./docker/templates/*.template /etc/nginx/templates/

RUN addgroup --gid ${GROUPID} --system app \
 && adduser  --uid ${USERID} --system --ingroup app --home /usr/share/nginx/html app \
 && chown -R app:app /var/cache/nginx \
 && chmod -R g+w /var/cache/nginx \
 && chown -R app:app /etc/nginx \
 && chmod -R g+w /etc/nginx \
 && touch /tmp/nginx.pid \
 && chown -R app:app /tmp/nginx.pid \
 && apk add --no-cache dumb-init

# Set entrypoint to handle signals
#   15 = SIGSTOP (what is sent to nicely ask process to stop)
#   3 =  SIGQUIT (what we should send to nginx to make it actuly stop gracefully)
#   We remap stop to quit to make nginx act more kindly toward existing
#   connections and requests
ENTRYPOINT ["/usr/bin/dumb-init", "--rewrite", "15:3", "--", "/docker-entrypoint.sh"]

# run as a non-root user
USER app

CMD ["nginx", "-g", "daemon off;"]
