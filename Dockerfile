# PR contributed by https://github.com/Cufee

FROM node:21 as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy files
COPY --chown=node:node . .

# Build app
RUN pnpm run build

# Run in a slimmer image
FROM node:21-slim

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
USER node

COPY --chown=node:node package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

CMD [ "node", "--es-module-specifier-resolution=node", "dist/app.js" ]
