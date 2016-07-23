FROM ubuntu
MAINTAINER Federico Fregosi <federico.fregosi@gmail.com>
#installing Redis and Node.JS
RUN apt-get -y update && \
    apt-get -y install nodejs npm redis-server redis-tools && \
    ln -s /usr/bin/nodejs /usr/bin/node && \
    mkdir -p /var/log/nodeapp && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get update
RUN apt-get -y install git

WORKDIR /opt/
EXPOSE 8080 80 6379
ADD startup.sh /opt/
ENTRYPOINT /opt/startup.sh
