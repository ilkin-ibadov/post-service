# Dockerfile
FROM node:20-bullseye

# Add these lines to install psql client tools
# Use 'apk add postgresql-client' if using an Alpine base image
# Use 'apt-get update && apt-get install -y postgresql-client' if using a standard Debian base image
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the wait-for.sh script into the container (if it's not already covered by volume mount)
COPY wait-for.sh ./
RUN chmod +x wait-for.sh

# Copy all source code
COPY . .

# Expose port
EXPOSE 3000

# Start dev
CMD ["npm", "run", "start:dev"]
