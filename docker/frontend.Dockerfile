FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY frontend/package.json frontend/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Expose port
EXPOSE 3000

# Run in development mode (code is mounted via volume)
CMD ["yarn", "dev"]
