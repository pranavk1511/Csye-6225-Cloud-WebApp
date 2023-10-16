#!/bin/bash

# Update package lists
sudo apt-get update

# Install Node.js and npm
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm

# Install MariaDB server and client
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client

# Check Node.js version
sudo DEBIAN_FRONTEND=noninteractive node -v

# Check npm version
npm -v

# Install unzip
sudo DEBIAN_FRONTEND=noninteractive apt install -y unzip

# Unzip the WebAppRenamed file to the WebApp directory
sudo unzip WebAppRenamed -d WebApp

# Start MySQL shell
sudo mysql

# Alter the MySQL user 'root' at 'localhost' and set the password to 'root'
sudo mysql --execute="ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';"

# Flush MySQL privileges
sudo mysql --execute="FLUSH PRIVILEGES;"

# Create a MySQL database named Assignment3
sudo mysql --execute="CREATE DATABASE Assignment3;"

# Exit MySQL shell
sudo mysql --execute="EXIT;"

# Display a message
echo "foo"

