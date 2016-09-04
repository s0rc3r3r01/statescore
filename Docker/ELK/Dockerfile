#Dockerfile used to create the ELK server
# Author Federico Fregosi
# Date August 2016

FROM ubuntu
MAINTAINER Fede
WORKDIR /opt/
#installing elasticsearch
RUN apt-get -y update && \
    apt-get -y install openjdk-8-jre-headless wget unzip && \
    wget -qO - http://packages.elastic.co/GPG-KEY-elasticsearch | apt-key add - && \
    wget https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/zip/elasticsearch/2.3.4/elasticsearch-2.3.3.zip && \
    unzip elasticsearch-2.3.4.zip && \
    cd elasticsearch-2.3.4

#installing kibana
RUN wget https://download.elastic.co/kibana/kibana/kibana-4.5.3-linux-x64.tar.gz && \
    tar -xzf kibana-4.5.3-linux-x64.tar.gz && \
    cd kibana-4.5.3-linux-x64/
#adding customized elasticsearch config
COPY elasticsearch.yml /opt/elasticsearch-2.3.4/config
#starting local script
RUN echo "/opt/elasticsearch-2.3.4/bin/elasticsearch -Des.insecure.allow.root=true &" > startup.sh && \
    echo "/opt/kibana-4.5.3-linux-x64/bin/kibana -H 0.0.0.0 "  >> startup.sh && \
    chmod +x /opt/startup.sh

#entrypoint with script execution
EXPOSE 9200 9300 5601
ENTRYPOINT /opt/startup.sh
