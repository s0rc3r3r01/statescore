#!/usr/bin/env bash
#simple startup script for nodeapp server

#git clone of storeapp from remote server
git clone https://github.com/s0rc3r3r01/statescore.git /opt/nodeapp

#workdir known from Dockerfile, changing to app directory
cd /opt/nodeapp/app
#setting environment variable with hostname - AWS SPECIFIC
if [ -f /sys/hypervisor/uuid ] && [ `head -c 3 /sys/hypervisor/uuid` == ec2 ]; then
    export PUBLICHOSTNAME="$(curl http://169.254.169.254/latest/meta-data/public-hostname/)"
else
#if it is not ec2 I assume the image is running on local development
    export PUBLICHOSTNAME="$(127.0.0.1"
fi



#starting redis
redis-server --daemonize yes

#installing modules
npm install

#starting Node.JS
node server.js
