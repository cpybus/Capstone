#!/bin/bash

# Make sure everything is up to date to begin with.
sudo apt-get update && sudo apt-get upgrade

# Install python development libraries.
sudo apt-get install python-dev

# Install MySQL Server.
# This must be done before installing the mysqlclient python library
# in order for configuration to work correctly.
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo apt-get install libmysqlclient-dev
echo "Enter MySQL root password:"
read rootpassword
mysql -uroot -p${rootpassword} -e "CREATE USER bcsteam IDENTIFIED BY 'mitre';"
mysql -uroot -p${rootpassword} -e "CREATE DATABASE BcsDb;"
mysql -uroot -p${rootpassword} -e "GRANT ALL ON BcsDb.* TO bcsteam;"
mysql -uroot -p${rootpassword} -e "FLUSH PRIVILEGES;"

# Install pip for managing python libraries.
sudo apt-get install python-pip

# Install required python libraries.
sudo pip install Django
sudo pip install Celery
sudo pip install mysqlclient
sudo pip install redis
sudo pip install asgi-redis
sudo pip install channels
sudo pip install requests
sudo pip install zeroless
sudo pip install numpy

# Install Redis.
cd ~/Downloads
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
cd ~/Downloads
rm -r redis-stable
rm redis-stable.tar.gz
cd ~/Documents
sudo apt-get install redis-server

# Perform Django Migrations.
cd ~/Documents/bcs-f/server/data/
python publisher.py &
PUBLISHER_PID=$!
cd ~/Documents/bcs-f/server/
python manage.py makemigrations
python manage.py makemigrations data
python manage.py migrate
sudo kill ${PUBLISHER_PID}

# Import airport seed data into MySQL.
cd ~/Documents/bcs-f/server/data/seed-data/
mysql -ubcsteam -pmitre --local-infile BcsDb < import_all.sql

