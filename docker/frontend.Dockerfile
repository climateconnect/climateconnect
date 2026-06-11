FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY frontend/package.json frontend/yarn.lock* ./

# Enable Corepack so it honours the `packageManager` field in package.json
RUN corepack enable

# Install dependencies (--immutable is the Yarn 4 equivalent of --frozen-lockfile)
RUN yarn install --immutable

# Expose port
EXPOSE 3000

# Run in development mode (code is mounted via volume)
CMD ["yarn", "dev"]
