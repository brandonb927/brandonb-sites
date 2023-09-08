---
title: Setting up iojs, Coffeescript, and an Upstart script on Ubuntu AWS EC2
date: 2015-04-28
---


This is a basic setup on how to get an `iojs` (or `nodejs`) app running using Upstart on an Ubuntu AWS EC2 instance.

<!-- break -->

**Note**: Replace `username` in the config below with the username of your choice.

```
# app.conf

description "app"

start on filesystem or runlevel [2345] and started networking
stop on [!2345]

respawn

setuid ubuntu

env USER=ubuntu
env HOME=/home/ubuntu
env LOG_FILE=/tmp/app.log
env APP_DIR=/home/folder
env NODE_ENV=production
…

pre-start script
  VERSION=$(cat $APP_DIR/.nvmrc | sed -e 's/iojs-//g')
  cd $APP_DIR
  exec $HOME/.nvm/versions/io.js/$VERSION/bin/npm install --production
end script

script
  cd $APP_DIR
  exec $HOME/.node/bin/coffee $APP_DIR/server.coffee >> $LOG_FILE 2>&1
end script
```

The config above is almost exactly what I use to run this blog, of course with some minor tweaks and extra environment variables. I also use [`nvm`](https://github.com/creationix/nvm) to manage iojs/node versions.

I won't go into how to build an iojs/node app because coding that is up to you, and this script is a starting block to running your own app on Ubuntu.
