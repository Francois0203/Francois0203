# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set npm config for GitHub Packages
ARG NODE_AUTH_TOKEN
RUN npm config set @francois0203:registry https://npm.pkg.github.com/
RUN npm config set //npm.pkg.github.com/:_authToken ${NODE_AUTH_TOKEN}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install UI package
RUN npm install @francois0203/ui@latest

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]