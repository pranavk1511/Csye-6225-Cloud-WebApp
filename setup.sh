#!/bin/bash

# Update package lists
sudo apt-get update

# Install Node.js and npm
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm




# Check Node.js version
sudo DEBIAN_FRONTEND=noninteractive node -v

# Check npm version
npm -v

# Install unzip
sudo DEBIAN_FRONTEND=noninteractive apt install -y unzip

# Unzip the WebAppRenamed file to the WebApp directory
sudo unzip WebAppRenamed -d WebApp


# Uninstall git 
sudo apt-get remove -y git


# Setting up new User

sudo useradd -m webappuser
sudo groupadd webappgroup

# Add webappuser to the webappgroup
sudo usermod -aG webappgroup webappuser

# Set ownership and permissions for webappuser's home directory
sudo chown -R webappuser:webappgroup /home/webappuser
sudo chmod -R 750 /home/webappuser


# Set ownership and permissions for the app.js file in admin's directory
sudo chown webappuser:webappgroup /home/admin/WebApp
sudo chmod 750 /home/admin/WebApp
sudo chown webappuser:webappgroup /home/admin/WebApp/app.js
sudo chmod 750 /home/admin/WebApp/app.js


# Add webappuser to the systemd-journal group
sudo usermod -aG systemd-journal webappuser

sudo chmod 644 /home/admin/WebApp/.env
# Create the log file and set ownership and permissions

sudo touch /var/log/webapp.log

sudo chown webappuser:webappgroup /var/log/webapp.log

sudo chmod 644 /var/log/webapp.log
sudo chmod 600 /home/admin/WebApp/.env

