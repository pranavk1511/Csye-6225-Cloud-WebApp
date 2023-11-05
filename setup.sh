
#!/bin/bash
sudo cp /tmp/webapp.zip /opt/webapp.zip
 
sudo groupadd csye6225
sudo useradd -s /bin/false -g csye6225 -d /opt/csye6225 -m csye6225
 
sudo apt update
sudo apt upgrade -y
sudo apt install -y nodejs
sudo apt install -y npm
sudo apt install -y unzip
sudo apt-get -y remove git
sudo apt-get update -y
sudo apt-get upgrade -y
 
nodejs -v
 
cd /opt
sudo unzip webapp.zip -d csye6225
cd /opt/csye6225
sudo ls -la
sudo npm install
 
 
 
sudo chown -R csye6225:csye6225 /opt/csye6225
sudo chmod -R 750  /opt/csye6225
sudo -u csye6225 bash
