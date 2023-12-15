# Stage 1: Build Node.js Application
FROM node:14 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY opt ./

RUN npm install

COPY . .

# Stage 2: Install MySQL
FROM mysql:latest

# Create a database
ENV MYSQL_DATABASE Assignment3

# Stage 3: Copy Node.js Application and MySQL from builder
FROM node:14

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

# Expose a port the app will run on
EXPOSE 3000

CMD ["npm", "start"]
