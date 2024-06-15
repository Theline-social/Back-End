# Use an official Node.js runtime as the base image
FROM node:18
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) before other files
# This is to leverage Docker cache to avoid re-installing dependencies if they haven't changed
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Build the TypeScript code and ensure the dist directory is created
RUN npx tsc && \
    if [ ! -d "dist" ]; then echo "Error: dist directory was not created"; exit 1; fi

# Expose the port the app runs on
EXPOSE 2023

# Start the server
CMD ["node", "dist/server.js"]
