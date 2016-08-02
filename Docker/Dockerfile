FROM ubuntu
MAINTAINER Federico Fregosi <federico.fregosi@gmail.com>
#installing Redis and Node.JS
RUN apt-get -y update && \
    apt-get -y install nodejs npm redis-server redis-tools git curl && \
    ln -s /usr/bin/nodejs /usr/bin/node && \
    mkdir -p /var/log/nodeapp
#    && \
#    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get -y install openjdk-7-jre-headless
RUN wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | apt-key add -
RUN echo "deb https://packages.elastic.co/logstash/2.3/debian stable main" | tee -a /etc/apt/sources.list
RUN apt-get update && apt-get install logstash
WORKDIR /opt/
EXPOSE 8080 80 6379
ADD startup.sh /opt/
CMD /opt/startup.sh
