# --- build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

# Vite bakes VITE_* vars in at build time — pass them as build args in CI/Azure.
ARG VITE_AUTH_API_URL
ARG VITE_GAME_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_GAME_API_URL=$VITE_GAME_API_URL

RUN npm run build

# --- production runtime: static files served by nginx ---
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
