# File: node-api/Dockerfile

# --- Stage 1: Dependency Installation (Builder Stage) ---
FROM node:20-alpine AS builder

WORKDIR /DSAS-SYSTEM

# Copy root package.json and package-lock.json
COPY ../package.json ../package-lock.json ./

# Install all dependencies
RUN npm install

# Copy only the backend code into the builder image
COPY . .

# --- Stage 2: Final Express API Application Image ---
FROM node:20-alpine

WORKDIR /DSAS-SYSTEM/node-api

# Copy node_modules from builder
COPY --from=builder /DSAS-SYSTEM/node_modules ../node_modules

# Copy backend code from builder
COPY --from=builder /DSAS-SYSTEM/node-api ./

EXPOSE 3000
CMD ["node", "index.js"]