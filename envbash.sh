#!/bin/bash

# Define the content for the .env file
echo "DB_HOST=localhost" > .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=root" >> .env
echo "DB_NAME=Assignment-3" >> .env
echo "PORT=3000" >> .env

# Display a message to confirm the file has been created
echo "Created .env file with the following details:"
cat .env
