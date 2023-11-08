# Web-App

Setup On Local
1. Set Up your MySql
2. Set Download Dependenceies
3. nodemon app.js 

### Steps for Digital Ocean Droplet  
-ssh into  your VM(Droplet)
ssh -i ~/.ssh/DigitalOcean root@"yourip"

- sch you web-app
scp -i /Users/pranavkulkarni/.ssh/DigitalOcean -r /Users/pranavkulkarni/Desktop/CloudAssignmentGithub/Web-App-Local root@134.209.78.246:/root/Demo

-MARIA DB 

sudo apt install mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'pranav';
FLUSH PRIVILEGES
CREATE DATABASE Assignment3;
SHOW DATABASES;
-install node and npm 

sudo apt install nodejs npm 

--start stop maria db 

sudo systemctl stop mariadb
sudo systemctl start  mariadb

-- change .env

vi .env



// ami buid check -1 
// ami build check -2 
// ami buid check -3 4

changed env config for autostart 



// Sanity Test 

// Ami build for route 53

// Canvas download check for demo - build ami 

