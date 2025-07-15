# Use official Node.js LTS image as base
FROM node:20-slim

# Install required compilers and runtimes
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        g++ \
        gcc \
        openjdk-17-jdk \
        python3 \
        python3-pip \
        python3-venv \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Create codes and outputs directories and set ownership
RUN mkdir -p codes outputs && chown -R node:node codes outputs

# Expose the port (default 5001)
EXPOSE 5001

# Use node user for security
USER node

# Start the service
CMD ["node", "index.js"] 