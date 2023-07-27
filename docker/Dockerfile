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

# Copying files more specifically lets us reuse the build cache and iterate more quickly
# COPY . .
# RUN corepack enable \
#   && yarn install \
#   && yarn format:check \
#   && yarn lint:check \
#   # && yarn test \
#   && yarn build

RUN mkdir -p public src scripts .husky .yarn .storybook cypress \
  && rm -rf node_modules
COPY public/ public
COPY scripts/ scripts
COPY .yarn/ .yarn
COPY .husky/ .husky
COPY .storybook/ .storybook
COPY .gitignore .yarnrc .prettierignore .prettierrc.json .nvmrc .eslintrc.js .env.development .env.production babel.config.js cypress.config.ts jest.config.ts package.json tsconfig.json vite.config.js yarn.lock index.html graphql.schema.json codegen.yml .

RUN corepack enable \
 && yarn cache clean \
 && yarn install

COPY cypress/ cypress
COPY src/ ./src

RUN yarn format:check \
 && yarn lint:check \
 && yarn build

#####################################################################
# nginx container
#####################################################################
FROM nginx:1.23-alpine
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
 && apk add --no-cache tini

# set entrypoint to handle signals
ENTRYPOINT ["/sbin/tini", "--", "/docker-entrypoint.sh"]

# run as a non-root user
USER app

CMD ["nginx", "-g", "daemon off;"]
