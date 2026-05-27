FROM ruby:3.2-slim-bookworm

ARG USERID=${USERID:-10000}
ARG GROUPID=${GROUPID:-10001}

RUN groupadd --gid ${GROUPID} app \
 && useradd --uid ${USERID} --gid app --home-dir /home/app --no-create-home app \
 && apt-get update \
 && apt-get install -y --no-install-recommends curl build-essential \
 && rm -rf /var/lib/apt/lists/* \
 && gem install rack rackup puma \
 && mkdir /app

WORKDIR /app

COPY server.rb .

EXPOSE 8080

CMD ["ruby", "./server.rb"]
