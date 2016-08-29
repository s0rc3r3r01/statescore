#Dockerfile used to create the statescore image
FROM ubuntu
MAINTAINER Federico Fregosi <federico.fregosi@gmail.com>
#installing Redis and Node.JS
RUN apt-get -y update && \
    apt-get -y install nodejs npm redis-server redis-tools git curl && \
    ln -s /usr/bin/nodejs /usr/bin/node && \
    mkdir -p /var/log/nodeapp

#installing openjdk and logstash
RUN apt-get -y install openjdk-8-jre-headless wget
RUN wget -qO - http://packages.elastic.co/GPG-KEY-elasticsearch | apt-key add -
RUN echo "deb http://packages.elastic.co/logstash/2.3/debian stable main" | tee -a /etc/apt/sources.list
RUN apt-get update && apt-get -y install logstash
#setting workdir
WORKDIR /opt/
EXPOSE 8080 80 6379
ADD startup.sh /opt/
#starting local script
CMD /opt/startup.sh
