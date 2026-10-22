# ---- Stage 1: build the React app ----------------------------------------
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Empty = the browser calls the API on the same origin (this one container serves both).
ENV VITE_API_URL=""
RUN npm run build

# ---- Stage 2: Express API + the built frontend -----------------------------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public
USER node
EXPOSE 8080
CMD ["node", "server.js"]
