  #!/usr/bin/env bash
  #simple startup script for nodeapp server
  #git clone of storeapp from remote server
  git clone https://github.com/s0rc3r3r01/statescore.git /opt/nodeapp
  #workdir known from Dockerfile, changing to app directory
  cd /opt/nodeapp/app
  #starting Node.JS
  node server.js
