# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install Python and required packages
RUN apk add --no-cache python3 py3-pip

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Install Python dependencies
RUN pip3 install --no-cache-dir mediapipe opencv-python-headless numpy pillow

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/main"]
