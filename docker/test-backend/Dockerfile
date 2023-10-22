FROM ruby:3.2-alpine

ARG USERID=${USERID:-10000}
ARG GROUPID=${GROUPID:-10001}

RUN addgroup --gid ${GROUPID} --system app \
 && adduser  --uid ${USERID} --system --ingroup app --home /home/app app \
 && apk update \
 && apk add curl build-base \
 && gem install rack rackup puma \
 && mkdir /app

WORKDIR /app

COPY server.rb .

EXPOSE 8080

CMD ["ruby", "./server.rb"]
