# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install && npm run build 

# Copy the rest of your application
COPY . .

# Expose the port the app runs on
EXPOSE 2023

# Command to run the application
CMD ["npm", "run","start:prod"]
