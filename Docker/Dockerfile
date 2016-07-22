FROM ubuntu
MAINTAINER Federico Fregosi <federico.fregosi@gmail.com>
#installing Redis and Node.JS
RUN apt-get -y update && \
    apt-get -y install nodejs npm redis-server redis-tools && \
    ln -s /usr/bin/nodejs /usr/bin/node && \
    mkdir -p /var/log/nodeapp && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /opt/nodeapp


EXPOSE 8080 80 6379
