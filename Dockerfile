# 1. Base Image: Node.js 20 on Alpine Linux (Lightweight)
FROM node:20-alpine AS builder

# 2. Set Working Directory
WORKDIR /app

# 3. Install Dependencies
# Copy package.json and lock file first to leverage Docker cache
COPY package.json package-lock.json ./
# Install dependencies (ci is faster and stricter than install)
RUN npm ci

# 4. Copy Source Code
# .dockerignore will exclude node_modules, .next, .env, etc.
COPY . .

# 5. Build the Application
# This generates the .next directory with all static assets and server code
RUN npm run build

# --- Production Stage (Optional but recommended for smaller image) ---
# For simplicity in troubleshooting, we can keep it single stage or use multi-stage.
# Let's stick to a clean single stage for now to ensure everything is there, 
# or a simple runner stage if size matters. 
# Given "images not showing" issues, a single stage is safest to ensure no file is missed.

# 6. Expose Port
EXPOSE 3000

# 7. Start the Application
# Using npm start (default Next.js server)
CMD ["npm", "start"]
