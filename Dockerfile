# Use the official Node.js 20 image based on Alpine Linux for a smaller footprint
FROM node:20-alpine

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json FIRST (before copying source code).
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the source code into the container
COPY . .

# Expose port 3000 to allow external access to the app
EXPOSE 3000

# The command that runs when the container starts.
CMD ["node", "--import", "tsx/esm", "src/server.ts"]