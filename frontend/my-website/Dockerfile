# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

# Public URLs baked into Angular prod build (SSR + browser fetch these at build time)
ARG SITE_URL=https://yoursite.com
ARG STORAGE_PUBLIC_BASE_URL=https://yoursite.com/
ENV SITE_URL=${SITE_URL}
ENV STORAGE_PUBLIC_BASE_URL=${STORAGE_PUBLIC_BASE_URL}

COPY package.json ./
RUN npm install

COPY . .

# Replace localhost URLs in both env files (some services imported development directly)
RUN for f in src/environments/environment.ts src/environments/environment.development.ts; do \
      sed -i "s|http://localhost:8080/api|${SITE_URL}/api|g" "$f" && \
      sed -i "s|http://localhost:4200/|${SITE_URL}/|g" "$f" && \
      sed -i "s|http://localhost:4200/assets|${SITE_URL}/assets|g" "$f" && \
      sed -i "s|http://localhost:9000/online-store-bucket|${STORAGE_PUBLIC_BASE_URL}|g" "$f"; \
    done

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/dist/multikart-frontend ./dist/multikart-frontend
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/multikart-frontend/server/server.mjs"]
