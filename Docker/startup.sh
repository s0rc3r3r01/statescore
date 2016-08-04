#!/usr/bin/env bash
#simple startup script for nodeapp server

#git clone of storeapp from remote server
git clone https://github.com/s0rc3r3r01/statescore.git /opt/statescore

#workdir known from Dockerfile, changing to app directory
cd /opt/statescore/app

#setting environment variable with hostname - AWS SPECIFIC
# commmented out as Google Cloud as been put in use for Kubernetes
#if [ -f /sys/hypervisor/uuid ] && [ `head -c 3 /sys/hypervisor/uuid` == ec2 ]; then
#    export PUBLICHOSTNAME="$(curl http://169.254.169.254/latest/meta-data/public-ipv4/)"
#else
#if it is not ec2 I assume the image is running on local development
#    export PUBLICHOSTNAME="localhost"
#fi

#starting redis
redis-server --daemonize yes

#copying latest logstash configuration
cp /opt/statescore/logstash/node.conf /etc/logstash/conf.d

#starting logstash
service logstash start

#installing modules
npm install

#starting Node.JS
node server.js
