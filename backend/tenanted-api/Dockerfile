# Base Image
FROM node:18.16.0-alpine

# Set up necessary packages and tools
RUN apk add --no-cache curl && \
    curl -L https://unpkg.com/@pnpm/self-installer | node && \
    npm install -g ts-node && \
    apk add openssl

# Set the working directory
WORKDIR /app

# Copy the contents from staging to the working directory
COPY staging/ .

# Install the dependencies using pnpm
RUN pnpm install

# Expose port 3000 for the application
EXPOSE 3000

# Command to run the application using ts-node
CMD npx ts-node --esm src/index.ts
